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
public class RoomService {

    private final RoomRepository            roomRepository;
    private final HotelRepository           hotelRepository;
    private final AmenityRepository         amenityRepository;
    private final RoomAvailabilityRepository availabilityRepository;

    // ── Danh sách tất cả phòng có phân trang ─────────────────────────────────
    @Transactional(readOnly = true)
    public Page<RoomResponse> getAllRooms(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        return roomRepository.findByIsActiveTrue(pageable).map(this::toResponse);
    }

    // ── Danh sách phòng theo khách sạn ───────────────────────────────────────
    @Transactional(readOnly = true)
    public List<RoomResponse> getRoomsByHotel(Long hotelId) {
        return roomRepository.findByHotelIdAndIsActiveTrue(hotelId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Chi tiết phòng ───────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public RoomResponse getById(Long id) {
        return toResponse(findRoom(id));
    }

    // ── Tìm kiếm phòng còn trống ─────────────────────────────────────────────
    @Transactional(readOnly = true)
    public Page<RoomResponse> searchAvailableRooms(RoomSearchRequest req) {
        if (req.getCheckInDate() == null || req.getCheckOutDate() == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Vui lòng cung cấp ngày check-in và check-out");
        }
        if (!req.getCheckOutDate().isAfter(req.getCheckInDate())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Ngày check-out phải sau ngày check-in");
        }

        Room.RoomType roomType = null;
        if (req.getRoomType() != null) {
            try { roomType = Room.RoomType.valueOf(req.getRoomType().toUpperCase()); }
            catch (IllegalArgumentException e) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Loại phòng không hợp lệ: " + req.getRoomType());
            }
        }

        Pageable pageable = PageRequest.of(req.getPage(), req.getSize(), Sort.by("pricePerNight").ascending());
        return roomRepository.searchAvailableRooms(
                req.getHotelId(), req.getCity(), roomType,
                req.getMinPrice(), req.getMaxPrice(), req.getCapacity(),
                req.getCheckInDate(), req.getCheckOutDate(), pageable
        ).map(this::toResponse);
    }

    // ── Tạo phòng ────────────────────────────────────────────────────────────
    @Transactional
    public RoomResponse createRoom(RoomRequest req) {
        Hotel hotel = hotelRepository.findById(req.getHotelId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy khách sạn id=" + req.getHotelId()));

        Room.RoomType roomType;
        try { roomType = Room.RoomType.valueOf(req.getRoomType().toUpperCase()); }
        catch (IllegalArgumentException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Loại phòng không hợp lệ: " + req.getRoomType());
        }

        Room room = Room.builder()
                .hotel(hotel)
                .roomNumber(req.getRoomNumber())
                .roomType(roomType)
                .description(req.getDescription())
                .floor(req.getFloor())
                .capacity(req.getCapacity() != null ? req.getCapacity() : 2)
                .pricePerNight(req.getPricePerNight())
                .isActive(true)
                .build();

        if (req.getAmenityIds() != null && !req.getAmenityIds().isEmpty()) {
            room.setAmenities(new HashSet<>(amenityRepository.findAllById(req.getAmenityIds())));
        }

        room = roomRepository.save(room);
        log.info("Tạo phòng id={} số={} hotel={}", room.getId(), room.getRoomNumber(), hotel.getName());
        return toResponse(room);
    }

    // ── Cập nhật phòng ────────────────────────────────────────────────────────
    @Transactional
    public RoomResponse updateRoom(Long id, RoomRequest req) {
        Room room = findRoom(id);

        if (req.getRoomNumber()  != null) room.setRoomNumber(req.getRoomNumber());
        if (req.getDescription() != null) room.setDescription(req.getDescription());
        if (req.getFloor()       != null) room.setFloor(req.getFloor());
        if (req.getCapacity()    != null) room.setCapacity(req.getCapacity());
        if (req.getPricePerNight() != null) room.setPricePerNight(req.getPricePerNight());

        if (req.getRoomType() != null) {
            try { room.setRoomType(Room.RoomType.valueOf(req.getRoomType().toUpperCase())); }
            catch (IllegalArgumentException e) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Loại phòng không hợp lệ");
            }
        }
        if (req.getAmenityIds() != null) {
            room.setAmenities(new HashSet<>(amenityRepository.findAllById(req.getAmenityIds())));
        }

        room = roomRepository.save(room);
        log.info("Cập nhật phòng id={}", id);
        return toResponse(room);
    }

    // ── Xoá phòng (soft delete) ───────────────────────────────────────────────
    @Transactional
    public void deleteRoom(Long id) {
        Room room = findRoom(id);
        room.setActive(false);
        roomRepository.save(room);
        log.info("Xoá mềm phòng id={}", id);
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    private Room findRoom(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy phòng id=" + id));
    }

    public RoomResponse toResponse(Room r) {
        List<AmenityResponse> amenities = r.getAmenities().stream()
                .map(a -> AmenityResponse.builder()
                        .id(a.getId()).name(a.getName())
                        .icon(a.getIcon()).category(a.getCategory().name())
                        .build())
                .collect(Collectors.toList());

        return RoomResponse.builder()
                .id(r.getId())
                .hotelId(r.getHotel().getId())
                .hotelName(r.getHotel().getName())
                .hotelCity(r.getHotel().getCity())
                .roomNumber(r.getRoomNumber())
                .roomType(r.getRoomType().name())
                .description(r.getDescription())
                .floor(r.getFloor())
                .capacity(r.getCapacity())
                .pricePerNight(r.getPricePerNight())
                .isActive(r.isActive())
                .amenities(amenities)
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
