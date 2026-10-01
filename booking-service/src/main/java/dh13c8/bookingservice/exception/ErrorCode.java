package dh13c8.bookingservice.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    BOOKING_NOT_FOUND("BK001", "Không tìm thấy booking", HttpStatus.NOT_FOUND),
    ROOM_NOT_AVAILABLE("BK002", "Phòng không còn trống", HttpStatus.CONFLICT),
    INVALID_DATE_RANGE("BK003", "Ngày check-in/check-out không hợp lệ", HttpStatus.BAD_REQUEST),
    INVALID_STATUS_TRANSITION("BK004", "Không thể chuyển trạng thái booking", HttpStatus.BAD_REQUEST),
    BOOKING_EXPIRED("BK005", "Booking đã hết hạn thanh toán", HttpStatus.GONE),
    UNAUTHORIZED("BK006", "Bạn không có quyền thao tác booking này", HttpStatus.FORBIDDEN),
    SERVICE_UNAVAILABLE("BK007", "Dịch vụ tạm thời không khả dụng", HttpStatus.SERVICE_UNAVAILABLE),
    CANNOT_CANCEL("BK008", "Không thể hủy booking ở trạng thái hiện tại", HttpStatus.BAD_REQUEST),
    PAYMENT_FAILED("BK009", "Thanh toán thất bại", HttpStatus.PAYMENT_REQUIRED),
    INVALID_REQUEST("BK010", "Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus status;

    ErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }
}