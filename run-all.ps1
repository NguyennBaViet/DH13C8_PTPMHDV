# Script chạy toàn bộ hệ thống Khách Sạn (Backend Microservices + Frontend React)
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   KHOI DONG TOAN BO HE THONG HOTEL MICROSERVICES" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

$services = @(
    @{ Name = "auth-service"; Port = 8021 },
    @{ Name = "user-service"; Port = 8022 },
    @{ Name = "hotel-room-service"; Port = 8023 },
    @{ Name = "booking-service"; Port = 8024 },
    @{ Name = "payment-noti-service"; Port = 8025 },
    @{ Name = "api-gateway"; Port = 8020 }
)

foreach ($s in $services) {
    Write-Host "-> Dang khoi dong $($s.Name) tren Port $($s.Port)..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:JAVA_HOME='C:\Program Files\Java\jdk-17'; cd '$PWD\$($s.Name)'; .\mvnw spring-boot:run"
    Start-Sleep -Seconds 2
}

# Khởi động Frontend
Write-Host "-> Dang khoi dong Frontend React (Port 5173)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; if (-not (Test-Path 'node_modules')) { Write-Host 'Cai dat dependencies cho frontend...'; npm.cmd install }; npm.cmd run dev"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Tat ca 6 Backend Services va Frontend da duoc khoi dong!" -ForegroundColor Green
Write-Host "Giao dien Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "API Gateway:        http://localhost:8020" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan