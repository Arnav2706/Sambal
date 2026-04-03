@echo off
echo ==================================================
echo         Starting SAMBAL AI Platform
echo ==================================================
echo.

echo [1/2] Starting Backend (FastAPI + XGBoost)...
start "SAMBAL Backend" cmd /k "cd sambal-backend && venv\Scripts\activate && uvicorn main_v2:app --reload"

echo [2/2] Starting Frontend (React + Vite)...
start "SAMBAL Frontend" cmd /k "cd sambal-frontend && npm run dev"

echo.
echo All services are launching!
echo The backend is running at http://127.0.0.1:8000
echo The frontend will open in your browser automatically...
echo.
echo Press any key to close this launcher window (Servers will stay running in their own windows).
timeout /t 5 >nul
start http://localhost:5173
