package dh13c8.paymentnotiservice.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePaymentRequest {

    @NotNull(message = "bookingId không được để trống")
    private Long bookingId;

    private BigDecimal amount;

    @Builder.Default
    private String currency = "VND";

    @Builder.Default
    private String paymentMethod = "MOCK";

    private String successUrl;

    private String cancelUrl;
}
