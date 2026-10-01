package dh13c8.bookingservice.util;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class BookingCodeGenerator {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyMMddHHmmss");

    /** Sinh mã booking kiểu: BK2401011200001234 */
    public String generate() {
        int rand = ThreadLocalRandom.current().nextInt(1000, 9999);
        return "BK" + LocalDateTime.now().format(FMT) + rand;
    }
}