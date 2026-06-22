from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[3]
DEFAULT_SQLITE_URL = "sqlite:///./data/segmify.db"


class Settings(BaseSettings):
    app_name: str = "Segmify.ai"
    api_prefix: str = "/api/v1"
    secret_key: str = "change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 12
    database_url: str = DEFAULT_SQLITE_URL
    model_path: str = str(BASE_DIR / "ml" / "segmify_model.joblib")
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    environment: str = "development"
    frontend_url: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
