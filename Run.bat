@echo off

if "%1" neq "hidden" (
    start "" /min cmd /c "%~f0 hidden"
    exit
)

cd /d %~dp0

docker-compose up -d

:check
curl -s http://localhost:3000 > nul
if %errorlevel% neq 0 (
    timeout /t 2 > nul
    goto check
)

start "" "http://localhost:3000"

exit