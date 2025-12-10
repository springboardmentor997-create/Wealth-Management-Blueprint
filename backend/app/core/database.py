from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from .config import settings  # Import settings from your config.py

# =================================================================
# 1. Database URL Configuration
# =================================================================

# Use the URI defined in config.py
# Example URI for SQLite: "sqlite:///./sql_app.db"
# Example URI for PostgreSQL: "postgresql://user:password@host:port/dbname"
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URI


# =================================================================
# 2. Engine and Session Creation
# =================================================================

# The engine is the main entry point to the database
# For SQLite, check_same_thread must be False for FastAPI to handle multiple requests
connect_args = {"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    **connect_args
)

# SessionLocal is a class used to create a new database session
# This session will be used by your FastAPI paths to interact with the database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# =================================================================
# 3. Base Class for Models
# =================================================================

# The Base class is used to define your SQLAlchemy models later in models.py
Base = declarative_base()


# =================================================================
# 4. Dependency: The get_db function
# =================================================================

# This function is used by FastAPI's dependency injection system (Depends)
# to provide a separate database session for each request.
def get_db():
    db = SessionLocal()
    try:
        yield db  # Return the session to the FastAPI endpoint
    finally:
        db.close() # Ensure the session is closed after the request is finished
