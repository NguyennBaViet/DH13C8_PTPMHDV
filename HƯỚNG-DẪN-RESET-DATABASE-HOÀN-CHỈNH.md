# 🔄 HƯỚNG DẪN: XÓA VÀ ĐẶT LẠI CƠ SỞ DỮ LIỆU HOÀN CHỈNH

## 📌 MỤC TIÊU
- ❌ XÓA CƠ SỞ DỮ LIỆU CŨ (khachsan)
- ✅ TẠO CƠ SỞ DỮ LIỆU MỚI VỚI UTF-8MB4
- 📊 THÊM DỮ LIỆU MẪU (5 KHÁCH SẠN, 21 PHÒNG, 5 NGƯỜI DÙNG)

---

## 🚀 CÁCH THỰC HIỆN (3 BƯỚC)

### BƯỚC 1: MỞ phpMyAdmin

**ĐỊA CHỈ:**
```
http://localhost:8888/phpmyadmin/
```

**ĐĂNG NHẬP:**
- TÊN ĐĂNG NHẬP: `root`
- MẬT KHẨU: (ĐỂ TRỐNG)

**NHẤP "GO" ĐỂ ĐĂNG NHẬP**

---

### BƯỚC 2: MỞ TAB SQL VÀ CHẠY SCRIPT

**1. NHẤP TAB "SQL"**
- Nằm ở đầu trang phpMyAdmin
- Hoặc: Nhấp "CỠ SỞ DỮ LIỆU" → "SQL"

**2. SAO CHÉP TOÀN BỘ NỘI DUNG**
- MỞ TẬP TIN: `d:\DH13C8_PTPMHDV\database\reset-for-root.sql`
- CHỌN TẤT CẢ (Ctrl+A)
- SAO CHÉP (Ctrl+C)

**3. DÁN VÀO phpMyAdmin**
- NHẤP VÀO KHUNG SOẠN THẢO SQL
- DÁN (Ctrl+V)

**4. CHẠY SCRIPT**
- NHẤP NÚT "GO" (HOẶC NHẤN Ctrl+Enter)

**5. CHỜ HOÀN THÀNH**
- BẠN SẼ THẤY THÔNG BÁO:
  ```
  ✅ DATABASE RESET HOÀN TẤT - ROOT USER
  TỔNG SỐ KHÁCH SẠN: 5
  TỔNG SỐ PHÒNG: 21
  TỔNG SỐ NGƯỜI DÙNG: 5
  ```

---

### BƯỚC 3: KIỂM TRA DỮ LIỆU VÀ KHỞI ĐỘNG LẠI SERVICES

**KIỂM TRA TRONG phpMyAdmin:**
1. NHẤP CƠSỞ DỮ LIỆU "khachsan"
2. NHẤP BẢNG "hotels"
3. NHẤ NTAB "DUYỆT"
4. KIỂM TRA 5 KHÁCH SẠN CÓ HIỂN THỊ KHÔNG
5. TIẾNG VIỆT PHẢI HIỂN THỊ ĐÚNG: "HÀ NỘI", "ĐÀ NẴNG"...

**KHỞI ĐỘNG LẠI SERVICES:**

MỞ POWERSHELL VÀ CHẠY:
```powershell
cd "d:\DH13C8_PTPMHDV"
.\run-all.ps1
```

**CHỜ KHOẢNG 30-40 GIÂY** để tất cả services khởi động.

---

## ✅ KIỂM TRA KẾT QUẢ

### KIỂM TRA #1: API

MỞ TRÌNH DUYỆT VÀ VÀO:
```
http://localhost:8020/api/hotels?page=0&size=5
```

