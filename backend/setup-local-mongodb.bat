@echo off
echo ========================================
echo MongoDB Local Setup Helper
echo ========================================
echo.

:: Check if MongoDB is installed
where mongod >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] MongoDB is NOT installed
    echo.
    echo Please install MongoDB from:
    echo https://www.mongodb.com/try/download/community
    echo.
    echo Or use Chocolatey:
    echo choco install mongodb
    echo.
    pause
    exit /b 1
)

echo [✓] MongoDB is installed
echo.

:: Create data directory if it doesn't exist
if not exist "C:\data\db" (
    echo Creating MongoDB data directory...
    mkdir C:\data\db
    echo [✓] Created C:\data\db
) else (
    echo [✓] Data directory exists
)
echo.

:: Check if MongoDB service is running
sc query MongoDB | find "RUNNING" >nul
if %ERRORLEVEL% EQU 0 (
    echo [✓] MongoDB service is already running
) else (
    echo Starting MongoDB service...
    net start MongoDB >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo [✓] MongoDB service started
    ) else (
        echo [!] Could not start service, trying manual start...
        echo.
        echo Run this command in a new terminal:
        echo mongod --dbpath "C:\data\db"
        echo.
    )
)
echo.

:: Update .env file
echo Updating .env file to use local MongoDB...
cd /d "%~dp0"
if exist ".env" (
    powershell -Command "(Get-Content .env) -replace 'MONGO_URI=mongodb\+srv://.*', 'MONGO_URI=mongodb://localhost:27017/localworker' | Set-Content .env"
    echo [✓] Updated .env file
) else (
    echo [X] .env file not found
)
echo.

:: Test connection
echo Testing MongoDB connection...
mongosh --eval "db.version()" --quiet >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [✓] MongoDB is accessible
    echo.
    echo ========================================
    echo SUCCESS! MongoDB is ready to use
    echo ========================================
    echo.
    echo Now run: node server.js
    echo.
) else (
    echo [!] Could not connect to MongoDB
    echo.
    echo Try starting MongoDB manually:
    echo mongod --dbpath "C:\data\db"
    echo.
)

pause
