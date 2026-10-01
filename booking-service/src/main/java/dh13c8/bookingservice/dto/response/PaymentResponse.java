package dh13c8.bookingservice.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentResponse {
    private Long paymentId;
    private String status;
    private BigDecimal amount;
    private String transactionId;
    private String message;
}