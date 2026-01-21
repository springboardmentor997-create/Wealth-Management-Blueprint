from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import sys
from dotenv import load_dotenv
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load .env from the fastapi_backend directory
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

# Database URL - use PostgreSQL if available, fallback to SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./wealth_app_new.db")

logger.info(f"[Database] Attempting connection with: {DATABASE_URL[:60]}...")

try:
    # Try to create engine with the configured database
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
    )
    
    # Test the connection
    with engine.connect() as conn:
        logger.info("✅ [Database] Connection successful!")
    
    if "postgresql" in DATABASE_URL:
        logger.info("✅ [Database] Using PostgreSQL")
    elif "sqlite" in DATABASE_URL:
        logger.info("✅ [Database] Using SQLite")
    else:
        logger.info(f"✅ [Database] Using: {DATABASE_URL.split(':')[0]}")
        
except ImportError as e:
    # If there's a DLL/import error with PostgreSQL, fallback to SQLite
    logger.warning(f"⚠️  [Database] PostgreSQL driver issue detected: {str(e)[:100]}")
    logger.warning(f"⚠️  [Database] Falling back to SQLite...")
    DATABASE_URL = "sqlite:///./wealth_app_new.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    logger.info("✅ [Database] SQLite fallback engine created successfully")
except Exception as e:
    logger.error(f"❌ [Database] Connection error: {str(e)}")
    logger.warning(f"⚠️  [Database] Falling back to SQLite...")
    DATABASE_URL = "sqlite:///./wealth_app_new.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    logger.info("✅ [Database] SQLite fallback engine created successfully")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
