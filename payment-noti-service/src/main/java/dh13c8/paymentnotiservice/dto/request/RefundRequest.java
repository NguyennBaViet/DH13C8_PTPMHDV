package dh13c8.paymentnotiservice.dto.request;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundRequest {

    private BigDecimal amount;

    private String reason;
}
