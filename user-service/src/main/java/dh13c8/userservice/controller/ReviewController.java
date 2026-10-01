package dh13c8.userservice.controller;

import dh13c8.userservice.dto.*;
import dh13c8.userservice.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collection;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * POST /api/reviews  – tạo đánh giá mới (phải là GUEST đã COMPLETED booking)
     */
    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @Valid @RequestBody CreateReviewRequest req,
            Principal principal) {
        Long userId = extractUserId(principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.createReview(userId, req));
    }

    /**
     * GET /api/reviews/my?page=0&size=10  – xem đánh giá của mình
     */
    @GetMapping("/my")
    public ResponseEntity<Page<ReviewResponse>> getMyReviews(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal) {
        Long userId = extractUserId(principal);
        return ResponseEntity.ok(reviewService.getMyReviews(userId, page, size));
    }

    /**
     * GET /api/reviews/hotel/{hotelId}?page=0&size=10  – public: xem review của khách sạn
     */
    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<Page<ReviewResponse>> getHotelReviews(
            @PathVariable Long hotelId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(reviewService.getHotelReviews(hotelId, page, size));
    }

    /**
     * GET /api/reviews/hotel/{hotelId}/summary  – thống kê rating khách sạn
     */
    @GetMapping("/hotel/{hotelId}/summary")
    public ResponseEntity<HotelRatingSummary> getHotelRatingSummary(@PathVariable Long hotelId) {
        return ResponseEntity.ok(reviewService.getHotelRatingSummary(hotelId));
    }

    /**
     * DELETE /api/reviews/{id}  – xoá đánh giá (owner hoặc ADMIN)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id,
            Principal principal) {
        Long userId = extractUserId(principal);
        String role = extractRole(principal);
        reviewService.deleteReview(id, userId, role);
        return ResponseEntity.noContent().build();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private Long extractUserId(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            return (Long) auth.getCredentials();
        }
        throw new IllegalStateException("Không thể xác định userId");
    }

    private String extractRole(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
            return authorities.stream()
                    .map(GrantedAuthority::getAuthority)
                    .map(a -> a.replace("ROLE_", ""))
                    .findFirst()
                    .orElse("GUEST");
        }
        return "GUEST";
    }
}
