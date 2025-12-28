$env:CYBORGDB_ENCRYPTION_KEY = "deadbeef1234567890abcdef1234567890abcdef1234567890abcdef12345678"
$env:PYTHONPATH = "C:\Users\aakan\Downloads\rare-net\backend"

Write-Host "🔑 Encryption key set" -ForegroundColor Green
Write-Host "📁 PYTHONPATH set to: $env:PYTHONPATH" -ForegroundColor Cyan
Write-Host "🚀 Starting backend on http://127.0.0.1:8001..." -ForegroundColor Yellow
Write-Host ""

cd C:\Users\aakan\Downloads\rare-net\backend
python -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload
