package dh13c8.apigateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory rate limiter – 60 request/phút mỗi IP.
 * Không cần Redis, phù hợp cho môi trường dev/học.
 */
@Slf4j
@Component
public class RateLimitFilter implements GlobalFilter, Ordered {

    private static final int    MAX_REQUESTS_PER_MINUTE = 60;
    private static final long   WINDOW_MS               = 60_000L;

    // IP -> [count, windowStart]
    private final Map<String, long[]> counters = new ConcurrentHashMap<>();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String ip = getClientIp(exchange);
        long   now = Instant.now().toEpochMilli();

        counters.compute(ip, (k, v) -> {
            if (v == null || (now - v[1]) > WINDOW_MS) {
                return new long[]{1, now};       // window mới
            }
            v[0]++;                               // tăng counter
            return v;
        });

        long[] entry = counters.get(ip);
        if (entry[0] > MAX_REQUESTS_PER_MINUTE) {
            log.warn("Rate limit exceeded – IP={} count={}", ip, entry[0]);
            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            exchange.getResponse().getHeaders().add("Retry-After", "60");
            exchange.getResponse().getHeaders().add("Content-Type", "application/json");
            var body = "{\"status\":429,\"error\":\"Too Many Requests\","
                     + "\"message\":\"Quá nhiều yêu cầu, vui lòng thử lại sau 1 phút\"}";
            var buffer = exchange.getResponse().bufferFactory()
                    .wrap(body.getBytes());
            return exchange.getResponse().writeWith(Mono.just(buffer));
        }

        return chain.filter(exchange);
    }

    private String getClientIp(ServerWebExchange exchange) {
        String forwarded = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        var addr = exchange.getRequest().getRemoteAddress();
        return addr != null ? addr.getAddress().getHostAddress() : "unknown";
    }

    @Override
    public int getOrder() {
        return -2; // chạy trước LoggingFilter
    }
}
