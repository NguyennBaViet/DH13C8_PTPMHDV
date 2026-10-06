package dh13c8.hotelroomservice.dto;

import lombok.*;
import java.math.BigDecimal;

/**
 * Response cho booking-service khi query thông tin phòng
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InternalRoomTypeDto {
    private Long       id;
    private Long       hotelId;
    private String     hotelName;
    private String     name;          // roomType + roomNumber
    private BigDecimal pricePerNight;
    private Integer    capacity;
    private Integer    availableRooms; // luôn = 1 (mỗi room là 1 phòng)
}
