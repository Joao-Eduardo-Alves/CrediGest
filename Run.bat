@echo off
setlocal

cd /d %~dp0

echo Iniciando CrediGest...

REM Verifica se Docker está rodando
docker info >nul 2>&1
if errorlevel 1 (
    echo Docker nao esta rodando. Abra o Docker Desktop e tente novamente.
    pause
    exit /b
)

echo Subindo containers...
docker compose up -d

echo Aguardando frontend...

:check
powershell -Command "try { Invoke-WebRequest http://localhost:3000 -UseBasicParsing | Out-Null; exit 0 } catch { exit 1 }"
if errorlevel 1 (
    timeout /t 2 > nul
    goto check
)

echo Abrindo navegador...
start "" http://localhost:3000

exit
