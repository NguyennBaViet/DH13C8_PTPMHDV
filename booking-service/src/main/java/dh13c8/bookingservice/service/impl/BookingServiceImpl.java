package dh13c8.bookingservice.service.impl;

import dh13c8.bookingservice.client.PaymentClient;
import dh13c8.bookingservice.client.RoomClient;
import dh13c8.bookingservice.dto.request.CreateBookingRequest;
import dh13c8.bookingservice.dto.request.LockRoomRequest;
import dh13c8.bookingservice.dto.request.UpdateBookingRequest;
import dh13c8.bookingservice.dto.response.BookingResponse;
import dh13c8.bookingservice.dto.response.RoomTypeDto;
import dh13c8.bookingservice.entity.Booking;
import dh13c8.bookingservice.entity.BookingStatus;
import dh13c8.bookingservice.exception.BusinessException;
import dh13c8.bookingservice.exception.ErrorCode;
import dh13c8.bookingservice.repository.BookingRepository;
import dh13c8.bookingservice.service.BookingService;
import dh13c8.bookingservice.util.BookingCodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepo;
    private final RoomClient roomClient;
    private final PaymentClient paymentClient;
    private final BookingCodeGenerator codeGen;

    // Config với default value → không cần sửa application.properties
    @Value("${booking.lock-timeout-minutes:15}")
    private int lockTimeoutMinutes;

    @Value("${booking.tax-rate:0.10}")
    private double taxRate;

    @Value("${booking.cancel-free-before-hours:24}")
    private int cancelFreeBeforeHours;

    // ============================================================
    // 1. TẠO BOOKING MỚI
    // ============================================================
    @Override
    @Transactional
    public BookingResponse createBooking(Long userId, CreateBookingRequest req) {
        log.info("📝 Tạo booking: userId={}, roomTypeId={}, {} → {}",
                userId, req.getRoomTypeId(), req.getCheckIn(), req.getCheckOut());

        // 1.1. Validate ngày
        if (!req.getCheckOut().isAfter(req.getCheckIn())) {
            throw new BusinessException(ErrorCode.INVALID_DATE_RANGE,
                    "Ngày check-out phải sau check-in");
        }
        if (req.getCheckIn().isBefore(LocalDate.now())) {
            throw new BusinessException(ErrorCode.INVALID_DATE_RANGE,
                    "Ngày check-in không được ở quá khứ");
        }

        // 1.2. Lấy thông tin phòng
        RoomTypeDto roomType;
        try {
            roomType = roomClient.getRoomType(req.getRoomTypeId());
        } catch (Exception e) {
            log.error("Không lấy được thông tin phòng", e);
            throw new BusinessException(ErrorCode.SERVICE_UNAVAILABLE,
                    "Hotel-Room Service tạm thời không khả dụng");
        }

        if (roomType == null || roomType.getId() == null) {
            throw new BusinessException(ErrorCode.ROOM_NOT_AVAILABLE, "Loại phòng không tồn tại");
        }

        // 1.25. Nếu chính user này đã có đơn PENDING chưa thanh toán cho cùng phòng và ngày: tái sử dụng đơn cũ
        List<Booking> existingUserBookings = bookingRepo.findByUserIdAndRoomTypeIdAndCheckInAndCheckOut(
                userId, req.getRoomTypeId(), req.getCheckIn(), req.getCheckOut());
        Optional<Booking> pendingBooking = existingUserBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING && b.getPaymentId() == null)
                .findFirst();

        if (pendingBooking.isPresent()) {
            Booking b = pendingBooking.get();
            log.info("🔄 Tái sử dụng đơn booking PENDING id={} của userId={}", b.getId(), userId);
            b.setLockExpiresAt(LocalDateTime.now().plusMinutes(15));
            b.setContactName(req.getContactName());
            b.setContactEmail(req.getContactEmail());
            b.setContactPhone(req.getContactPhone());
            b.setSpecialRequests(req.getSpecialRequests());
            b.setGuests(req.getGuests());
            bookingRepo.save(b);
            return toResponse(b);
        }

        // 1.3. Check availability
        LockRoomRequest lockReq = LockRoomRequest.builder()
                .roomTypeId(req.getRoomTypeId())
                .checkIn(req.getCheckIn())
                .checkOut(req.getCheckOut())
                .rooms(req.getRooms())
                .build();

        Boolean available = roomClient.checkAvailability(lockReq);
        if (!Boolean.TRUE.equals(available)) {
            throw new BusinessException(ErrorCode.ROOM_NOT_AVAILABLE,
                    "Phòng đã hết trong khoảng thời gian này");
        }

        // 1.4. Lock phòng (giữ chỗ tạm)
        try {
            roomClient.lockRooms(lockReq);
        } catch (Exception e) {
            log.error("Lock phòng thất bại", e);
            throw new BusinessException(ErrorCode.SERVICE_UNAVAILABLE, "Không thể giữ phòng");
        }

        // 1.5. Tính tiền
        long nights = ChronoUnit.DAYS.between(req.getCheckIn(), req.getCheckOut());
        BigDecimal pricePerNight = roomType.getPricePerNight();
        BigDecimal subTotal = pricePerNight
                .multiply(BigDecimal.valueOf(nights))
                .multiply(BigDecimal.valueOf(req.getRooms()));
        BigDecimal taxAmount = subTotal.multiply(BigDecimal.valueOf(taxRate))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalPrice = subTotal.add(taxAmount).setScale(2, RoundingMode.HALF_UP);

        // 1.6. Lưu booking PENDING
        Booking booking = Booking.builder()
                .bookingCode(codeGen.generate())
                .userId(userId)
                .hotelId(req.getHotelId())
                .hotelName(roomType.getHotelName())
                .roomId(req.getRoomId())
                .roomTypeId(req.getRoomTypeId())
                .roomTypeName(roomType.getName())
                .checkIn(req.getCheckIn())
                .checkOut(req.getCheckOut())
                .nights((int) nights)
                .rooms(req.getRooms())
                .guests(req.getGuests())
                .pricePerNight(pricePerNight)
                .subTotal(subTotal)
                .taxAmount(taxAmount)
                .totalPrice(totalPrice)
                .status(BookingStatus.PENDING)
                .specialRequests(req.getSpecialRequests())
                .contactName(req.getContactName())
                .contactEmail(req.getContactEmail())
                .contactPhone(req.getContactPhone())
                .lockExpiresAt(LocalDateTime.now().plusMinutes(lockTimeoutMinutes))
                .build();

        bookingRepo.save(booking);
        log.info("✅ Đã tạo booking {} (PENDING), hết hạn lock lúc {}",
                booking.getBookingCode(), booking.getLockExpiresAt());

        return toResponse(booking);
    }

    // ============================================================
    // 2. XÁC NHẬN THANH TOÁN (gọi từ Payment Service)
    // ============================================================
    @Override
    @Transactional
    public BookingResponse confirmPayment(Long bookingId, Long paymentId) {
        Booking b = findBooking(bookingId);

        if (b.getStatus() != BookingStatus.PENDING) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION,
                    "Chỉ xác nhận được booking ở trạng thái PENDING");
        }
        if (b.getLockExpiresAt() != null && b.getLockExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException(ErrorCode.BOOKING_EXPIRED);
        }

        // Lưu thông tin thanh toán & xóa lock timeout (để không bị auto release)
        // Giữ trạng thái PENDING ("Chờ xác nhận") để Admin hoặc Staff phê duyệt thủ công
        b.setPaymentId(paymentId);
        b.setLockExpiresAt(null);
        bookingRepo.save(b);

        log.info("✅ Booking {} đã ghi nhận thanh toán (paymentId={}), giữ PENDING chờ Admin/Staff xác nhận", b.getBookingCode(), paymentId);
        return toResponse(b);
    }

    // ============================================================
    // 3. LẤY BOOKING
    // ============================================================
    @Override
    public BookingResponse getBooking(Long bookingId, Long userId, String role) {
        Booking b = findBooking(bookingId);
        if (!"ADMIN".equals(role) && !"STAFF".equals(role) && !b.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        return toResponse(b);
    }

    @Override
    public BookingResponse getByCode(String code) {
        Booking b = bookingRepo.findByBookingCode(code)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOOKING_NOT_FOUND));
        return toResponse(b);
    }

    @Override
    public Page<BookingResponse> getUserBookings(Long userId, Pageable pageable) {
        return bookingRepo.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toResponse);
    }

    @Override
    public Page<BookingResponse> getHotelBookings(Long hotelId, Pageable pageable) {
        return bookingRepo.findByHotelIdOrderByCreatedAtDesc(hotelId, pageable)
                .map(this::toResponse);
    }

    @Override
    public Page<BookingResponse> getAllBookings(Pageable pageable) {
        return bookingRepo.findAll(pageable)
                .map(this::toResponse);
    }

    @Override
    public Page<BookingResponse> getPendingBookings(Pageable pageable) {
        return bookingRepo.findByStatusOrderByCreatedAtDesc(BookingStatus.PENDING, pageable)
                .map(this::toResponse);
    }

    // ============================================================
    // 4. CẬP NHẬT BOOKING (chỉ khi PENDING)
    // ============================================================
    @Override
    @Transactional
    public BookingResponse updateBooking(Long bookingId, Long userId, UpdateBookingRequest req) {
        Booking b = findBooking(bookingId);

        if (!b.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        if (b.getStatus() != BookingStatus.PENDING) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION,
                    "Chỉ sửa được booking ở trạng thái PENDING");
        }

        LocalDate newCheckIn = req.getCheckIn() != null ? req.getCheckIn() : b.getCheckIn();
        LocalDate newCheckOut = req.getCheckOut() != null ? req.getCheckOut() : b.getCheckOut();
        Integer newRooms = req.getRooms() != null ? req.getRooms() : b.getRooms();

        if (!newCheckOut.isAfter(newCheckIn)) {
            throw new BusinessException(ErrorCode.INVALID_DATE_RANGE);
        }

        boolean dateChanged = !newCheckIn.equals(b.getCheckIn()) || !newCheckOut.equals(b.getCheckOut());
        boolean roomsChanged = !newRooms.equals(b.getRooms());

        // Nếu đổi ngày hoặc số phòng → release cũ + lock mới
        if (dateChanged || roomsChanged) {
            // Release lock cũ
            roomClient.releaseRooms(LockRoomRequest.builder()
                    .roomTypeId(b.getRoomTypeId())
                    .checkIn(b.getCheckIn())
                    .checkOut(b.getCheckOut())
                    .rooms(b.getRooms())
                    .build());

            // Lock lại theo thông tin mới
            LockRoomRequest newLock = LockRoomRequest.builder()
                    .roomTypeId(b.getRoomTypeId())
                    .checkIn(newCheckIn)
                    .checkOut(newCheckOut)
                    .rooms(newRooms)
                    .build();

            Boolean available = roomClient.checkAvailability(newLock);
            if (!Boolean.TRUE.equals(available)) {
                // Rollback: lock lại cái cũ
                roomClient.lockRooms(LockRoomRequest.builder()
                        .roomTypeId(b.getRoomTypeId())
                        .checkIn(b.getCheckIn())
                        .checkOut(b.getCheckOut())
                        .rooms(b.getRooms())
                        .build());
                throw new BusinessException(ErrorCode.ROOM_NOT_AVAILABLE,
                        "Phòng không còn trống cho ngày mới");
            }

            roomClient.lockRooms(newLock);

            // Cập nhật entity
            b.setCheckIn(newCheckIn);
            b.setCheckOut(newCheckOut);
            b.setRooms(newRooms);
            long nights = ChronoUnit.DAYS.between(newCheckIn, newCheckOut);
            b.setNights((int) nights);

            // Tính lại tiền
            BigDecimal subTotal = b.getPricePerNight()
                    .multiply(BigDecimal.valueOf(nights))
                    .multiply(BigDecimal.valueOf(newRooms));
            BigDecimal taxAmount = subTotal.multiply(BigDecimal.valueOf(taxRate))
                    .setScale(2, RoundingMode.HALF_UP);
            b.setSubTotal(subTotal);
            b.setTaxAmount(taxAmount);
            b.setTotalPrice(subTotal.add(taxAmount).setScale(2, RoundingMode.HALF_UP));
        }

        if (req.getGuests() != null) b.setGuests(req.getGuests());
        if (req.getSpecialRequests() != null) b.setSpecialRequests(req.getSpecialRequests());

        // Reset lock timeout vì có thay đổi
        b.setLockExpiresAt(LocalDateTime.now().plusMinutes(lockTimeoutMinutes));

        bookingRepo.save(b);
        log.info("✅ Đã cập nhật booking {}", b.getBookingCode());
        return toResponse(b);
    }

    // ============================================================
    // 5. HỦY BOOKING / YÊU CẦU HỦY
    // ============================================================
    @Override
    @Transactional
    public BookingResponse cancelBooking(Long bookingId, Long userId, String role, String reason) {
        Booking b = findBooking(bookingId);

        boolean isAdminOrStaff = "ADMIN".equals(role) || "STAFF".equals(role);
        if (!isAdminOrStaff && !b.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        if (b.getStatus() == BookingStatus.CANCELLED || b.getStatus() == BookingStatus.REFUNDED) {
            throw new BusinessException(ErrorCode.CANNOT_CANCEL, "Booking đã bị hủy trước đó");
        }
        if (b.getStatus() == BookingStatus.CANCEL_REQUESTED) {
            throw new BusinessException(ErrorCode.CANNOT_CANCEL, "Đơn đặt phòng đang chờ Quản trị viên duyệt hủy");
        }
        if (b.getStatus() == BookingStatus.COMPLETED || b.getStatus() == BookingStatus.CHECKED_IN) {
            throw new BusinessException(ErrorCode.CANNOT_CANCEL,
                    "Không thể hủy booking đã nhận phòng hoặc đã hoàn thành");
        }
        if (b.getCheckIn().isBefore(LocalDate.now())) {
            throw new BusinessException(ErrorCode.CANNOT_CANCEL, "Không thể hủy booking sau ngày nhận phòng");
        }

        // Tính toán phí hủy & hoàn tiền theo chính sách
        long hoursUntilCheckIn = ChronoUnit.HOURS.between(LocalDateTime.now(), b.getCheckIn().atStartOfDay());
        BigDecimal refundAmount;
        BigDecimal cancellationFee;

        boolean isPaid = (b.getPaymentId() != null);
        boolean isPending = (b.getStatus() == BookingStatus.PENDING);

        if (isPending || hoursUntilCheckIn >= cancelFreeBeforeHours) {
            refundAmount = b.getTotalPrice(); // Hoàn 100%
            cancellationFee = BigDecimal.ZERO; // Phí hủy 0đ
        } else {
            refundAmount = b.getTotalPrice().multiply(BigDecimal.valueOf(0.5)).setScale(2, RoundingMode.HALF_UP); // Hoàn 50%
            cancellationFee = b.getTotalPrice().subtract(refundAmount); // Phí hủy 50%
        }

        b.setCancellationFee(cancellationFee);
        b.setRefundAmount(refundAmount);
        b.setCancelReason(reason != null && !reason.isBlank() ? reason : "Khách yêu cầu hủy phòng");
        b.setCancelledAt(LocalDateTime.now());

        // NẾU LÀ KHÁCH HÀNG VÀ ĐƠN ĐÃ ĐƯỢC XÁC NHẬN HOẶC ĐÃ THANH TOÁN
        // -> CHUYỂN TRẠNG THÁI SANG CANCEL_REQUESTED (CHỜ ADMIN DUYỆT HỦY)
        if (!isAdminOrStaff && (b.getStatus() == BookingStatus.CONFIRMED || isPaid)) {
            b.setStatus(BookingStatus.CANCEL_REQUESTED);
            bookingRepo.save(b);
            log.info("⏳ Khách hàng {} gửi yêu cầu hủy booking #{}. Chờ Admin phê duyệt.", userId, b.getBookingCode());
            return toResponse(b);
        }

        // NẾU LÀ ADMIN/STAFF HOẶC ĐƠN PENDING CHƯA THANH TOÁN:
        // HỦY TRỰC TIẾP, GIẢI PHÓNG PHÒNG VÀ HOÀN TIỀN
        roomClient.releaseRooms(buildLockReq(b));

        if (isPaid && refundAmount.compareTo(BigDecimal.ZERO) > 0) {
            try {
                paymentClient.refund(b.getPaymentId(), refundAmount);
                b.setStatus(BookingStatus.REFUNDED);
            } catch (Exception e) {
                log.error("❌ Hoàn tiền thất bại, chuyển sang CANCELLED", e);
                b.setStatus(BookingStatus.CANCELLED);
            }
        } else {
            b.setStatus(BookingStatus.CANCELLED);
        }

        b.setLockExpiresAt(null);
        bookingRepo.save(b);

        log.info("✅ Đã hủy booking {} - status={}", b.getBookingCode(), b.getStatus());
        return toResponse(b);
    }

    @Override
    @Transactional
    public BookingResponse approveCancellation(Long bookingId, String role) {
        if (!"ADMIN".equals(role) && !"STAFF".equals(role)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Chỉ STAFF hoặc ADMIN mới có quyền duyệt hủy đơn");
        }
        Booking b = findBooking(bookingId);
        if (b.getStatus() != BookingStatus.CANCEL_REQUESTED) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION,
                    "Chỉ phê duyệt được các đơn đang ở trạng thái Yêu cầu hủy (CANCEL_REQUESTED)");
        }

        // 1. Giải phóng phòng
        roomClient.releaseRooms(buildLockReq(b));

        // 2. Hoàn tiền nếu đã thanh toán
        BigDecimal refundAmt = b.getRefundAmount() != null ? b.getRefundAmount() : b.getTotalPrice();
        if (b.getPaymentId() != null && refundAmt.compareTo(BigDecimal.ZERO) > 0) {
            try {
                paymentClient.refund(b.getPaymentId(), refundAmt);
                b.setStatus(BookingStatus.REFUNDED);
            } catch (Exception e) {
                log.error("❌ Hoàn tiền qua cổng payment thất bại, chuyển CANCELLED", e);
                b.setStatus(BookingStatus.CANCELLED);
            }
        } else {
            b.setStatus(BookingStatus.CANCELLED);
        }

        b.setLockExpiresAt(null);
        b.setCancelAdminNote("Quản trị viên đã phê duyệt hủy đơn và hoàn tiền theo chính sách");
        bookingRepo.save(b);

        log.info("✅ Admin ({}) đã phê duyệt hủy booking #{}", role, b.getBookingCode());
        return toResponse(b);
    }

    @Override
    @Transactional
    public BookingResponse rejectCancellation(Long bookingId, String role, String reason) {
        if (!"ADMIN".equals(role) && !"STAFF".equals(role)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Chỉ STAFF hoặc ADMIN mới có quyền từ chối yêu cầu hủy");
        }
        Booking b = findBooking(bookingId);
        if (b.getStatus() != BookingStatus.CANCEL_REQUESTED) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION,
                    "Chỉ từ chối được các đơn đang ở trạng thái Yêu cầu hủy (CANCEL_REQUESTED)");
        }

        // Khôi phục trạng thái về CONFIRMED (giữ nguyên phòng đã đặt)
        b.setStatus(BookingStatus.CONFIRMED);
        b.setCancelAdminNote(reason != null && !reason.isBlank() ? reason : "Từ chối hủy do không thỏa mãn chính sách hủy");
        bookingRepo.save(b);

        log.info("⛔ Admin ({}) đã từ chối yêu cầu hủy booking #{}. Lý do: {}", role, b.getBookingCode(), b.getCancelAdminNote());
        return toResponse(b);
    }

    // ============================================================
    // 5.5. XÁC NHẬN / PHÊ DUYỆT BOOKING (STAFF/ADMIN)
    // ============================================================
    @Override
    @Transactional
    public BookingResponse confirmBooking(Long bookingId, String role) {
        if (!"STAFF".equals(role) && !"ADMIN".equals(role)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Chỉ STAFF hoặc ADMIN mới có quyền xác nhận booking");
        }
        Booking b = findBooking(bookingId);

        if (b.getStatus() != BookingStatus.PENDING) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION,
                    "Chỉ xác nhận được booking ở trạng thái PENDING (Chờ xác nhận)");
        }

        // Chuyển phòng từ LOCKED sang BOOKED
        roomClient.confirmRooms(buildLockReq(b));

        b.setStatus(BookingStatus.CONFIRMED);
        b.setLockExpiresAt(null);
        bookingRepo.save(b);

        log.info("✅ Booking {} đã được Admin/Staff ({}) xác nhận (CONFIRMED)", b.getBookingCode(), role);
        return toResponse(b);
    }

    // ============================================================
    // 6. CHECK-IN (STAFF/ADMIN)
    // ============================================================
    @Override
    @Transactional
    public BookingResponse checkIn(Long bookingId, String role) {
        if (!"STAFF".equals(role) && !"ADMIN".equals(role)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Chỉ STAFF/ADMIN mới check-in");
        }
        Booking b = findBooking(bookingId);
        if (b.getStatus() != BookingStatus.CONFIRMED) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION,
                    "Chỉ check-in được booking CONFIRMED");
        }

        b.setStatus(BookingStatus.CHECKED_IN);
        bookingRepo.save(b);
        log.info("✅ Check-in booking {}", b.getBookingCode());
        return toResponse(b);
    }

    // ============================================================
    // 7. CHECK-OUT (STAFF/ADMIN)
    // ============================================================
    @Override
    @Transactional
    public BookingResponse checkOut(Long bookingId, String role) {
        if (!"STAFF".equals(role) && !"ADMIN".equals(role)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Chỉ STAFF/ADMIN mới check-out");
        }
        Booking b = findBooking(bookingId);
        if (b.getStatus() != BookingStatus.CHECKED_IN) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION,
                    "Chỉ check-out được booking CHECKED_IN");
        }

        b.setStatus(BookingStatus.COMPLETED);
        bookingRepo.save(b);
        log.info("✅ Check-out booking {}", b.getBookingCode());
        return toResponse(b);
    }

    // ============================================================
    // 8. AUTO RELEASE EXPIRED BOOKINGS (gọi từ Scheduler)
    // ============================================================
    @Override
    @Transactional
    public void releaseExpiredBookings() {
        List<Booking> expired = bookingRepo.findExpiredPendingBookings(LocalDateTime.now());
        if (expired.isEmpty()) return;

        log.info("🧹 Tìm thấy {} booking hết hạn lock", expired.size());

        for (Booking b : expired) {
            try {
                roomClient.releaseRooms(buildLockReq(b));
                b.setStatus(BookingStatus.EXPIRED);
                b.setLockExpiresAt(null);
                bookingRepo.save(b);
                log.info("  → Đã release booking {}", b.getBookingCode());
            } catch (Exception e) {
                log.error("  ❌ Lỗi release booking {}: {}", b.getBookingCode(), e.getMessage());
            }
        }
    }

    // ============================================================
    // HELPERS
    // ============================================================
    private Booking findBooking(Long id) {
        return bookingRepo.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOOKING_NOT_FOUND));
    }

    private LockRoomRequest buildLockReq(Booking b) {
        return LockRoomRequest.builder()
                .roomTypeId(b.getRoomTypeId())
                .checkIn(b.getCheckIn())
                .checkOut(b.getCheckOut())
                .rooms(b.getRooms())
                .build();
    }

    private BookingResponse toResponse(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .bookingCode(b.getBookingCode())
                .userId(b.getUserId())
                .hotelId(b.getHotelId())
                .hotelName(b.getHotelName())
                .roomTypeId(b.getRoomTypeId())
                .roomTypeName(b.getRoomTypeName())
                .checkIn(b.getCheckIn())
                .checkOut(b.getCheckOut())
                .nights(b.getNights())
                .rooms(b.getRooms())
                .guests(b.getGuests())
                .pricePerNight(b.getPricePerNight())
                .subTotal(b.getSubTotal())
                .taxAmount(b.getTaxAmount())
                .totalPrice(b.getTotalPrice())
                .status(b.getStatus())
                .specialRequests(b.getSpecialRequests())
                .contactName(b.getContactName())
                .contactEmail(b.getContactEmail())
                .contactPhone(b.getContactPhone())
                .lockExpiresAt(b.getLockExpiresAt())
                .cancelledAt(b.getCancelledAt())
                .cancelReason(b.getCancelReason())
                .cancellationFee(b.getCancellationFee())
                .refundAmount(b.getRefundAmount())
                .cancelAdminNote(b.getCancelAdminNote())
                .paymentId(b.getPaymentId())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }
}