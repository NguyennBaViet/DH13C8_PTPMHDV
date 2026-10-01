package dh13c8.userservice.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateReviewRequest {

    @NotNull(message = "Booking ID không được để trống")
    private Long bookingId;

    @NotNull(message = "Hotel ID không được để trống")
    private Long hotelId;

    @NotNull(message = "Điểm đánh giá không được để trống")
    @Min(value = 1, message = "Điểm đánh giá tối thiểu là 1")
    @Max(value = 5, message = "Điểm đánh giá tối đa là 5")
    private Integer rating;

    @Size(max = 200, message = "Tiêu đề tối đa 200 ký tự")
    private String title;

    @Size(max = 2000, message = "Nội dung đánh giá tối đa 2000 ký tự")
    private String comment;
}
