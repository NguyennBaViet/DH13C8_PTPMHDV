package dh13c8.paymentnotiservice.controller;

import dh13c8.paymentnotiservice.dto.ApiResponse;
import dh13c8.paymentnotiservice.dto.request.SendEmailRequest;
import dh13c8.paymentnotiservice.dto.response.NotificationResponse;
import dh13c8.paymentnotiservice.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getMyNotifications(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("? GET /api/notifications/me - userId={}", userId);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<NotificationResponse> result = notificationService.getUserNotifications(userId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NotificationResponse>> getNotificationById(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "GUEST") String role) {

        NotificationResponse response = notificationService.getNotificationById(id, userId, role);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/send-email")
    public ResponseEntity<ApiResponse<NotificationResponse>> sendEmail(
            @Valid @RequestBody SendEmailRequest req) {

        log.info("? POST /api/notifications/send-email to: {}", req.getRecipientEmail());
        NotificationResponse response = notificationService.sendCustomEmail(req);
        return ResponseEntity.ok(ApiResponse.ok("Gui thong bao thanh cong", response));
    }

    @PostMapping("/resend/{id}")
    public ResponseEntity<ApiResponse<NotificationResponse>> resendNotification(@PathVariable Long id) {
        log.info("? POST /api/notifications/resend/{}", id);
        NotificationResponse response = notificationService.resendNotification(id);
        return ResponseEntity.ok(ApiResponse.ok("Thuc hien gui lai thong bao thanh cong", response));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.ok("Notification Service is running"));
    }
}
