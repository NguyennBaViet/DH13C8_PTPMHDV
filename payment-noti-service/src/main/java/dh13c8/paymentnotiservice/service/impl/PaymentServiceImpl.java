package dh13c8.paymentnotiservice.service.impl;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import dh13c8.paymentnotiservice.client.BookingClient;
import dh13c8.paymentnotiservice.config.VNPayConfig;
import dh13c8.paymentnotiservice.config.VNPayUtil;
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
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepo;
    private final BookingClient bookingClient;
    private final NotificationService notificationService;
    private final VNPayConfig vnPayConfig;
    private final ObjectMapper objectMapper;

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
    public PaymentResponse createVNPayPayment(Long userId, CreatePaymentRequest req, HttpServletRequest servletRequest) {
        log.info("💳 Khởi tạo VNPay Payment: userId={}, bookingId={}", userId, req.getBookingId());

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
                .paymentMethod(PaymentMethod.VNPAY)
                .status(PaymentStatus.PENDING)
                .build();
        paymentRepo.save(payment);

        String txnRef = payment.getId() + "_" + System.currentTimeMillis();
        payment.setTransactionId(txnRef);
        paymentRepo.save(payment);

        long vnpAmount = amount.multiply(BigDecimal.valueOf(100)).longValue();
        String clientIp = VNPayUtil.getIpAddress(servletRequest);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        String createDate = formatter.format(cld.getTime());
        cld.add(Calendar.MINUTE, 15);
        String expireDate = formatter.format(cld.getTime());

        String returnUrl = (req.getReturnUrl() != null && !req.getReturnUrl().isBlank())
                ? req.getReturnUrl()
                : vnPayConfig.getReturnUrl();

        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnpParams.put("vnp_Amount", String.valueOf(vnpAmount));
        vnpParams.put("vnp_CurrCode", "VND");
        String bankCode = (req.getBankCode() != null && !req.getBankCode().isBlank())
                ? req.getBankCode().trim()
                : "NCB";
        vnpParams.put("vnp_BankCode", bankCode);
        vnpParams.put("vnp_TxnRef", txnRef);
        vnpParams.put("vnp_OrderInfo", "Thanh toan dat phong " + req.getBookingId());
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", returnUrl);
        vnpParams.put("vnp_IpAddr", clientIp);
        vnpParams.put("vnp_CreateDate", createDate);
        vnpParams.put("vnp_ExpireDate", expireDate);

        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (String fieldName : fieldNames) {
            String fieldValue = vnpParams.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                if (hashData.length() > 0) {
                    hashData.append('&');
                    query.append('&');
                }
                hashData.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII))
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII))
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
            }
        }

        String secureHash = vnPayConfig.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        String paymentUrl = vnPayConfig.getPayUrl() + "?" + query.toString() + "&vnp_SecureHash=" + secureHash;

        log.info("🔗 VNPay payment URL tạo thành công: txnRef={}, url={}", txnRef, paymentUrl);

        PaymentResponse response = toResponse(payment, "Khởi tạo giao dịch VNPay thành công");
        response.setCheckoutUrl(paymentUrl);
        response.setTransactionId(txnRef);
        return response;
    }

    @Override
    @Transactional
    public PaymentResponse processVNPayReturn(Map<String, String> params) {
        log.info("📩 Xử lý kết quả VNPay callback/return: {}", params);

        String secureHash = params.get("vnp_SecureHash");
        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionNo = params.get("vnp_TransactionNo");

        if (txnRef == null) {
            throw new BusinessException(ErrorCode.PAYMENT_NOT_FOUND, "Thiếu mã tham chiếu giao dịch vnp_TxnRef");
        }

        // Kiểm tra chữ ký bảo mật
        String calculatedHash = vnPayConfig.hashAllFields(params);
        boolean isValidHash = calculatedHash.equalsIgnoreCase(secureHash);
        log.info("VNPay hash check: calculated={}, received={}, matches={}", calculatedHash, secureHash, isValidHash);

        if (!isValidHash) {
            log.warn("⚠️ Chữ ký VNPay không hợp lệ!");
            throw new BusinessException(ErrorCode.INVALID_SIGNATURE, "Chữ ký số VNPay không hợp lệ");
        }

        // Tìm giao dịch theo txnRef hoặc paymentId
        Payment payment = paymentRepo.findByTransactionId(txnRef).orElse(null);
        if (payment == null) {
            try {
                Long paymentId = Long.parseLong(txnRef.split("_")[0]);
                payment = paymentRepo.findById(paymentId).orElse(null);
            } catch (Exception e) {
                // ignore
            }
        }

        if (payment == null) {
            throw new BusinessException(ErrorCode.PAYMENT_NOT_FOUND, "Không tìm thấy giao dịch với txnRef: " + txnRef);
        }

        String message = VNPayUtil.getResponseMessage(responseCode);

        // Đã được xử lý thành công trước đó (idempotent)
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return toResponse(payment, "Giao dịch đã được ghi nhận thành công trước đó");
        }

        try {
            payment.setGatewayResponse(objectMapper.writeValueAsString(params));
        } catch (Exception e) {
            payment.setGatewayResponse("{}");
        }

        if ("00".equals(responseCode)) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());
            if (transactionNo != null && !transactionNo.isBlank() && !"0".equals(transactionNo)) {
                payment.setTransactionId(transactionNo);
            }
            paymentRepo.save(payment);

            log.info("✅ VNPay thanh toán thành công: bookingId={}, paymentId={}, txnNo={}",
                    payment.getBookingId(), payment.getId(), transactionNo);

            // Xác nhận đơn với booking-service
            bookingClient.confirmPayment(payment.getBookingId(), payment.getId());

            // Gửi email xác nhận đặt phòng
            BookingDetailDto booking = bookingClient.getBooking(payment.getBookingId());
            notificationService.sendBookingConfirmation(payment, booking);

            return toResponse(payment, "Thanh toán VNPay thành công! " + message);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepo.save(payment);
            log.warn("❌ VNPay thanh toán không thành công: code={}, reason={}", responseCode, message);
            return toResponse(payment, "Thanh toán thất bại: " + message);
        }
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
                ? amount.min(payment.getAmount())
                : payment.getAmount();

        if (payment.getPaymentMethod() == PaymentMethod.STRIPE && payment.getTransactionId() != null && payment.getTransactionId().startsWith("pi_")) {
            try {
                RefundCreateParams params = RefundCreateParams.builder()
                        .setPaymentIntent(payment.getTransactionId())
                        .setAmount(refundAmt.longValue())
                        .build();
                Refund stripeRefund = Refund.create(params);
                log.info("💳 Stripe Refund thành công: id={}", stripeRefund.getId());
            } catch (Exception e) {
                log.warn("⚠️ Stripe Refund API thất bại hoặc đang dùng mock sandbox: {}", e.getMessage());
            }
        }

        if (payment.getPaymentMethod() == PaymentMethod.VNPAY) {
            executeVNPayRefund(payment, refundAmt, reason);
        }

        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setRefundAmount(refundAmt);
        payment.setRefundReason(reason);
        payment.setRefundedAt(LocalDateTime.now());
        paymentRepo.save(payment);

        log.info("✅ Đã hoàn tiền thành công: paymentId={}, refundAmount={}", payment.getId(), refundAmt);

        BookingDetailDto booking = bookingClient.getBooking(payment.getBookingId());
        notificationService.sendRefundNotification(payment, booking, refundAmt, reason);

        return toResponse(payment, "Hoan tien thanh cong va email thong bao da duoc gui den khach hang.");
    }

    private void executeVNPayRefund(Payment payment, BigDecimal refundAmt, String reason) {
        log.info("💸 Bắt đầu gọi API hoàn tiền VNPay: paymentId={}, txnId={}, amount={}",
                payment.getId(), payment.getTransactionId(), refundAmt);

        try {
            String txnRef = payment.getTransactionId();
            String txnNo = payment.getTransactionId();
            String payDate = null;

            if (payment.getGatewayResponse() != null && !payment.getGatewayResponse().isBlank()) {
                try {
                    Map<String, Object> respMap = objectMapper.readValue(payment.getGatewayResponse(), Map.class);
                    if (respMap.containsKey("vnp_TxnRef")) {
                        txnRef = String.valueOf(respMap.get("vnp_TxnRef"));
                    }
                    if (respMap.containsKey("vnp_TransactionNo")) {
                        txnNo = String.valueOf(respMap.get("vnp_TransactionNo"));
                    }
                    if (respMap.containsKey("vnp_PayDate")) {
                        payDate = String.valueOf(respMap.get("vnp_PayDate"));
                    }
                } catch (Exception e) {
                    log.warn("Không parse được gateway_response, dùng giá trị mặc định: {}", e.getMessage());
                }
            }

            if (payDate == null && payment.getPaidAt() != null) {
                payDate = payment.getPaidAt().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
            }
            if (payDate == null) {
                payDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
            }

            String requestId = String.valueOf(System.currentTimeMillis());
            String version = "2.1.0";
            String command = "refund";
            String tmnCode = vnPayConfig.getTmnCode();
            boolean isFullRefund = refundAmt.compareTo(payment.getAmount()) >= 0;
            String trType = isFullRefund ? "02" : "03";
            long vnpAmount = refundAmt.multiply(BigDecimal.valueOf(100)).longValue();
            String amountStr = String.valueOf(vnpAmount);
            String createBy = "admin";
            String createDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
            String ipAddr = "127.0.0.1";
            String orderInfo = (reason != null && !reason.isBlank()) ? reason : ("Hoan tien dat phong " + payment.getBookingId());

            // Chuỗi dữ liệu ký hash theo chuẩn VNPay Refund:
            // vnp_RequestId|vnp_Version|vnp_Command|vnp_TmnCode|vnp_TransactionType|vnp_TxnRef|vnp_Amount|vnp_TransactionNo|vnp_TransactionDate|vnp_CreateBy|vnp_CreateDate|vnp_IpAddr|vnp_OrderInfo
            String hashData = String.join("|",
                    requestId, version, command, tmnCode, trType,
                    txnRef, amountStr, txnNo != null ? txnNo : "", payDate,
                    createBy, createDate, ipAddr, orderInfo
            );

            String secureHash = vnPayConfig.hmacSHA512(vnPayConfig.getHashSecret(), hashData);

            Map<String, Object> reqBody = new HashMap<>();
            reqBody.put("vnp_RequestId", requestId);
            reqBody.put("vnp_Version", version);
            reqBody.put("vnp_Command", command);
            reqBody.put("vnp_TmnCode", tmnCode);
            reqBody.put("vnp_TransactionType", trType);
            reqBody.put("vnp_TxnRef", txnRef);
            reqBody.put("vnp_Amount", amountStr);
            reqBody.put("vnp_TransactionNo", txnNo != null ? txnNo : "");
            reqBody.put("vnp_TransactionDate", payDate);
            reqBody.put("vnp_CreateBy", createBy);
            reqBody.put("vnp_CreateDate", createDate);
            reqBody.put("vnp_IpAddr", ipAddr);
            reqBody.put("vnp_OrderInfo", orderInfo);
            reqBody.put("vnp_SecureHash", secureHash);

            String jsonPayload = objectMapper.writeValueAsString(reqBody);

            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest httpRequest = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(vnPayConfig.getApiUrl()))
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                    .build();

            java.net.http.HttpResponse<String> httpResponse = client.send(httpRequest, java.net.http.HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            log.info("📩 VNPay Refund response: code={}, body={}", httpResponse.statusCode(), httpResponse.body());

            if (httpResponse.statusCode() == 200) {
                Map<String, Object> respMap = objectMapper.readValue(httpResponse.body(), Map.class);
                String respCode = String.valueOf(respMap.get("vnp_ResponseCode"));
                String respMsg = String.valueOf(respMap.get("vnp_Message"));
                if ("00".equals(respCode)) {
                    log.info("✅ Hoàn tiền qua VNPay thành công: txnRef={}, amount={}", txnRef, refundAmt);
                } else {
                    log.warn("⚠️ VNPay trả về mã phản hồi: code={}, msg={}", respCode, respMsg);
                }
            } else {
                log.warn("⚠️ Gọi VNPay API hoàn tiền thất bại, HTTP status: {}", httpResponse.statusCode());
            }

        } catch (Exception e) {
            log.error("❌ Lỗi ngoại lệ khi gọi API hoàn tiền VNPay: {}", e.getMessage(), e);
        }
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
