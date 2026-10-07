package dh13c8.bookingservice.service;

import dh13c8.bookingservice.dto.request.CreateBookingRequest;
import dh13c8.bookingservice.dto.request.UpdateBookingRequest;
import dh13c8.bookingservice.dto.response.BookingResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BookingService {

    BookingResponse createBooking(Long userId, CreateBookingRequest req);

    BookingResponse getBooking(Long bookingId, Long userId, String role);

    BookingResponse getByCode(String code);

    Page<BookingResponse> getUserBookings(Long userId, Pageable pageable);

    Page<BookingResponse> getHotelBookings(Long hotelId, Pageable pageable);

    Page<BookingResponse> getAllBookings(Pageable pageable);

    BookingResponse updateBooking(Long bookingId, Long userId, UpdateBookingRequest req);

    BookingResponse cancelBooking(Long bookingId, Long userId, String role, String reason);

    BookingResponse confirmPayment(Long bookingId, Long paymentId);

    BookingResponse confirmBooking(Long bookingId, String role);

    BookingResponse checkIn(Long bookingId, String role);

    BookingResponse checkOut(Long bookingId, String role);

    void releaseExpiredBookings();
}