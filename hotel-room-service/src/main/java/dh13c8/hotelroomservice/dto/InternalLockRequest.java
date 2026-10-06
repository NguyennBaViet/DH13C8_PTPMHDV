package dh13c8.hotelroomservice.dto;

import lombok.Data;
import java.time.LocalDate;

/**
 * Request body cho internal API: lock/release/confirm phòng
 * Được gọi từ booking-service
 */
@Data
public class InternalLockRequest {
    private Long   roomTypeId;   // room.id
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Integer   rooms;     // số phòng (hiện tại luôn = 1)
}
