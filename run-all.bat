@echo off
title Khoi dong he thong Hotel Microservices
echo ========================================================
echo    DANG KHOI DONG TOAN BO HE THONG HOTEL MICROSERVICES
echo ========================================================
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%

echo 1. Khoi dong auth-service (Port 8021)...
start "Auth Service - Port 8021" cmd /k "cd auth-service && mvnw spring-boot:run"

timeout /t 5 /nobreak >nul

echo 2. Khoi dong user-service (Port 8022)...
start "User Service - Port 8022" cmd /k "cd user-service && mvnw spring-boot:run"

echo 3. Khoi dong hotel-room-service (Port 8023)...
start "Hotel Room Service - Port 8023" cmd /k "cd hotel-room-service && mvnw spring-boot:run"

echo 4. Khoi dong booking-service (Port 8024)...
start "Booking Service - Port 8024" cmd /k "cd booking-service && mvnw spring-boot:run"

echo 5. Khoi dong payment-noti-service (Port 8025)...
start "Payment Noti Service - Port 8025" cmd /k "cd payment-noti-service && mvnw spring-boot:run"

timeout /t 10 /nobreak >nul

echo 6. Khoi dong API Gateway (Port 8020)...
start "API Gateway - Port 8020" cmd /k "cd api-gateway && mvnw spring-boot:run"

echo ========================================================
echo   TAT CA CAC SERVICES DANG DUOC KHOI DONG TRONG CUA SO RIENG
echo   Cong Gateway chinh: http://localhost:8020
echo ========================================================
