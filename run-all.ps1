# Script chạy toàn bộ microservices
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
    Start-Sleep -Seconds 3
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Tat ca 6 services da duoc bat trong cac cua so PowerShell!" -ForegroundColor Green
Write-Host "API Gateway (diem goi API tap trung): http://localhost:8020" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
