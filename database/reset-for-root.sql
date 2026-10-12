-- ============================================================
-- RESET DATABASE CHO ROOT USER (PASSWORD TRỐNG)
-- ============================================================
-- Mục đích:
--   - Xóa database khachsan cũ
--   - Tạo database mới với UTF8_GENERAL_CI
--   - Dùng user root (password trống)
-- ============================================================

USE mysql;

-- Step 1: Xóa database khachsan cũ
DROP DATABASE IF EXISTS khachsan;

-- Step 2: Tạo database mới
CREATE DATABASE khachsan
  CHARACTER SET utf8
  COLLATE utf8_general_ci;

USE khachsan;

-- ============================================================
-- TẠO LẠI TẤT CẢ BẢNG VỚI ENCODING UTF8_GENERAL_CI
-- ============================================================

-- 1. USERS
CREATE TABLE users (
    id           BIGINT          NOT NULL AUTO_INCREMENT,
    username     VARCHAR(50)     NOT NULL COLLATE utf8_general_ci,
    email        VARCHAR(100)    NOT NULL COLLATE utf8_general_ci,
    password     VARCHAR(255)    NOT NULL,
    full_name    VARCHAR(100)    COLLATE utf8_general_ci,
    phone        VARCHAR(20),
    avatar_url   VARCHAR(500),
    address      VARCHAR(300)    COLLATE utf8_general_ci,
    role         ENUM('GUEST','STAFF','ADMIN') NOT NULL DEFAULT 'GUEST',
    is_active    TINYINT(1)      NOT NULL DEFAULT 1,
    created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email    (email),
    KEY idx_users_role           (role),
    KEY idx_users_active         (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- 2. REFRESH_TOKENS
CREATE TABLE refresh_tokens (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    user_id     BIGINT       NOT NULL,
    token       VARCHAR(512) NOT NULL,
    expires_at  DATETIME     NOT NULL,
    revoked     TINYINT(1)   NOT NULL DEFAULT 0,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_rt_token  (token),
    KEY idx_rt_user_id      (user_id),
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- 3. HOTELS
CREATE TABLE hotels (
    id             BIGINT          NOT NULL AUTO_INCREMENT,
    name           VARCHAR(200)    NOT NULL COLLATE utf8_general_ci,
    description    TEXT            COLLATE utf8_general_ci,
    address        VARCHAR(500)    NOT NULL COLLATE utf8_general_ci,
    city           VARCHAR(100)    NOT NULL COLLATE utf8_general_ci,
    district       VARCHAR(100)    COLLATE utf8_general_ci,
    country        VARCHAR(100)    NOT NULL DEFAULT 'Vietnam' COLLATE utf8_general_ci,
    latitude       DECIMAL(10,7),
    longitude      DECIMAL(10,7),
    star_rating    TINYINT         CHECK (star_rating BETWEEN 1 AND 5),
    phone          VARCHAR(20),
    email          VARCHAR(100),
    website        VARCHAR(255),
    cover_image    VARCHAR(500),
    images         JSON,
    is_active      TINYINT(1)      NOT NULL DEFAULT 1,
    created_by     BIGINT,
    created_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_hotels_city   (city),
    KEY idx_hotels_star   (star_rating),
    KEY idx_hotels_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- 4. AMENITIES
CREATE TABLE amenities (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL COLLATE utf8_general_ci,
    icon        VARCHAR(100),
    category    ENUM('HOTEL','ROOM','BOTH') NOT NULL DEFAULT 'BOTH',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_amenities_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- 5. HOTEL_AMENITIES
CREATE TABLE hotel_amenities (
    hotel_id    BIGINT NOT NULL,
    amenity_id  BIGINT NOT NULL,
    PRIMARY KEY (hotel_id, amenity_id),
    CONSTRAINT fk_ha_hotel   FOREIGN KEY (hotel_id)   REFERENCES hotels(id)    ON DELETE CASCADE,
    CONSTRAINT fk_ha_amenity FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- 6. ROOMS
CREATE TABLE rooms (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    hotel_id         BIGINT        NOT NULL,
    room_number      VARCHAR(20)   NOT NULL COLLATE utf8_general_ci,
    room_type        ENUM('SINGLE','DOUBLE','TWIN','SUITE','DELUXE','FAMILY') NOT NULL DEFAULT 'DOUBLE',
    description      TEXT          COLLATE utf8_general_ci,
    floor            TINYINT,
    capacity         TINYINT       NOT NULL DEFAULT 2,
    price_per_night  DECIMAL(12,2) NOT NULL,
    images           JSON,
    image            LONGTEXT      COLLATE utf8_general_ci,
    is_active        TINYINT(1)    NOT NULL DEFAULT 1,
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_room_hotel_number (hotel_id, room_number),
    KEY idx_rooms_hotel_id (hotel_id),
    KEY idx_rooms_type     (room_type),
    KEY idx_rooms_price    (price_per_night),
    CONSTRAINT fk_rooms_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- 7. ROOM_AMENITIES
CREATE TABLE room_amenities (
    room_id     BIGINT NOT NULL,
    amenity_id  BIGINT NOT NULL,
    PRIMARY KEY (room_id, amenity_id),
    CONSTRAINT fk_ra_room    FOREIGN KEY (room_id)    REFERENCES rooms(id)     ON DELETE CASCADE,
    CONSTRAINT fk_ra_amenity FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- 8. ROOM_AVAILABILITY
CREATE TABLE room_availability (
    id          BIGINT  NOT NULL AUTO_INCREMENT,
    room_id     BIGINT  NOT NULL,
    date        DATE    NOT NULL,
    status      ENUM('AVAILABLE','BOOKED','LOCKED','MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
    booking_id  BIGINT  NULL,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_avail_room_date (room_id, date),
    KEY idx_avail_room_id (room_id),
    KEY idx_avail_date    (date),
    KEY idx_avail_status  (status),
    CONSTRAINT fk_avail_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- 9. PROMOTIONS
CREATE TABLE promotions (
    id                BIGINT        NOT NULL AUTO_INCREMENT,
    code              VARCHAR(50)   NOT NULL COLLATE utf8_general_ci,
    description       TEXT          COLLATE utf8_general_ci,
    discount_type     ENUM('PERCENT','FIXED') NOT NULL DEFAULT 'PERCENT',
    discount_value    DECIMAL(10,2) NOT NULL,
    max_uses          INT           NOT NULL DEFAULT 100,
    used_count        INT           NOT NULL DEFAULT 0,
    min_order_amount  DECIMAL(12,2) DEFAULT 0,
    start_date        DATE          NOT NULL,
    end_date          DATE          NOT NULL,
    is_active         TINYINT(1)    NOT NULL DEFAULT 1,
    created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_promo_code  (code),
    KEY idx_promo_active      (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- 10. BOOKINGS
CREATE TABLE bookings (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    booking_code     VARCHAR(20)   NOT NULL COLLATE utf8_general_ci,
    user_id          BIGINT        NOT NULL,
    room_id          BIGINT        NOT NULL,
    hotel_id         BIGINT        NOT NULL,
    check_in_date    DATE          NOT NULL,
    check_out_date   DATE          NOT NULL,
    num_guests       TINYINT       NOT NULL DEFAULT 1,
    total_nights     INT           NOT NULL,
    room_price       DECIMAL(12,2) NOT NULL,
    discount_amount  DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount     DECIMAL(12,2) NOT NULL,
    promotion_id     BIGINT        NULL,
    status           VARCHAR(30)   NOT NULL DEFAULT 'PENDING',
    special_requests TEXT          COLLATE utf8_general_ci,
    cancelled_at     DATETIME      NULL,
    cancel_reason    TEXT          COLLATE utf8_general_ci,
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_booking_code   (booking_code),
    KEY idx_bookings_user_id     (user_id),
    KEY idx_bookings_room_id     (room_id),
    KEY idx_bookings_hotel_id    (hotel_id),
    KEY idx_bookings_status      (status),
    KEY idx_bookings_checkin     (check_in_date),
    CONSTRAINT fk_bookings_user      FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_room      FOREIGN KEY (room_id)      REFERENCES rooms(id)      ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_hotel     FOREIGN KEY (hotel_id)     REFERENCES hotels(id)     ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_promotion FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- 11. PAYMENTS
CREATE TABLE payments (
    id                BIGINT        NOT NULL AUTO_INCREMENT,
    booking_id        BIGINT        NOT NULL,
    user_id           BIGINT        NOT NULL,
    amount            DECIMAL(12,2) NOT NULL,
    currency          VARCHAR(10)   NOT NULL DEFAULT 'VND',
    payment_method    ENUM('MOCK','BANK_TRANSFER','CREDIT_CARD','MOMO','VNPAY') NOT NULL DEFAULT 'MOCK',
    transaction_id    VARCHAR(255)  NULL,
    status            ENUM('PENDING','SUCCESS','FAILED','REFUND_PENDING','REFUNDED') NOT NULL DEFAULT 'PENDING',
    refund_amount     DECIMAL(12,2) NULL,
    refund_reason     TEXT          COLLATE utf8_general_ci,
    refunded_at       DATETIME      NULL,
    gateway_response  JSON          NULL,
    paid_at           DATETIME      NULL,
    created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_payment_transaction (transaction_id),
    KEY idx_payments_booking_id  (booking_id),
    KEY idx_payments_user_id     (user_id),
    KEY idx_payments_status      (status),
    CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
    CONSTRAINT fk_payments_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- 12. REVIEWS
CREATE TABLE reviews (
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    user_id     BIGINT      NOT NULL,
    hotel_id    BIGINT      NOT NULL,
    booking_id  BIGINT      NOT NULL,
    rating      TINYINT     NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title       VARCHAR(200) COLLATE utf8_general_ci,
    comment     TEXT        COLLATE utf8_general_ci,
    images      JSON,
    is_visible  TINYINT(1)  NOT NULL DEFAULT 1,
    created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_review_booking  (booking_id),
    KEY idx_reviews_hotel_id      (hotel_id),
    KEY idx_reviews_user_id       (user_id),
    KEY idx_reviews_rating        (rating),
    CONSTRAINT fk_reviews_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_reviews_hotel   FOREIGN KEY (hotel_id)   REFERENCES hotels(id)   ON DELETE CASCADE,
    CONSTRAINT fk_reviews_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- 13. NOTIFICATIONS
CREATE TABLE notifications (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    user_id          BIGINT       NOT NULL,
    booking_id       BIGINT       NULL,
    type             ENUM('BOOKING_CONFIRMED','BOOKING_CANCELLED','PAYMENT_SUCCESS','PAYMENT_FAILED','REFUND_PROCESSED','CHECK_IN_REMINDER') NOT NULL,
    channel          ENUM('EMAIL','SMS','PUSH') NOT NULL DEFAULT 'EMAIL',
    recipient_email  VARCHAR(100),
    subject          VARCHAR(255) COLLATE utf8_general_ci,
    body             TEXT        COLLATE utf8_general_ci,
    status           ENUM('PENDING','SENT','FAILED') NOT NULL DEFAULT 'PENDING',
    sent_at          DATETIME NULL,
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_notif_user_id    (user_id),
    KEY idx_notif_booking_id (booking_id),
    KEY idx_notif_status     (status),
    CONSTRAINT fk_notif_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_notif_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- 14. AUDIT_LOG
CREATE TABLE audit_log (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    user_id      BIGINT       NULL,
    action       VARCHAR(100) NOT NULL COLLATE utf8_general_ci,
    entity_type  VARCHAR(50)  NOT NULL COLLATE utf8_general_ci,
    entity_id    BIGINT       NULL,
    old_value    JSON         NULL,
    new_value    JSON         NULL,
    ip_address   VARCHAR(45),
    user_agent   VARCHAR(500),
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_audit_user_id    (user_id),
    KEY idx_audit_entity     (entity_type, entity_id),
    KEY idx_audit_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- ============================================================
-- INSERT DỮ LIỆU MẪU
-- ============================================================
SET NAMES utf8;
SET CHARACTER_SET_CLIENT = utf8;
SET CHARACTER_SET_CONNECTION = utf8;

INSERT INTO users (username, email, password, full_name, phone, address, role) VALUES
('admin',   'admin@khachsan.vn',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lzmW', 'Quản Trị Viên',      '0901234567', '49 Lý Thái Tổ, Hà Nội',       'ADMIN'),
('staff01', 'staff01@khachsan.vn','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lzmW', 'Nguyễn Thị Lễ Tân',  '0907654321', '30 Trường Sa, Đà Nẵng',       'STAFF'),
('guest01', 'guest01@gmail.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lzmW', 'Nguyễn Văn An',      '0912345678', '22 Nguyễn Huệ, TP.HCM',       'GUEST'),
('guest02', 'guest02@gmail.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lzmW', 'Trần Thị Bích',      '0923456789', '15 Lê Lợi, Cần Thơ',          'GUEST'),
('guest03', 'guest03@gmail.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lzmW', 'Lê Văn Cường',       '0934567890', '88 Hoàng Diệu, Hải Phòng',    'GUEST');

INSERT INTO amenities (name, icon, category) VALUES
('WiFi miễn phí',       'wifi',            'BOTH'),
('Hồ bơi',              'pool',            'HOTEL'),
('Nhà hàng',            'restaurant',      'HOTEL'),
('Phòng gym',           'fitness_center',  'HOTEL'),
('Bãi đỗ xe miễn phí',  'local_parking',   'HOTEL'),
('Điều hòa nhiệt độ',   'ac_unit',         'ROOM'),
('TV màn hình phẳng',   'tv',              'ROOM'),
('Minibar',             'local_bar',       'ROOM'),
('Bồn tắm',             'bathtub',         'ROOM'),
('Ban công',            'balcony',         'ROOM'),
('Spa & Massage',       'spa',             'HOTEL'),
('Dịch vụ phòng 24/7',  'room_service',    'HOTEL'),
('Lễ tân 24/7',         'support_agent',   'HOTEL'),
('Két an toàn',         'lock',            'ROOM'),
('Ấm đun nước',         'coffee_maker',    'ROOM');

INSERT INTO hotels (name, description, address, city, district, star_rating, phone, email, cover_image, created_by, is_active) VALUES
('Grand Palace Hotel',
 'Khách sạn 5 sao sang trọng tọa lạc ngay trung tâm Hà Nội, mang đến trải nghiệm đẳng cấp với tầm nhìn tuyệt đẹp ra hồ Hoàn Kiếm. Thiết kế kết hợp phong cách Đông Dương cổ điển và hiện đại.',
 '49 Lý Thái Tổ', 'Hà Nội', 'Hoàn Kiếm', 5,
 '024-3825-6920', 'info@grandpalace.vn',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1, 1),

('Sunrise Beach Resort',
 'Resort nghỉ dưỡng 4 sao ven biển Đà Nẵng với bãi biển riêng tuyệt đẹp. Không gian thư giãn lý tưởng cho gia đình và cặp đôi, cách sân bay quốc tế Đà Nẵng 20 phút lái xe.',
 '30 Trường Sa', 'Đà Nẵng', 'Ngũ Hành Sơn', 4,
 '0236-3958-888', 'booking@sunrisebeach.vn',
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 1, 1),

('Saigon Boutique Hotel',
 'Khách sạn boutique 3 sao nằm ngay trung tâm quận 1, phong cách thiết kế hiện đại trẻ trung. Thuận tiện di chuyển đến Bến Thành, phố đi bộ Nguyễn Huệ chỉ 5 phút đi bộ.',
 '22 Bùi Viện', 'Hồ Chí Minh', 'Quận 1', 3,
 '028-3925-6789', 'info@saigonboutique.vn',
 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 1, 1),

('Hội An Ancient Town Hotel',
 'Khách sạn 4 sao nằm trong khu phố cổ Hội An huyền bí. Kiến trúc truyền thống Việt Nam kết hợp với tiện nghi hiện đại, mang lại cảm giác sống trong lòng di sản văn hóa thế giới.',
 '5 Trần Phú', 'Hội An', 'Minh An', 4,
 '0235-3861-445', 'info@hoianancient.vn',
 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800', 1, 1),

('Nha Trang Pearl Hotel',
 'Khách sạn 4 sao nhìn ra vịnh Nha Trang thơ mộng. Hồ bơi vô cực trên tầng thượng, nhà hàng hải sản tươi sống và dịch vụ spa đẳng cấp là điểm nổi bật.',
 '68 Trần Phú', 'Nha Trang', 'Lộc Thọ', 4,
 '0258-3522-788', 'booking@ntpearl.vn',
 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800', 1, 1);

INSERT INTO hotel_amenities (hotel_id, amenity_id) VALUES
(1,1),(1,2),(1,3),(1,4),(1,5),(1,11),(1,12),(1,13),
(2,1),(2,2),(2,3),(2,4),(2,5),(2,11),(2,12),(2,13),
(3,1),(3,3),(3,5),(3,12),(3,13),
(4,1),(4,2),(4,3),(4,5),(4,11),(4,12),(4,13),
(5,1),(5,2),(5,3),(5,4),(5,5),(5,11),(5,12),(5,13);

INSERT INTO rooms (hotel_id, room_number, room_type, description, floor, capacity, price_per_night, is_active) VALUES
(1, '101', 'DOUBLE', 'Phòng double thoáng mát, view thành phố tầng 1',              1, 2,  1200000, 1),
(1, '201', 'DOUBLE', 'Phòng double view hồ Hoàn Kiếm, ban công riêng',              2, 2,  1800000, 1),
(1, '301', 'SUITE',  'Suite sang trọng phòng khách + phòng ngủ tách biệt',          3, 2,  4500000, 1),
(1, '401', 'DELUXE', 'Deluxe corner view toàn cảnh thành phố 360°',                 4, 2,  3200000, 1),
(1, '501', 'FAMILY', 'Phòng gia đình 2 giường đôi, phù hợp 4 người',               5, 4,  2800000, 1),
(2, 'B01', 'DOUBLE', 'Phòng view biển trực tiếp, tiếng sóng buổi sáng',            1, 2,  2200000, 1),
(2, 'B02', 'TWIN',   'Phòng twin 2 giường đơn view biển',                           1, 2,  1900000, 1),
(2, 'V01', 'SUITE',  'Beach Villa riêng với hồ bơi mini và sân vườn',               1, 4,  8500000, 1),
(2, 'B03', 'FAMILY', 'Bungalow gia đình sát biển, 3 phòng ngủ',                    1, 6,  4200000, 1),
(2, 'D01', 'DELUXE', 'Deluxe room tầng 2, ban công view hồ bơi và biển',            2, 2,  2800000, 1),
(3, 'S01', 'SINGLE', 'Phòng đơn cozy thiết kế tối giản hiện đại',                  2, 1,   750000, 1),
(3, 'S02', 'DOUBLE', 'Phòng đôi phong cách industrial-chic',                        3, 2,  1150000, 1),
(3, 'S03', 'DELUXE', 'Phòng deluxe view đường phố Bùi Viện sầm uất',               4, 2,  1650000, 1),
(3, 'S04', 'TWIN',   'Phòng twin thích hợp cho bạn bè cùng đi',                    3, 2,  1050000, 1),
(4, 'H01', 'DOUBLE', 'Phòng double phong cách Hội An, view khu phố cổ',             1, 2,  1400000, 1),
(4, 'H02', 'SUITE',  'Suite cổ điển với bồn tắm gỗ và ban công phố cổ',            2, 2,  3800000, 1),
(4, 'H03', 'FAMILY', 'Phòng gia đình không gian truyền thống ấm cúng',              1, 4,  2400000, 1),
(5, 'N01', 'DOUBLE', 'Phòng double view vịnh Nha Trang',                            5, 2,  1600000, 1),
(5, 'N02', 'DELUXE', 'Deluxe với ban công riêng nhìn thẳng ra biển',               8, 2,  2500000, 1),
(5, 'N03', 'SUITE',  'Penthouse suite với jacuzzi và view toàn cảnh vịnh',          12, 2, 6500000, 1),
(5, 'N04', 'TWIN',   'Phòng twin tầng cao, view núi và biển',                       6, 2,  1800000, 1);

INSERT INTO room_amenities (room_id, amenity_id) VALUES
(1,1),(1,6),(1,7),(1,14),(1,15),
(2,1),(2,6),(2,7),(2,10),(2,14),(2,15),
(3,1),(3,6),(3,7),(3,8),(3,9),(3,10),(3,14),(3,15),
(4,1),(4,6),(4,7),(4,8),(4,10),(4,14),(4,15),
(5,1),(5,6),(5,7),(5,14),(5,15),
(6,1),(6,6),(6,7),(6,10),(6,14),
(7,1),(7,6),(7,7),(7,14),
(8,1),(8,6),(8,7),(8,8),(8,9),(8,10),(8,14),(8,15),
(9,1),(9,6),(9,7),(9,14),
(10,1),(10,6),(10,7),(10,10),(10,14),(10,15),
(11,1),(11,6),(11,7),(11,15),
(12,1),(12,6),(12,7),(12,14),(12,15),
(13,1),(13,6),(13,7),(13,10),(13,14),(13,15),
(14,1),(14,6),(14,7),(14,15),
(15,1),(15,6),(15,7),(15,10),(15,14),
(16,1),(16,6),(16,7),(16,8),(16,9),(16,10),(16,14),(16,15),
(17,1),(17,6),(17,7),(17,14),
(18,1),(18,6),(18,7),(18,10),(18,14),
(19,1),(19,6),(19,7),(19,8),(19,10),(19,14),(19,15),
(20,1),(20,6),(20,7),(20,8),(20,9),(20,10),(20,14),(20,15),
(21,1),(21,6),(21,7),(21,14);

-- ============================================================
-- HOÀN THÀNH
-- ============================================================
SELECT '✅ DATABASE RESET HOÀN TẤT - ROOT USER' AS status;
SELECT CONCAT('TỔNG SỐ KHÁCH SẠN: ', COUNT(*)) FROM hotels;
SELECT CONCAT('TỔNG SỐ PHÒNG: ', COUNT(*)) FROM rooms;
SELECT CONCAT('TỔNG SỐ NGƯỜI DÙNG: ', COUNT(*)) FROM users;
