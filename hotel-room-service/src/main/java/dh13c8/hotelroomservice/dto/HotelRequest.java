package dh13c8.hotelroomservice.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.Set;

@Data
public class HotelRequest {

    @NotBlank(message = "Tên khách sạn không được để trống")
    @Size(max = 200)
    private String name;

    private String description;

    @NotBlank(message = "Địa chỉ không được để trống")
    @Size(max = 500)
    private String address;

    @NotBlank(message = "Thành phố không được để trống")
    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String district;

    @Size(max = 100)
    private String country;

    @Min(1) @Max(5)
    private Integer starRating;

    @Pattern(regexp = "^[0-9+\\-\\s()]{7,20}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @Email
    private String email;

    private String website;
    private String coverImage;

    private Set<Long> amenityIds;
}
