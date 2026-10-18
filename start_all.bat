@echo off
echo ============================================================
echo Starting CivicLens AI Application
echo "Turn community complaints into organized, actionable evidence."
echo ============================================================

set PATH=C:\Program Files\nodejs;C:\Users\Pramod\.local\bin;%PATH%

cd /d "%~dp0\backend"
echo Launching CivicLens AI Backend & Frontend on http://127.0.0.1:8000 ...
start "" http://127.0.0.1:8000
.venv\Scripts\python.exe run.py
pause
