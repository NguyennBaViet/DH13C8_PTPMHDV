package dh13c8.paymentnotiservice.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    PAYMENT_NOT_FOUND("PAYMENT_NOT_FOUND", "Không tìm thấy giao dịch thanh toán", HttpStatus.NOT_FOUND),
    PAYMENT_ALREADY_SUCCESS("PAYMENT_ALREADY_SUCCESS", "Giao dịch thanh toán này đã thành công trước đó", HttpStatus.BAD_REQUEST),
    PAYMENT_FAILED("PAYMENT_FAILED", "Xử lý thanh toán thất bại", HttpStatus.BAD_REQUEST),
    PAYMENT_METHOD_NOT_SUPPORTED("PAYMENT_METHOD_NOT_SUPPORTED", "Phương thức thanh toán không được hỗ trợ", HttpStatus.BAD_REQUEST),
    INVALID_REFUND_AMOUNT("INVALID_REFUND_AMOUNT", "Số tiền hoàn không hợp lệ hoặc lớn hơn số tiền đã thanh toán", HttpStatus.BAD_REQUEST),
    CANNOT_REFUND("CANNOT_REFUND", "Không thể hoàn tiền cho giao dịch này", HttpStatus.BAD_REQUEST),
    BOOKING_NOT_FOUND("BOOKING_NOT_FOUND", "Không tìm thấy thông tin đặt phòng", HttpStatus.NOT_FOUND),
    BOOKING_SERVICE_UNAVAILABLE("BOOKING_SERVICE_UNAVAILABLE", "Không thể kết nối đến Booking Service", HttpStatus.SERVICE_UNAVAILABLE),
    NOTIFICATION_NOT_FOUND("NOTIFICATION_NOT_FOUND", "Không tìm thấy thông báo", HttpStatus.NOT_FOUND),
    UNAUTHORIZED("UNAUTHORIZED", "Bạn không có quyền thực hiện thao tác này", HttpStatus.FORBIDDEN),
    STRIPE_ERROR("STRIPE_ERROR", "Lỗi xử lý qua cổng thanh toán Stripe", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus status;

    ErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }
}
