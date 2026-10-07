# Mois Hotel - Docker Compose Stop Script

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    Mois Hotel - Docker Services Shutdown               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Change to project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Stopping containers..." -ForegroundColor Yellow
docker-compose down

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to stop Docker services" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "All containers stopped successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "To start containers again, run: .\start-docker.ps1" -ForegroundColor Yellow
