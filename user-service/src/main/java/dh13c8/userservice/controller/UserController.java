package dh13c8.userservice.controller;

import dh13c8.userservice.dto.*;
import dh13c8.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * GET /api/users/me  – lấy profile của chính mình
     */
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(Principal principal) {
        Long userId = extractUserId(principal);
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    /**
     * PUT /api/users/me  – cập nhật profile
     */
    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest req,
            Principal principal) {
        Long userId = extractUserId(principal);
        return ResponseEntity.ok(userService.updateProfile(userId, req));
    }

    /**
     * PATCH /api/users/me/password  – đổi mật khẩu
     */
    @PatchMapping("/me/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest req,
            Principal principal) {
        Long userId = extractUserId(principal);
        userService.changePassword(userId, req);
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }

    /**
     * GET /api/users/{id}  – admin xem profile bất kỳ user
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getProfile(id));
    }

    // Credentials object chứa userId trong password field (set bởi JwtAuthFilter)
    private Long extractUserId(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            return (Long) auth.getCredentials();
        }
        throw new IllegalStateException("Không thể xác định userId từ token");
    }
}
