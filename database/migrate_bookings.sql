USE khachsan;

-- Bước 1: Thêm cột check_in và check_out với DEFAULT để tránh lỗi '0000-00-00'
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS check_in  DATE NULL,
    ADD COLUMN IF NOT EXISTS check_out DATE NULL;

-- Bước 2: Copy dữ liệu từ cột cũ sang cột mới (nếu có dữ liệu)
UPDATE bookings
SET check_in  = check_in_date,
    check_out = check_out_date
WHERE check_in IS NULL AND check_in_date IS NOT NULL;

-- Bước 3: Set default cho các row có giá trị NULL
UPDATE bookings SET check_in = CURDATE() WHERE check_in IS NULL;
UPDATE bookings SET check_out = DATE_ADD(CURDATE(), INTERVAL 1 DAY) WHERE check_out IS NULL;

-- Bước 4: Đổi thành NOT NULL
ALTER TABLE bookings
    MODIFY COLUMN check_in  DATE NOT NULL,
    MODIFY COLUMN check_out DATE NOT NULL;

-- Bước 5: Thêm index
ALTER TABLE bookings
    ADD INDEX IF NOT EXISTS idx_booking_check_in (check_in);

-- Verify
SELECT 'Migration OK' AS result;
DESCRIBE bookings;
