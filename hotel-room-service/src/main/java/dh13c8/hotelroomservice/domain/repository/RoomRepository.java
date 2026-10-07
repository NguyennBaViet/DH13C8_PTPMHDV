package dh13c8.hotelroomservice.domain.repository;

import dh13c8.hotelroomservice.domain.entity.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByHotelIdAndIsActiveTrue(Long hotelId);

    Page<Room> findByIsActiveTrue(Pageable pageable);

    /**
     * Tìm phòng còn trống trong khoảng ngày, theo giá và loại phòng.
     * Phòng "còn trống" = không có bất kỳ ngày nào trong [checkIn, checkOut-1]
     * bị BOOKED hoặc LOCKED.
     */
    @Query("""
        SELECT r FROM Room r
        WHERE r.hotel.isActive = true
          AND r.isActive = true
          AND (:hotelId IS NULL OR r.hotel.id = :hotelId)
          AND (:city IS NULL OR LOWER(r.hotel.city) LIKE LOWER(CONCAT('%',:city,'%')))
          AND (:roomType IS NULL OR r.roomType = :roomType)
          AND (:minPrice IS NULL OR r.pricePerNight >= :minPrice)
          AND (:maxPrice IS NULL OR r.pricePerNight <= :maxPrice)
          AND (:capacity IS NULL OR r.capacity >= :capacity)
          AND r.id NOT IN (
              SELECT ra.room.id FROM RoomAvailability ra
              WHERE ra.date >= :checkIn
                AND ra.date < :checkOut
                AND ra.status IN ('BOOKED','LOCKED')
          )
        ORDER BY r.pricePerNight ASC
        """)
    Page<Room> searchAvailableRooms(
        @Param("hotelId")   Long hotelId,
        @Param("city")      String city,
        @Param("roomType")  Room.RoomType roomType,
        @Param("minPrice")  BigDecimal minPrice,
        @Param("maxPrice")  BigDecimal maxPrice,
        @Param("capacity")  Integer capacity,
        @Param("checkIn")   LocalDate checkIn,
        @Param("checkOut")  LocalDate checkOut,
        Pageable pageable
    );
}
