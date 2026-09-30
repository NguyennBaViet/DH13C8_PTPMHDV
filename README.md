Hệ Thống Đặt Phòng Khách Sạn – Microservices

 Danh Sách Services

 Công Nghệ Sử Dụng

- **Backend:** Spring Boot 3.2.5, Spring Security, Spring Data JPA, JJWT 0.11.5
- **Database:** MySQL 8.x (phpMyAdmin) – database `khachsan`
- **Frontend:** React 18 + Vite + TailwindCSS
- **Build:** Maven, JDK 17
- **Container:** Docker + Docker Compose

## Hướng Dẫn Chạy

### 1. Chuẩn bị Database
```sql
-- Chạy lần lượt trong phpMyAdmin
source database/schema.sql
source database/data.sql
```

### 2. Chạy từng service (theo thứ tự)
```bash
cd auth-service        && mvnw spring-boot:run
cd user-service        && mvnw spring-boot:run
cd hotel-room-service  && mvnw spring-boot:run
cd booking-service     && mvnw spring-boot:run
cd payment-noti-service && mvnw spring-boot:run
cd api-gateway         && mvnw spring-boot:run
```

### 3. Chạy Frontend
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

### 4. Hoặc chạy toàn bộ bằng Docker
```bash
cp .env.example .env   # cấu hình biến môi trường
docker compose up -d
```

## Tài Khoản Mẫu

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `Admin@123` |
| Staff | `staff01` | `Admin@123` |
| Guest | `guest01` | `Admin@123` |

## API Chính

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |
| GET | `/api/hotels?city=&checkIn=&checkOut=` | Tìm khách sạn |
| GET | `/api/rooms/{id}/availability` | Kiểm tra phòng trống |
| POST | `/api/bookings` | Tạo đặt phòng |
| POST | `/api/payments` | Thanh toán |
| GET | `/api/users/me/bookings` | Lịch sử đặt phòng |

