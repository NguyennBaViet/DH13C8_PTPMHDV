package dh13c8.bookingservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings", indexes = {
        @Index(name = "idx_user_id", columnList = "user_id"),
        @Index(name = "idx_hotel_id", columnList = "hotel_id"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_booking_code", columnList = "booking_code", unique = true)
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_code", unique = true, nullable = false, length = 32)
    private String bookingCode;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "hotel_id", nullable = false)
    private Long hotelId;

    @Column(name = "hotel_name", length = 255)
    private String hotelName;

    @Column(name = "room_type_id", nullable = false)
    private Long roomTypeId;

    @Column(name = "room_type_name", length = 255)
    private String roomTypeName;

    @Column(name = "check_in", nullable = false)
    private LocalDate checkIn;

    @Column(name = "check_out", nullable = false)
    private LocalDate checkOut;

    @Column(nullable = false)
    private Integer nights;

    @Column(nullable = false)
    private Integer rooms;

    @Column(nullable = false)
    private Integer guests;

    @Column(name = "price_per_night", precision = 15, scale = 2)
    private BigDecimal pricePerNight;

    @Column(name = "sub_total", precision = 15, scale = 2)
    private BigDecimal subTotal;

    @Column(name = "tax_amount", precision = 15, scale = 2)
    private BigDecimal taxAmount;

    @Column(name = "total_price", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookingStatus status;

    @Column(name = "special_requests", length = 1000)
    private String specialRequests;

    @Column(name = "contact_name", length = 150)
    private String contactName;

    @Column(name = "contact_email", length = 150)
    private String contactEmail;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "payment_id")
    private Long paymentId;

    @Column(name = "lock_expires_at")
    private LocalDateTime lockExpiresAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancel_reason", length = 500)
    private String cancelReason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = BookingStatus.PENDING;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}