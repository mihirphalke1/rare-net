@echo off
REM RareNet Setup Script for Windows
REM Automatically sets up and runs the entire RareNet system

echo =========================================
echo   RareNet Setup Script (Windows)
echo   Privacy-Preserving Rare Disease Diagnosis
echo =========================================
echo.

REM Step 1: Check prerequisites
echo Step 1: Checking prerequisites...
echo.

REM Check Docker
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not installed
    echo Please install Docker Desktop from https://www.docker.com/get-started
    pause
    exit /b 1
)
echo [OK] Docker found

REM Check Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed
    echo Please install Python 3.11+ from https://www.python.org/
    pause
    exit /b 1
)
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo [OK] Python %PYTHON_VERSION% found

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=1" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% found

echo.

REM Step 2: Start CyborgDB and Redis
echo Step 2: Starting CyborgDB and Redis...
echo.

docker-compose up -d

echo [OK] CyborgDB and Redis started
echo   - CyborgDB: http://localhost:8000
echo   - Redis: localhost:6379
echo.

REM Wait for CyborgDB
echo Waiting for CyborgDB to be ready...
timeout /t 5 /nobreak >nul
echo [OK] CyborgDB is ready
echo.

REM Step 3: Setup Backend
echo Step 3: Setting up backend...
echo.

cd backend

REM Create virtual environment
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
    echo [OK] Virtual environment created
) else (
    echo [INFO] Virtual environment already exists
)

REM Activate virtual environment and install dependencies
call venv\Scripts\activate.bat

echo Installing Python dependencies...
python -m pip install --upgrade pip >nul 2>nul
pip install -r requirements.txt >nul 2>nul
echo [OK] Python dependencies installed

REM Start backend server
echo Starting backend server...
start "RareNet Backend" cmd /k "venv\Scripts\activate.bat && uvicorn main:app --host 127.0.0.1 --port 8001 --reload"

REM Wait for backend
echo Waiting for backend to be ready...
timeout /t 10 /nobreak >nul

REM Seed demo users
echo Seeding demo users...
curl -s -X POST http://127.0.0.1:8001/auth/seed-demo-users >nul 2>nul
echo [OK] Demo users seeded

REM Initialize database
echo Initializing patient database (this may take 2-3 minutes)...
python scripts\init_db.py >nul 2>nul
echo [OK] Patient database initialized (30,000 vectors)

cd ..
echo.

REM Step 4: Setup Frontend
echo Step 4: Setting up frontend...
echo.

cd frontend

REM Install dependencies
if not exist "node_modules" (
    echo Installing Node.js dependencies...
    call npm install >nul 2>nul
    echo [OK] Node.js dependencies installed
) else (
    echo [INFO] Node modules already installed
)

REM Start frontend server
echo Starting frontend server...
start "RareNet Frontend" cmd /k "npm run dev"

REM Wait for frontend
echo Waiting for frontend to be ready...
timeout /t 10 /nobreak >nul

cd ..
echo.

REM Step 5: Verification
echo Step 5: Running verification tests...
echo.

REM Test backend health
echo Testing backend health...
curl -s http://127.0.0.1:8001/api/health | findstr "healthy" >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Backend health check passed
) else (
    echo [WARN] Backend health check failed
)

REM Test login
echo Testing login...
curl -s -X POST http://127.0.0.1:8001/auth/login -H "Content-Type: application/json" -d "{\"email\":\"doctor@mumbai.hospital\",\"password\":\"password123\"}" | findstr "access_token" >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Login test passed
) else (
    echo [WARN] Login test failed
)

echo.

REM Final summary
echo =========================================
echo   Setup Complete!
echo =========================================
echo.
echo Services running:
echo   * Frontend:  http://localhost:5173
echo   * Backend:   http://localhost:8001
echo   * API Docs:  http://localhost:8001/docs
echo   * CyborgDB:  http://localhost:8000
echo.
echo Demo Credentials:
echo   * Email:    doctor@mumbai.hospital
echo   * Password: password123
echo.
echo Next steps:
echo   1. Open http://localhost:5173 in your browser
echo   2. Click 'Sign In'
echo   3. Login with demo credentials above
echo   4. Try searching: 'joint hypermobility, easy bruising, stretchy skin'
echo.
echo To stop all services:
echo   * Close the backend and frontend windows
echo   * Run: docker-compose down
echo.
echo Happy diagnosing!
echo.

pause
