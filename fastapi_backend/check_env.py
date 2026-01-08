import sys
import os

print("Checking backend environment...")

try:
    import fastapi
    print(f"FastAPI version: {fastapi.__version__}")
except ImportError:
    print("ERROR: fastapi not installed.")

try:
    import uvicorn
    print(f"Uvicorn version: {uvicorn.__version__}")
except ImportError:
    print("ERROR: uvicorn not installed.")

try:
    import sqlalchemy
    print(f"SQLAlchemy version: {sqlalchemy.__version__}")
except ImportError:
    print("ERROR: sqlalchemy not installed.")

try:
    from main import app
    print("Successfully imported main.app. Backend code seems valid.")
except Exception as e:
    print(f"ERROR: Failed to import main.app: {e}")
    import traceback
    traceback.print_exc()

print("\nCheck complete.")
