package dh13c8.bookingservice.repository;

import dh13c8.bookingservice.entity.Booking;
import dh13c8.bookingservice.entity.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingCode(String bookingCode);

    Page<Booking> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Booking> findByHotelIdOrderByCreatedAtDesc(Long hotelId, Pageable pageable);

    Page<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.status = 'PENDING' " +
            "AND b.lockExpiresAt IS NOT NULL AND b.lockExpiresAt < :now")
    List<Booking> findExpiredPendingBookings(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.userId = :userId " +
            "AND b.hotelId = :hotelId AND b.status = 'COMPLETED'")
    boolean hasCompletedBooking(@Param("userId") Long userId, @Param("hotelId") Long hotelId);
}