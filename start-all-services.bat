@echo off
echo ========================================
echo TechNexus AI Quiz Platform v2.1.0
echo ========================================
echo.
echo This will start 3 services in separate windows:
echo 1. AI Service (Port 8000) - Status Service
echo 2. Realtime Service (Port 4000) - WebSocket Server
echo 3. Frontend (Port 3000) - Next.js App with Chatbot
echo.
echo Press Ctrl+C in each window to stop a service
echo ========================================
echo.

REM Start AI Service
start "AI Service (Port 8000)" cmd /k "cd /d "%~dp0ai-service" && echo Starting AI Service v2.1.0... && python main.py"

REM Wait a bit for AI service to start
timeout /t 3 /nobreak >nul

REM Start Realtime Service
start "Realtime Service (Port 4000)" cmd /k "cd /d "%~dp0realtime-service" && echo Starting Realtime Service v2.0.0... && npm start"

REM Wait a bit for Realtime service to start
timeout /t 3 /nobreak >nul

REM Start Frontend
start "Frontend (Port 3000)" cmd /k "cd /d "%~dp0" && echo Starting Frontend with TechNexus Chatbot... && npm run dev"

echo.
echo ========================================
echo All services are starting!
echo ========================================
echo.
echo Check the opened windows for status.
echo.
echo Access the app at: http://localhost:3000
echo Try the TechNexus Chatbot (purple button)!
echo.
pause
