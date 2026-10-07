@echo off
title Khoi dong toan bo he thong Hotel Microservices
echo ========================================================
echo    DANG KHOI DONG TOAN BO HE THONG HOTEL MICROSERVICES
echo ========================================================
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%

echo [0/7] Giai phong cac port cu (8020, 8021, 8022, 8023, 8024, 8025, 5173)...
for %%p in (8020 8021 8022 8023 8024 8025 5173) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING') do (
        taskkill /F /PID %%a >nul 2>&1
    )
)
timeout /t 2 /nobreak >nul

echo 1. Khoi dong auth-service (Port 8021)...
start "Auth Service - Port 8021" cmd /k "cd auth-service && mvnw.cmd spring-boot:run"
timeout /t 3 /nobreak >nul

echo 2. Khoi dong user-service (Port 8022)...
start "User Service - Port 8022" cmd /k "cd user-service && mvnw.cmd spring-boot:run"

echo 3. Khoi dong hotel-room-service (Port 8023)...
start "Hotel Room Service - Port 8023" cmd /k "cd hotel-room-service && mvnw.cmd spring-boot:run"

echo 4. Khoi dong booking-service (Port 8024)...
start "Booking Service - Port 8024" cmd /k "cd booking-service && mvnw.cmd spring-boot:run"

echo 5. Khoi dong payment-noti-service (Port 8025)...
start "Payment Noti Service - Port 8025" cmd /k "cd payment-noti-service && mvnw.cmd spring-boot:run"
timeout /t 5 /nobreak >nul

echo 6. Khoi dong API Gateway (Port 8020)...
start "API Gateway - Port 8020" cmd /k "cd api-gateway && mvnw.cmd spring-boot:run"

echo 7. Khoi dong Frontend (Port 5173)...
start "Frontend React - Port 5173" cmd /k "cd frontend && if not exist node_modules (npm.cmd install) && npm.cmd run dev"

echo ========================================================
echo   TAT CA CAC SERVICES VA FRONTEND DANG DUOC KHOI DONG!
echo   Giao dien Web: http://localhost:5173
echo   API Gateway:   http://localhost:8020
echo ========================================================