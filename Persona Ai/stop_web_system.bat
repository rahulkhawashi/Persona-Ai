@echo off
echo Stopping Persona AI Web System...
taskkill /F /IM python.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
echo Done.
pause
