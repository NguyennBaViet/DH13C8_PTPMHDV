package dh13c8.authservice.service;

import dh13c8.authservice.domain.entity.*;
import dh13c8.authservice.domain.repository.RefreshTokenRepository;
import dh13c8.authservice.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    @Transactional
    public RefreshToken createRefreshToken(User user) {
        // Thu hồi tất cả token cũ của user
        refreshTokenRepository.revokeAllByUser(user);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpirationMs / 1000))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional(readOnly = true)
    public RefreshToken verifyRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Refresh token không hợp lệ"));

        if (refreshToken.isRevoked()) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Refresh token đã bị thu hồi");
        }
        if (refreshToken.isExpired()) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Refresh token đã hết hạn, vui lòng đăng nhập lại");
        }

        return refreshToken;
    }

    @Transactional
    public void revokeAllByUser(User user) {
        refreshTokenRepository.revokeAllByUser(user);
    }
}
