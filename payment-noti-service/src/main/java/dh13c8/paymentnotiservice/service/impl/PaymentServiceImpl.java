package dh13c8.paymentnotiservice.service.impl;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import dh13c8.paymentnotiservice.client.BookingClient;
import dh13c8.paymentnotiservice.dto.request.CreatePaymentRequest;
import dh13c8.paymentnotiservice.dto.request.ProcessPaymentRequest;
import dh13c8.paymentnotiservice.dto.request.RefundRequest;
import dh13c8.paymentnotiservice.dto.response.BookingDetailDto;
import dh13c8.paymentnotiservice.dto.response.PaymentResponse;
import dh13c8.paymentnotiservice.entity.Payment;
import dh13c8.paymentnotiservice.entity.PaymentMethod;
import dh13c8.paymentnotiservice.entity.PaymentStatus;
import dh13c8.paymentnotiservice.exception.BusinessException;
import dh13c8.paymentnotiservice.exception.ErrorCode;
import dh13c8.paymentnotiservice.repository.PaymentRepository;
import dh13c8.paymentnotiservice.service.NotificationService;
import dh13c8.paymentnotiservice.service.PaymentService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepo;
    private final BookingClient bookingClient;
    private final NotificationService notificationService;

    @Value("${stripe.api-key:sk_test_placeholder}")
    private String stripeApiKey;

    @Value("${stripe.currency:vnd}")
    private String stripeCurrency;

    @PostConstruct
    public void initStripe() {
        if (stripeApiKey != null && !stripeApiKey.isBlank()) {
            Stripe.apiKey = stripeApiKey;
            log.info("? Stripe SDK initialized.");
        }
    }

    @Override
    @Transactional
    public PaymentResponse createPayment(Long userId, CreatePaymentRequest req) {
        log.info("? T?o payment: userId={}, bookingId={}", userId, req.getBookingId());

        if (paymentRepo.existsByBookingIdAndStatus(req.getBookingId(), PaymentStatus.SUCCESS)) {
            throw new BusinessException(ErrorCode.PAYMENT_ALREADY_SUCCESS);
        }

        BigDecimal amount = req.getAmount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            BookingDetailDto booking = bookingClient.getBooking(req.getBookingId());
            if (booking != null && booking.getTotalPrice() != null) {
                amount = booking.getTotalPrice();
            } else {
                amount = BigDecimal.valueOf(1000000);
            }
        }

        PaymentMethod method = parsePaymentMethod(req.getPaymentMethod());

        Payment payment = Payment.builder()
                .bookingId(req.getBookingId())
                .userId(userId)
                .amount(amount)
                .currency(req.getCurrency() != null ? req.getCurrency().toUpperCase() : "VND")
                .paymentMethod(method)
                .status(PaymentStatus.PENDING)
                .build();

        paymentRepo.save(payment);

        return toResponse(payment, "Tao yeu cau thanh toan thanh cong (PENDING)");
    }

    @Override
    @Transactional
    public PaymentResponse processMockPayment(ProcessPaymentRequest req, Long userId) {
        log.info("? X? l Mock Payment: paymentId={}, simulateSuccess={}", req.getPaymentId(), req.isSimulateSuccess());

        Payment payment = paymentRepo.findById(req.getPaymentId())
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            throw new BusinessException(ErrorCode.PAYMENT_ALREADY_SUCCESS);
        }

        if (req.isSimulateSuccess()) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());
            payment.setTransactionId("TXN_MOCK_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            if (req.getPaymentMethod() != null) {
                payment.setPaymentMethod(parsePaymentMethod(req.getPaymentMethod()));
            }
            paymentRepo.save(payment);

            log.info("? Mock payment thnh cng: txn={}", payment.getTransactionId());

            bookingClient.confirmPayment(payment.getBookingId(), payment.getId());
            BookingDetailDto booking = bookingClient.getBooking(payment.getBookingId());
            notificationService.sendBookingConfirmation(payment, booking);

            return toResponse(payment, "Thanh toan thanh cong! Email xac nhan dat phong da duoc gui.");
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepo.save(payment);
            return toResponse(payment, "Thanh toan that bai (gia lap)");
        }
    }

    @Override
    @Transactional
    public PaymentResponse createStripePayment(Long userId, CreatePaymentRequest req) {
        log.info("? Kh?i t?o Stripe Sandbox Payment cho bookingId={}", req.getBookingId());

        if (paymentRepo.existsByBookingIdAndStatus(req.getBookingId(), PaymentStatus.SUCCESS)) {
            throw new BusinessException(ErrorCode.PAYMENT_ALREADY_SUCCESS);
        }

        BigDecimal amount = req.getAmount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            BookingDetailDto booking = bookingClient.getBooking(req.getBookingId());
            if (booking != null && booking.getTotalPrice() != null) {
                amount = booking.getTotalPrice();
            } else {
                amount = BigDecimal.valueOf(1000000);
            }
        }

        Payment payment = Payment.builder()
                .bookingId(req.getBookingId())
                .userId(userId)
                .amount(amount)
                .currency("VND")
                .paymentMethod(PaymentMethod.STRIPE)
                .status(PaymentStatus.PENDING)
                .build();

        String clientSecret = null;
        String transactionId = null;

        try {
            long stripeAmount = amount.longValue();

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(stripeAmount)
                    .setCurrency(stripeCurrency.toLowerCase())
                    .setDescription("Thanh toan dat phong #" + req.getBookingId())
                    .putMetadata("bookingId", String.valueOf(req.getBookingId()))
                    .putMetadata("userId", String.valueOf(userId))
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .setAllowRedirects(PaymentIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER)
                                    .build()
                    )
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);
            transactionId = intent.getId();
            clientSecret = intent.getClientSecret();
            payment.setGatewayResponse(intent.toJson());
            log.info("? Stripe PaymentIntent t?o thnh cng: id={}", transactionId);
        } catch (Exception e) {
            log.warn("? Khng k?t n?i ???c Stripe API th?t ({}), t? ??ng kch ho?t Stripe Sandbox Simulator!", e.getMessage());
            transactionId = "pi_sandbox_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
            clientSecret = transactionId + "_secret_" + UUID.randomUUID().toString().substring(0, 16);
            payment.setGatewayResponse("{\"simulator\": true, \"payment_intent\": \"" + transactionId + "\"}");
        }

        payment.setTransactionId(transactionId);
        paymentRepo.save(payment);

        PaymentResponse response = toResponse(payment, "Khoi tao Stripe payment thanh cong");
        response.setClientSecret(clientSecret);
        response.setTransactionId(transactionId);
        return response;
    }

    @Override
    @Transactional
    public PaymentResponse confirmStripePayment(String paymentIntentId) {
        log.info("? Xc nh?n thanh ton Stripe: intentId={}", paymentIntentId);

        Payment payment = paymentRepo.findByTransactionId(paymentIntentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND, "Khong tim thay giao dich voi Stripe intent: " + paymentIntentId));

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return toResponse(payment, "Giao dich da duoc xac nhan truoc do");
        }

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepo.save(payment);

        bookingClient.confirmPayment(payment.getBookingId(), payment.getId());
        BookingDetailDto booking = bookingClient.getBooking(payment.getBookingId());
        notificationService.sendBookingConfirmation(payment, booking);

        return toResponse(payment, "Thanh toan Stripe thanh cong. Email xac nhan da duoc gui!");
    }

    @Override
    @Transactional
    public PaymentResponse refund(Long paymentId, RefundRequest req, Long userId, String role) {
        log.info("? X? l hon ti?n: paymentId={}, userId={}, role={}", paymentId, userId, role);

        Payment payment = paymentRepo.findById(paymentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));

        if (!"ADMIN".equals(role) && !"STAFF".equals(role) && !payment.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        return doRefund(payment, req != null ? req.getAmount() : null, req != null ? req.getReason() : "Huy phong va yeu cau hoan tien");
    }

    @Override
    @Transactional
    public PaymentResponse refundInternal(Long paymentId, BigDecimal amount, String reason) {
        log.info("? Hon ti?n n?i b? t? Booking Service: paymentId={}, amount={}, reason={}", paymentId, amount, reason);

        Payment payment = paymentRepo.findById(paymentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));

        return doRefund(payment, amount, reason != null ? reason : "Huy dat phong qua he thong");
    }

    @Override
    @Transactional
    public PaymentResponse createPaymentInternal(Map<String, Object> req) {
        log.info("? T?o payment n?i b?: {}", req);

        Long bookingId = Long.valueOf(req.get("bookingId").toString());
        Long userId = req.get("userId") != null ? Long.valueOf(req.get("userId").toString()) : 1L;
        BigDecimal amount = req.get("amount") != null ? new BigDecimal(req.get("amount").toString()) : BigDecimal.ZERO;
        String methodStr = (String) req.getOrDefault("paymentMethod", "MOCK");

        Payment payment = Payment.builder()
                .bookingId(bookingId)
                .userId(userId)
                .amount(amount)
                .currency("VND")
                .paymentMethod(parsePaymentMethod(methodStr))
                .status(PaymentStatus.PENDING)
                .build();

        paymentRepo.save(payment);
        return toResponse(payment, "Tao payment noi bo thanh cong");
    }

    @Override
    public PaymentResponse getPaymentById(Long id, Long userId, String role) {
        Payment payment = paymentRepo.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));

        if (!"ADMIN".equals(role) && !"STAFF".equals(role) && !payment.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        return toResponse(payment, "Lay thong tin thanh toan thanh cong");
    }

    @Override
    public PaymentResponse getPaymentByBookingId(Long bookingId, Long userId, String role) {
        Payment payment = paymentRepo.findByBookingId(bookingId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND, "Chua co thanh toan cho booking #" + bookingId));

        if (!"ADMIN".equals(role) && !"STAFF".equals(role) && !payment.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        return toResponse(payment, "Lay thong tin thanh toan thanh cong");
    }

    @Override
    public Page<PaymentResponse> getMyPayments(Long userId, Pageable pageable) {
        return paymentRepo.findByUserId(userId, pageable)
                .map(p -> toResponse(p, null));
    }

    @Override
    public Page<PaymentResponse> getAllPayments(Pageable pageable) {
        return paymentRepo.findAll(pageable)
                .map(p -> toResponse(p, null));
    }

    private PaymentResponse doRefund(Payment payment, BigDecimal amount, String reason) {
        if (payment.getStatus() != PaymentStatus.SUCCESS && payment.getStatus() != PaymentStatus.REFUND_PENDING) {
            throw new BusinessException(ErrorCode.CANNOT_REFUND, "Chi co the hoan tien cho giao dich da thanh toan thanh cong (SUCCESS)");
        }

        BigDecimal refundAmt = (amount != null && amount.compareTo(BigDecimal.ZERO) > 0)
                ? amount
                : payment.getAmount();

        if (refundAmt.compareTo(payment.getAmount()) > 0) {
            throw new BusinessException(ErrorCode.INVALID_REFUND_AMOUNT);
        }

        if (payment.getPaymentMethod() == PaymentMethod.STRIPE && payment.getTransactionId() != null && payment.getTransactionId().startsWith("pi_")) {
            try {
                RefundCreateParams params = RefundCreateParams.builder()
                        .setPaymentIntent(payment.getTransactionId())
                        .setAmount(refundAmt.longValue())
                        .build();
                Refund stripeRefund = Refund.create(params);
                log.info("? Stripe Refund thnh cng: id={}", stripeRefund.getId());
            } catch (Exception e) {
                log.warn("? Stripe Refund API th?t b?i ho?c ?ang dng mock sandbox: {}", e.getMessage());
            }
        }

        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setRefundAmount(refundAmt);
        payment.setRefundReason(reason);
        payment.setRefundedAt(LocalDateTime.now());
        paymentRepo.save(payment);

        log.info("? ? hon ti?n thnh cng: paymentId={}, refundAmount={}", payment.getId(), refundAmt);

        BookingDetailDto booking = bookingClient.getBooking(payment.getBookingId());
        notificationService.sendRefundNotification(payment, booking, refundAmt, reason);

        return toResponse(payment, "Hoan tien thanh cong va email thong bao da duoc gui den khach hang.");
    }

    private PaymentMethod parsePaymentMethod(String method) {
        if (method == null) return PaymentMethod.MOCK;
        try {
            return PaymentMethod.valueOf(method.toUpperCase());
        } catch (IllegalArgumentException e) {
            return PaymentMethod.MOCK;
        }
    }

    private PaymentResponse toResponse(Payment p, String message) {
        return PaymentResponse.builder()
                .paymentId(p.getId())
                .bookingId(p.getBookingId())
                .userId(p.getUserId())
                .amount(p.getAmount())
                .currency(p.getCurrency())
                .paymentMethod(p.getPaymentMethod() != null ? p.getPaymentMethod().name() : null)
                .status(p.getStatus() != null ? p.getStatus().name() : null)
                .transactionId(p.getTransactionId())
                .refundAmount(p.getRefundAmount())
                .refundReason(p.getRefundReason())
                .refundedAt(p.getRefundedAt())
                .paidAt(p.getPaidAt())
                .createdAt(p.getCreatedAt())
                .message(message)
                .build();
    }
}
