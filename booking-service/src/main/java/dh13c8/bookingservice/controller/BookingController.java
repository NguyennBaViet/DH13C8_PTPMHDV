package dh13c8.bookingservice.controller;

import dh13c8.bookingservice.dto.ApiResponse;
import dh13c8.bookingservice.dto.request.CreateBookingRequest;
import dh13c8.bookingservice.dto.request.UpdateBookingRequest;
import dh13c8.bookingservice.dto.response.BookingResponse;
import dh13c8.bookingservice.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Slf4j
public class BookingController {

    private final BookingService bookingService;

    // ============================================================
    // 0. LẤY TẤT CẢ BOOKING (ADMIN/STAFF)
    // GET /api/bookings
    // ============================================================
    @GetMapping
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<BookingResponse> result = bookingService.getAllBookings(pageable);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    // ============================================================
    // 1. TẠO BOOKING MỚI
    // POST /api/bookings
    // ============================================================
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateBookingRequest req) {

        log.info("📥 POST /api/bookings - userId={}", userId);
        BookingResponse response = bookingService.createBooking(userId, req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo booking thành công", response));
    }

    // ============================================================
    // 2. LẤY BOOKING THEO ID
    // GET /api/bookings/{id}
    // ============================================================
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBooking(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "GUEST") String role) {

        BookingResponse response = bookingService.getBooking(id, userId, role);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // ============================================================
    // 3. TRA CỨU BOOKING THEO CODE
    // GET /api/bookings/code/{code}
    // ============================================================
    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<BookingResponse>> getByCode(@PathVariable String code) {
        BookingResponse response = bookingService.getByCode(code);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // ============================================================
    // 4. LỊCH SỬ BOOKING CỦA USER (có phân trang)
    // GET /api/bookings/me?page=0&size=10
    // ============================================================
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> myBookings(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<BookingResponse> result = bookingService.getUserBookings(userId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    // ============================================================
    // 5. LỊCH SỬ BOOKING THEO USER ID (dùng cho User Service gọi)
    // GET /api/bookings/user/{userId}
    // ============================================================
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<BookingResponse>> getByUserId(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(bookingService.getUserBookings(userId, pageable));
    }

    // ============================================================
    // 6. LỊCH SỬ BOOKING THEO HOTEL (STAFF/ADMIN)
    // GET /api/bookings/hotel/{hotelId}
    // ============================================================
    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getByHotel(
            @PathVariable Long hotelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<BookingResponse> result = bookingService.getHotelBookings(hotelId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    // ============================================================
    // 7. CẬP NHẬT BOOKING (chỉ PENDING)
    // PUT /api/bookings/{id}
    // ============================================================
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBooking(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody UpdateBookingRequest req) {

        BookingResponse response = bookingService.updateBooking(id, userId, req);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thành công", response));
    }

    // ============================================================
    // 8. HỦY BOOKING
    // POST /api/bookings/{id}/cancel
    // ============================================================
    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "GUEST") String role,
            @RequestBody(required = false) Map<String, String> body) {

        String reason = body != null ? body.getOrDefault("reason", "Không có lý do") : "Không có lý do";
        BookingResponse response = bookingService.cancelBooking(id, userId, role, reason);
        return ResponseEntity.ok(ApiResponse.ok("Hủy booking thành công", response));
    }

    // ============================================================
    // 9. XÁC NHẬN THANH TOÁN (gọi từ Payment Service)
    // POST /api/bookings/{id}/confirm-payment?paymentId=123
    // ============================================================
    @PostMapping("/{id}/confirm-payment")
    public ResponseEntity<ApiResponse<BookingResponse>> confirmPayment(
            @PathVariable Long id,
            @RequestParam Long paymentId) {

        BookingResponse response = bookingService.confirmPayment(id, paymentId);
        return ResponseEntity.ok(ApiResponse.ok("Xác nhận thanh toán thành công", response));
    }

    // ============================================================
    // 10. CHECK-IN (STAFF/ADMIN)
    // POST /api/bookings/{id}/check-in
    // ============================================================
    @PostMapping("/{id}/check-in")
    public ResponseEntity<ApiResponse<BookingResponse>> checkIn(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", defaultValue = "GUEST") String role) {

        BookingResponse response = bookingService.checkIn(id, role);
        return ResponseEntity.ok(ApiResponse.ok("Check-in thành công", response));
    }

    // ============================================================
    // 11. CHECK-OUT (STAFF/ADMIN)
    // POST /api/bookings/{id}/check-out
    // ============================================================
    @PostMapping("/{id}/check-out")
    public ResponseEntity<ApiResponse<BookingResponse>> checkOut(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", defaultValue = "GUEST") String role) {

        BookingResponse response = bookingService.checkOut(id, role);
        return ResponseEntity.ok(ApiResponse.ok("Check-out thành công", response));
    }

    // ============================================================
    // 12. HEALTH CHECK
    // GET /api/bookings/health
    // ============================================================
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.ok("Booking Service is running on port 8024"));
    }
}