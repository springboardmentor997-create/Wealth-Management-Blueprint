from sqlalchemy import MetaData
from app.core.database import engine, Base
from app.models import user 
# Note: You only need to import 'user' here to ensure the User table is created again.
# The 'reflection' part below handles finding/deleting the other tables automatically.

print("🗑️  Deleting all existing data...")

# 1. Create a "Metadata" object that reads the LIVE database
meta = MetaData()
meta.reflect(bind=engine) 

# 2. Drop everything found in the DB (Goals, Investments, etc. in the correct order)
# This fixes the "DependentObjectsStillExist" error!
meta.drop_all(bind=engine)

print("✨ Creating fresh tables...")
# 3. Create the tables defined in your code
Base.metadata.create_all(bind=engine)

print("✅ Database reset complete!")