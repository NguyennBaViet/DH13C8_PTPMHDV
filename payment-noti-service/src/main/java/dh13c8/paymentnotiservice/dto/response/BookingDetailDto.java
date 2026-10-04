package dh13c8.paymentnotiservice.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class BookingDetailDto {
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
    private String status;
    private String specialRequests;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
}
