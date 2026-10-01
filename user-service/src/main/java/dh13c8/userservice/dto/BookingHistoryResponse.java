package dh13c8.userservice.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BookingHistoryResponse {
    private Long        id;
    private String      bookingCode;
    private Long        roomId;
    private Long        hotelId;
    private LocalDate   checkInDate;
    private LocalDate   checkOutDate;
    private Integer     numGuests;
    private Integer     totalNights;
    private BigDecimal  roomPrice;
    private BigDecimal  discountAmount;
    private BigDecimal  totalAmount;
    private String      status;
    private String      specialRequests;
    private LocalDateTime createdAt;
}
