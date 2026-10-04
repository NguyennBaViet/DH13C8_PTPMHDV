package dh13c8.paymentnotiservice.service;

import dh13c8.paymentnotiservice.dto.request.SendEmailRequest;
import dh13c8.paymentnotiservice.dto.response.BookingDetailDto;
import dh13c8.paymentnotiservice.dto.response.NotificationResponse;
import dh13c8.paymentnotiservice.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

public interface NotificationService {

    void sendBookingConfirmation(Payment payment, BookingDetailDto booking);

    void sendRefundNotification(Payment payment, BookingDetailDto booking, BigDecimal refundAmount, String reason);

    NotificationResponse sendCustomEmail(SendEmailRequest request);

    Page<NotificationResponse> getUserNotifications(Long userId, Pageable pageable);

    NotificationResponse getNotificationById(Long id, Long userId, String role);

    NotificationResponse resendNotification(Long id);
}
