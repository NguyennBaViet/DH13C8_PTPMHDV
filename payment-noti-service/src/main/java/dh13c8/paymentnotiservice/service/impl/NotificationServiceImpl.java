package dh13c8.paymentnotiservice.service.impl;

import dh13c8.paymentnotiservice.dto.request.SendEmailRequest;
import dh13c8.paymentnotiservice.dto.response.BookingDetailDto;
import dh13c8.paymentnotiservice.dto.response.NotificationResponse;
import dh13c8.paymentnotiservice.entity.*;
import dh13c8.paymentnotiservice.exception.BusinessException;
import dh13c8.paymentnotiservice.exception.ErrorCode;
import dh13c8.paymentnotiservice.repository.NotificationRepository;
import dh13c8.paymentnotiservice.service.EmailService;
import dh13c8.paymentnotiservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepo;
    private final EmailService emailService;
    private final SpringTemplateEngine templateEngine;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final NumberFormat CURRENCY_FORMATTER = NumberFormat.getInstance(new Locale("vi", "VN"));

    @Override
    @Async
    public void sendBookingConfirmation(Payment payment, BookingDetailDto booking) {
        log.info("NotificationService sendBookingConfirmation bookingId={}", payment.getBookingId());

        String recipientEmail = (booking != null && booking.getContactEmail() != null)
                ? booking.getContactEmail()
                : "guest_" + payment.getUserId() + "@example.com";

        String contactName = (booking != null && booking.getContactName() != null)
                ? booking.getContactName()
                : "Quy khach";

        String bookingCode = (booking != null && booking.getBookingCode() != null)
                ? booking.getBookingCode()
                : "BK" + payment.getBookingId();

        String hotelName = (booking != null && booking.getHotelName() != null)
                ? booking.getHotelName()
                : "Khach san doi tac";

        String roomTypeName = (booking != null && booking.getRoomTypeName() != null)
                ? booking.getRoomTypeName()
                : "Phong tieu chuan";

        String subject = "Xac nhan dat phong thanh cong - Ma " + bookingCode;

        Context context = new Context();
        context.setVariable("contactName", contactName);
        context.setVariable("bookingCode", bookingCode);
        context.setVariable("hotelName", hotelName);
        context.setVariable("roomTypeName", roomTypeName);
        context.setVariable("transactionId", payment.getTransactionId() != null ? payment.getTransactionId() : "N/A");
        context.setVariable("paymentMethod", payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : "MOCK");
        context.setVariable("amount", CURRENCY_FORMATTER.format(payment.getAmount()));
        context.setVariable("currency", payment.getCurrency() != null ? payment.getCurrency() : "VND");
        context.setVariable("paidAt", payment.getPaidAt() != null ? payment.getPaidAt().format(DATE_FORMATTER) : LocalDateTime.now().format(DATE_FORMATTER));

        String htmlContent;
        try {
            htmlContent = templateEngine.process("email/booking-confirmation", context);
        } catch (Exception e) {
            log.error("Loi render template booking-confirmation: {}", e.getMessage());
            htmlContent = "<h3>Xac nhan dat phong thanh cong</h3>"
                    + "<p>Ma dat phong: " + bookingCode + "</p>"
                    + "<p>So tien: " + payment.getAmount() + " " + payment.getCurrency() + "</p>";
        }

        Notification notification = Notification.builder()
                .userId(payment.getUserId())
                .bookingId(payment.getBookingId())
                .type(NotificationType.PAYMENT_SUCCESS)
                .channel(NotificationChannel.EMAIL)
                .recipientEmail(recipientEmail)
                .subject(subject)
                .body(htmlContent)
                .status(NotificationStatus.PENDING)
                .build();

        notificationRepo.save(notification);

        boolean sent = emailService.sendHtmlEmail(recipientEmail, subject, htmlContent);
        if (sent) {
            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
        } else {
            notification.setStatus(NotificationStatus.FAILED);
        }
        notificationRepo.save(notification);
    }

    @Override
    @Async
    public void sendRefundNotification(Payment payment, BookingDetailDto booking, BigDecimal refundAmount, String reason) {
        log.info("NotificationService sendRefundNotification paymentId={}", payment.getId());

        String recipientEmail = (booking != null && booking.getContactEmail() != null)
                ? booking.getContactEmail()
                : "guest_" + payment.getUserId() + "@example.com";

        String contactName = (booking != null && booking.getContactName() != null)
                ? booking.getContactName()
                : "Quy khach";

        String bookingCode = (booking != null && booking.getBookingCode() != null)
                ? booking.getBookingCode()
                : "BK" + payment.getBookingId();

        String subject = "Thong bao hoan tien dat phong - Ma " + bookingCode;

        Context context = new Context();
        context.setVariable("contactName", contactName);
        context.setVariable("bookingCode", bookingCode);
        context.setVariable("transactionId", payment.getTransactionId() != null ? payment.getTransactionId() : "N/A");
        context.setVariable("amount", CURRENCY_FORMATTER.format(payment.getAmount()));
        context.setVariable("refundAmount", CURRENCY_FORMATTER.format(refundAmount != null ? refundAmount : payment.getAmount()));
        context.setVariable("refundReason", reason != null ? reason : "Huy phong theo yeu cau");
        context.setVariable("currency", payment.getCurrency() != null ? payment.getCurrency() : "VND");
        context.setVariable("refundedAt", LocalDateTime.now().format(DATE_FORMATTER));

        String htmlContent;
        try {
            htmlContent = templateEngine.process("email/refund-confirmation", context);
        } catch (Exception e) {
            log.error("Loi render template refund-confirmation: {}", e.getMessage());
            htmlContent = "<h3>Thong bao hoan tien dat phong</h3>"
                    + "<p>Ma dat phong: " + bookingCode + "</p>"
                    + "<p>So tien hoan lai: " + refundAmount + " " + payment.getCurrency() + "</p>";
        }

        Notification notification = Notification.builder()
                .userId(payment.getUserId())
                .bookingId(payment.getBookingId())
                .type(NotificationType.REFUND_PROCESSED)
                .channel(NotificationChannel.EMAIL)
                .recipientEmail(recipientEmail)
                .subject(subject)
                .body(htmlContent)
                .status(NotificationStatus.PENDING)
                .build();

        notificationRepo.save(notification);

        boolean sent = emailService.sendHtmlEmail(recipientEmail, subject, htmlContent);
        if (sent) {
            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
        } else {
            notification.setStatus(NotificationStatus.FAILED);
        }
        notificationRepo.save(notification);
    }

    @Override
    public NotificationResponse sendCustomEmail(SendEmailRequest request) {
        Notification notification = Notification.builder()
                .userId(request.getUserId() != null ? request.getUserId() : 0L)
                .bookingId(request.getBookingId())
                .type(NotificationType.BOOKING_CONFIRMED)
                .channel(NotificationChannel.EMAIL)
                .recipientEmail(request.getRecipientEmail())
                .subject(request.getSubject())
                .body(request.getBody())
                .status(NotificationStatus.PENDING)
                .build();

        notificationRepo.save(notification);

        boolean sent = emailService.sendHtmlEmail(request.getRecipientEmail(), request.getSubject(), request.getBody());
        if (sent) {
            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
        } else {
            notification.setStatus(NotificationStatus.FAILED);
        }
        notificationRepo.save(notification);

        return toResponse(notification);
    }

    @Override
    public Page<NotificationResponse> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepo.findByUserId(userId, pageable).map(this::toResponse);
    }

    @Override
    public NotificationResponse getNotificationById(Long id, Long userId, String role) {
        Notification n = notificationRepo.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTIFICATION_NOT_FOUND));

        if (!"ADMIN".equals(role) && !"STAFF".equals(role) && !n.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        return toResponse(n);
    }

    @Override
    public NotificationResponse resendNotification(Long id) {
        Notification n = notificationRepo.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTIFICATION_NOT_FOUND));

        boolean sent = emailService.sendHtmlEmail(n.getRecipientEmail(), n.getSubject(), n.getBody());
        if (sent) {
            n.setStatus(NotificationStatus.SENT);
            n.setSentAt(LocalDateTime.now());
        } else {
            n.setStatus(NotificationStatus.FAILED);
        }
        notificationRepo.save(n);
        return toResponse(n);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .userId(n.getUserId())
                .bookingId(n.getBookingId())
                .type(n.getType())
                .channel(n.getChannel())
                .recipientEmail(n.getRecipientEmail())
                .subject(n.getSubject())
                .body(n.getBody())
                .status(n.getStatus())
                .sentAt(n.getSentAt())
                .createdAt(n.getCreatedAt())
                .build();
    }
}