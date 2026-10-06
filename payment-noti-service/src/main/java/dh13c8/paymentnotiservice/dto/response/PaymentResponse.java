package dh13c8.paymentnotiservice.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentResponse {
    private Long paymentId;
    private Long bookingId;
    private Long userId;
    private BigDecimal amount;
    private String currency;
    private String paymentMethod;
    private String status;
    private String transactionId;
    private String checkoutUrl;
    private String clientSecret;
    private BigDecimal refundAmount;
    private String refundReason;
    private LocalDateTime refundedAt;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
    private String message;
}
