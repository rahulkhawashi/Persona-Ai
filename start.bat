@echo off
REM Persona AI Quick Start Script

echo.
echo ========================================
echo   PERSONA AI - Quick Start
echo ========================================
echo.
echo Choose mode:
echo 1. Text Mode (Recommended for first test)
echo 2. Voice Mode (Requires microphone)
echo 3. Test API Only
echo 4. Exit
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo Starting Persona AI in Text Mode...
    echo.
    python persona-ai-text.py
) else if "%choice%"=="2" (
    echo.
    echo Starting Persona AI in Voice Mode...
    echo.
    python persona-ai.py
) else if "%choice%"=="3" (
    echo.
    echo Testing Gemini API...
    echo.
    python quick_test.py
) else if "%choice%"=="4" (
    echo Goodbye!
    exit /b 0
) else (
    echo Invalid choice!
    exit /b 1
)

pause
