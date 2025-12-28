@echo off
REM =============================================================================
REM RareNet Final Verification Script
REM Tests all improvements and ensures system is submission-ready
REM =============================================================================

echo.
echo ========================================
echo RareNet Submission Verification
echo ========================================
echo.

set PASS=0
set FAIL=0

REM Test 1: Docker Compose Services
echo [1/8] Checking Docker services...
docker-compose ps | findstr "Up" | findstr "healthy" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Docker services are running and healthy
    set /a PASS+=1
) else (
    echo [FAIL] Docker services not healthy. Run: docker-compose up -d
    set /a FAIL+=1
)
echo.

REM Test 2: Backend Health Endpoint
echo [2/8] Testing /health endpoint...
curl -s http://localhost:8001/health | findstr "ok" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Backend health endpoint responds
    set /a PASS+=1
) else (
    echo [FAIL] Backend health endpoint not responding
    set /a FAIL+=1
)
echo.

REM Test 3: Backend Ready Endpoint
echo [3/8] Testing /ready endpoint...
curl -s http://localhost:8001/ready | findstr "ready" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Backend readiness check passes
    set /a PASS+=1
) else (
    echo [FAIL] Backend not ready
    set /a FAIL+=1
)
echo.

REM Test 4: CyborgDB Connection
echo [4/8] Testing CyborgDB connection...
curl -s http://localhost:8000/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [PASS] CyborgDB is accessible
    set /a PASS+=1
) else (
    echo [FAIL] CyborgDB not responding
    set /a FAIL+=1
)
echo.

REM Test 5: Frontend Running
echo [5/8] Testing frontend...
curl -s http://localhost:5173 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Frontend is running
    set /a PASS+=1
) else (
    echo [FAIL] Frontend not responding (run: npm run dev)
    set /a FAIL+=1
)
echo.

REM Test 6: Documentation Files
echo [6/8] Checking documentation...
set DOC_COUNT=0
if exist "README.md" set /a DOC_COUNT+=1
if exist "QUICK_START.md" set /a DOC_COUNT+=1
if exist "TROUBLESHOOTING.md" set /a DOC_COUNT+=1
if exist "docs\K_ANONYMITY_FINDINGS.md" set /a DOC_COUNT+=1
if exist "docs\BENCHMARKS.md" set /a DOC_COUNT+=1
if exist "docs\CYBORG_DB_PRODUCT_GAPS.md" set /a DOC_COUNT+=1

if %DOC_COUNT% GEQ 6 (
    echo [PASS] All critical documentation present (%DOC_COUNT%/6)
    set /a PASS+=1
) else (
    echo [FAIL] Missing documentation files (%DOC_COUNT%/6)
    set /a FAIL+=1
)
echo.

REM Test 7: Configuration Files
echo [7/8] Checking configuration...
findstr "redis://redis:6379/0" docker-compose.yml >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Docker Compose Redis connection string fixed
    set /a PASS+=1
) else (
    echo [FAIL] Docker Compose still has old Redis connection format
    set /a FAIL+=1
)
echo.

REM Test 8: Dependencies Pinned
echo [8/8] Checking dependency versions...
findstr "fastapi==" backend\requirements.txt >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Backend dependencies are pinned
    set /a PASS+=1
) else (
    echo [FAIL] Backend dependencies not pinned
    set /a FAIL+=1
)
echo.

REM Final Summary
echo ========================================
echo Verification Summary
echo ========================================
echo.
echo Tests Passed: %PASS%/8
echo Tests Failed: %FAIL%/8
echo.

if %FAIL% EQU 0 (
    echo [SUCCESS] All verification tests passed!
    echo.
    echo Your project is submission-ready! ✓
    echo.
    echo Quick checks:
    echo   - Frontend: http://localhost:5173
    echo   - Backend API: http://localhost:8001/docs
    echo   - Health: http://localhost:8001/health
    echo   - Readiness: http://localhost:8001/ready
    echo.
    echo Login credentials:
    echo   Email: doctor@mumbai.hospital
    echo   Password: rarenet2024
    echo.
    echo Test search: "joint hypermobility, stretchy skin, easy bruising"
    echo Expected: Ehlers-Danlos Syndrome with ~90%% confidence
    echo.
    exit /b 0
) else (
    echo [WARNING] %FAIL% test(s) failed. Review errors above.
    echo.
    echo Common fixes:
    echo   - Run: docker-compose up -d
    echo   - Run: cd backend ^&^& python main.py
    echo   - Run: cd frontend ^&^& npm run dev
    echo.
    pause
    exit /b 1
)
