package dh13c8.hotelroomservice.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Set;

@Data
public class RoomRequest {

    @NotNull(message = "Hotel ID không được để trống")
    private Long hotelId;

    @NotBlank(message = "Số phòng không được để trống")
    @Size(max = 20)
    private String roomNumber;

    @NotNull(message = "Loại phòng không được để trống")
    private String roomType;  // SINGLE, DOUBLE, TWIN, SUITE, DELUXE, FAMILY

    private String description;
    private Integer floor;

    @Min(value = 1, message = "Sức chứa tối thiểu 1 người")
    @Max(value = 10)
    private Integer capacity = 2;

    @NotNull(message = "Giá phòng không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá phòng phải lớn hơn 0")
    private BigDecimal pricePerNight;

    private String image;  // Base64 hoặc URL

    private Set<Long> amenityIds;
}
