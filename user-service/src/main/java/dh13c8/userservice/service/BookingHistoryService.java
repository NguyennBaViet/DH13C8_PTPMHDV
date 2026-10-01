package dh13c8.userservice.service;

import dh13c8.userservice.domain.entity.Booking;
import dh13c8.userservice.domain.repository.BookingRepository;
import dh13c8.userservice.dto.BookingHistoryResponse;
import dh13c8.userservice.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingHistoryService {

    private final BookingRepository bookingRepository;

    /**
     * Lấy toàn bộ lịch sử đặt phòng của user (phân trang)
     */
    @Transactional(readOnly = true)
    public Page<BookingHistoryResponse> getBookingHistory(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toResponse);
    }

    /**
     * Lấy chi tiết 1 booking (kiểm tra ownership)
     */
    @Transactional(readOnly = true)
    public BookingHistoryResponse getBookingDetail(Long userId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy booking id=" + bookingId));
        if (!booking.getUserId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem booking này");
        }
        return toResponse(booking);
    }

    private BookingHistoryResponse toResponse(Booking b) {
        return BookingHistoryResponse.builder()
                .id(b.getId())
                .bookingCode(b.getBookingCode())
                .roomId(b.getRoomId())
                .hotelId(b.getHotelId())
                .checkInDate(b.getCheckInDate())
                .checkOutDate(b.getCheckOutDate())
                .numGuests(b.getNumGuests())
                .totalNights(b.getTotalNights())
                .roomPrice(b.getRoomPrice())
                .discountAmount(b.getDiscountAmount())
                .totalAmount(b.getTotalAmount())
                .status(b.getStatus().name())
                .specialRequests(b.getSpecialRequests())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
