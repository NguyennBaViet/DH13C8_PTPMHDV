package dh13c8.hotelroomservice.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "room_availability",
       uniqueConstraints = @UniqueConstraint(columnNames = {"room_id", "date"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoomAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private AvailabilityStatus status = AvailabilityStatus.AVAILABLE;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum AvailabilityStatus { AVAILABLE, BOOKED, LOCKED, MAINTENANCE }
}
