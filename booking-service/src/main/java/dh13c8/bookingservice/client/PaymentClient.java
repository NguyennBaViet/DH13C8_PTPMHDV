package dh13c8.bookingservice.client;

import dh13c8.bookingservice.dto.response.PaymentResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.Map;

@Component
@Slf4j
public class PaymentClient {

    private final RestClient restClient;

    public PaymentClient(@Qualifier("paymentRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    /** Tạo payment (mock hoặc Stripe sandbox) */
    public PaymentResponse createPayment(Map<String, Object> request) {
        log.debug("→ Tạo payment: {}", request);
        try {
            return restClient.post()
                    .uri("/api/payments/internal/create")
                    .body(request)
                    .retrieve()
                    .body(PaymentResponse.class);
        } catch (Exception e) {
            log.error("❌ Lỗi tạo payment: {}", e.getMessage());
            throw new RuntimeException("Không tạo được payment: " + e.getMessage());
        }
    }

    /** Hoàn tiền */
    public PaymentResponse refund(Long paymentId, BigDecimal amount) {
        log.debug("→ Refund paymentId={}, amount={}", paymentId, amount);
        try {
            return restClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/payments/internal/{paymentId}/refund")
                            .queryParam("amount", amount)
                            .build(paymentId))
                    .retrieve()
                    .body(PaymentResponse.class);
        } catch (Exception e) {
            log.error("❌ Lỗi refund: {}", e.getMessage());
            throw new RuntimeException("Không hoàn tiền được: " + e.getMessage());
        }
    }
}