package dh13c8.authservice.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ValidateTokenResponse {
    private boolean valid;
    private Long    userId;
    private String  username;
    private String  email;
    private String  role;
}
