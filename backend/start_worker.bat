@echo off
echo Starting Wealth Manager Celery Worker...
echo.
echo IMPORTANT: Ensure Redis is running on localhost:6379 !
echo.

cd /d "%~dp0"
set PYTHONPATH=%PYTHONPATH%;%CD%

:: Launch Worker
start "Celery Worker" celery -A workers.celery_app worker --loglevel=info --pool=solo

:: Launch Beat (Scheduler)
start "Celery Beat" celery -A workers.celery_app beat --loglevel=info

echo Services started in separate windows.
pause
