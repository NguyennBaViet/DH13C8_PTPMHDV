package dh13c8.userservice.domain.repository;

import dh13c8.userservice.domain.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Review> findByHotelIdAndIsVisibleTrueOrderByCreatedAtDesc(Long hotelId, Pageable pageable);

    Optional<Review> findByBookingId(Long bookingId);

    boolean existsByBookingId(Long bookingId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.hotelId = :hotelId AND r.isVisible = true")
    Double averageRatingByHotelId(Long hotelId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.hotelId = :hotelId AND r.isVisible = true")
    Long countByHotelId(Long hotelId);

    List<Review> findByHotelIdAndIsVisibleTrue(Long hotelId);
}
