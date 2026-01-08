@echo off
echo Starting Celery Worker (with Beat)...
cd /d "%~dp0"
if exist "..\.venv\Scripts\activate.bat" (
    call "..\.venv\Scripts\activate.bat"
) else (
    echo Virtual environment not found at ..\.venv
    exit /b 1
)

echo.
echo NOTE: Redis must be running on localhost:6379 for this to work.
echo Starting worker...
celery -A celery_app worker --beat --loglevel=info -P solo
pause
