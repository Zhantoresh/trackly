from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Local file storage (served by this API, backed by a Railway Volume for persistence)
    UPLOAD_DIR: str = "/app/uploads"
    # Public URL this backend is reachable at, used to build file links, e.g.
    # https://trackly-backend-production.up.railway.app
    PUBLIC_BASE_URL: str

    class Config:
        env_file = ".env"

settings = Settings()