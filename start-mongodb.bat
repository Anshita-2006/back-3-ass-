@echo off
if not exist "%~dp0data\db" mkdir "%~dp0data\db"
echo Starting MongoDB on port 27017...
"C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath "%~dp0data\db" --port 27017
pause
