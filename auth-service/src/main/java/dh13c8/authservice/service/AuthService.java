package dh13c8.authservice.service;

import dh13c8.authservice.domain.entity.*;
import dh13c8.authservice.domain.repository.UserRepository;
import dh13c8.authservice.dto.*;
import dh13c8.authservice.exception.AppException;
import dh13c8.authservice.security.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository      userRepository;
    private final PasswordEncoder     passwordEncoder;
    private final JwtTokenProvider    jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final AuthenticationManager authenticationManager;

    @Value("${app.jwt.access-token-expiration-ms}")
    private long accessTokenExpirationMs;

    // ── Đăng ký ──────────────────────────────────────────────────────────────
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(HttpStatus.CONFLICT, "Username '" + request.getUsername() + "' đã tồn tại");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(HttpStatus.CONFLICT, "Email '" + request.getEmail() + "' đã được sử dụng");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(User.Role.GUEST)
                .isActive(true)
                .build();

        user = userRepository.save(user);
        log.info("Đăng ký thành công: {}", user.getUsername());

        return buildAuthResponse(user);
    }

    // ── Đăng nhập ────────────────────────────────────────────────────────────
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsernameOrEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByUsername(authentication.getName())
                .or(() -> userRepository.findByEmail(request.getUsernameOrEmail()))
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Không tìm thấy tài khoản"));

        if (!user.isActive()) {
            throw new AppException(HttpStatus.FORBIDDEN, "Tài khoản đã bị khóa");
        }

        log.info("Đăng nhập thành công: {}", user.getUsername());
        return buildAuthResponse(user);
    }

    // ── Refresh token ─────────────────────────────────────────────────────────
    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken oldToken = refreshTokenService.verifyRefreshToken(request.getRefreshToken());
        User user = oldToken.getUser();

        // Phát hành token mới, thu hồi cũ
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user);
        String newAccessToken = jwtTokenProvider.generateAccessToken(user);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(accessTokenExpirationMs / 1000)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    // ── Đăng xuất ─────────────────────────────────────────────────────────────
    @Transactional
    public void logout(String usernameOrEmail) {
        userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail))
                .ifPresent(refreshTokenService::revokeAllByUser);
        log.info("Đăng xuất: {}", usernameOrEmail);
    }

    // ── Validate token (dùng bởi API Gateway / services khác) ─────────────────
    public ValidateTokenResponse validateToken(String token) {
        if (!jwtTokenProvider.validateToken(token)) {
            return ValidateTokenResponse.builder().valid(false).build();
        }
        Claims claims = jwtTokenProvider.getClaimsFromToken(token);
        return ValidateTokenResponse.builder()
                .valid(true)
                .userId(Long.parseLong(claims.getSubject()))
                .username(claims.get("username", String.class))
                .email(claims.get("email", String.class))
                .role(claims.get("role", String.class))
                .build();
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    private AuthResponse buildAuthResponse(User user) {
        String      accessToken  = jwtTokenProvider.generateAccessToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(accessTokenExpirationMs / 1000)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }
}
