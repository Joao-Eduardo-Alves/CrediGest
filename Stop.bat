@echo off
cd /d %~dp0

echo Parando CrediGest...
docker-compose down

echo.
echo Sistema finalizado!
pause