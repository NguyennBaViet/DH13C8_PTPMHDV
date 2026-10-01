package dh13c8.hotelroomservice.service;

import dh13c8.hotelroomservice.domain.entity.*;
import dh13c8.hotelroomservice.domain.repository.*;
import dh13c8.hotelroomservice.dto.AvailabilityRequest;
import dh13c8.hotelroomservice.exception.AppException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final RoomRepository             roomRepository;
    private final RoomAvailabilityRepository availabilityRepository;

    /**
     * Kiểm tra phòng có trống trong khoảng ngày không.
     * Trả về true nếu tất cả ngày đều AVAILABLE.
     */
    @Transactional(readOnly = true)
    public boolean checkAvailability(Long roomId, LocalDate checkIn, LocalDate checkOut) {
        if (!checkOut.isAfter(checkIn)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Ngày check-out phải sau check-in");
        }
        long blocked = availabilityRepository.countBlockedDays(roomId, checkIn, checkOut);
        return blocked == 0;
    }

    /**
     * Lấy trạng thái từng ngày trong tháng để hiển thị lịch.
     */
    @Transactional(readOnly = true)
    public Map<LocalDate, String> getAvailabilityCalendar(Long roomId,
                                                           LocalDate from, LocalDate to) {
        List<RoomAvailability> records = availabilityRepository
                .findByRoomIdAndDateBetween(roomId, from, to);

        Map<LocalDate, String> calendar = new LinkedHashMap<>();
        // Mặc định tất cả ngày là AVAILABLE
        from.datesUntil(to.plusDays(1))
            .forEach(d -> calendar.put(d, "AVAILABLE"));
        // Ghi đè những ngày có trạng thái đặc biệt
        records.forEach(r -> calendar.put(r.getDate(), r.getStatus().name()));
        return calendar;
    }

    /**
     * Lock phòng theo ngày (gọi từ Booking Service sau khi tạo booking thành công).
     * Dùng UNIQUE KEY (room_id, date) để chống race condition.
     */
    @Transactional
    public void lockRoom(Long roomId, AvailabilityRequest req) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy phòng id=" + roomId));

        // Kiểm tra lại lần cuối trước khi lock
        long blocked = availabilityRepository.countBlockedDays(
                roomId, req.getCheckInDate(), req.getCheckOutDate());
        if (blocked > 0) {
            throw new AppException(HttpStatus.CONFLICT,
                    "Phòng đã được đặt trong khoảng thời gian này");
        }

        // Tạo bản ghi lock cho từng ngày [checkIn, checkOut)
        List<RoomAvailability> records = new ArrayList<>();
        LocalDate date = req.getCheckInDate();
        while (date.isBefore(req.getCheckOutDate())) {
            records.add(RoomAvailability.builder()
                    .room(room)
                    .date(date)
                    .status(RoomAvailability.AvailabilityStatus.BOOKED)
                    .bookingId(req.getBookingId())
                    .build());
            date = date.plusDays(1);
        }

        try {
            availabilityRepository.saveAll(records);
            log.info("Lock phòng id={} bookingId={} từ {} đến {}",
                    roomId, req.getBookingId(), req.getCheckInDate(), req.getCheckOutDate());
        } catch (DataIntegrityViolationException e) {
            // Race condition: 2 request lock cùng lúc → chỉ 1 thắng
            throw new AppException(HttpStatus.CONFLICT,
                    "Phòng vừa được đặt bởi người khác, vui lòng chọn phòng khác");
        }
    }

    /**
     * Unlock phòng (gọi khi hủy booking).
     */
    @Transactional
    public void unlockRoom(Long roomId, AvailabilityRequest req) {
        availabilityRepository.unlockDates(
                roomId, req.getCheckInDate(), req.getCheckOutDate(), req.getBookingId());
        log.info("Unlock phòng id={} bookingId={}", roomId, req.getBookingId());
    }
}
