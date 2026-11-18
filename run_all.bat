@echo off
TITLE Persona AI - Full Stack Launcher
echo ========================================================
echo   PERSONA AI : Full-Stack Web + AI Assistant Launcher
echo ========================================================
echo.

REM 1. Check / Start Ollama LLM
echo [1/3] Checking Ollama LLM Service...
curl -s http://127.0.0.1:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting Ollama engine in the background...
    start "Ollama Engine" /B ollama serve
    timeout /t 3 >nul
) else (
    echo Ollama LLM is already running on port 11434.
)

REM 2. Start Backend
echo.
echo [2/3] Starting FastAPI Backend on port 8000...
start "PersonaAI-Backend" cmd /k "cd /d "%~dp0persona-ai-backend" && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

REM 3. Start Frontend
echo.
echo [3/3] Starting React Vite Frontend on port 5173...
start "PersonaAI-Frontend" cmd /k "cd /d "%~dp0persona-ai-frontend" && npm run dev"

echo.
echo Waiting 3 seconds for services to initialize...
timeout /t 3 >nul

REM Open in default browser
echo Opening PersonaAI in your default browser...
start http://localhost:5173

echo.
echo ========================================================
echo   All components are connected and running:
echo   - Frontend:  http://localhost:5173
echo   - Backend:   http://localhost:8000 (Docs: /docs)
echo   - Local LLM: Ollama llama3.2:3b (Port 11434)
echo ========================================================
echo.
pause
