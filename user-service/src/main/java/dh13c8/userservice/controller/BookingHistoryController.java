package dh13c8.userservice.controller;

import dh13c8.userservice.dto.BookingHistoryResponse;
import dh13c8.userservice.service.BookingHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/users/me/bookings")
@RequiredArgsConstructor
public class BookingHistoryController {

    private final BookingHistoryService bookingHistoryService;

    /**
     * GET /api/users/me/bookings?page=0&size=10
     * Lịch sử đặt phòng của user hiện tại
     */
    @GetMapping
    public ResponseEntity<Page<BookingHistoryResponse>> getMyBookings(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal) {
        Long userId = extractUserId(principal);
        return ResponseEntity.ok(bookingHistoryService.getBookingHistory(userId, page, size));
    }

    /**
     * GET /api/users/me/bookings/{bookingId}
     * Chi tiết 1 booking
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingHistoryResponse> getBookingDetail(
            @PathVariable Long bookingId,
            Principal principal) {
        Long userId = extractUserId(principal);
        return ResponseEntity.ok(bookingHistoryService.getBookingDetail(userId, bookingId));
    }

    private Long extractUserId(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            return (Long) auth.getCredentials();
        }
        throw new IllegalStateException("Không thể xác định userId");
    }
}
