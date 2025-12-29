$ErrorActionPreference = "Stop"

function Test-PortAvailable {
    param($Port)
    $con = (Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue)
    return $null -eq $con
}

Write-Host "🚀 Starting TechNexus Quiz Platform..." -ForegroundColor Cyan

# 1. Start AI Service
if (Test-PortAvailable 8000) {
    Write-Host "🤖 Starting AI Service on port 8000..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'ai-service'; python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
} else {
    Write-Host "⚠️  AI Service port 8000 is already in use (assuming it's running)." -ForegroundColor Yellow
}

# 2. Start Realtime Service
if (Test-PortAvailable 4000) {
    Write-Host "⚡ Starting Realtime Service on port 4000..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'realtime-service'; npm run dev"
} else {
    Write-Host "⚠️  Realtime Service port 4000 is already in use." -ForegroundColor Yellow
}

# 3. Start Frontend
if (Test-PortAvailable 3000) {
    Write-Host "🎨 Starting Frontend on port 3000..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'client'; npm run dev"
} else {
    Write-Host "⚠️  Frontend port 3000 is already in use." -ForegroundColor Yellow
}

# 4. Open Browser
Write-Host "🌐 Opening Browser..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"

Write-Host "✅ Done! Services are running in separate windows." -ForegroundColor Green
