# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# -------------------------------------------------------------------
# POSTGRESQL CONNECTION STRING
# -------------------------------------------------------------------
DATABASE_URL = "postgresql://postgres:wealthplanner@localhost:5432/wealth_management"

# Create the engine
engine = create_engine(DATABASE_URL)

# Create the SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the Base class
Base = declarative_base()

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()