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
"""Configuration and fixtures for PyTest."""

import logging
import os
from typing import Any, Generator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from geojson_pydantic import Polygon
from loguru import logger as log
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy_utils import create_database, database_exists

from app.auth.auth_routes import get_or_create_user
from app.auth.osm import AuthUser
from app.central import central_crud
from app.config import settings
from app.db.database import Base, get_db
from app.db.db_models import DbOrganisation
from app.main import get_application
from app.models.enums import CommunityType, UserRole
from app.projects import project_crud
from app.projects.project_schemas import ODKCentralDecrypted, ProjectInfo, ProjectUpload

engine = create_engine(settings.FMTM_DB_URL.unicode_string())
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


def pytest_configure(config):
    """Configure pytest runs."""
    # Stop sqlalchemy logs
    sqlalchemy_log = logging.getLogger("sqlalchemy")
    sqlalchemy_log.propagate = False


@pytest.fixture(autouse=True)
def app() -> Generator[FastAPI, Any, None]:
    """Get the FastAPI test server."""
    yield get_application()


@pytest.fixture(scope="session")
def db_engine():
    """The SQLAlchemy database engine to init."""
    engine = create_engine(settings.FMTM_DB_URL.unicode_string())
    if not database_exists:
        create_database(engine.url)

    Base.metadata.create_all(bind=engine)
    yield engine


@pytest.fixture(scope="function")
def db(db_engine):
    """Database session using db_engine."""
    connection = db_engine.connect()

    # begin a non-ORM transaction
    connection.begin()

    # bind an individual Session to the connection
    db = TestingSessionLocal(bind=connection)

    yield db

    db.rollback()
    connection.close()


@pytest.fixture(scope="function")
async def admin_user(db):
    """A test user."""
    db_user = await get_or_create_user(
        db,
        AuthUser(
            username="localadmin",
            id=1,
            role=UserRole.ADMIN,
        ),
    )
    # Upgrade role from default MAPPER (if user already exists)
    db_user["role"] = UserRole.ADMIN
    db.commit()
    return db_user


@pytest.fixture(scope="function")
def organisation(db):
    """A test organisation."""
    db_org = DbOrganisation(
        name="test_org_qwerty",
        slug="test_qwerty",
        description="test org",
        url="https://test.org",
        logo="none",
        approved=True,
        community_type=CommunityType.OSM_COMMUNITY,
    )
    db.add(db_org)
    db.commit()
    return db_org


@pytest.fixture(scope="function")
async def project(db, admin_user, organisation):
    """A test project, using the test user and org."""
    project_metadata = ProjectUpload(
        project_info=ProjectInfo(
            name="test project",
            short_description="test",
            description="test",
        ),
        xform_category="buildings",
        odk_central_url=os.getenv("ODK_CENTRAL_URL"),
        odk_central_user=os.getenv("ODK_CENTRAL_USER"),
        odk_central_password=os.getenv("ODK_CENTRAL_PASSWD"),
        hashtags=["hot-fmtm"],
        outline_geojson=Polygon(
            type="Polygon",
            coordinates=[
                [
                    [85.299989110, 27.7140080437],
                    [85.299989110, 27.7108923499],
                    [85.304783157, 27.7108923499],
                    [85.304783157, 27.7140080437],
                    [85.299989110, 27.7140080437],
                ]
            ],
        ),
        organisation_id=organisation.id,
    )

    odk_creds_decrypted = ODKCentralDecrypted(
        odk_central_url=project_metadata.odk_central_url,
        odk_central_user=project_metadata.odk_central_user,
        odk_central_password=project_metadata.odk_central_password,
    )

    # Create ODK Central Project
    try:
        odkproject = central_crud.create_odk_project(
            project_metadata.project_info.name,
            odk_creds_decrypted,
        )
        log.debug(f"ODK project returned: {odkproject}")
        assert odkproject is not None
    except Exception as e:
        log.exception(e)
        pytest.fail(f"Test failed with exception: {str(e)}")

    # Create FMTM Project
    try:
        new_project = await project_crud.create_project_with_project_info(
            db,
            project_metadata,
            odkproject["id"],
            AuthUser(
                username=admin_user["username"],
                id=admin_user["id"],
                role=UserRole.ADMIN,
            ),
        )
        log.debug(f"Project returned: {new_project.__dict__}")
        assert new_project is not None
    except Exception as e:
        log.exception(e)
        pytest.fail(f"Test failed with exception: {str(e)}")

    return new_project


# @pytest.fixture(scope="function")
# def get_ids(db, project):
#     user_id_query = text(f"SELECT id FROM {DbUser.__table__.name} LIMIT 1")
#     organisation_id_query = text(
#         f"SELECT id FROM {DbOrganisation.__table__.name} LIMIT 1"
#     )
#     project_id_query = text(f"SELECT id FROM {DbProject.__table__.name} LIMIT 1")

#     user_id = db.execute(user_id_query).scalar()
#     organisation_id = db.execute(organisation_id_query).scalar()
#     project_id = db.execute(project_id_query).scalar()

#     data = {
#         "user_id": user_id,
#         "organisation_id": organisation_id,
#         "project_id": project_id,
#     }
#     log.debug(f"get_ids return: {data}")
#     return data


@pytest.fixture(scope="function")
def client(app, db):
    """The FastAPI test server."""
    app.dependency_overrides[get_db] = lambda: db

    with TestClient(app) as c:
        yield c
