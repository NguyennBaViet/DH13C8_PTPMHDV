package dh13c8.hotelroomservice.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class RoomSearchRequest {
    private Long      hotelId;
    private String    city;
    private String    roomType;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Integer   capacity;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private int       page = 0;
    private int       size = 10;
}
