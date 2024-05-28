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
"""Config file for Pydantic and FastAPI, using environment variables."""

import base64
import os
from enum import Enum
from functools import lru_cache
from typing import Annotated, Any, Optional, Union

from cryptography.fernet import Fernet
from pydantic import (
    BeforeValidator,
    Field,
    TypeAdapter,
    ValidationInfo,
    computed_field,
    field_validator,
)
from pydantic.networks import HttpUrl, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict

HttpUrlStr = Annotated[
    str,
    BeforeValidator(
        lambda value: str(TypeAdapter(HttpUrl).validate_python(value) if value else "")
    ),
]


class MonitoringTypes(str, Enum):
    """Configuration options for monitoring."""

    NONE = ""
    SENTRY = "sentry"
    OPENOBSERVE = "openobserve"


class OtelSettings(BaseSettings):
    """Inherited OpenTelemetry specific settings (monitoring).

    These mostly set environment variables set by the OTEL SDK.
    """

    FMTM_DOMAIN: Optional[str] = Field(exclude=True)
    LOG_LEVEL: Optional[str] = Field(exclude=True)
    ODK_CENTRAL_URL: Optional[str] = Field(exclude=True)

    @computed_field
    @property
    def otel_log_level(self) -> Optional[str]:
        """Set OpenTelemetry log level."""
        log_level = "info"
        if self.LOG_LEVEL:
            log_level = self.LOG_LEVEL.lower()
            # NOTE setting to DEBUG makes very verbose for every library
            # os.environ["OTEL_LOG_LEVEL"] = log_level
            os.environ["OTEL_LOG_LEVEL"] = "info"
        return log_level

    @computed_field
    @property
    def otel_service_name(self) -> Optional[HttpUrlStr]:
        """Set OpenTelemetry service name for traces."""
        service_name = "unknown"
        if self.FMTM_DOMAIN:
            # Return domain with underscores
            service_name = self.FMTM_DOMAIN.replace(".", "_")
            # Export to environment for OTEL instrumentation
            os.environ["OTEL_SERVICE_NAME"] = service_name
        return service_name

    @computed_field
    @property
    def otel_python_excluded_urls(self) -> Optional[str]:
        """Set excluded URLs for Python instrumentation."""
        endpoints = "__lbheartbeat__,docs,openapi.json"
        os.environ["OTEL_PYTHON_EXCLUDED_URLS"] = endpoints
        # Add extra endpoints ignored by for requests
        # NOTE we add ODK Central session auth endpoint here
        if self.ODK_CENTRAL_URL:
            os.environ["OTEL_PYTHON_REQUESTS_EXCLUDED_URLS"] = (
                f"{endpoints}" f"{self.ODK_CENTRAL_URL}/v1/sessions"
            )
        return endpoints

    @computed_field
    @property
    def otel_python_log_correlation(self) -> Optional[str]:
        """Set log correlation for OpenTelemetry Python spans."""
        value = "true"
        os.environ["OTEL_PYTHON_LOG_CORRELATION"] = value
        return value


class SentrySettings(OtelSettings):
    """Optional Sentry OpenTelemetry specific settings (monitoring)."""

    SENTRY_DSN: HttpUrlStr


class OpenObserveSettings(OtelSettings):
    """Optional OpenTelemetry specific settings (monitoring)."""

    OTEL_ENDPOINT: HttpUrlStr = Field(exclude=True)
    OTEL_AUTH_TOKEN: Optional[str] = Field(exclude=True)

    @computed_field
    @property
    def otel_exporter_otpl_endpoint(self) -> Optional[HttpUrlStr]:
        """Set endpoint for OpenTelemetry."""
        os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"] = str(self.OTEL_ENDPOINT)
        return self.OTEL_ENDPOINT

    @computed_field
    @property
    def otel_exporter_otlp_headers(self) -> Optional[str]:
        """Set headers for OpenTelemetry collector service."""
        if not self.OTEL_AUTH_TOKEN:
            return None
        # NOTE auth token must be URL encoded, i.e. space=%20
        auth_header = f"Authorization=Basic%20{self.OTEL_AUTH_TOKEN}"
        os.environ["OTEL_EXPORTER_OTLP_HEADERS"] = auth_header
        return auth_header


