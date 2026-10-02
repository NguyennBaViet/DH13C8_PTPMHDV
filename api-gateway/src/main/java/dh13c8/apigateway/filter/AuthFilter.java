package dh13c8.apigateway.filter;

import dh13c8.apigateway.security.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Filter xác thực JWT tại API Gateway.
 * Được gắn vào các route yêu cầu đăng nhập (user-service, booking, payment).
 * Route public (hotels, auth) không dùng filter này.
 */
@Slf4j
@Component
public class AuthFilter extends AbstractGatewayFilterFactory<AuthFilter.Config> {

    private final JwtTokenProvider jwtTokenProvider;

    // Các path không cần token dù đi qua route có filter
    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/auth",
            "/api/reviews/hotel",
            "/api/hotels",
            "/api/rooms",
            "/api/amenities"
    );

    public AuthFilter(JwtTokenProvider jwtTokenProvider) {
        super(Config.class);
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getURI().getPath();

            // Bỏ qua nếu là public path
            boolean isPublic = PUBLIC_PATHS.stream().anyMatch(path::startsWith);
            if (isPublic) return chain.filter(exchange);

            // Lấy token từ header Authorization
            String token = extractToken(exchange);
            if (!StringUtils.hasText(token)) {
                return unauthorized(exchange, "Vui lòng đăng nhập để tiếp tục");
            }

            if (!jwtTokenProvider.validateToken(token)) {
                return unauthorized(exchange, "Token không hợp lệ hoặc đã hết hạn");
            }

            // Forward thêm thông tin user vào header để service downstream dùng
            String userId   = jwtTokenProvider.getUserId(token);
            String username = jwtTokenProvider.getUsername(token);
            String role     = jwtTokenProvider.getRole(token);

            ServerWebExchange mutatedExchange = exchange.mutate()
                    .request(r -> r
                        .header("X-User-Id",   userId)
                        .header("X-Username",  username)
                        .header("X-User-Role", role)
                    )
                    .build();

            log.debug("Gateway auth OK – userId={} role={} path={}", userId, role, path);
            return chain.filter(mutatedExchange);
        };
    }

    private String extractToken(ServerWebExchange exchange) {
        String header = exchange.getRequest()
                .getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        log.warn("Gateway 401: {} – path={}", message,
                exchange.getRequest().getURI().getPath());
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().add("Content-Type", "application/json");
        var body = String.format(
            "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"%s\"}", message);
        var buffer = exchange.getResponse().bufferFactory()
                .wrap(body.getBytes());
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    public static class Config {
        // Config class trống – không cần tham số
    }
}
