# Copyright (c) 2022, 2023 Humanitarian OpenStreetMap Team
#
# This file is part of FMTM.
#
#     FMTM is free software: you can redistribute it and/or modify
#     it under the terms of the GNU General Public License as published by
#     the Free Software Foundation, either version 3 of the License, or
#     (at your option) any later version.
#
#     FMTM is distributed in the hope that it will be useful,
#     but WITHOUT ANY WARRANTY; without even the implied warranty of
#     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#     GNU General Public License for more details.
#
#     You should have received a copy of the GNU General Public License
#     along with FMTM.  If not, see <https:#www.gnu.org/licenses/>.
#
"""Entrypoint for FastAPI app."""

import json
import logging
import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse, Response
from loguru import logger as log
from osm_fieldwork.xlsforms import xlsforms_path
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.__version__ import __version__
from app.auth import auth_routes
from app.central import central_routes
from app.config import MonitoringTypes, settings
from app.db.database import get_db
from app.helpers import helper_routes
from app.models.enums import HTTPStatus
from app.monitoring import (
    add_endpoint_profiler,
    instrument_app_otel,
    set_otel_tracer,
    set_sentry_otel_tracer,
)
from app.organisations import organisation_routes
from app.organisations.organisation_crud import init_admin_org
from app.projects import project_routes
from app.projects.project_crud import read_and_insert_xlsforms
from app.submissions import submission_routes
from app.tasks import tasks_routes
from app.users import user_routes


def get_api() -> FastAPI:
    """Return the FastAPI app, configured for the environment.

    Add endpoint profiler or monitoring setup based on environment.
    """
    api = get_application()

    # Add endpoint profiler to check for bottlenecks
    if settings.DEBUG:
        add_endpoint_profiler(api)

    # Add monitoring if flag set
    if settings.MONITORING == MonitoringTypes.SENTRY:
        log.info("Adding Sentry OpenTelemetry monitoring config")
        set_sentry_otel_tracer(settings.monitoring_config.SENTRY_DSN)
        instrument_app_otel(api)
    elif settings.MONITORING == MonitoringTypes.OPENOBSERVE:
        log.info("Adding OpenObserve OpenTelemetry monitoring config")
        set_otel_tracer(api, settings.monitoring_config.otel_exporter_otpl_endpoint)
        # set_otel_logger(settings.monitoring_config.otel_exporter_otpl_endpoint)
        instrument_app_otel(api)

    return api


@asynccontextmanager
async def lifespan(
    app: FastAPI,  # dead: disable
):
    """FastAPI startup/shutdown event."""
    log.debug("Starting up FastAPI server.")
    db_conn = next(get_db())
    log.debug("Initialising admin org and user in DB.")
    await init_admin_org(db_conn)
    log.debug("Reading XLSForms from DB.")
    await read_and_insert_xlsforms(db_conn, xlsforms_path)

    yield

    # Shutdown events
    log.debug("Shutting down FastAPI server.")


def get_application() -> FastAPI:
    """Get the FastAPI app instance, with settings."""
    _app = FastAPI(
        title=settings.APP_NAME,
        description="HOTOSM Field Tasking Manager",
        version=__version__,
        license_info={
            "name": "GPL-3.0-only",
            "url": "https://raw.githubusercontent.com/hotosm/fmtm/main/LICENSE.md",
        },
        debug=settings.DEBUG,
        lifespan=lifespan,
        root_path=settings.API_PREFIX,
    )

    # Set custom logger
    _app.logger = get_logger()

    _app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.EXTRA_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["Content-Disposition"],
    )

    _app.include_router(user_routes.router)
    _app.include_router(project_routes.router)
    _app.include_router(tasks_routes.router)
    _app.include_router(central_routes.router)
    _app.include_router(auth_routes.router)
    _app.include_router(submission_routes.router)
    _app.include_router(organisation_routes.router)
    _app.include_router(helper_routes.router)

    return _app


class InterceptHandler(logging.Handler):
    """Intercept python standard lib logging."""

    def emit(self, record):
        """Retrieve context where the logging call occurred.

        This happens to be in the 6th frame upward.
        """
        logger_opt = log.opt(depth=6, exception=record.exc_info)
        logger_opt.log(record.levelno, record.getMessage())


def get_logger():
    """Override FastAPI logger with custom loguru."""
    # Hook all other loggers into ours
    logger_name_list = [name for name in logging.root.manager.loggerDict]
    for logger_name in logger_name_list:
        logging.getLogger(logger_name).setLevel(10)
        logging.getLogger(logger_name).handlers = []
        if logger_name == "sqlalchemy":
            # Don't hook sqlalchemy, very verbose
            continue
        if logger_name == "urllib3":
            # Don't hook urllib3, called on each OTEL trace
            continue
        if "." not in logger_name:
            logging.getLogger(logger_name).addHandler(InterceptHandler())

    log.remove()
    log.add(
        sys.stderr,
        level=settings.LOG_LEVEL,
        format=(
            "{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} "
            "| {name}:{function}:{line} | {message}"
        ),
        enqueue=True,  # Run async / non-blocking
        colorize=True,
        backtrace=True,  # More detailed tracebacks
        catch=True,  # Prevent app crashes
    )

    # Only log to file in production
    if not settings.DEBUG:
        log.add(
            "/opt/logs/fmtm.json",
            level=settings.LOG_LEVEL,
            enqueue=True,
            serialize=True,  # JSON format
            rotation="00:00",  # New file at midnight
            retention="10 days",
            # format=log_json_format, # JSON format func
        )


api = get_api()


@api.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,  # dead: disable
    exc: RequestValidationError,
):
    """Exception handler for more descriptive logging and traces."""
    status_code = 500
    errors = []
    for error in exc.errors():
        # TODO Handle this properly
        if error["msg"] in ["Invalid input", "field required"]:
            status_code = HTTPStatus.UNPROCESSABLE_ENTITY
        else:
            status_code = HTTPStatus.BAD_REQUEST
        errors.append(
            {
                "loc": error["loc"],
                "msg": error["msg"],
                "error": error["msg"] + str([x for x in error["loc"]]),
            }
        )
    return JSONResponse(status_code=status_code, content={"errors": errors})


@api.get("/")
async def home():
    """Redirect home to docs."""
    return RedirectResponse("/docs")


@api.get("/__version__")
async def deployment_details():
    """Mozilla Dockerflow Spec: source, version, commit, and link to CI build."""
    details = {}

    version_path = Path("/opt/version.json")
    if version_path.exists():
        with open(version_path, "r") as version_file:
            details = json.load(version_file)
    commit = details.get("commit", "commit key was not found in file!")
    build = details.get("build", "build key was not found in file!")

    return JSONResponse(
        status_code=HTTPStatus.OK,
        content={
            "source": "https://github.com/hotosm/fmtm",
            "version": __version__,
            "commit": commit or "/app/version.json not found",
            "build": build or "/app/version.json not found",
        },
    )


@api.get("/__heartbeat__")
async def heartbeat_plus_db(db: Session = Depends(get_db)):
    """Heartbeat that checks that API and DB are both up and running."""
    try:
        db.execute(text("SELECT 1"))
        return Response(status_code=HTTPStatus.OK)
    except Exception as e:
        log.warning(e)
        log.warning("Server failed __heartbeat__ database connection check")
        return JSONResponse(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR, content={"error": str(e)}
        )


@api.get("/__lbheartbeat__")
async def simple_heartbeat():
    """Simple ping/pong API response."""
    return Response(status_code=HTTPStatus.OK)
