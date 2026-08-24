import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-super-secret-jwt-key-here-for-local-dev")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 24 * 60 # 24 hours
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./persona.db")
    USE_ONLINE_FALLBACK: bool = os.getenv("USE_ONLINE_FALLBACK", "false").lower() == "true"

settings = Settings()
