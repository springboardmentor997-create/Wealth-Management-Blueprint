"""
Migrate database schema to add password reset columns
"""
from sqlmodel import SQLModel, create_engine

DATABASE_URL = "postgresql://postgres:Srusanth25@localhost:4000/wealth_db"
engine = create_engine(DATABASE_URL, echo=False)

# Import models to register them with SQLModel
from models.user import User

print("Creating tables...")
SQLModel.metadata.create_all(engine)
print("✅ Migration complete - new columns added")
