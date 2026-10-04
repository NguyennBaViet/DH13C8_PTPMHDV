package dh13c8.paymentnotiservice.service;

import dh13c8.paymentnotiservice.dto.response.BookingDetailDto;
import dh13c8.paymentnotiservice.entity.*;
import dh13c8.paymentnotiservice.repository.NotificationRepository;
import dh13c8.paymentnotiservice.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepo;

    @Mock
    private EmailService emailService;

    @Mock
    private SpringTemplateEngine templateEngine;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private Payment payment;
    private BookingDetailDto booking;

    @BeforeEach
    void setUp() {
        payment = Payment.builder()
                .id(1L)
                .bookingId(100L)
                .userId(5L)
                .amount(BigDecimal.valueOf(2000000))
                .currency("VND")
                .paymentMethod(PaymentMethod.MOCK)
                .transactionId("TXN_123456")
                .paidAt(LocalDateTime.now())
                .status(PaymentStatus.SUCCESS)
                .build();

        booking = BookingDetailDto.builder()
                .id(100L)
                .bookingCode("BK_TEST_001")
                .hotelName("Vinpearl Resort Nha Trang")
                .roomTypeName("Ocean View Suite")
                .contactName("Tran Van B")
                .contactEmail("tranvanb@gmail.com")
                .contactPhone("0912345678")
                .totalPrice(BigDecimal.valueOf(2000000))
                .build();
    }

    @Test
    @DisplayName("1. Gui email xac nhan dat phong sau khi thanh toan thanh cong")
    void testSendBookingConfirmationSuccess() {
        when(templateEngine.process(eq("email/booking-confirmation"), any(Context.class)))
                .thenReturn("<html><body>Mock Email Content</body></html>");
        when(emailService.sendHtmlEmail(eq("tranvanb@gmail.com"), anyString(), anyString()))
                .thenReturn(true);

        notificationService.sendBookingConfirmation(payment, booking);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepo, atLeastOnce()).save(captor.capture());

        Notification saved = captor.getValue();
        assertEquals("tranvanb@gmail.com", saved.getRecipientEmail());
        assertEquals(NotificationType.PAYMENT_SUCCESS, saved.getType());
        assertEquals(NotificationStatus.SENT, saved.getStatus());
        assertNotNull(saved.getSentAt());
    }

    @Test
    @DisplayName("2. Gui email thong bao hoan tien khi huy phong")
    void testSendRefundNotificationSuccess() {
        when(templateEngine.process(eq("email/refund-confirmation"), any(Context.class)))
                .thenReturn("<html><body>Mock Refund Email Content</body></html>");
        when(emailService.sendHtmlEmail(eq("tranvanb@gmail.com"), anyString(), anyString()))
                .thenReturn(true);

        notificationService.sendRefundNotification(payment, booking, BigDecimal.valueOf(1000000), "Khach yeu cau huy som");

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepo, atLeastOnce()).save(captor.capture());

        Notification saved = captor.getValue();
        assertEquals("tranvanb@gmail.com", saved.getRecipientEmail());
        assertEquals(NotificationType.REFUND_PROCESSED, saved.getType());
        assertEquals(NotificationStatus.SENT, saved.getStatus());
    }
}
