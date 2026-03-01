@echo off

echo Starting backend...
cd backend

:: Start backend in background and redirect output to a file
start /b cmd /c ".\start-backend.bat > backend-output.txt 2>&1"

setlocal enabledelayedexpansion

:wait_for_port
:: Read the file and look for our port log
for /f "tokens=2 delims==" %%a in ('findstr "BACKEND_DYNAMIC_PORT=" backend-output.txt 2^>nul') do (
    set BACKEND_PORT=%%a
    goto :port_found
)

:: Wait a second and try again
ping 127.0.0.1 -n 2 > nul
goto :wait_for_port

:port_found
echo ✅ Backend successfully started on dynamic port: %BACKEND_PORT%

cd ..\frontend
echo Starting frontend...
set VITE_BACKEND_PORT=%BACKEND_PORT%
npm run dev

:: Clean up
taskkill /F /IM java.exe > nul 2>&1
