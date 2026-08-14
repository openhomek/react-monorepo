from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db_name: str = "jikeyuan_api"

    ingest_api_key: str = "dev-ingest-key"

    cors_origins: str = "http://localhost:5175,https://blog.openhomek.com"

    storage_backend: str = "local"
    media_root: str = "media"
    media_public_base_url: str = "http://localhost:8000/media"

    s3_endpoint_url: str | None = None
    s3_bucket: str | None = None
    s3_access_key_id: str | None = None
    s3_secret_access_key: str | None = None

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
