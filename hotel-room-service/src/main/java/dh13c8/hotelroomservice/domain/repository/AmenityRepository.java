package dh13c8.hotelroomservice.domain.repository;

import dh13c8.hotelroomservice.domain.entity.Amenity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AmenityRepository extends JpaRepository<Amenity, Long> {
    List<Amenity> findByCategory(Amenity.Category category);
}
