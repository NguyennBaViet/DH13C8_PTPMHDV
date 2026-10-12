-- Migration: Thêm cột maintenance_today và maintenance_count vào bảng rooms
USE khachsan;

ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS maintenance_today TINYINT(1) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS maintenance_count INT NOT NULL DEFAULT 0;

SELECT 'Migration: Added maintenance_today and maintenance_count columns to rooms table' AS result;
DESCRIBE rooms;
