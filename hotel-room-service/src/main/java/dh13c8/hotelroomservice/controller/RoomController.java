package dh13c8.hotelroomservice.controller;

import dh13c8.hotelroomservice.dto.*;
import dh13c8.hotelroomservice.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService         roomService;
    private final AvailabilityService availabilityService;

    /** GET /api/rooms/hotel/{hotelId} – tất cả phòng của 1 khách sạn */
    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<RoomResponse>> getRoomsByHotel(@PathVariable Long hotelId) {
        return ResponseEntity.ok(roomService.getRoomsByHotel(hotelId));
    }

    /** GET /api/rooms/{id} – chi tiết phòng */
    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getById(id));
    }

    /**
     * GET /api/rooms/search?checkInDate=2025-08-01&checkOutDate=2025-08-05
     *     &city=Đà Nẵng&roomType=DOUBLE&minPrice=500000&maxPrice=3000000
     *     &capacity=2&page=0&size=10
     */
    @GetMapping("/search")
    public ResponseEntity<Page<RoomResponse>> search(
            @RequestParam(required = false) Long      hotelId,
            @RequestParam(required = false) String    city,
            @RequestParam(required = false) String    roomType,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer   capacity,
            @RequestParam(required = false) LocalDate checkInDate,
            @RequestParam(required = false) LocalDate checkOutDate,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        RoomSearchRequest req = new RoomSearchRequest();
        req.setHotelId(hotelId);
        req.setCity(city);
        req.setRoomType(roomType);
        req.setMinPrice(minPrice);
        req.setMaxPrice(maxPrice);
        req.setCapacity(capacity);
        req.setCheckInDate(checkInDate);
        req.setCheckOutDate(checkOutDate);
        req.setPage(page);
        req.setSize(size);

        return ResponseEntity.ok(roomService.searchAvailableRooms(req));
    }

    /** POST /api/rooms – tạo phòng mới (STAFF, ADMIN) */
    @PostMapping
    public ResponseEntity<RoomResponse> create(@Valid @RequestBody RoomRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoom(req));
    }

    /** PUT /api/rooms/{id} – cập nhật phòng (STAFF, ADMIN) */
    @PutMapping("/{id}")
    public ResponseEntity<RoomResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody RoomRequest req) {
        return ResponseEntity.ok(roomService.updateRoom(id, req));
    }

    /** DELETE /api/rooms/{id} – xoá mềm phòng (ADMIN) */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }

    /** GET /api/rooms/{id}/availability?checkInDate=...&checkOutDate=... */
    @GetMapping("/{id}/availability")
    public ResponseEntity<?> checkAvailability(
            @PathVariable Long id,
            @RequestParam LocalDate checkInDate,
            @RequestParam LocalDate checkOutDate) {
        boolean available = availabilityService.checkAvailability(id, checkInDate, checkOutDate);
        return ResponseEntity.ok(java.util.Map.of(
                "roomId",       id,
                "checkInDate",  checkInDate.toString(),
                "checkOutDate", checkOutDate.toString(),
                "available",    available
        ));
    }

    /** GET /api/rooms/{id}/availability/calendar?from=2025-08-01&to=2025-08-31 */
    @GetMapping("/{id}/availability/calendar")
    public ResponseEntity<?> getCalendar(
            @PathVariable Long id,
            @RequestParam LocalDate from,
            @RequestParam LocalDate to) {
        return ResponseEntity.ok(availabilityService.getAvailabilityCalendar(id, from, to));
    }

    /** POST /api/rooms/{id}/availability/lock – Booking Service gọi để lock phòng */
    @PostMapping("/{id}/availability/lock")
    public ResponseEntity<Void> lockRoom(
            @PathVariable Long id,
            @Valid @RequestBody AvailabilityRequest req) {
        availabilityService.lockRoom(id, req);
        return ResponseEntity.ok().build();
    }

    /** POST /api/rooms/{id}/availability/unlock – gọi khi hủy booking */
    @PostMapping("/{id}/availability/unlock")
    public ResponseEntity<Void> unlockRoom(
            @PathVariable Long id,
            @Valid @RequestBody AvailabilityRequest req) {
        availabilityService.unlockRoom(id, req);
        return ResponseEntity.ok().build();
    }
}
