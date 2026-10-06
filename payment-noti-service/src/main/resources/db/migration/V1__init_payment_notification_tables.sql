-- V1__init_payment_notification_tables.sql
-- Payment & Notification Service - Database Migration
-- Created: Oct 2026
-- Description: Initialize Payment and Notification tables for payment-noti-service

-- ============================================================
-- PAYMENTS table - Store payment transactions
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
    KEY idx_payments_status      (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- NOTIFICATIONS table - Store notification records
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
    KEY idx_notif_status     (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Sample data for testing (optional - comment out for production)
-- ============================================================
-- INSERT INTO payments (booking_id, user_id, amount, currency, payment_method, status, created_at, updated_at)
-- VALUES (1, 1, 1000000, 'VND', 'MOCK', 'PENDING', NOW(), NOW());

-- INSERT INTO notifications (user_id, booking_id, type, channel, recipient_email, subject, body, status, created_at)
-- VALUES (1, 1, 'BOOKING_CONFIRMED', 'EMAIL', 'user@example.com', 'Xác nhận đặt phòng', 'Đặt phòng của bạn đã được xác nhận', 'PENDING', NOW());
