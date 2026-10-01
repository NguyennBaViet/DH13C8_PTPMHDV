package dh13c8.hotelroomservice.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<Map<String, Object>> handleApp(AppException ex) {
        return build(ex.getStatus(), ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getAllErrors().forEach(e -> {
            String f = e instanceof FieldError fe ? fe.getField() : e.getObjectName();
            errors.put(f, e.getDefaultMessage());
        });
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status",  400);
        body.put("error",   "Validation Failed");
        body.put("details", errors);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        log.error("Unexpected error", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi hệ thống");
    }

    private ResponseEntity<Map<String, Object>> build(HttpStatus s, String msg) {
        Map<String, Object> b = new LinkedHashMap<>();
        b.put("timestamp", LocalDateTime.now().toString());
        b.put("status",  s.value());
        b.put("error",   s.getReasonPhrase());
        b.put("message", msg);
        return ResponseEntity.status(s).body(b);
    }
}
