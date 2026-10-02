package dh13c8.bookingservice.service;

import dh13c8.bookingservice.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingExpiryScheduler {

    private final BookingService bookingService;

    /**
     * Chạy mỗi 60 giây (1 phút) — quét booking PENDING hết hạn và release phòng.
     * fixedDelay = 60000ms: đợi 60s SAU KHI lần chạy trước kết thúc.
     */
    @Scheduled(fixedDelay = 60_000, initialDelay = 30_000)
    public void autoReleaseExpiredBookings() {
        try {
            log.debug("🕐 [Scheduler] Bắt đầu quét booking hết hạn...");
            bookingService.releaseExpiredBookings();
        } catch (Exception e) {
            log.error("❌ [Scheduler] Lỗi khi release booking hết hạn: {}", e.getMessage(), e);
        }
    }
}