from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    ALPHA_VANTAGE_API_KEY: str = os.getenv("ALPHA_VANTAGE_API_KEY", "demo")
    FINNHUB_API_KEY: str = os.getenv("FINNHUB_API_KEY", "")
    TWELVE_DATA_API_KEY: str = os.getenv("TWELVE_DATA_API_KEY", "")
    INDIAN_API_KEY: str = os.getenv("INDIAN_API_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:Srusanth25@localhost:4000/wealth_db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "Srusanth")
    # Optional: Celery/Redis configuration (present in .env but not always used)
    CELERY_BROKER_URL: str | None = os.getenv("CELERY_BROKER_URL")
    REDIS_URL: str | None = os.getenv("REDIS_URL")
    # Email Configuration
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SENDER_EMAIL: str = os.getenv("SENDER_EMAIL", "")
    SENDER_NAME: str = os.getenv("SENDER_NAME", "Wealth Manager")
    # Google OAuth Configuration
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
