package dh13c8.paymentnotiservice.service;

import dh13c8.paymentnotiservice.client.BookingClient;
import dh13c8.paymentnotiservice.dto.request.CreatePaymentRequest;
import dh13c8.paymentnotiservice.dto.request.ProcessPaymentRequest;
import dh13c8.paymentnotiservice.dto.request.RefundRequest;
import dh13c8.paymentnotiservice.dto.response.BookingDetailDto;
import dh13c8.paymentnotiservice.dto.response.PaymentResponse;
import dh13c8.paymentnotiservice.entity.Payment;
import dh13c8.paymentnotiservice.entity.PaymentMethod;
import dh13c8.paymentnotiservice.entity.PaymentStatus;
import dh13c8.paymentnotiservice.repository.PaymentRepository;
import dh13c8.paymentnotiservice.service.impl.PaymentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepo;

    @Mock
    private BookingClient bookingClient;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private Payment mockPayment;
    private BookingDetailDto mockBooking;

    @BeforeEach
    void setUp() {
        mockPayment = Payment.builder()
                .id(1L)
                .bookingId(100L)
                .userId(10L)
                .amount(BigDecimal.valueOf(1500000))
                .currency("VND")
                .paymentMethod(PaymentMethod.MOCK)
                .status(PaymentStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        mockBooking = BookingDetailDto.builder()
                .id(100L)
                .bookingCode("BK123456")
                .userId(10L)
                .hotelName("Khach San Mau Sai Gon")
                .roomTypeName("Deluxe King Room")
                .contactName("Nguyen Van A")
                .contactEmail("nguyenvana@gmail.com")
                .contactPhone("0901234567")
                .totalPrice(BigDecimal.valueOf(1500000))
                .status("PENDING")
                .build();
    }

    @Test
    @DisplayName("1. Tao payment thanh cong voi trang thai PENDING")
    void testCreatePayment() {
        when(paymentRepo.existsByBookingIdAndStatus(100L, PaymentStatus.SUCCESS)).thenReturn(false);
        when(paymentRepo.save(any(Payment.class))).thenAnswer(i -> {
            Payment p = i.getArgument(0);
            p.setId(1L);
            return p;
        });

        CreatePaymentRequest req = CreatePaymentRequest.builder()
                .bookingId(100L)
                .amount(BigDecimal.valueOf(1500000))
                .paymentMethod("MOCK")
                .build();

        PaymentResponse response = paymentService.createPayment(10L, req);

        assertNotNull(response);
        assertEquals("PENDING", response.getStatus());
        assertEquals(BigDecimal.valueOf(1500000), response.getAmount());
        verify(paymentRepo, times(1)).save(any(Payment.class));
    }

    @Test
    @DisplayName("2. Xu ly thanh toan Mock thanh cong -> tu dong confirm booking va kich hoat gui email")
    void testProcessMockPaymentSuccess() {
        when(paymentRepo.findById(1L)).thenReturn(Optional.of(mockPayment));
        when(paymentRepo.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));
        when(bookingClient.confirmPayment(eq(100L), eq(1L))).thenReturn(true);
        when(bookingClient.getBooking(100L)).thenReturn(mockBooking);

        ProcessPaymentRequest req = ProcessPaymentRequest.builder()
                .paymentId(1L)
                .simulateSuccess(true)
                .build();

        PaymentResponse response = paymentService.processMockPayment(req, 10L);

        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());
        assertNotNull(response.getTransactionId());
        assertTrue(response.getTransactionId().startsWith("TXN_MOCK_"));

        verify(bookingClient, times(1)).confirmPayment(100L, 1L);
        verify(notificationService, times(1)).sendBookingConfirmation(any(Payment.class), any(BookingDetailDto.class));
    }

    @Test
    @DisplayName("3. Hoan tien khi huy phong thanh cong -> chuyen REFUNDED va kich hoat gui email")
    void testRefundSuccess() {
        mockPayment.setStatus(PaymentStatus.SUCCESS);
        mockPayment.setTransactionId("TXN_MOCK_TEST_123");
        when(paymentRepo.findById(1L)).thenReturn(Optional.of(mockPayment));
        when(paymentRepo.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));
        when(bookingClient.getBooking(100L)).thenReturn(mockBooking);

        RefundRequest req = RefundRequest.builder()
                .amount(BigDecimal.valueOf(1500000))
                .reason("Khach doi lich cong tac")
                .build();

        PaymentResponse response = paymentService.refund(1L, req, 10L, "GUEST");

        assertNotNull(response);
        assertEquals("REFUNDED", response.getStatus());
        assertEquals(BigDecimal.valueOf(1500000), response.getRefundAmount());
        assertEquals("Khach doi lich cong tac", response.getRefundReason());

        verify(notificationService, times(1)).sendRefundNotification(eq(mockPayment), eq(mockBooking), eq(BigDecimal.valueOf(1500000)), eq("Khach doi lich cong tac"));
    }

    @Test
    @DisplayName("4. Hoan tien noi bo tu BookingService khi huy phong")
    void testRefundInternalFromBookingService() {
        mockPayment.setStatus(PaymentStatus.SUCCESS);
        when(paymentRepo.findById(1L)).thenReturn(Optional.of(mockPayment));
        when(paymentRepo.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));
        when(bookingClient.getBooking(100L)).thenReturn(mockBooking);

        PaymentResponse response = paymentService.refundInternal(1L, BigDecimal.valueOf(750000), "Huy sat gio hoan 50%");

        assertNotNull(response);
        assertEquals("REFUNDED", response.getStatus());
        assertEquals(BigDecimal.valueOf(750000), response.getRefundAmount());

        verify(notificationService, times(1)).sendRefundNotification(eq(mockPayment), eq(mockBooking), eq(BigDecimal.valueOf(750000)), eq("Huy sat gio hoan 50%"));
    }
}
