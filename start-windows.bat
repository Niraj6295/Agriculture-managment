@echo off
echo.
echo ============================================
echo   Smart Agriculture - Startup Script
echo ============================================
echo.

REM Check MongoDB
echo [1/3] Checking MongoDB...
sc query MongoDB >nul 2>&1
if %errorlevel% == 0 (
    echo     MongoDB service found. Starting...
    net start MongoDB >nul 2>&1
) else (
    echo     MongoDB service not found.
    echo     Please start MongoDB manually before continuing.
    echo     e.g. mongod --dbpath C:\data\db
    pause
)

REM Backend
echo [2/3] Starting Backend on http://localhost:5000 ...
cd backend
if not exist node_modules (
    echo     Installing backend dependencies...
    npm install
)
start "SmartAgri Backend" cmd /k "npm run dev"
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Frontend
echo [3/3] Starting Frontend on http://localhost:5173 ...
cd frontend
if not exist node_modules (
    echo     Installing frontend dependencies...
    npm install
)
start "SmartAgri Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ============================================
echo   App running at http://localhost:5173
echo ============================================
echo.
echo   Admin:  admin@agri.com  / admin123
echo   Farmer: farmer@agri.com / farmer123
echo   Expert: expert@agri.com / expert123
echo.
pause
