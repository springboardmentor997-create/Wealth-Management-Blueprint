@echo off
echo Starting FastAPI Backend...
if exist "venv\Scripts\activate.bat" (
    call "venv\Scripts\activate.bat"
) else if exist "..\.venv\Scripts\activate.bat" (
    call "..\.venv\Scripts\activate.bat"
)
uvicorn main:app --reload --port 8000 --host 0.0.0.0
pause