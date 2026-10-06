# Hotel Booking System - Docker Startup Script (PowerShell)

# Hotel Booking System - Docker Compose Startup
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🐳 Khách Sạn Online - Docker Compose Startup" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file. Please update with your configuration." -ForegroundColor Green
}

# Build images
Write-Host ""
Write-Host "🔨 Building Docker images..." -ForegroundColor Cyan
docker-compose build

# Start services
Write-Host ""
Write-Host "🚀 Starting services..." -ForegroundColor Cyan
docker-compose up -d

Write-Host ""
Write-Host "✓ All services starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor Yellow
Write-Host "  • Frontend:        http://localhost:5173"
Write-Host "  • API Gateway:     http://localhost:8020"
Write-Host "  • Auth Service:    http://localhost:8021"
Write-Host "  • User Service:    http://localhost:8022"
Write-Host "  • Hotel-Room:      http://localhost:8023"
Write-Host "  • Booking Service: http://localhost:8024"
Write-Host "  • Payment-Noti:    http://localhost:8025"
Write-Host "  • MySQL:           localhost:3306"
Write-Host ""
Write-Host "Check status: docker-compose ps" -ForegroundColor Green
Write-Host "View logs:   docker-compose logs -f" -ForegroundColor Green
Write-Host "Stop all:    docker-compose down" -ForegroundColor Green
Write-Host ""
