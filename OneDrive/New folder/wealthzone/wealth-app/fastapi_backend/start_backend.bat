@echo off
echo ========================================
echo  Starting Wealth Management Backend
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo Virtual environment not found. Running setup...
    call setup_environment.bat
    if errorlevel 1 (
        echo Setup failed. Please check the errors above.
        pause
        exit /b 1
    )
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Checking database connection...
python -c "from fastapi_backend.database import engine; engine.connect(); print('Database connection successful')"

if errorlevel 1 (
    echo Database connection failed. Creating tables...
    python -c "from models import Base; from fastapi_backend.database import ...
 engine; Base.metadata.create_all(bind=engine); print('Database initialized')"
)

echo.
echo Starting FastAPI server...
echo ========================================
echo  Server Information:
echo  - URL: http://localhost:8080
echo  - API Docs: http://localhost:8080/docs
echo  - ReDoc: http://localhost:8080/redoc
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn fastapi_backend.main:app --reload --host 0.0.0.0 --port 8080