@echo off
title Wealth Manager Launcher
echo ===================================================
echo   Wealth Manager - Production Launcher 🚀
echo ===================================================
echo.

:: 1. Check for Backend Directory
if not exist "backend" (
    echo [ERROR] Backend directory not found!
    pause
    exit /b
)

cd backend

:: 2. Activate Virtual Environment
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else (
    echo [WARNING] venv not found. Running with system Python...
)

:: 3. Check dependencies (optional, fast check)
:: pip install -r requirements.txt

:: 4. Start Background Workers (Redis/Celery)
echo [INFO] Launching Background Workers...
start "Celery Services" call start_worker.bat

:: 5. Start Main Web Server
echo.
echo [INFO] Starting Web Server...
echo [INFO] Access the app at: http://localhost:8000
echo.
uvicorn main:app --host 0.0.0.0 --port 8000

pause
