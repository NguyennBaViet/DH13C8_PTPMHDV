package dh13c8.authservice.controller;

import dh13c8.authservice.domain.entity.User;
import dh13c8.authservice.domain.repository.UserRepository;
import dh13c8.authservice.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /** Lấy danh sách tất cả users */
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(this::toMap)
                .toList();
        return ResponseEntity.ok(users);
    }

    /** Khoá / Mở khoá tài khoản */
    @PatchMapping("/users/{id}/toggle-active")
    public ResponseEntity<Map<String, Object>> toggleActive(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy user id=" + id));
        user.setActive(!user.isActive());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of(
                "userId",   user.getId(),
                "username", user.getUsername(),
                "isActive", user.isActive(),
                "message",  user.isActive() ? "Tài khoản đã được mở khoá" : "Tài khoản đã bị khoá"
        ));
    }

    /** Thay đổi role */
    @PatchMapping("/users/{id}/role")
    public ResponseEntity<Map<String, Object>> changeRole(
            @PathVariable Long id,
            @RequestParam String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy user id=" + id));
        try {
            user.setRole(User.Role.valueOf(role.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Role không hợp lệ: " + role);
        }
        userRepository.save(user);
        return ResponseEntity.ok(Map.of(
                "userId",   user.getId(),
                "username", user.getUsername(),
                "role",     user.getRole().name(),
                "message",  "Cập nhật role thành công"
        ));
    }

    private Map<String, Object> toMap(User u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",        u.getId());
        m.put("username",  u.getUsername());
        m.put("email",     u.getEmail());
        m.put("fullName",  u.getFullName());
        m.put("phone",     u.getPhone());
        m.put("role",      u.getRole());
        m.put("isActive",  u.isActive());
        m.put("createdAt", u.getCreatedAt());
        return m;
    }
}
