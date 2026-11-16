@echo off
echo ========================================================
echo Starting Inventory and Data Management System
echo ========================================================

:: 1. Ensure data directory exists
if not exist "%~dp0data\db" mkdir "%~dp0data\db"

:: 2. Start MongoDB Server in a new window
echo [1/3] Starting MongoDB Server on port 27017...
start "MongoDB Server (Port 27017)" "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath "%~dp0data\db" --port 27017

:: Wait 3 seconds for MongoDB to start
echo Waiting for MongoDB to initialize...
timeout /t 3 /nobreak >nul

:: 3. Seed Database
echo [2/3] Seeding initial data...
call npm run seed

:: 4. Start Express Server in a new window
echo [3/3] Starting Express Server on port 5000...
start "Express API Server (Port 5000)" cmd /k "cd /d %~dp0 && npm start"

echo ========================================================
echo Server and Database are now running!
echo URL: http://localhost:5000
echo ========================================================
pause
