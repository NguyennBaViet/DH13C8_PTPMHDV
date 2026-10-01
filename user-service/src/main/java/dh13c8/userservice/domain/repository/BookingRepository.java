package dh13c8.userservice.domain.repository;

import dh13c8.userservice.domain.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Page<Booking> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<Booking> findByUserIdAndStatus(Long userId, Booking.BookingStatus status);
    boolean existsByIdAndUserId(Long bookingId, Long userId);
}
