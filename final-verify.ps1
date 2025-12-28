#!/usr/bin/env pwsh
# Final verification script before submission

Write-Host "`n=================================" -ForegroundColor Cyan
Write-Host "   RareNet Final Verification" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$allPassed = $true

# Check 1: Backend health
Write-Host "`n[1/6] Checking backend health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8001/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "  OK Backend is healthy" -ForegroundColor Green
    } else {
        Write-Host "  FAIL Backend returned status $($response.StatusCode)" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "  FAIL Backend not responding" -ForegroundColor Red
    $allPassed = $false
}

# Check 2: Backend readiness
Write-Host "`n[2/6] Checking backend readiness..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8001/ready" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "  OK Backend is ready" -ForegroundColor Green
    } else {
        Write-Host "  FAIL Backend not ready" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "  FAIL Backend readiness check failed" -ForegroundColor Red
    $allPassed = $false
}

# Check 3: Frontend
Write-Host "`n[3/6] Checking frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "  OK Frontend is running" -ForegroundColor Green
    } else {
        Write-Host "  FAIL Frontend returned status $($response.StatusCode)" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "  FAIL Frontend not responding" -ForegroundColor Red
    $allPassed = $false
}

# Check 4: CyborgDB
Write-Host "`n[4/6] Checking CyborgDB..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/v1/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "  OK CyborgDB is healthy" -ForegroundColor Green
    } else {
        Write-Host "  FAIL CyborgDB returned status $($response.StatusCode)" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "  FAIL CyborgDB not responding" -ForegroundColor Red
    $allPassed = $false
}

# Check 5: Database seeding
Write-Host "`n[5/6] Checking database..." -ForegroundColor Yellow
$statsPath = "backend\data\network_stats.json"
if (Test-Path $statsPath) {
    $stats = Get-Content $statsPath | ConvertFrom-Json
    $totalCases = $stats.total_cases
    if ($totalCases -eq 146) {
        Write-Host "  OK Database seeded with $totalCases patients" -ForegroundColor Green
    } else {
        Write-Host "  WARN Expected 146 patients, found $totalCases" -ForegroundColor Yellow
    }
} else {
    Write-Host "  FAIL Database stats file not found" -ForegroundColor Red
    $allPassed = $false
}

# Check 6: Documentation
Write-Host "`n[6/6] Checking documentation..." -ForegroundColor Yellow
$criticalDocs = @(
    "README.md",
    "FINAL_CHECKLIST.md",
    "docs\README.md",
    "docs\submission\CYBORGDB_EVALUATION.md",
    "docs\submission\HIPAA_COMPLIANCE.md",
    "docs\submission\VIDEO_SCRIPT.md",
    "docs\submission\TECHNICAL_JOURNEY.md",
    "docs\technical\ARCHITECTURE.md",
    "docs\technical\PRIVACY_IMPLEMENTATION.md",
    "docs\deployment\QUICK_START.md"
)

$missingDocs = @()
foreach ($doc in $criticalDocs) {
    if (-not (Test-Path $doc)) {
        $missingDocs += $doc
    }
}

if ($missingDocs.Count -eq 0) {
    Write-Host "  OK All critical documents present" -ForegroundColor Green
} else {
    Write-Host "  FAIL Missing documents:" -ForegroundColor Red
    foreach ($doc in $missingDocs) {
        Write-Host "    - $doc" -ForegroundColor Red
    }
    $allPassed = $false
}

# Summary
Write-Host "`n=================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "   ALL CHECKS PASSED" -ForegroundColor Green
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host "`n VIDEO NEXT: Record video demo" -ForegroundColor Yellow
    Write-Host "   Follow: docs\submission\VIDEO_SCRIPT.md" -ForegroundColor Yellow
    Write-Host "   Duration: 3-5 minutes" -ForegroundColor Yellow
    Write-Host "   Worth: 50% of hackathon grade!" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "   SOME CHECKS FAILED" -ForegroundColor Red
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host "`nFix the issues above before recording video" -ForegroundColor Yellow
    exit 1
}
