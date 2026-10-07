@echo off
title Dung toan bo he thong Hotel Microservices
echo ========================================================
echo   DANG DUNG TOAN BO HE THONG HOTEL MICROSERVICES
echo ========================================================

for %%p in (8020 8021 8022 8023 8024 8025 5173) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING') do (
        echo Dang tat process tren port %%p (PID: %%a)...
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo ========================================================
echo   DA GIAI PHONG TOAN BO PORTS (8020-8025, 5173)!
echo ========================================================
pause
