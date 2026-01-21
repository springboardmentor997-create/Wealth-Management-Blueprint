from sqlalchemy import create_engine # pyright: ignore[reportMissingImports]
from sqlalchemy.orm import sessionmaker, declarative_base # pyright: ignore[reportMissingImports]
import os
from dotenv import load_dotenv # pyright: ignore[reportMissingImports]

load_dotenv()

# -----------------------------------
# DATABASE CONFIG (SAFE & CLEAR)
# -----------------------------------

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "wealth_management_db")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "Anuma@1711")

# SQLite database (no setup required)
SQLALCHEMY_DATABASE_URL = "sqlite:///./wealth_management.db"

# -----------------------------------
# SQLALCHEMY ENGINE
# -----------------------------------

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # SQLite specific
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# -----------------------------------
# DB DEPENDENCY
# -----------------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
