package dh13c8.userservice.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(max = 100, message = "Họ tên tối đa 100 ký tự")
    private String fullName;

    @Pattern(regexp = "^(0[3|5|7|8|9])+([0-9]{8})$",
             message = "Số điện thoại không hợp lệ")
    private String phone;

    @Size(max = 500, message = "URL ảnh tối đa 500 ký tự")
    private String avatarUrl;

    @Size(max = 300, message = "Địa chỉ tối đa 300 ký tự")
    private String address;
}
