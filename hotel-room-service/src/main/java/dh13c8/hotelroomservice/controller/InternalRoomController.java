package dh13c8.hotelroomservice.controller;

import dh13c8.hotelroomservice.dto.*;
import dh13c8.hotelroomservice.service.InternalRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Internal API — chỉ dùng cho giao tiếp service-to-service (booking-service gọi).
 * Không expose ra ngoài qua gateway.
 */
@Slf4j
@RestController
@RequestMapping("/api/rooms/internal")
@RequiredArgsConstructor
public class InternalRoomController {

    private final InternalRoomService internalRoomService;

    /** GET /api/rooms/internal/{id} — lấy thông tin phòng */
    @GetMapping("/{id}")
    public ResponseEntity<InternalRoomTypeDto> getRoomType(@PathVariable Long id) {
        return ResponseEntity.ok(internalRoomService.getRoomType(id));
    }

    /** POST /api/rooms/internal/check-availability — kiểm tra phòng trống */
    @PostMapping("/check-availability")
    public ResponseEntity<Boolean> checkAvailability(@RequestBody InternalLockRequest req) {
        return ResponseEntity.ok(internalRoomService.checkAvailability(req));
    }

    /** POST /api/rooms/internal/lock — tạm lock phòng */
    @PostMapping("/lock")
    public ResponseEntity<Void> lockRooms(@RequestBody InternalLockRequest req) {
        internalRoomService.lockRooms(req);
        return ResponseEntity.ok().build();
    }

    /** POST /api/rooms/internal/release — release phòng (khi hủy) */
    @PostMapping("/release")
    public ResponseEntity<Void> releaseRooms(@RequestBody InternalLockRequest req) {
        internalRoomService.releaseRooms(req);
        return ResponseEntity.ok().build();
    }

    /** POST /api/rooms/internal/confirm — xác nhận phòng (sau thanh toán) */
    @PostMapping("/confirm")
    public ResponseEntity<Void> confirmRooms(@RequestBody InternalLockRequest req) {
        internalRoomService.confirmRooms(req);
        return ResponseEntity.ok().build();
    }
}
