# Stop and remove containers (PowerShell)

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🛑 Stopping all services..." -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan

docker-compose down

Write-Host "✓ All services stopped." -ForegroundColor Green
Write-Host ""
Write-Host "Remove volumes (reset database):" -ForegroundColor Yellow
Write-Host "  docker-compose down -v" -ForegroundColor Gray
Write-Host ""
