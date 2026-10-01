package dh13c8.hotelroomservice.service;

import dh13c8.hotelroomservice.domain.entity.Amenity;
import dh13c8.hotelroomservice.domain.repository.AmenityRepository;
import dh13c8.hotelroomservice.dto.AmenityResponse;
import dh13c8.hotelroomservice.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AmenityService {

    private final AmenityRepository amenityRepository;

    @Transactional(readOnly = true)
    public List<AmenityResponse> getAll() {
        return amenityRepository.findAll().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AmenityResponse> getByCategory(String category) {
        Amenity.Category cat;
        try { cat = Amenity.Category.valueOf(category.toUpperCase()); }
        catch (IllegalArgumentException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Category không hợp lệ: " + category);
        }
        return amenityRepository.findByCategory(cat).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    private AmenityResponse toResponse(Amenity a) {
        return AmenityResponse.builder()
                .id(a.getId()).name(a.getName())
                .icon(a.getIcon()).category(a.getCategory().name())
                .build();
    }
}
