import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv

load_dotenv() # Loads .env locally, but does nothing on Render (which is fine)

# 🚀 CRITICAL: This must read the env variable, NOT default to localhost
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL") 

# If the URL is missing, we crash intentionally so we know it's missing
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("DATABASE_URL is not set. Please check Render Environment Variables.")

# Fix for some postgres drivers (Render uses postgres://, SQLAlchemy needs postgresql://)
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()