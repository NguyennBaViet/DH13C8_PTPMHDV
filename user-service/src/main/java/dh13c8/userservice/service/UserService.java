package dh13c8.userservice.service;

import dh13c8.userservice.domain.entity.User;
import dh13c8.userservice.domain.repository.UserRepository;
import dh13c8.userservice.dto.*;
import dh13c8.userservice.exception.AppException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    // Dùng BCrypt riêng – user-service không inject AuthenticationManager
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

    // ── Lấy profile ───────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = findUser(userId);
        return toProfileResponse(user);
    }

    // ── Cập nhật profile ──────────────────────────────────────────────────────
    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest req) {
        User user = findUser(userId);

        if (req.getFullName()  != null) user.setFullName(req.getFullName());
        if (req.getPhone()     != null) user.setPhone(req.getPhone());
        if (req.getAvatarUrl() != null) user.setAvatarUrl(req.getAvatarUrl());
        if (req.getAddress()   != null) user.setAddress(req.getAddress());

        user = userRepository.save(user);
        log.info("Cập nhật profile user id={}", userId);
        return toProfileResponse(user);
    }

    // ── Đổi mật khẩu ─────────────────────────────────────────────────────────
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest req) {
        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Mật khẩu xác nhận không khớp");
        }

        User user = findUser(userId);

        if (!passwordEncoder.matches(req.getOldPassword(), user.getPassword())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Mật khẩu cũ không đúng");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        log.info("Đổi mật khẩu user id={}", userId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy người dùng id=" + userId));
    }

    private UserProfileResponse toProfileResponse(User u) {
        return UserProfileResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .fullName(u.getFullName())
                .phone(u.getPhone())
                .avatarUrl(u.getAvatarUrl())
                .address(u.getAddress())
                .role(u.getRole().name())
                .isActive(u.isActive())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }
}
