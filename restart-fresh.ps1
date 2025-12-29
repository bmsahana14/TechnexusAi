$ports = @(3000, 4000, 8000)

Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Cyan

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($con in $connections) {
            $pid_to_kill = $con.OwningProcess
            if ($pid_to_kill -ne 0) {
                Write-Host "Killing process $pid_to_kill on port $port" -ForegroundColor Yellow
                Stop-Process -Id $pid_to_kill -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

Write-Host "✨ Ports cleared." -ForegroundColor Green
Start-Sleep -Seconds 2

# Clear Next.js lock if it exists (optional but safe)
if (Test-Path "client\.next\dev\lock") {
    Write-Host "🔓 Removing stale Next.js lock..." -ForegroundColor Yellow
    Remove-Item "client\.next\dev\lock" -Force -ErrorAction SilentlyContinue
}

Write-Host "🚀 Restarting services..." -ForegroundColor Cyan
.\start-dev.ps1
