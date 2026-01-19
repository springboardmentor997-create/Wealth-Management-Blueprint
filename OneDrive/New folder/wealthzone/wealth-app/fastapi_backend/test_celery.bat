@echo off
echo ========================================
echo  Celery Worker Setup and Test
echo ========================================
echo.

REM Check if Redis is running
echo Checking Redis connection...
redis-cli ping >nul 2>&1
if errorlevel 1 (
    echo WARNING: Redis is not running or not installed
    echo.
    echo To install Redis on Windows:
    echo 1. Download Redis from: https://github.com/microsoftarchive/redis/releases
    echo 2. Or use WSL: wsl --install then sudo apt install redis-server
    echo 3. Or use Docker: docker run -d -p 6379:6379 redis:alpine
    echo.
    echo Skipping Celery setup for now...
    pause
    exit /b 1
)

echo Redis is running ✅
echo.

REM Activate virtual environment
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate
) else (
    echo Virtual environment not found. Please run setup_environment.bat first.
    pause
    exit /b 1
)

echo Testing Celery configuration...
python -c "from celery_app import celery_app; print('Celery app created successfully'); print(f'Broker: {celery_app.conf.broker_url}'); print(f'Backend: {celery_app.conf.result_backend}')"

echo.
echo Starting Celery worker with beat scheduler...
echo Press Ctrl+C to stop
echo.

celery -A celery_app worker --beat --loglevel=info -P solo