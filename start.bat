@echo off
REM Persona AI Quick Start Script

echo.
echo ========================================
echo   PERSONA AI - Quick Start
echo ========================================
echo.
echo Choose mode:
echo 1. Full-Stack Web App (Frontend + Backend + Local LLM)
echo 2. CLI Text Mode
echo 3. CLI Voice Mode (Requires microphone)
echo 4. Test Gemini API Only
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo Starting Full-Stack Persona AI...
    call "%~dp0run_all.bat"
) else if "%choice%"=="2" (
    echo.
    echo Starting Persona AI in Text Mode...
    echo.
    python persona-ai-text.py
) else if "%choice%"=="3" (
    echo.
    echo Starting Persona AI in Voice Mode...
    echo.
    python persona-ai.py
) else if "%choice%"=="4" (
    echo.
    echo Testing Gemini API...
    echo.
    python quick_test.py
) else if "%choice%"=="5" (
    echo Goodbye!
    exit /b 0
) else (
    echo Invalid choice!
    exit /b 1
)

pause