**PHẢI THẤY:**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Grand Palace Hotel",
      "city": "Hà Nội",
      "description": "Khách sạn 5 sao sang trọng...",
      "starRating": 5,
      "isActive": true
    },
    ...
  ],
  "totalElements": 5
}
```

✅ **TIẾNG VIỆT ĐÚNG**: "Hà Nội", "Khách sạn"... (KHÔNG PHẢI ????)

### KIỂM TRA #2: FRONTEND

MỞ TRÌNH DUYỆT VÀO:
```
http://localhost:5173/admin/hotels
```

**ĐĂNG NHẬP:**
- TÊN ĐĂNG NHẬP: `admin`
- MẬT KHẨU: `Admin@123`

**PHẢI THẤY:**
- ✅ 5 KHÁCH SẠN TRONG DANH SÁCH
- ✅ TIẾNG VIỆT ĐÚNG (KHÔNG PHẢI ????)
- ✅ CÓ THỂ NHẤP VÀO TỪNG KHÁCH SẠN ĐỂ XEM CHI TIẾT
- ✅ CÓ THỂ THÊM KHÁCH SẠN MỚI (SẼ LƯU VÀO DATABASE)

### KIỂM TRA #3: DỮ LIỆU KHÁCH SẠN

**DANH SÁCH 5 KHÁCH SẠN:**

1. **Grand Palace Hotel** (Hà Nội)
   - Sao: 5 sao
   - Địa chỉ: 49 Lý Thái Tổ

2. **Sunrise Beach Resort** (Đà Nẵng)
   - Sao: 4 sao
   - Địa chỉ: 30 Trường Sa

3. **Saigon Boutique Hotel** (Hồ Chí Minh)
   - Sao: 3 sao
   - Địa chỉ: 22 Bùi Viện

4. **Hội An Ancient Town Hotel** (Hội An)
   - Sao: 4 sao
   - Địa chỉ: 5 Trần Phú

5. **Nha Trang Pearl Hotel** (Nha Trang)
   - Sao: 4 sao
   - Địa chỉ: 68 Trần Phú

---

## 🧪 KIỂM TRA ENCODING

**TRỰC TIẾP TRONG phpMyAdmin:**

1. MỞ phpMyAdmin
2. NHẤP BẢNG "hotels"
3. NHẤP "DUYỆT"
4. KIỂM TRA CỘT "city":
   - PHẢI THẤY: "Hà Nội", "Đà Nẵng", "Hồ Chí Minh"...
   - KHÔNG PHẢI: "H?? N???i", "???? N?????"...

**NẾU ENCODING VẪN SAI:**
- KIỂM TRA: phpMyAdmin → TRẠNG THÁI → BỘ KÝ TỰ MÁY CHỦ
- PHẢI LÀ: `utf8mb4`
- NẾUP KHÔNG PHẢI: LIÊN HỆ QUẢN TRỊ MYSQL

---

## ⚠️ NẾU CÓ LỖI

### LỖI 1: phpMyAdmin HỎI MẬT KHẨU ROOT
**GIẢI PHÁP:**
- Nếu MySQL set password cho root → Nhập password
- Nếu root không có password → Bỏ trống

### LỖI 2: "DATABASES CÓ TỒN TẠI"
**GIẢI PHÁP:**
- Script sẽ xóa database cũ tự động
- Nhấp "OK" để xác nhận

### LỖI 3: KHÔNG THẤY TIẾNG VIỆT (????)
**GIẢI PHÁP:**
- Kiểm tra MySQL charset: UTF-8MB4
- Khởi động lại MySQL: Mở Services → MySQL
- Khởi động lại Services: .\run-all.ps1

### LỖI 4: KHÔNG THỂ ĐẲN NHẬP ADMIN
**GIẢI PHÁP:**
- Password: `Admin@123` (CHỮ "A" VIẾT HOA)
- Nếu vẫn không được: Dữ liệu chưa nạp → Kiểm tra lại bước 2

---

## 📊 DỮ LIỆU ĐƯỢC THÊM

### NGƯỜI DÙNG (5):
1. `admin` / `Admin@123` (QUẢN TRỊ VIÊN)
2. `staff01` / (NHÂN VIÊN)
3. `guest01` / (KHÁCH)
4. `guest02` / (KHÁCH)
5. `guest03` / (KHÁCH)

### KHÁCH SẠN (5):
- Grand Palace Hotel (Hà Nội, 5⭐)
- Sunrise Beach Resort (Đà Nẵng, 4⭐)
- Saigon Boutique Hotel (Hồ Chí Minh, 3⭐)
- Hội An Ancient Town Hotel (Hội An, 4⭐)
- Nha Trang Pearl Hotel (Nha Trang, 4⭐)

### PHÒNG (21):
- Grand Palace Hotel: 5 phòng
- Sunrise Beach Resort: 5 phòng
- Saigon Boutique Hotel: 4 phòng
- Hội An Ancient Town Hotel: 3 phòng
- Nha Trang Pearl Hotel: 4 phòng

### TIỆN NGHI (15):
- WiFi, Hồ bơi, Nhà hàng, Phòng gym, Bãi đỗ xe, Spa...

---

## 📋 TÓMEN TẮT

| BƯỚC | HÀNH ĐỘNG | KẾT QUẢ |
|------|----------|--------|
| 1 | MỞ phpMyAdmin | ĐĂNG NHẬP THÀNH CÔNG |
| 2 | CHẠY SCRIPT | DATABASE MỚI + DỮ LIỆU MẪU |
| 3 | KHỞI ĐỘNG LẠI SERVICES | SERVICES KẾT NỐI DATABASE |
| 4 | KIỂM TRA WEB | HIỂN THỊ 5 KHÁCH SẠN, TIẾNG VIỆT ĐÚNG |

---

## 🎉 HOÀN THÀNH

✅ **SAU KHI HOÀN THÀNH:**
- DATABASE TRỐNG + CLEAN
- DỮ LIỆU MẪU TIẾNG VIỆT ĐẦY ĐỦ
- SERVICES KẾT NỐI ĐÚNG
- FRONTEND HIỂN THỊ 5 KHÁCH SẠN
- CÓ THỂ THÊM/SỬA/XÓA KHÁCH SẠN MỚI
- ĐĂNG KÝ & ĐĂNG NHẬP HOẠT ĐỘNG BÌNH THƯỜNG