class Settings(BaseSettings):
    """Main settings defining environment variables."""

    model_config = SettingsConfigDict(
        case_sensitive=True, env_file=".env", extra="allow"
    )

    APP_NAME: str = "FMTM"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    ENCRYPTION_KEY: str

    FMTM_DOMAIN: str
    FMTM_DEV_PORT: Optional[str] = "7050"

    EXTRA_CORS_ORIGINS: Optional[Union[str, list[str]]] = []

    @field_validator("EXTRA_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(
        cls,
        val: Union[str, list[str]],
        info: ValidationInfo,
    ) -> Union[list[str], str]:
        """Build and validate CORS origins list.

        By default, the provided frontend URLs are included in the origins list.
        If this variable used, the provided urls are appended to the list.
        """
        default_origins = []

        # Build default origins from env vars
        url_scheme = "http" if info.data.get("DEBUG") else "https"
        local_server_port = (
            f":{info.data.get('FMTM_DEV_PORT')}" if info.data.get("DEBUG") else ""
        )
        if frontend_domain := info.data.get("FMTM_DOMAIN"):
            default_origins = [
                f"{url_scheme}://{frontend_domain}{local_server_port}",
                # Also add the xlsform-editor url
                "https://xlsforms.fmtm.dev",
            ]

        if val is None:
            return default_origins

        if isinstance(val, str):
            default_origins += [i.strip() for i in val.split(",")]
            return default_origins

        elif isinstance(val, list):
            default_origins += val
            return default_origins

    API_PREFIX: str = "/"

    FMTM_DB_HOST: Optional[str] = "fmtm-db"
    FMTM_DB_USER: Optional[str] = "fmtm"
    FMTM_DB_PASSWORD: Optional[str] = "fmtm"
    FMTM_DB_NAME: Optional[str] = "fmtm"

    FMTM_DB_URL: Optional[PostgresDsn] = None

    @field_validator("FMTM_DB_URL", mode="after")
    @classmethod
    def assemble_db_connection(cls, v: Optional[str], info: ValidationInfo) -> Any:
        """Build Postgres connection from environment variables."""
        if isinstance(v, str):
            return v
        pg_url = PostgresDsn.build(
            scheme="postgresql",
            username=info.data.get("FMTM_DB_USER"),
            password=info.data.get("FMTM_DB_PASSWORD"),
            host=info.data.get("FMTM_DB_HOST"),
            path=info.data.get("FMTM_DB_NAME", ""),
        )
        return pg_url

    ODK_CENTRAL_URL: Optional[HttpUrlStr] = ""
    ODK_CENTRAL_USER: Optional[str] = ""
    ODK_CENTRAL_PASSWD: Optional[str] = ""

    OSM_CLIENT_ID: str
    OSM_CLIENT_SECRET: str
    OSM_SECRET_KEY: str
    OSM_URL: HttpUrlStr = "https://www.openstreetmap.org"
    OSM_SCOPE: str = "read_prefs"
    OSM_LOGIN_REDIRECT_URI: str = "http://127.0.0.1:7051/osmauth/"

    S3_ENDPOINT: str = "http://s3:9000"
    S3_ACCESS_KEY: Optional[str] = ""
    S3_SECRET_KEY: Optional[str] = ""
    S3_BUCKET_NAME: str = "fmtm-data"
    S3_DOWNLOAD_ROOT: Optional[str] = None

    @field_validator("S3_DOWNLOAD_ROOT", mode="before")
    @classmethod
    def configure_s3_download_root(cls, v: Optional[str], info: ValidationInfo) -> str:
        """Set S3_DOWNLOAD_ROOT for S3 downloads.

        This is required, when we use a containerised S3 service.
        The S3_ENDPOINT is a docker compose service name and not
        resolvable outside of the stack.

        S3_DOWNLOAD_ROOT is equal to S3_ENDPOINT if a public S3 instance
        is used (e.g. AWS S3).
        """
        # If set manually, pass through
        if v and isinstance(v, str):
            return v

        # Externally hosted S3
        s3_endpoint = info.data.get("S3_ENDPOINT")
        if s3_endpoint and s3_endpoint.startswith("https://"):
            return s3_endpoint

        # Containerised S3
        else:
            fmtm_domain = info.data.get("FMTM_DOMAIN")
            # Local dev
            if info.data.get("DEBUG"):
                dev_port = info.data.get("FMTM_DEV_PORT")
                return f"http://s3.{fmtm_domain}:{dev_port}"
            return f"https://s3.{fmtm_domain}"

    RAW_DATA_API_URL: HttpUrlStr = "https://api-prod.raw-data.hotosm.org/v1"
    RAW_DATA_API_AUTH_TOKEN: Optional[str] = None

    @field_validator("RAW_DATA_API_AUTH_TOKEN", mode="before")
    @classmethod
    def set_raw_data_api_auth_none(cls, v: Optional[str]) -> Optional[str]:
        """Set RAW_DATA_API_AUTH_TOKEN to None if set to empty string."""
        if v == "":
            return None
        return v

    # Used for temporary auth feature
    OSM_SVC_ACCOUNT_TOKEN: Optional[str] = None

    @field_validator("OSM_SVC_ACCOUNT_TOKEN", mode="before")
    @classmethod
    def set_osm_svc_account_none(cls, v: Optional[str]) -> Optional[str]:
        """Set OSM_SVC_ACCOUNT_TOKEN to None if set to empty string."""
        if v == "":
            return None
        return v

    MONITORING: Optional[MonitoringTypes] = None

    @computed_field
    @property
    def monitoring_config(self) -> Optional[OpenObserveSettings | SentrySettings]:
        """Get the monitoring configuration."""
        if self.MONITORING == MonitoringTypes.SENTRY:
            return SentrySettings()
        elif self.MONITORING == MonitoringTypes.OPENOBSERVE:
            return OpenObserveSettings()
        return None


@lru_cache
def get_settings():
    """Cache settings when accessed throughout app."""
    _settings = Settings()

    if _settings.DEBUG:
        print("Loaded settings: " f"{_settings.model_dump()}")
    return _settings


@lru_cache
def get_cipher_suite():
    """Cache cypher suite."""
    return Fernet(settings.ENCRYPTION_KEY)


def encrypt_value(password: Union[str, HttpUrlStr]) -> str:
    """Encrypt value before going to the DB."""
    cipher_suite = get_cipher_suite()
    encrypted_password = cipher_suite.encrypt(password.encode("utf-8"))
    return base64.b64encode(encrypted_password).decode("utf-8")


def decrypt_value(db_password: str) -> str:
    """Decrypt the database value."""
    cipher_suite = get_cipher_suite()
    encrypted_password = base64.b64decode(db_password.encode("utf-8"))
    decrypted_password = cipher_suite.decrypt(encrypted_password)
    return decrypted_password.decode("utf-8")


settings = get_settings()
