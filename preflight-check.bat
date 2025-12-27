@echo off
REM =============================================================================
REM RareNet Pre-Flight Check Script
REM Validates all dependencies before running setup
REM =============================================================================

echo.
echo ========================================
echo RareNet Pre-Flight Dependency Check
echo ========================================
echo.

set ERRORS=0

REM Check 1: Docker
echo [1/6] Checking Docker...
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not installed or not in PATH
    echo         Download from: https://www.docker.com/products/docker-desktop
    set /a ERRORS+=1
) else (
    docker --version
    echo [OK] Docker found
)
echo.

REM Check 2: Docker Compose
echo [2/6] Checking Docker Compose...
docker-compose --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker Compose is not installed
    echo         Usually included with Docker Desktop
    set /a ERRORS+=1
) else (
    docker-compose --version
    echo [OK] Docker Compose found
)
echo.

REM Check 3: Docker Running
echo [3/6] Checking if Docker is running...
docker ps >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not running
    echo         Start Docker Desktop and try again
    set /a ERRORS+=1
) else (
    echo [OK] Docker daemon is running
)
echo.

REM Check 4: Python
echo [4/6] Checking Python...
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH
    echo         Download Python 3.9+ from: https://www.python.org/downloads/
    set /a ERRORS+=1
) else (
    python --version
    for /f "tokens=2 delims= " %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo [OK] Python found: %PYTHON_VERSION%
    
    REM Check if version is 3.9+
    for /f "tokens=1,2 delims=." %%a in ("%PYTHON_VERSION%") do (
        if %%a LSS 3 (
            echo [WARNING] Python version should be 3.9 or higher
            set /a ERRORS+=1
        ) else if %%a EQU 3 (
            if %%b LSS 9 (
                echo [WARNING] Python version should be 3.9 or higher
                set /a ERRORS+=1
            )
        )
    )
)
echo.

REM Check 5: Node.js
echo [5/6] Checking Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo         Download from: https://nodejs.org/
    set /a ERRORS+=1
) else (
    node --version
    echo [OK] Node.js found
)
echo.

REM Check 6: Port Availability
echo [6/6] Checking port availability...

REM Check port 8000 (CyborgDB)
netstat -ano | findstr :8000 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [WARNING] Port 8000 is in use (needed for CyborgDB)
    echo           Run: docker-compose down
    set /a ERRORS+=1
) else (
    echo [OK] Port 8000 is available
)

REM Check port 8001 (Backend API)
netstat -ano | findstr :8001 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [WARNING] Port 8001 is in use (needed for Backend API)
    echo           Stop any running Python processes
    set /a ERRORS+=1
) else (
    echo [OK] Port 8001 is available
)

REM Check port 5173 (Frontend)
netstat -ano | findstr :5173 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [WARNING] Port 5173 is in use (needed for Frontend)
    echo           Stop any running Vite/Node processes
    set /a ERRORS+=1
) else (
    echo [OK] Port 5173 is available
)

REM Check port 6379 (Redis)
netstat -ano | findstr :6379 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [WARNING] Port 6379 is in use (needed for Redis)
    echo           Stop any running Redis instances
    set /a ERRORS+=1
) else (
    echo [OK] Port 6379 is available
)
echo.

REM Check disk space (optional)
echo [BONUS] Checking disk space...
for /f "tokens=3" %%a in ('dir /-c ^| find "bytes free"') do set FREESPACE=%%a
set FREESPACE=%FREESPACE:,=%
if %FREESPACE% LSS 5000000000 (
    echo [WARNING] Low disk space (less than 5GB free)
    echo           Docker images require ~2-3GB
) else (
    echo [OK] Sufficient disk space available
)
echo.

REM Final Summary
echo ========================================
echo Pre-Flight Check Complete
echo ========================================
echo.

if %ERRORS% EQU 0 (
    echo [SUCCESS] All checks passed! You're ready to run setup.bat
    echo.
    echo Next step: 
    echo   .\setup.bat
    echo.
    exit /b 0
) else (
    echo [FAILURE] %ERRORS% issue(s) found. Please fix the errors above.
    echo.
    echo Common fixes:
    echo   - Install missing software
    echo   - Start Docker Desktop
    echo   - Stop conflicting services: docker-compose down
    echo   - Close programs using required ports
    echo.
    pause
    exit /b 1
)
