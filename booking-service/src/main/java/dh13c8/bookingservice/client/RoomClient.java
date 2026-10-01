package dh13c8.bookingservice.client;

import dh13c8.bookingservice.dto.request.LockRoomRequest;
import dh13c8.bookingservice.dto.response.RoomTypeDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@Slf4j
public class RoomClient {

    private final RestClient restClient;

    public RoomClient(@Qualifier("hotelRoomRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    /** Lấy thông tin 1 loại phòng */
    public RoomTypeDto getRoomType(Long id) {
        log.debug("→ Gọi hotel-room-service: GET /api/rooms/internal/{}", id);
        try {
            return restClient.get()
                    .uri("/api/rooms/internal/{id}", id)
                    .retrieve()
                    .body(RoomTypeDto.class);
        } catch (Exception e) {
            log.error("❌ Lỗi gọi getRoomType: {}", e.getMessage());
            throw new RuntimeException("Không lấy được thông tin phòng: " + e.getMessage());
        }
    }

    /** Kiểm tra phòng còn trống không */
    public Boolean checkAvailability(LockRoomRequest req) {
        log.debug("→ Check availability: {}", req);
        try {
            Boolean result = restClient.post()
                    .uri("/api/rooms/internal/check-availability")
                    .body(req)
                    .retrieve()
                    .body(Boolean.class);
            return Boolean.TRUE.equals(result);
        } catch (Exception e) {
            log.error("❌ Lỗi check availability: {}", e.getMessage());
            return false;
        }
    }

    /** Lock phòng (giữ chỗ) */
    public void lockRooms(LockRoomRequest req) {
        log.debug("→ Lock rooms: {}", req);
        restClient.post()
                .uri("/api/rooms/internal/lock")
                .body(req)
                .retrieve()
                .toBodilessEntity();
    }

    /** Release phòng (bỏ giữ chỗ) */
    public void releaseRooms(LockRoomRequest req) {
        log.debug("→ Release rooms: {}", req);
        try {
            restClient.post()
                    .uri("/api/rooms/internal/release")
                    .body(req)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.warn("⚠️ Không release được phòng (bỏ qua): {}", e.getMessage());
        }
    }

    /** Xác nhận chính thức (trừ tồn kho) */
    public void confirmRooms(LockRoomRequest req) {
        log.debug("→ Confirm rooms: {}", req);
        restClient.post()
                .uri("/api/rooms/internal/confirm")
                .body(req)
                .retrieve()
                .toBodilessEntity();
    }
}