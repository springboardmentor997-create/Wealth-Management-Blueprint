@echo off
echo Starting Wealth Management Platform...
echo.
echo 1. Starting FastAPI Backend on http://localhost:8000
pushd "%~dp0fastapi_backend"
start "Backend" cmd /k "start-simple.bat"
popd

timeout /t 5 /nobreak > nul

echo 2. Starting React Frontend on http://localhost:5173
pushd "%~dp0wealth_frontend"
start "Frontend" cmd /k "npm run dev"
popd

echo.
echo Both services are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to exit...
pause > nul