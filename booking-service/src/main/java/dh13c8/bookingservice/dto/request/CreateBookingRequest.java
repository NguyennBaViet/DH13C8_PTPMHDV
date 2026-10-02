package dh13c8.bookingservice.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateBookingRequest {

    @NotNull(message = "hotelId không được để trống")
    private Long hotelId;

    @NotNull(message = "roomTypeId không được để trống")
    private Long roomTypeId;

    @NotNull(message = "checkIn không được để trống")
    @FutureOrPresent(message = "Ngày check-in không hợp lệ")
    private LocalDate checkIn;

    @NotNull(message = "checkOut không được để trống")
    @Future(message = "Ngày check-out phải ở tương lai")
    private LocalDate checkOut;

    @NotNull @Min(value = 1, message = "Số phòng tối thiểu 1")
    @Max(value = 10, message = "Số phòng tối đa 10")
    private Integer rooms;

    @NotNull @Min(value = 1, message = "Số khách tối thiểu 1")
    @Max(value = 30, message = "Số khách tối đa 30")
    private Integer guests;

    @Size(max = 1000, message = "Yêu cầu đặc biệt tối đa 1000 ký tự")
    private String specialRequests;

    @NotBlank(message = "Tên liên hệ không được để trống")
    private String contactName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String contactEmail;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0|\\+84)\\d{9,10}$", message = "SĐT không hợp lệ")
    private String contactPhone;
}