package dh13c8.userservice.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserProfileResponse {
    private Long   id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private String address;
    private String role;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
