@echo off
echo ===================================================
echo SAMBAL Platform Starter
echo ===================================================
echo.

set ROOT_DIR=%~dp0
set BACKEND_DIR=%ROOT_DIR%sambal-backend
set FRONTEND_DIR=%ROOT_DIR%sambal-frontend

echo [1/4] Setting up Backend Environment...
cd "%BACKEND_DIR%"
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)
echo Activating virtual environment and installing requirements...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
echo Backend setup complete.
echo.

echo [2/4] Checking AI Model...
if not exist "%BACKEND_DIR%\sambal_ai_v3.pkl" (
    echo *** Model file not found. Training SAMBAL AI v3 now — this takes ~2 minutes ***
    cd "%BACKEND_DIR%"
    python train_v3.py
    echo *** Model training complete! ***
) else (
    echo Model file found. Skipping training.
)
echo.

echo [3/4] Setting up Frontend Environment...
cd "%FRONTEND_DIR%"
if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install
)
echo Frontend setup complete.
echo.

echo [4/4] Starting Servers...
echo Starting Backend Server on port 8000...
start cmd /k "cd "%BACKEND_DIR%" && call venv\Scripts\activate.bat && python -m uvicorn main_v2:app --host 0.0.0.0 --port 8000 --reload"

echo Starting Frontend Server on port 5173...
start cmd /k "cd "%FRONTEND_DIR%" && npm run dev"

echo.
echo ===================================================
echo SAMBAL IS RUNNING!
echo ===================================================
echo Frontend UI: http://localhost:5173
echo Backend API: http://localhost:8000
echo.
echo You can close this window to keep servers running in the background.
pause
