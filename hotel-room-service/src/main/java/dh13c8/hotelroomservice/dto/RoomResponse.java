package dh13c8.hotelroomservice.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RoomResponse {
    private Long        id;
    private Long        hotelId;
    private String      hotelName;
    private String      hotelCity;
    private String      roomNumber;
    private String      roomType;
    private String      description;
    private Integer     floor;
    private Integer     capacity;
    private BigDecimal  pricePerNight;
    private String      image;
    private boolean     isActive;
    private List<AmenityResponse> amenities;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
