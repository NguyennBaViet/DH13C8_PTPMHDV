package dh13c8.bookingservice.dto.response;

import dh13c8.bookingservice.entity.BookingStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BookingResponse {
    private Long id;
    private String bookingCode;
    private Long userId;
    private Long hotelId;
    private String hotelName;
    private Long roomTypeId;
    private String roomTypeName;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Integer nights;
    private Integer rooms;
    private Integer guests;
    private BigDecimal pricePerNight;
    private BigDecimal subTotal;
    private BigDecimal taxAmount;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private String specialRequests;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private LocalDateTime lockExpiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}