# RareNet Ultimate Seeding & Startup Script
# Features: Auto-load .env, Fresh Start Option, Smart Health Checks, Full 8-Hospital Seeding

Write-Host "RareNet Ultimate Seeding Workflow" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray

# ---------------------------------------------------------
# 1. Parse .env file
# ---------------------------------------------------------
Write-Host "Step 1: Loading configuration from backend/.env..." -ForegroundColor Yellow
$envPath = "backend\.env"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match "^\s*([^#=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            # Remove quotes if present
            $value = $value -replace '^"|"$', ''
            [System.Environment]::SetEnvironmentVariable($key, $value, [System.EnvironmentVariableTarget]::Process)
            # Write-Host "  Loaded: $key" -ForegroundColor Gray
        }
    }
    Write-Host "Configuration loaded successfully." -ForegroundColor Green
} else {
    Write-Host "ERROR: backend/.env not found! Please create it first." -ForegroundColor Red
    exit 1
}

# Verify critical keys
if (-not $env:CYBORGDB_ENCRYPTION_KEY) {
    Write-Host "ERROR: CYBORGDB_ENCRYPTION_KEY not found in .env" -ForegroundColor Red
    exit 1
}

# ---------------------------------------------------------
# 2. Fresh Start Prompts
# ---------------------------------------------------------
Write-Host ""
Write-Host "Do you want to RESET all data? (Recommended for clean demo)" -ForegroundColor Yellow
$response = Read-Host "Type 'y' for YES, or enter to skip"

if ($response -eq 'y') {
    Write-Host "Step 2: NUKING Redis data..." -ForegroundColor Magenta
    docker-compose down -v
    Start-Sleep -Seconds 2
} else {
    Write-Host "Step 2: Keeping existing data..." -ForegroundColor Gray
}

# ---------------------------------------------------------
# 3. Start Docker
# ---------------------------------------------------------
Write-Host ""
Write-Host "Step 3: Starting CyborgDB and Redis..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker failed to start. Is Docker Desktop running?" -ForegroundColor Red
    exit 1
}

# ---------------------------------------------------------
# 4. Smart Health Check (Polled)
# ---------------------------------------------------------
Write-Host ""
Write-Host "Step 4: Waiting for CyborgDB (http://localhost:8000/v1/health)..." -ForegroundColor Yellow

$maxRetries = 30
$retryCount = 0
$cyborgHealthy = $false

while ($retryCount -lt $maxRetries -and -not $cyborgHealthy) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/v1/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $cyborgHealthy = $true
            Write-Host "  ✅ CyborgDB is ONLINE" -ForegroundColor Green
        }
    } catch {
        $retryCount++
        Write-Host "  ...waiting ($retryCount/$maxRetries)" -NoNewline
        Start-Sleep -Seconds 2
    }
}

if (-not $cyborgHealthy) {
    Write-Host "`nERROR: CyborgDB failed to start." -ForegroundColor Red
    docker-compose logs --tail 20 cyborgdb
    exit 1
}

# ---------------------------------------------------------
# 5. Start Backend
# ---------------------------------------------------------
Write-Host ""
Write-Host "Step 5: Starting FastAPI Backend..." -ForegroundColor Yellow

# Kill existing backend processes on port 8001 (optional but safe)
$port = 8001
$tcpConnection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($tcpConnection) {
    Write-Host "  Killing existing backend on port $port..." -ForegroundColor Gray
    Stop-Process -Id $tcpConnection.OwningProcess -Force -ErrorAction SilentlyContinue
}

# Construct command with explicit environment variables passed to the new shell
# We format the env vars as $env:KEY='VAL'; ...
$command = "cd backend; " +
           "`$env:CYBORGDB_ENCRYPTION_KEY='$($env:CYBORGDB_ENCRYPTION_KEY)'; " +
           "`$env:CYBORGDB_API_KEY='$($env:CYBORGDB_API_KEY)'; " +
           "python -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload"

$backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", $command -PassThru
Write-Host "  Backend launched (PID: $($backendJob.Id))" -ForegroundColor Green

# ---------------------------------------------------------
# 6. Wait for Backend Health
# ---------------------------------------------------------
Write-Host ""
Write-Host "Step 6: Waiting for Backend API..." -ForegroundColor Yellow

$maxRetries = 30
$retryCount = 0
$backendHealthy = $false

while ($retryCount -lt $maxRetries -and -not $backendHealthy) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8001/api/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $backendHealthy = $true
            Write-Host "  ✅ Backend is ONLINE" -ForegroundColor Green
        }
    } catch {
        $retryCount++
        Start-Sleep -Seconds 1
    }
}

if (-not $backendHealthy) {
    Write-Host "ERROR: Backend failed to start." -ForegroundColor Red
    exit 1
}

# ---------------------------------------------------------
# 7. Run Seeding (Conditioned on Reset)
# ---------------------------------------------------------
Write-Host ""
if ($response -eq 'y') {
    Write-Host "Step 7: Seeding 8 Hospitals (Global Network)..." -ForegroundColor Yellow
    
    cd backend
    python scripts\seed_8_hospitals.py
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Seeding Complete" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Seeding Failed" -ForegroundColor Red
        exit 1
    }

    Write-Host "Step 8: Synchronizing Stats..." -ForegroundColor Yellow
    python scripts\update_stats.py
    cd ..
    
} else {
    Write-Host "Skipping seeding (Data preserved)." -ForegroundColor Gray
}

# ---------------------------------------------------------
# Summary
# ---------------------------------------------------------
Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host "🚀 RareNet System Ready!" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:5173  (run 'npm run dev' if not started)"
Write-Host "  Backend:   http://localhost:8001"
Write-Host "  CyborgDB:  http://localhost:8000"
Write-Host ""
Write-Host "Encryption Key:" -ForegroundColor Cyan
Write-Host "  $($env:CYBORGDB_ENCRYPTION_KEY.Substring(0, 8))... (Matched & Loaded)"
Write-Host ""
Write-Host "Demo Instructions:" -ForegroundColor Cyan
Write-Host "1. Open Frontend"
Write-Host "2. Search 'joint hypermobility' -> SUCCESS"
Write-Host "3. Search 'progressive muscle rigidity' -> BLOCKED (Privacy Demo)"
Write-Host ""
