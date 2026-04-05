from pydantic import ConfigDict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env")

    # 非同期用（postgresql+asyncpg://）。Alembic・アプリ共通。
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/todo_db"

    # CORS設定（カンマ区切りで複数指定可能）
    allowed_origins: str = "http://localhost:3000"

    @property
    def cors_origins(self) -> list[str]:
        """CORS許可オリジンをリストで返す"""
        return [origin.strip() for origin in self.allowed_origins.split(",")]


settings = Settings()
