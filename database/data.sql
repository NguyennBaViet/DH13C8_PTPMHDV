-- ============================================================
-- HỆ THỐNG ĐẶT PHÒNG KHÁCH SẠN - DỮ LIỆU MẪU
-- Chạy sau schema.sql
-- ============================================================

USE khachsan;

-- ============================================================
-- USERS  (password: Admin@123 – BCrypt $2a$10$...)
-- ============================================================
INSERT INTO users (username, email, password, full_name, phone, address, role) VALUES
('admin',   'admin@khachsan.vn',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lzmW', 'Quản Trị Viên',      '0901234567', '49 Lý Thái Tổ, Hà Nội',       'ADMIN'),
('staff01', 'staff01@khachsan.vn','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lzmW', 'Nguyễn Thị Lễ Tân',  '0907654321', '30 Trường Sa, Đà Nẵng',       'STAFF'),
('guest01', 'guest01@gmail.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lzmW', 'Nguyễn Văn An',      '0912345678', '22 Nguyễn Huệ, TP.HCM',       'GUEST'),
('guest02', 'guest02@gmail.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lzmW', 'Trần Thị Bích',      '0923456789', '15 Lê Lợi, Cần Thơ',          'GUEST'),
('guest03', 'guest03@gmail.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lzmW', 'Lê Văn Cường',       '0934567890', '88 Hoàng Diệu, Hải Phòng',    'GUEST');

-- ============================================================
-- AMENITIES
-- ============================================================
INSERT INTO amenities (name, icon, category) VALUES
('WiFi miễn phí',       'wifi',            'BOTH'),
('Hồ bơi',              'pool',            'HOTEL'),
('Nhà hàng',            'restaurant',      'HOTEL'),
('Phòng gym',           'fitness_center',  'HOTEL'),
('Bãi đỗ xe miễn phí', 'local_parking',   'HOTEL'),
('Điều hòa nhiệt độ',  'ac_unit',         'ROOM'),
('TV màn hình phẳng',  'tv',              'ROOM'),
('Minibar',             'local_bar',       'ROOM'),
('Bồn tắm',            'bathtub',         'ROOM'),
('Ban công',            'balcony',         'ROOM'),
('Spa & Massage',       'spa',             'HOTEL'),
('Dịch vụ phòng 24/7', 'room_service',    'HOTEL'),
('Lễ tân 24/7',        'support_agent',   'HOTEL'),
('Két an toàn',        'lock',            'ROOM'),
('Ấm đun nước',        'coffee_maker',    'ROOM');

-- ============================================================
-- HOTELS
-- ============================================================
INSERT INTO hotels (name, description, address, city, district, star_rating, phone, email, cover_image, created_by) VALUES
('Grand Palace Hotel',
 'Khách sạn 5 sao sang trọng tọa lạc ngay trung tâm Hà Nội, mang đến trải nghiệm đẳng cấp với tầm nhìn tuyệt đẹp ra hồ Hoàn Kiếm. Thiết kế kết hợp phong cách Đông Dương cổ điển và hiện đại.',
 '49 Lý Thái Tổ', 'Hà Nội', 'Hoàn Kiếm', 5,
 '024-3825-6920', 'info@grandpalace.vn',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1),

('Sunrise Beach Resort',
 'Resort nghỉ dưỡng 4 sao ven biển Đà Nẵng với bãi biển riêng tuyệt đẹp. Không gian thư giãn lý tưởng cho gia đình và cặp đôi, cách sân bay quốc tế Đà Nẵng 20 phút lái xe.',
 '30 Trường Sa', 'Đà Nẵng', 'Ngũ Hành Sơn', 4,
 '0236-3958-888', 'booking@sunrisebeach.vn',
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 1),

('Saigon Boutique Hotel',
 'Khách sạn boutique 3 sao nằm ngay trung tâm quận 1, phong cách thiết kế hiện đại trẻ trung. Thuận tiện di chuyển đến Bến Thành, phố đi bộ Nguyễn Huệ chỉ 5 phút đi bộ.',
 '22 Bùi Viện', 'Hồ Chí Minh', 'Quận 1', 3,
 '028-3925-6789', 'info@saigonboutique.vn',
 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 1),

('Hội An Ancient Town Hotel',
 'Khách sạn 4 sao nằm trong khu phố cổ Hội An huyền bí. Kiến trúc truyền thống Việt Nam kết hợp với tiện nghi hiện đại, mang lại cảm giác sống trong lòng di sản văn hóa thế giới.',
 '5 Trần Phú', 'Hội An', 'Minh An', 4,
 '0235-3861-445', 'info@hoianancient.vn',
 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800', 1),

('Nha Trang Pearl Hotel',
 'Khách sạn 4 sao nhìn ra vịnh Nha Trang thơ mộng. Hồ bơi vô cực trên tầng thượng, nhà hàng hải sản tươi sống và dịch vụ spa đẳng cấp là điểm nổi bật.',
 '68 Trần Phú', 'Nha Trang', 'Lộc Thọ', 4,
 '0258-3522-788', 'booking@ntpearl.vn',
 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800', 1);

-- ============================================================
-- HOTEL_AMENITIES
-- ============================================================
-- Grand Palace (id=1): WiFi, Pool, Restaurant, Gym, Parking, Spa, Room Service, Reception
INSERT INTO hotel_amenities (hotel_id, amenity_id) VALUES
(1,1),(1,2),(1,3),(1,4),(1,5),(1,11),(1,12),(1,13);
-- Sunrise Beach (id=2)
INSERT INTO hotel_amenities (hotel_id, amenity_id) VALUES
(2,1),(2,2),(2,3),(2,4),(2,5),(2,11),(2,12),(2,13);
-- Saigon Boutique (id=3)
INSERT INTO hotel_amenities (hotel_id, amenity_id) VALUES
(3,1),(3,3),(3,5),(3,12),(3,13);
-- Hoi An (id=4)
INSERT INTO hotel_amenities (hotel_id, amenity_id) VALUES
(4,1),(4,2),(4,3),(4,5),(4,11),(4,12),(4,13);
-- Nha Trang (id=5)
INSERT INTO hotel_amenities (hotel_id, amenity_id) VALUES
(5,1),(5,2),(5,3),(5,4),(5,5),(5,11),(5,12),(5,13);

-- ============================================================
-- ROOMS
-- ============================================================
INSERT INTO rooms (hotel_id, room_number, room_type, description, floor, capacity, price_per_night) VALUES
-- Grand Palace Hotel
(1, '101', 'DOUBLE', 'Phòng double thoáng mát, view thành phố tầng 1',              1, 2,  1200000),
(1, '201', 'DOUBLE', 'Phòng double view hồ Hoàn Kiếm, ban công riêng',              2, 2,  1800000),
(1, '301', 'SUITE',  'Suite sang trọng phòng khách + phòng ngủ tách biệt',          3, 2,  4500000),
(1, '401', 'DELUXE', 'Deluxe corner view toàn cảnh thành phố 360°',                 4, 2,  3200000),
(1, '501', 'FAMILY', 'Phòng gia đình 2 giường đôi, phù hợp 4 người',               5, 4,  2800000),
-- Sunrise Beach Resort
(2, 'B01', 'DOUBLE', 'Phòng view biển trực tiếp, tiếng sóng buổi sáng',            1, 2,  2200000),
(2, 'B02', 'TWIN',   'Phòng twin 2 giường đơn view biển',                           1, 2,  1900000),
(2, 'V01', 'SUITE',  'Beach Villa riêng với hồ bơi mini và sân vườn',               1, 4,  8500000),
(2, 'B03', 'FAMILY', 'Bungalow gia đình sát biển, 3 phòng ngủ',                    1, 6,  4200000),
(2, 'D01', 'DELUXE', 'Deluxe room tầng 2, ban công view hồ bơi và biển',            2, 2,  2800000),
-- Saigon Boutique Hotel
(3, 'S01', 'SINGLE', 'Phòng đơn cozy thiết kế tối giản hiện đại',                  2, 1,   750000),
(3, 'S02', 'DOUBLE', 'Phòng đôi phong cách industrial-chic',                        3, 2,  1150000),
(3, 'S03', 'DELUXE', 'Phòng deluxe view đường phố Bùi Viện sầm uất',               4, 2,  1650000),
(3, 'S04', 'TWIN',   'Phòng twin thích hợp cho bạn bè cùng đi',                    3, 2,  1050000),
-- Hoi An Ancient Town Hotel
(4, 'H01', 'DOUBLE', 'Phòng double phong cách Hội An, view khu phố cổ',             1, 2,  1400000),
(4, 'H02', 'SUITE',  'Suite cổ điển với bồn tắm gỗ và ban công phố cổ',            2, 2,  3800000),
(4, 'H03', 'FAMILY', 'Phòng gia đình không gian truyền thống ấm cúng',              1, 4,  2400000),
-- Nha Trang Pearl Hotel
(5, 'N01', 'DOUBLE', 'Phòng double view vịnh Nha Trang',                            5, 2,  1600000),
(5, 'N02', 'DELUXE', 'Deluxe với ban công riêng nhìn thẳng ra biển',               8, 2,  2500000),
(5, 'N03', 'SUITE',  'Penthouse suite với jacuzzi và view toàn cảnh vịnh',          12, 2, 6500000),
(5, 'N04', 'TWIN',   'Phòng twin tầng cao, view núi và biển',                       6, 2,  1800000);

-- ============================================================
-- ROOM_AMENITIES
-- ============================================================
-- Grand Palace rooms
INSERT INTO room_amenities (room_id, amenity_id) VALUES
(1,1),(1,6),(1,7),(1,14),(1,15),
(2,1),(2,6),(2,7),(2,10),(2,14),(2,15),
(3,1),(3,6),(3,7),(3,8),(3,9),(3,10),(3,14),(3,15),
(4,1),(4,6),(4,7),(4,8),(4,10),(4,14),(4,15),
(5,1),(5,6),(5,7),(5,14),(5,15);
-- Sunrise Beach rooms
INSERT INTO room_amenities (room_id, amenity_id) VALUES
(6,1),(6,6),(6,7),(6,10),(6,14),
(7,1),(7,6),(7,7),(7,14),
(8,1),(8,6),(8,7),(8,8),(8,9),(8,10),(8,14),(8,15),
(9,1),(9,6),(9,7),(9,14),
(10,1),(10,6),(10,7),(10,10),(10,14),(10,15);
-- Saigon Boutique rooms
INSERT INTO room_amenities (room_id, amenity_id) VALUES
(11,1),(11,6),(11,7),(11,15),
(12,1),(12,6),(12,7),(12,14),(12,15),
(13,1),(13,6),(13,7),(13,10),(13,14),(13,15),
(14,1),(14,6),(14,7),(14,15);
-- Hoi An rooms
INSERT INTO room_amenities (room_id, amenity_id) VALUES
(15,1),(15,6),(15,7),(15,10),(15,14),
(16,1),(16,6),(16,7),(16,8),(16,9),(16,10),(16,14),(16,15),
(17,1),(17,6),(17,7),(17,14);
-- Nha Trang rooms
INSERT INTO room_amenities (room_id, amenity_id) VALUES
(18,1),(18,6),(18,7),(18,10),(18,14),
(19,1),(19,6),(19,7),(19,8),(19,10),(19,14),(19,15),
(20,1),(20,6),(20,7),(20,8),(20,9),(20,10),(20,14),(20,15),
(21,1),(21,6),(21,7),(21,14);

-- ============================================================
-- PROMOTIONS
-- ============================================================
INSERT INTO promotions (code, description, discount_type, discount_value, max_uses, min_order_amount, start_date, end_date) VALUES
('WELCOME10',  'Giảm 10% cho lần đặt phòng đầu tiên',             'PERCENT', 10.00,     500, 500000,   '2025-01-01', '2026-12-31'),
('SUMMER25',   'Khuyến mãi hè 2025 – Giảm 15%',                  'PERCENT', 15.00,     300, 1000000,  '2025-06-01', '2025-08-31'),
('SAVE200K',   'Giảm 200.000đ cho đơn từ 1 triệu',                'FIXED',   200000.00, 200, 1000000,  '2025-01-01', '2026-12-31'),
('VIP500K',    'Giảm 500.000đ cho đơn từ 5 triệu',                'FIXED',   500000.00, 100, 5000000,  '2025-01-01', '2026-12-31'),
('WEEKEND20',  'Cuối tuần vàng – Giảm 20%',                       'PERCENT', 20.00,     150, 800000,   '2025-01-01', '2026-12-31'),
('TETHOLIDAY', 'Ưu đãi Tết Nguyên Đán – Giảm 12%',               'PERCENT', 12.00,     200, 1200000,  '2025-01-20', '2025-02-10');

-- ============================================================
-- BOOKINGS mẫu
-- ============================================================
INSERT INTO bookings (booking_code, user_id, room_id, hotel_id, check_in_date, check_out_date,
                      num_guests, total_nights, room_price, discount_amount, total_amount, status) VALUES
('BK20250001', 3, 2, 1, '2025-03-10', '2025-03-13', 2, 3, 1800000, 0,      5400000,  'COMPLETED'),
('BK20250002', 4, 6, 2, '2025-04-05', '2025-04-08', 2, 3, 2200000, 0,      6600000,  'COMPLETED'),
('BK20250003', 5, 12, 3,'2025-05-15', '2025-05-17', 2, 2, 1150000, 230000, 2070000,  'COMPLETED'),
('BK20250004', 3, 8, 2, '2025-07-20', '2025-07-25', 4, 5, 8500000, 0,      42500000, 'CONFIRMED'),
('BK20250005', 4, 19, 5,'2025-08-01', '2025-08-04', 2, 3, 2500000, 375000, 7125000,  'PENDING');

-- ============================================================
-- PAYMENTS mẫu  (cho các booking đã COMPLETED)
-- ============================================================
INSERT INTO payments (booking_id, user_id, amount, payment_method, transaction_id, status, paid_at) VALUES
(1, 3, 5400000,  'MOCK', 'TXN-BK20250001-001', 'SUCCESS', '2025-03-10 09:15:00'),
(2, 4, 6600000,  'MOCK', 'TXN-BK20250002-001', 'SUCCESS', '2025-04-05 10:22:00'),
(3, 5, 2070000,  'MOCK', 'TXN-BK20250003-001', 'SUCCESS', '2025-05-15 14:30:00');

-- ============================================================
-- REVIEWS mẫu  (chỉ sau booking COMPLETED)
-- ============================================================
INSERT INTO reviews (user_id, hotel_id, booking_id, rating, title, comment) VALUES
(3, 1, 1, 5, 'Tuyệt vời, sẽ quay lại!',
 'Phòng rất sạch sẽ và thoáng mát. Nhân viên lễ tân thân thiện, nhiệt tình. View hồ Hoàn Kiếm từ ban công đẹp không kém gì ảnh. Sẽ quay lại vào dịp tới!'),
(4, 2, 2, 4, 'Resort biển đẹp, tiện nghi đầy đủ',
 'Bãi biển riêng của resort rất sạch, ít người. Hồ bơi rộng. Dịch vụ ăn sáng ngon. Trừ 1 sao vì wifi hơi chậm vào buổi tối.'),
(5, 3, 3, 4, 'Vị trí đắc địa, phòng tinh tế',
 'Khách sạn nằm đúng khu Bùi Viện, đi bộ 5 phút là ra phố. Phòng tuy nhỏ nhưng được thiết kế rất thông minh và thẩm mỹ. Giá hợp lý.');

-- ============================================================
-- NOTIFICATIONS mẫu
-- ============================================================
INSERT INTO notifications (user_id, booking_id, type, channel, recipient_email, subject, body, status, sent_at) VALUES
(3, 1, 'BOOKING_CONFIRMED', 'EMAIL', 'guest01@gmail.com',
 '[Grand Palace Hotel] Xác nhận đặt phòng BK20250001',
 'Kính gửi Nguyễn Văn An, đặt phòng của bạn đã được xác nhận. Check-in: 10/03/2025, Check-out: 13/03/2025.',
 'SENT', '2025-03-10 09:16:00'),
(3, 1, 'PAYMENT_SUCCESS', 'EMAIL', 'guest01@gmail.com',
 '[Thanh toán thành công] Đơn hàng BK20250001',
 'Thanh toán 5.400.000đ thành công. Mã giao dịch: TXN-BK20250001-001.',
 'SENT', '2025-03-10 09:16:05');
