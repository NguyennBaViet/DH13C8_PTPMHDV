package dh13c8.paymentnotiservice.controller;

import dh13c8.paymentnotiservice.dto.ApiResponse;
import dh13c8.paymentnotiservice.dto.request.CreatePaymentRequest;
import dh13c8.paymentnotiservice.dto.request.ProcessPaymentRequest;
import dh13c8.paymentnotiservice.dto.request.RefundRequest;
import dh13c8.paymentnotiservice.dto.response.PaymentResponse;
import dh13c8.paymentnotiservice.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @Valid @RequestBody CreatePaymentRequest req) {

        log.info("? POST /api/payments - userId={}, bookingId={}", userId, req.getBookingId());
        PaymentResponse response = paymentService.createPayment(userId, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Tao yeu cau thanh toan thanh cong", response));
    }

    @PostMapping("/process")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @Valid @RequestBody ProcessPaymentRequest req) {

        log.info("? POST /api/payments/process - userId={}, paymentId={}", userId, req.getPaymentId());
        PaymentResponse response = paymentService.processMockPayment(req, userId);
        return ResponseEntity.ok(ApiResponse.ok(response.getMessage(), response));
    }

    @PostMapping("/stripe/create-intent")
    public ResponseEntity<ApiResponse<PaymentResponse>> createStripeIntent(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @Valid @RequestBody CreatePaymentRequest req) {

        log.info("? POST /api/payments/stripe/create-intent - userId={}, bookingId={}", userId, req.getBookingId());
        PaymentResponse response = paymentService.createStripePayment(userId, req);
        return ResponseEntity.ok(ApiResponse.ok("Khoi tao Stripe sandbox thanh cong", response));
    }

    @PostMapping("/stripe/confirm")
    public ResponseEntity<ApiResponse<PaymentResponse>> confirmStripePayment(
            @RequestBody Map<String, String> body) {

        String paymentIntentId = body.get("paymentIntentId");
        log.info("? POST /api/payments/stripe/confirm - intentId={}", paymentIntentId);
        PaymentResponse response = paymentService.confirmStripePayment(paymentIntentId);
        return ResponseEntity.ok(ApiResponse.ok(response.getMessage(), response));
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<ApiResponse<PaymentResponse>> refund(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "GUEST") String role,
            @RequestBody(required = false) RefundRequest req) {

        log.info("? POST /api/payments/{}/refund - userId={}, role={}", id, userId, role);
        PaymentResponse response = paymentService.refund(id, req, userId, role);
        return ResponseEntity.ok(ApiResponse.ok(response.getMessage(), response));
    }

    @PostMapping("/internal/create")
    public ResponseEntity<PaymentResponse> createPaymentInternal(
            @RequestBody Map<String, Object> request) {

        log.info("? POST /api/payments/internal/create - {}", request);
        PaymentResponse response = paymentService.createPaymentInternal(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/internal/{paymentId}/refund")
    public ResponseEntity<PaymentResponse> refundInternal(
            @PathVariable Long paymentId,
            @RequestParam(required = false) BigDecimal amount,
            @RequestParam(required = false, defaultValue = "Huy dat phong qua he thong") String reason) {

        log.info("? POST /api/payments/internal/{}/refund - amount={}", paymentId, amount);
        PaymentResponse response = paymentService.refundInternal(paymentId, amount, reason);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "GUEST") String role) {

        PaymentResponse response = paymentService.getPaymentById(id, userId, role);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByBookingId(
            @PathVariable Long bookingId,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "GUEST") String role) {

        PaymentResponse response = paymentService.getPaymentByBookingId(bookingId, userId, role);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Page<PaymentResponse>>> getMyPayments(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PaymentResponse> result = paymentService.getMyPayments(userId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PaymentResponse>>> getAllPayments(
            @RequestHeader(value = "X-User-Role", defaultValue = "ADMIN") String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PaymentResponse> result = paymentService.getAllPayments(pageable);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.ok("Payment & Notification Service is running on port 8025"));
    }
}
