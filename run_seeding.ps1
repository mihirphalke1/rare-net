# RareNet Optimal Seeding Script
# This script starts all services and seeds the database efficiently

Write-Host "RareNet Optimal Seeding Workflow" -ForegroundColor Cyan
$separator = "=" * 60
Write-Host $separator -ForegroundColor Gray

# Step 1: Start Docker Services
Write-Host ""
Write-Host "Step 1: Starting CyborgDB and Redis via Docker..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker failed to start. Please ensure Docker Desktop is running." -ForegroundColor Red
    Write-Host "Start Docker Desktop and run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "Docker services started" -ForegroundColor Green

# Step 2: Wait for services to be healthy
Write-Host ""
Write-Host "Step 2: Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$maxRetries = 12
$retryCount = 0
$cyborgHealthy = $false

while ($retryCount -lt $maxRetries -and -not $cyborgHealthy) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $cyborgHealthy = $true
            Write-Host "CyborgDB is healthy" -ForegroundColor Green
        }
    } catch {
        $retryCount++
        Write-Host "Waiting for CyborgDB... ($retryCount/$maxRetries)" -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $cyborgHealthy) {
    Write-Host "CyborgDB failed to become healthy" -ForegroundColor Red
    docker-compose logs cyborgdb
    exit 1
}

# Step 3: Start Backend in background
Write-Host ""
Write-Host "Step 3: Starting FastAPI Backend..." -ForegroundColor Yellow

$env:CYBORGDB_ENCRYPTION_KEY = "deadbeef1234567890abcdef1234567890abcdef1234567890abcdef12345678"
$env:PYTHONPATH = "C:\Users\aakan\Downloads\rare-net\backend"

# Start backend in a new PowerShell window
$command = "cd C:\Users\aakan\Downloads\rare-net\backend; `$env:CYBORGDB_ENCRYPTION_KEY='deadbeef1234567890abcdef1234567890abcdef1234567890abcdef12345678'; `$env:PYTHONPATH='C:\Users\aakan\Downloads\rare-net\backend'; python -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload"
$backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", $command -PassThru

Write-Host "Backend starting (PID: $($backendJob.Id))" -ForegroundColor Green

# Step 4: Wait for backend to be ready
Write-Host ""
Write-Host "Step 4: Waiting for backend to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

$maxRetries = 15
$retryCount = 0
$backendHealthy = $false

while ($retryCount -lt $maxRetries -and -not $backendHealthy) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8001/health" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $backendHealthy = $true
            Write-Host "Backend is healthy" -ForegroundColor Green
        }
    } catch {
        $retryCount++
        Write-Host "Waiting for backend... ($retryCount/$maxRetries)" -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $backendHealthy) {
    Write-Host "Backend failed to start" -ForegroundColor Red
    Write-Host "Check the backend window for errors" -ForegroundColor Yellow
    exit 1
}

# Step 5: Run the seeding script
Write-Host ""
Write-Host "Step 5: Running database seeding..." -ForegroundColor Yellow
Write-Host "This will populate the database with test data for privacy testing" -ForegroundColor Gray
Write-Host ""

cd C:\Users\aakan\Downloads\rare-net\backend

# Run quick_seed.py for fast seeding
python scripts\quick_seed.py

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Seeding completed successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Seeding completed with some errors" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host $separator -ForegroundColor Gray
Write-Host "RareNet is ready!" -ForegroundColor Green
Write-Host $separator -ForegroundColor Gray
Write-Host ""
Write-Host "Services Running:" -ForegroundColor Cyan
Write-Host "  CyborgDB:  http://localhost:8000" -ForegroundColor White
Write-Host "  Backend:   http://localhost:8001" -ForegroundColor White
Write-Host "  API Docs:  http://localhost:8001/docs" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Start the frontend: cd frontend; npm run dev" -ForegroundColor White
Write-Host "  2. Test privacy features at http://localhost:5173" -ForegroundColor White
Write-Host "  3. Try searching for symptoms to see K-anonymity in action" -ForegroundColor White
Write-Host ""
Write-Host "To stop services:" -ForegroundColor Cyan
Write-Host "  Close the backend window" -ForegroundColor White
Write-Host "  Run: docker-compose down" -ForegroundColor White
Write-Host ""
