package dh13c8.userservice.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ReviewResponse {
    private Long   id;
    private Long   userId;
    private String username;
    private String userAvatar;
    private Long   hotelId;
    private Long   bookingId;
    private Integer rating;
    private String  title;
    private String  comment;
    private boolean isVisible;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
