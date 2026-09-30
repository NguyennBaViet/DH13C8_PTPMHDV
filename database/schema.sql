-- ============================================================
-- HỆ THỐNG ĐẶT PHÒNG KHÁCH SẠN - DATABASE SCHEMA
-- Database : khachsan
-- Engine   : MySQL 8.x / MariaDB
-- Charset  : utf8mb4_unicode_ci
-- Author   : DH13C8 Team
-- ============================================================

CREATE DATABASE IF NOT EXISTS khachsan
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE khachsan;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id           BIGINT          NOT NULL AUTO_INCREMENT,
    username     VARCHAR(50)     NOT NULL,
    email        VARCHAR(100)    NOT NULL,
    password     VARCHAR(255)    NOT NULL,
    full_name    VARCHAR(100),
    phone        VARCHAR(20),
    avatar_url   VARCHAR(500),
    address      VARCHAR(300),
    role         ENUM('GUEST','STAFF','ADMIN') NOT NULL DEFAULT 'GUEST',
    is_active    TINYINT(1)      NOT NULL DEFAULT 1,
    created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email    (email),
    KEY idx_users_role           (role),
    KEY idx_users_active         (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. REFRESH_TOKENS  (Auth Service – cấp phát lại JWT)
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. HOTELS
-- ============================================================
CREATE TABLE IF NOT EXISTS hotels (
    id             BIGINT          NOT NULL AUTO_INCREMENT,
    name           VARCHAR(200)    NOT NULL,
    description    TEXT,
    address        VARCHAR(500)    NOT NULL,
    city           VARCHAR(100)    NOT NULL,
    district       VARCHAR(100),
    country        VARCHAR(100)    NOT NULL DEFAULT 'Vietnam',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. AMENITIES  (tiện nghi dùng chung cho hotel & room)
-- ============================================================
CREATE TABLE IF NOT EXISTS amenities (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    icon        VARCHAR(100),
    category    ENUM('HOTEL','ROOM','BOTH') NOT NULL DEFAULT 'BOTH',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_amenities_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. HOTEL_AMENITIES  (M-N: hotels ↔ amenities)
-- ============================================================
CREATE TABLE IF NOT EXISTS hotel_amenities (
    hotel_id    BIGINT NOT NULL,
    amenity_id  BIGINT NOT NULL,
    PRIMARY KEY (hotel_id, amenity_id),
    CONSTRAINT fk_ha_hotel   FOREIGN KEY (hotel_id)   REFERENCES hotels(id)    ON DELETE CASCADE,
    CONSTRAINT fk_ha_amenity FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. ROOMS
-- ============================================================
CREATE TABLE IF NOT EXISTS rooms (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    hotel_id         BIGINT        NOT NULL,
    room_number      VARCHAR(20)   NOT NULL,
    room_type        ENUM('SINGLE','DOUBLE','TWIN','SUITE','DELUXE','FAMILY') NOT NULL DEFAULT 'DOUBLE',
    description      TEXT,
    floor            TINYINT,
    capacity         TINYINT       NOT NULL DEFAULT 2,
    price_per_night  DECIMAL(12,2) NOT NULL,
    images           JSON,
    is_active        TINYINT(1)    NOT NULL DEFAULT 1,
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_room_hotel_number (hotel_id, room_number),
    KEY idx_rooms_hotel_id (hotel_id),
    KEY idx_rooms_type     (room_type),
    KEY idx_rooms_price    (price_per_night),
    CONSTRAINT fk_rooms_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. ROOM_AMENITIES  (M-N: rooms ↔ amenities)
-- ============================================================
CREATE TABLE IF NOT EXISTS room_amenities (
    room_id     BIGINT NOT NULL,
    amenity_id  BIGINT NOT NULL,
    PRIMARY KEY (room_id, amenity_id),
    CONSTRAINT fk_ra_room    FOREIGN KEY (room_id)    REFERENCES rooms(id)     ON DELETE CASCADE,
    CONSTRAINT fk_ra_amenity FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. ROOM_AVAILABILITY  (trạng thái phòng theo từng ngày)
-- ============================================================
CREATE TABLE IF NOT EXISTS room_availability (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. PROMOTIONS  (mã khuyến mãi)
-- ============================================================
CREATE TABLE IF NOT EXISTS promotions (
    id                BIGINT        NOT NULL AUTO_INCREMENT,
    code              VARCHAR(50)   NOT NULL,
    description       TEXT,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    booking_code     VARCHAR(20)   NOT NULL,
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
    status           ENUM('PENDING','CONFIRMED','CHECKED_IN','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    special_requests TEXT,
    cancelled_at     DATETIME      NULL,
    cancel_reason    TEXT          NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
    id                BIGINT        NOT NULL AUTO_INCREMENT,
    booking_id        BIGINT        NOT NULL,
    user_id           BIGINT        NOT NULL,
    amount            DECIMAL(12,2) NOT NULL,
    currency          VARCHAR(10)   NOT NULL DEFAULT 'VND',
    payment_method    ENUM('MOCK','BANK_TRANSFER','CREDIT_CARD','MOMO','VNPAY') NOT NULL DEFAULT 'MOCK',
    transaction_id    VARCHAR(255)  NULL,
    status            ENUM('PENDING','SUCCESS','FAILED','REFUND_PENDING','REFUNDED') NOT NULL DEFAULT 'PENDING',
    refund_amount     DECIMAL(12,2) NULL,
    refund_reason     TEXT          NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. REVIEWS  (đánh giá sau khi hoàn tất booking)
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    user_id     BIGINT      NOT NULL,
    hotel_id    BIGINT      NOT NULL,
    booking_id  BIGINT      NOT NULL,
    rating      TINYINT     NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title       VARCHAR(200),
    comment     TEXT,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    user_id          BIGINT       NOT NULL,
    booking_id       BIGINT       NULL,
    type             ENUM('BOOKING_CONFIRMED','BOOKING_CANCELLED','PAYMENT_SUCCESS',
                          'PAYMENT_FAILED','REFUND_PROCESSED','CHECK_IN_REMINDER') NOT NULL,
    channel          ENUM('EMAIL','SMS','PUSH') NOT NULL DEFAULT 'EMAIL',
    recipient_email  VARCHAR(100),
    subject          VARCHAR(255),
    body             TEXT,
    status           ENUM('PENDING','SENT','FAILED') NOT NULL DEFAULT 'PENDING',
    sent_at          DATETIME NULL,
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_notif_user_id    (user_id),
    KEY idx_notif_booking_id (booking_id),
    KEY idx_notif_status     (status),
    CONSTRAINT fk_notif_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_notif_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. AUDIT_LOG  (ghi log mọi thao tác quan trọng)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    user_id      BIGINT       NULL,
    action       VARCHAR(100) NOT NULL,
    entity_type  VARCHAR(50)  NOT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
