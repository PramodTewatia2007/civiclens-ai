import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

def get_database_url() -> str:
    url = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'civiclens.db'}")
    # Render and Heroku use postgres://, which SQLAlchemy 2.0 deprecated in favor of postgresql://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url

class Settings(BaseModel):
    APP_NAME: str = "CivicLens AI"
    TAGLINE: str = "Turn community complaints into organized, actionable evidence."
    VERSION: str = "1.0.0"
    DATABASE_URL: str = get_database_url()
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    STATIC_DIR: Path = BASE_DIR / "static"
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = os.getenv("HOST", "0.0.0.0")

settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.STATIC_DIR.mkdir(parents=True, exist_ok=True)

