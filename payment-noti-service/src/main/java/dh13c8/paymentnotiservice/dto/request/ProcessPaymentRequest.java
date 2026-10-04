package dh13c8.paymentnotiservice.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessPaymentRequest {

    @NotNull(message = "paymentId không được để trống")
    private Long paymentId;

    @Builder.Default
    private boolean simulateSuccess = true;

    private String paymentMethod;

    private String stripePaymentIntentId;
}
