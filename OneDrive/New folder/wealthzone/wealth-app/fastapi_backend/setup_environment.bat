@echo off
echo ========================================
echo  Wealth Management Backend Setup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and add it to PATH
    pause
    exit /b 1
)

echo 1. Creating virtual environment...
if exist "venv" (
    echo Virtual environment already exists, removing old one...
    rmdir /s /q venv
)
python -m venv venv

echo 2. Activating virtual environment...
call venv\Scripts\activate

echo 3. Upgrading pip...
python -m pip install --upgrade pip

echo 4. Installing dependencies...
pip install -r requirements.txt

echo 5. Setting up database...
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
)

echo 6. Creating database tables...
python -c "from models import Base; from database import engine; Base.metadata.create_all(bind=engine); print('Database tables created successfully')"

echo 7. Creating uploads directories...
if not exist "uploads" mkdir uploads
if not exist "uploads\kyc_documents" mkdir uploads\kyc_documents
if not exist "uploads\profile_pictures" mkdir uploads\profile_pictures
if not exist "uploads\reports" mkdir uploads\reports

echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo To start the server, run: start-simple.bat
echo API Documentation: http://localhost:8080/docs
echo.
pause