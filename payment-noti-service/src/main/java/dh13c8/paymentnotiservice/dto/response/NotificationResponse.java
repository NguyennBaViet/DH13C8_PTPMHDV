package dh13c8.paymentnotiservice.dto.response;

import dh13c8.paymentnotiservice.entity.NotificationChannel;
import dh13c8.paymentnotiservice.entity.NotificationStatus;
import dh13c8.paymentnotiservice.entity.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private Long id;
    private Long userId;
    private Long bookingId;
    private NotificationType type;
    private NotificationChannel channel;
    private String recipientEmail;
    private String subject;
    private String body;
    private NotificationStatus status;
    private LocalDateTime sentAt;
    private LocalDateTime createdAt;
}
