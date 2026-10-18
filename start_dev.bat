@echo off
echo ============================================================
echo Starting CivicLens AI in Development Mode (FastAPI + Vite)
echo ============================================================

set PATH=C:\Program Files\nodejs;C:\Users\Pramod\.local\bin;%PATH%

start "CivicLens AI Backend (FastAPI)" cmd /k "cd /d %~dp0backend && .venv\Scripts\python.exe run.py"
timeout /t 2 >nul
start "CivicLens AI Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Backend: http://127.0.0.1:8000
echo Frontend Dev Server: http://localhost:5173
echo.
