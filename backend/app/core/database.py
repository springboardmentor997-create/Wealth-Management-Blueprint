import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base # Updated import for newer SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

# 1. Get the URL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# 2. Validate it exists
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("DATABASE_URL is not set. Please check Render Environment Variables.")

# 3. 🛠️ FIX: Replace 'postgres://' with 'postgresql://'
# This is necessary because SQLAlchemy stopped supporting 'postgres://'
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 4. Create Engine
try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
except Exception as e:
    print(f"Error creating engine: {e}")
    raise e

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()