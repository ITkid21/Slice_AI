@echo off
echo Starting SiliceAI Architect...

start "SiliceAI Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn main:app --reload"
timeout /t 2 >nul
start "SiliceAI Frontend" cmd /k "cd frontend && npm run dev"

echo App is running!
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
