package dh13c8.hotelroomservice.domain.repository;

import dh13c8.hotelroomservice.domain.entity.Hotel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    Page<Hotel> findByIsActiveTrueOrderByStarRatingDesc(Pageable pageable);

    @Query("""
        SELECT DISTINCT h FROM Hotel h
        WHERE h.isActive = true
          AND (:city IS NULL OR LOWER(h.city) LIKE LOWER(CONCAT('%', :city, '%')))
          AND (:minStar IS NULL OR h.starRating >= :minStar)
          AND (:maxStar IS NULL OR h.starRating <= :maxStar)
        ORDER BY h.starRating DESC
        """)
    Page<Hotel> searchHotels(
        @Param("city")    String city,
        @Param("minStar") Integer minStar,
        @Param("maxStar") Integer maxStar,
        Pageable pageable
    );
}
