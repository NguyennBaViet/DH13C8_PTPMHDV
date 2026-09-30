package dh13c8.authservice.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private Long   expiresIn;     // giây
    private Long   userId;
    private String username;
    private String email;
    private String fullName;
    private String role;
}
