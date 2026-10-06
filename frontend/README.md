# Mois Hotel - Frontend

Frontend cho hệ thống đặt khách sạn "Mois" - một ứng dụng web hiện đại xây dựng với React, Vite, và TailwindCSS.

## 📋 Tính Năng

### Trang Chính
- **Trang Chủ**: Hero section, tìm kiếm khách sạn nhanh, khách sạn nổi bật
- **Tìm Kiếm**: Lọc theo thành phố, giá, đánh giá
- **Chi Tiết Khách Sạn**: Thông tin đầy đủ, loại phòng, tiện ích

### Người Dùng
- **Đăng Nhập/Đăng Ký**: Tạo tài khoản mới hoặc đăng nhập
- **Hồ Sơ Cá Nhân**: Xem, chỉnh sửa thông tin, đổi mật khẩu
- **Đơn Đặt Phòng**: Xem lịch sử, hủy đơn

### Đặt Phòng & Thanh Toán
- **Đặt Phòng**: Form chi tiết với yêu cầu đặc biệt
- **Thanh Toán**: Hỗ trợ nhiều phương thức (thẻ, chuyển khoản, ví)
- **Xác Nhận**: Hiển thị trạng thái thanh toán

## 🚀 Cài Đặt & Chạy

### Yêu Cầu
- Node.js 16+ 
- npm hoặc yarn

### Bước 1: Cài Đặt Dependencies
```bash
cd frontend
npm install
```

### Bước 2: Cấu Hình Môi Trường
Tạo file `.env.development`:
```
VITE_API_URL=http://localhost:8080/api
```

### Bước 3: Chạy Dev Server
```bash
npm run dev
```

Truy cập `http://localhost:5173` trong trình duyệt.

## 📁 Cấu Trúc Thư Mục

```
frontend/
├── src/
│   ├── components/          # Các component dùng chung
│   │   ├── Header.jsx      # Header với navigation
│   │   └── Footer.jsx      # Footer
│   ├── pages/              # Các trang chính
│   │   ├── Home.jsx        # Trang chủ
│   │   ├── Login.jsx       # Đăng nhập
│   │   ├── Register.jsx    # Đăng ký
│   │   ├── HotelSearch.jsx # Tìm kiếm khách sạn
│   │   ├── HotelDetail.jsx # Chi tiết khách sạn
│   │   ├── Booking.jsx     # Đặt phòng
│   │   ├── Payment.jsx     # Thanh toán
│   │   ├── MyBookings.jsx  # Đơn của tôi
│   │   └── UserProfile.jsx # Hồ sơ cá nhân
│   ├── services/           # API services
│   │   ├── api.js          # Axios config
│   │   ├── authService.js  # Xác thực
│   │   ├── hotelService.js # Khách sạn
│   │   ├── bookingService.js # Đặt phòng
│   │   └── paymentService.js # Thanh toán
│   ├── context/            # React Context
│   │   └── AuthContext.jsx # Auth state
│   ├── hooks/              # Custom hooks
│   │   └── useAuth.js      # useAuth hook
│   ├── App.jsx             # App root
│   ├── main.jsx            # Entry point
│   ├── App.css             # App styles
│   └── index.css           # Global styles
├── index.html              # HTML template
├── tailwind.config.js      # TailwindCSS config
├── vite.config.js          # Vite config
├── package.json            # Dependencies
└── README.md               # This file
```

## 🎨 Thiết Kế & Màu Sắc

Mois sử dụng luxury color scheme:
- **Primary**: Xanh đen (#1f2937) - chủ yếu cho background, text
- **Luxury Gold**: Vàng ánh vàng (#d4af37) - accent, buttons, highlights
- **Background**: Xanh nhạt (#f9fafb)

## 📦 Dependencies

### Core
- `react` - UI library
- `react-dom` - React DOM
- `react-router-dom` - Routing

### Styling
- `tailwindcss` - CSS framework
- `postcss` - CSS processor
- `autoprefixer` - CSS vendor prefix

### HTTP
- `axios` - HTTP client

### Icons
- `lucide-react` - Icon library

### Dev Tools
- `vite` - Build tool
- `eslint` - Linter
- `@vitejs/plugin-react` - React plugin

## 🔧 Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Check code quality
```

## 🔌 API Integration

Frontend kết nối với backend API tại `http://localhost:8080/api`.

### Endpoints được sử dụng:
- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký
- `GET /hotels` - Danh sách khách sạn
- `GET /hotels/:id` - Chi tiết khách sạn
- `GET /hotels/:id/rooms` - Loại phòng
- `POST /bookings` - Tạo đơn đặt
- `GET /bookings/my-bookings` - Đơn của tôi
- `POST /bookings/:id/cancel` - Hủy đơn
- `POST /payments` - Tạo thanh toán
- `POST /payments/:id/process` - Xử lý thanh toán

## 🔐 Xác Thực

Hệ thống sử dụng JWT (JSON Web Token):
- Token được lưu trong `localStorage`
- Tự động gửi trong header `Authorization: Bearer <token>`
- Tự động xóa nếu nhận response 401

## 🎯 Trạng Thái Authentication

```jsx
// Sử dụng useAuth hook
const { user, login, logout, register } = useAuth()

// Kiểm tra đăng nhập
if (user) {
  // User đã đăng nhập
} else {
  // User chưa đăng nhập
}
```

## 📱 Responsive Design

Mois hoàn toàn responsive:
- Mobile-first approach
- Tailwind breakpoints: sm, md, lg, xl
- Flexible grid layouts
- Touch-friendly buttons

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

Output được tạo tại folder `dist/`.

### Serve với HTTP Server
```bash
npm install -g serve
serve -s dist -l 3000
```

## 🐛 Troubleshooting

### Port 5173 đã được sử dụng
```bash
npm run dev -- --port 5174
```

### API connection refused
- Kiểm tra backend đang chạy trên port 8080
- Kiểm tra `.env.development` có URL đúng
- Kiểm tra CORS settings trên backend

### Styles không được áp dụng
```bash
# Rebuild Tailwind
rm -rf node_modules/.vite
npm run dev
```

## 📞 Support

Liên hệ: info@mois.vn

## 📝 License

© 2024 Mois Hotel. All rights reserved.
