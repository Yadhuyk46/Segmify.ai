@echo off
setlocal

cd /d "%~dp0"

echo Starting Project A backend and frontend...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run_app.ps1"

echo.
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://127.0.0.1:5173
echo.
echo If the backend and frontend windows opened successfully, you can close this launcher window.
pause
