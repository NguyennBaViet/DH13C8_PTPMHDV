package dh13c8.hotelroomservice.service;

import dh13c8.hotelroomservice.domain.entity.*;
import dh13c8.hotelroomservice.domain.repository.*;
import dh13c8.hotelroomservice.dto.*;
import dh13c8.hotelroomservice.exception.AppException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Service dành riêng cho giao tiếp nội bộ giữa booking-service và hotel-room-service.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InternalRoomService {

    private final RoomRepository             roomRepository;
    private final RoomAvailabilityRepository availabilityRepository;

    /** Lấy thông tin phòng theo ID — trả về format RoomTypeDto cho booking-service */
    @Transactional(readOnly = true)
    public InternalRoomTypeDto getRoomType(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy phòng id=" + roomId));

        long available = availabilityRepository.countBlockedDays(
                roomId, LocalDate.now(), LocalDate.now().plusDays(1)) == 0 ? 1 : 0;

        return InternalRoomTypeDto.builder()
                .id(room.getId())
                .hotelId(room.getHotel().getId())
                .hotelName(room.getHotel().getName())
                .name(room.getRoomType().name() + " - " + room.getRoomNumber())
                .pricePerNight(room.getPricePerNight())
                .capacity(room.getCapacity())
                .availableRooms((int) available)
                .build();
    }

    /** Kiểm tra phòng có khả dụng trong khoảng ngày không */
    @Transactional(readOnly = true)
    public boolean checkAvailability(InternalLockRequest req) {
        if (req.getRoomTypeId() == null || req.getCheckIn() == null || req.getCheckOut() == null) {
            return false;
        }
        long blocked = availabilityRepository.countBlockedDays(
                req.getRoomTypeId(), req.getCheckIn(), req.getCheckOut());
        return blocked == 0;
    }

    /** Tạm lock phòng (PENDING booking) */
    @Transactional
    public void lockRooms(InternalLockRequest req) {
        Room room = roomRepository.findById(req.getRoomTypeId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy phòng id=" + req.getRoomTypeId()));

        long blocked = availabilityRepository.countBlockedDays(
                req.getRoomTypeId(), req.getCheckIn(), req.getCheckOut());
        if (blocked > 0) {
            throw new AppException(HttpStatus.CONFLICT, "Phòng đã được đặt trong khoảng thời gian này");
        }

        List<RoomAvailability> records = new ArrayList<>();
        LocalDate date = req.getCheckIn();
        while (date.isBefore(req.getCheckOut())) {
            records.add(RoomAvailability.builder()
                    .room(room)
                    .date(date)
                    .status(RoomAvailability.AvailabilityStatus.LOCKED)
                    .build());
            date = date.plusDays(1);
        }

        try {
            availabilityRepository.saveAll(records);
            log.info("🔒 Lock phòng id={} từ {} đến {}", req.getRoomTypeId(), req.getCheckIn(), req.getCheckOut());
        } catch (DataIntegrityViolationException e) {
            throw new AppException(HttpStatus.CONFLICT, "Phòng vừa được đặt bởi người khác");
        }
    }

    /** Release phòng (hủy booking PENDING) */
    @Transactional
    public void releaseRooms(InternalLockRequest req) {
        List<RoomAvailability> records = availabilityRepository
                .findByRoomIdAndDateBetween(req.getRoomTypeId(), req.getCheckIn(), req.getCheckOut().minusDays(1));
        availabilityRepository.deleteAll(records);
        log.info("🔓 Release phòng id={} từ {} đến {}", req.getRoomTypeId(), req.getCheckIn(), req.getCheckOut());
    }

    /** Xác nhận booking (PENDING → CONFIRMED), đổi LOCKED → BOOKED */
    @Transactional
    public void confirmRooms(InternalLockRequest req) {
        List<RoomAvailability> records = availabilityRepository
                .findByRoomIdAndDateBetween(req.getRoomTypeId(), req.getCheckIn(), req.getCheckOut().minusDays(1));
        records.forEach(r -> r.setStatus(RoomAvailability.AvailabilityStatus.BOOKED));
        availabilityRepository.saveAll(records);
        log.info("✅ Confirm phòng id={} từ {} đến {}", req.getRoomTypeId(), req.getCheckIn(), req.getCheckOut());
    }
}
