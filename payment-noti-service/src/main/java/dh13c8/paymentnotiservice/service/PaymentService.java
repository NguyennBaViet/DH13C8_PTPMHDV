package dh13c8.paymentnotiservice.service;

import dh13c8.paymentnotiservice.dto.request.CreatePaymentRequest;
import dh13c8.paymentnotiservice.dto.request.ProcessPaymentRequest;
import dh13c8.paymentnotiservice.dto.request.RefundRequest;
import dh13c8.paymentnotiservice.dto.response.PaymentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Map;

public interface PaymentService {

    PaymentResponse createPayment(Long userId, CreatePaymentRequest req);

    PaymentResponse processMockPayment(ProcessPaymentRequest req, Long userId);

    PaymentResponse createStripePayment(Long userId, CreatePaymentRequest req);

    PaymentResponse confirmStripePayment(String paymentIntentId);

    PaymentResponse refund(Long paymentId, RefundRequest req, Long userId, String role);

    PaymentResponse refundInternal(Long paymentId, BigDecimal amount, String reason);

    PaymentResponse createPaymentInternal(Map<String, Object> req);

    PaymentResponse getPaymentById(Long id, Long userId, String role);

    PaymentResponse getPaymentByBookingId(Long bookingId, Long userId, String role);

    Page<PaymentResponse> getMyPayments(Long userId, Pageable pageable);

    Page<PaymentResponse> getAllPayments(Pageable pageable);
}
