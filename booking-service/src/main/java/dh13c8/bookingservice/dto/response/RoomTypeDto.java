package dh13c8.bookingservice.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoomTypeDto {
    private Long id;
    private Long hotelId;
    private String hotelName;
    private String name;
    private BigDecimal pricePerNight;
    private Integer capacity;
    private Integer availableRooms;
}