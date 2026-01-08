@echo off
echo Starting FastAPI Wealth Management Backend...
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Install dependencies
echo Installing dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Start the FastAPI server with Swagger enabled
echo.
echo Starting FastAPI server...
echo Swagger UI will be available at: http://localhost:8000/docs
echo ReDoc will be available at: http://localhost:8000/redoc
echo.
uvicorn main:app --reload --host 0.0.0.0 --port 8000