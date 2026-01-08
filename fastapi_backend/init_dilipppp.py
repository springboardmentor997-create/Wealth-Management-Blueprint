from database import engine
from models import Base
from sqlalchemy import inspect

print(f"Connecting to database: {engine.url.database}")
print("Creating tables...")
Base.metadata.create_all(bind=engine)

Inspector = inspect(engine)
tables = Inspector.get_table_names()
print(f"Tables created successfully: {tables}")
