USE khachsan;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE refresh_tokens;
TRUNCATE TABLE audit_log;
TRUNCATE TABLE notifications;
TRUNCATE TABLE payments;
TRUNCATE TABLE reviews;
TRUNCATE TABLE bookings;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Password: Admin@123 (BCrypt rounds=10)
INSERT INTO users (username, email, password, full_name, phone, address, role, is_active) VALUES
('admin',   'admin@khachsan.vn',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lzmW', 'Quan Tri Vien',     '0901234567', 'Ha Noi',    'ADMIN', 1),
('staff01', 'staff01@khachsan.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lzmW', 'Nhan Vien Le Tan',  '0907654321', 'Da Nang',   'STAFF', 1),
('guest01', 'guest01@gmail.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lzmW', 'Nguyen Van An',     '0912345678', 'TP.HCM',    'GUEST', 1),
('guest02', 'guest02@gmail.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lzmW', 'Tran Thi Bich',     '0923456789', 'Can Tho',   'GUEST', 1);

SELECT id, username, email, role, is_active FROM users;
