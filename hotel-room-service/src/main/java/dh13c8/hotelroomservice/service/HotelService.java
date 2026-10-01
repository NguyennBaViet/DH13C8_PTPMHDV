package dh13c8.hotelroomservice.service;

import dh13c8.hotelroomservice.domain.entity.*;
import dh13c8.hotelroomservice.domain.repository.*;
import dh13c8.hotelroomservice.dto.*;
import dh13c8.hotelroomservice.exception.AppException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HotelService {

    private final HotelRepository   hotelRepository;
    private final AmenityRepository amenityRepository;

    @Transactional(readOnly = true)
    public Page<HotelResponse> getAllHotels(int page, int size) {
        Pageable p = PageRequest.of(page, size, Sort.by("starRating").descending());
        return hotelRepository.findByIsActiveTrueOrderByStarRatingDesc(p).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<HotelResponse> searchHotels(String city, Integer minStar, Integer maxStar,
                                             int page, int size) {
        return hotelRepository.searchHotels(city, minStar, maxStar, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public HotelResponse getById(Long id) {
        return toResponse(findHotel(id));
    }

    @Transactional
    public HotelResponse createHotel(HotelRequest req, Long createdBy) {
        Hotel hotel = Hotel.builder()
                .name(req.getName())
                .description(req.getDescription())
                .address(req.getAddress())
                .city(req.getCity())
                .district(req.getDistrict())
                .country(req.getCountry() != null ? req.getCountry() : "Vietnam")
                .starRating(req.getStarRating())
                .phone(req.getPhone())
                .email(req.getEmail())
                .website(req.getWebsite())
                .coverImage(req.getCoverImage())
                .isActive(true)
                .createdBy(createdBy)
                .build();

        if (req.getAmenityIds() != null && !req.getAmenityIds().isEmpty()) {
            hotel.setAmenities(new HashSet<>(amenityRepository.findAllById(req.getAmenityIds())));
        }

        hotel = hotelRepository.save(hotel);
        log.info("Tạo khách sạn id={} name={}", hotel.getId(), hotel.getName());
        return toResponse(hotel);
    }

    @Transactional
    public HotelResponse updateHotel(Long id, HotelRequest req) {
        Hotel hotel = findHotel(id);

        if (req.getName()        != null) hotel.setName(req.getName());
        if (req.getDescription() != null) hotel.setDescription(req.getDescription());
        if (req.getAddress()     != null) hotel.setAddress(req.getAddress());
        if (req.getCity()        != null) hotel.setCity(req.getCity());
        if (req.getDistrict()    != null) hotel.setDistrict(req.getDistrict());
        if (req.getCountry()     != null) hotel.setCountry(req.getCountry());
        if (req.getStarRating()  != null) hotel.setStarRating(req.getStarRating());
        if (req.getPhone()       != null) hotel.setPhone(req.getPhone());
        if (req.getEmail()       != null) hotel.setEmail(req.getEmail());
        if (req.getWebsite()     != null) hotel.setWebsite(req.getWebsite());
        if (req.getCoverImage()  != null) hotel.setCoverImage(req.getCoverImage());

        if (req.getAmenityIds() != null) {
            hotel.setAmenities(new HashSet<>(amenityRepository.findAllById(req.getAmenityIds())));
        }

        hotel = hotelRepository.save(hotel);
        log.info("Cập nhật khách sạn id={}", hotel.getId());
        return toResponse(hotel);
    }

    @Transactional
    public void deleteHotel(Long id) {
        Hotel hotel = findHotel(id);
        hotel.setActive(false);
        hotelRepository.save(hotel);
        log.info("Xoá mềm khách sạn id={}", id);
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    private Hotel findHotel(Long id) {
        return hotelRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy khách sạn id=" + id));
    }

    public HotelResponse toResponse(Hotel h) {
        List<AmenityResponse> amenities = h.getAmenities().stream()
                .map(a -> AmenityResponse.builder()
                        .id(a.getId()).name(a.getName())
                        .icon(a.getIcon()).category(a.getCategory().name())
                        .build())
                .collect(Collectors.toList());

        return HotelResponse.builder()
                .id(h.getId())
                .name(h.getName())
                .description(h.getDescription())
                .address(h.getAddress())
                .city(h.getCity())
                .district(h.getDistrict())
                .country(h.getCountry())
                .starRating(h.getStarRating())
                .phone(h.getPhone())
                .email(h.getEmail())
                .website(h.getWebsite())
                .coverImage(h.getCoverImage())
                .isActive(h.isActive())
                .amenities(amenities)
                .createdAt(h.getCreatedAt())
                .updatedAt(h.getUpdatedAt())
                .build();
    }
}
