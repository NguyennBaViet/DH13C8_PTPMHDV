package dh13c8.userservice.service;

import dh13c8.userservice.domain.entity.*;
import dh13c8.userservice.domain.repository.*;
import dh13c8.userservice.dto.*;
import dh13c8.userservice.exception.AppException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository  reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository    userRepository;

    /**
     * Tạo đánh giá mới – chỉ được đánh giá booking COMPLETED và chưa có review
     */
    @Transactional
    public ReviewResponse createReview(Long userId, CreateReviewRequest req) {
        // Kiểm tra booking tồn tại và thuộc về user
        Booking booking = bookingRepository.findById(req.getBookingId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy booking id=" + req.getBookingId()));

        if (!booking.getUserId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền đánh giá booking này");
        }
        if (booking.getStatus() != Booking.BookingStatus.COMPLETED) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Chỉ có thể đánh giá sau khi hoàn tất kỳ nghỉ");
        }
        if (reviewRepository.existsByBookingId(req.getBookingId())) {
            throw new AppException(HttpStatus.CONFLICT, "Bạn đã đánh giá booking này rồi");
        }

        Review review = Review.builder()
                .userId(userId)
                .hotelId(req.getHotelId())
                .bookingId(req.getBookingId())
                .rating(req.getRating())
                .title(req.getTitle())
                .comment(req.getComment())
                .isVisible(true)
                .build();

        review = reviewRepository.save(review);
        log.info("Tạo review id={} cho hotel id={}", review.getId(), review.getHotelId());
        return toResponse(review, userId);
    }

    /**
     * Lấy danh sách review của user (phân trang)
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getMyReviews(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(r -> toResponse(r, userId));
    }

    /**
     * Lấy danh sách review của khách sạn (public)
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getHotelReviews(Long hotelId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return reviewRepository.findByHotelIdAndIsVisibleTrueOrderByCreatedAtDesc(hotelId, pageable)
                .map(r -> toResponse(r, r.getUserId()));
    }

    /**
     * Rating summary của khách sạn
     */
    @Transactional(readOnly = true)
    public HotelRatingSummary getHotelRatingSummary(Long hotelId) {
        Double avg   = reviewRepository.averageRatingByHotelId(hotelId);
        Long   total = reviewRepository.countByHotelId(hotelId);

        List<Review> reviews = reviewRepository.findByHotelIdAndIsVisibleTrue(hotelId);
        long c5 = reviews.stream().filter(r -> r.getRating() == 5).count();
        long c4 = reviews.stream().filter(r -> r.getRating() == 4).count();
        long c3 = reviews.stream().filter(r -> r.getRating() == 3).count();
        long c2 = reviews.stream().filter(r -> r.getRating() == 2).count();
        long c1 = reviews.stream().filter(r -> r.getRating() == 1).count();

        return HotelRatingSummary.builder()
                .hotelId(hotelId)
                .averageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0)
                .totalReviews(total != null ? total : 0L)
                .count5Star(c5).count4Star(c4).count3Star(c3)
                .count2Star(c2).count1Star(c1)
                .build();
    }

    /**
     * Xoá review (chỉ chủ sở hữu hoặc admin)
     */
    @Transactional
    public void deleteReview(Long reviewId, Long userId, String role) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy review id=" + reviewId));

        boolean isOwner = review.getUserId().equals(userId);
        boolean isAdmin = "ADMIN".equals(role);

        if (!isOwner && !isAdmin) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền xoá review này");
        }

        reviewRepository.delete(review);
        log.info("Xoá review id={}", reviewId);
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    private ReviewResponse toResponse(Review r, Long currentUserId) {
        User user = userRepository.findById(r.getUserId()).orElse(null);
        return ReviewResponse.builder()
                .id(r.getId())
                .userId(r.getUserId())
                .username(user != null ? user.getUsername() : "Ẩn danh")
                .userAvatar(user != null ? user.getAvatarUrl() : null)
                .hotelId(r.getHotelId())
                .bookingId(r.getBookingId())
                .rating(r.getRating())
                .title(r.getTitle())
                .comment(r.getComment())
                .isVisible(r.isVisible())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
