package dh13c8.hotelroomservice.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "hotels")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(length = 100)
    private String district;

    @Column(length = 100)
    private String country = "Vietnam";

    @Column(precision = 10, scale = 7)
    private java.math.BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private java.math.BigDecimal longitude;

    @Column(name = "star_rating")
    private Integer starRating;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(length = 255)
    private String website;

    @Column(name = "cover_image", length = 500)
    private String coverImage;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "hotel_amenities",
        joinColumns = @JoinColumn(name = "hotel_id"),
        inverseJoinColumns = @JoinColumn(name = "amenity_id")
    )
    @Builder.Default
    private Set<Amenity> amenities = new HashSet<>();

    @OneToMany(mappedBy = "hotel", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private Set<Room> rooms = new HashSet<>();

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt  = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
