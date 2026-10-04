package dh13c8.paymentnotiservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notif_user_id", columnList = "user_id"),
        @Index(name = "idx_notif_booking_id", columnList = "booking_id"),
        @Index(name = "idx_notif_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "booking_id")
    private Long bookingId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 50, nullable = false)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", length = 20, nullable = false)
    @Builder.Default
    private NotificationChannel channel = NotificationChannel.EMAIL;

    @Column(name = "recipient_email", length = 100)
    private String recipientEmail;

    @Column(name = "subject", length = 255)
    private String subject;

    @Column(name = "body", columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private NotificationStatus status = NotificationStatus.PENDING;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = NotificationStatus.PENDING;
        }
        if (this.channel == null) {
            this.channel = NotificationChannel.EMAIL;
        }
    }
}
