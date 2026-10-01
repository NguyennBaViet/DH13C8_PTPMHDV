package dh13c8.hotelroomservice.domain.repository;

import dh13c8.hotelroomservice.domain.entity.RoomAvailability;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomAvailabilityRepository extends JpaRepository<RoomAvailability, Long> {

    Optional<RoomAvailability> findByRoomIdAndDate(Long roomId, LocalDate date);

    List<RoomAvailability> findByRoomIdAndDateBetween(Long roomId, LocalDate from, LocalDate to);

    @Query("""
        SELECT COUNT(ra) FROM RoomAvailability ra
        WHERE ra.room.id = :roomId
          AND ra.date >= :checkIn
          AND ra.date < :checkOut
          AND ra.status IN ('BOOKED','LOCKED')
        """)
    long countBlockedDays(
        @Param("roomId")   Long roomId,
        @Param("checkIn")  LocalDate checkIn,
        @Param("checkOut") LocalDate checkOut
    );

    @Modifying
    @Query("""
        UPDATE RoomAvailability ra
        SET ra.status = 'AVAILABLE', ra.bookingId = null
        WHERE ra.room.id = :roomId
          AND ra.date >= :checkIn
          AND ra.date < :checkOut
          AND ra.bookingId = :bookingId
        """)
    void unlockDates(
        @Param("roomId")    Long roomId,
        @Param("checkIn")   LocalDate checkIn,
        @Param("checkOut")  LocalDate checkOut,
        @Param("bookingId") Long bookingId
    );
}
