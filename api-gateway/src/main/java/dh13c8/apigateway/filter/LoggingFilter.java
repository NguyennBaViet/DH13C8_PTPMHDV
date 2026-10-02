package dh13c8.apigateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Instant;

/**
 * Global filter: log mọi request đi qua gateway với thời gian xử lý.
 */
@Slf4j
@Component
public class LoggingFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest req  = exchange.getRequest();
        long              start = Instant.now().toEpochMilli();

        log.info("→ {} {} [{}]",
                req.getMethod(),
                req.getURI().getPath(),
                req.getHeaders().getFirst("X-Forwarded-For") != null
                        ? req.getHeaders().getFirst("X-Forwarded-For")
                        : req.getRemoteAddress()
        );

        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            long duration = Instant.now().toEpochMilli() - start;
            log.info("← {} {} {}ms",
                    exchange.getResponse().getStatusCode(),
                    req.getURI().getPath(),
                    duration);
        }));
    }

    @Override
    public int getOrder() {
        return -1; // chạy trước tất cả filter khác
    }
}
