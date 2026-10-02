package dh13c8.bookingservice.dto.request;

import lombok.*;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LockRoomRequest {
    private Long roomTypeId;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Integer rooms;
}