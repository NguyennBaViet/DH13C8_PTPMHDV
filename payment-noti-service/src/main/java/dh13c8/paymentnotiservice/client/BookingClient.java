package dh13c8.paymentnotiservice.client;

import dh13c8.paymentnotiservice.dto.response.BookingDetailDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
@Slf4j
public class BookingClient {

    private final RestClient restClient;

    public BookingClient(@Qualifier("bookingRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    public BookingDetailDto getBooking(Long bookingId) {
        log.debug("? L?y thng tin bookingId={}", bookingId);
        try {
            Map<String, Object> response = restClient.get()
                    .uri("/api/bookings/{id}", bookingId)
                    .header("X-User-Id", "1")
                    .header("X-User-Role", "ADMIN")
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (response != null && response.get("data") != null) {
                return mapToBookingDetail((Map<String, Object>) response.get("data"));
            }
        } catch (Exception e) {
            log.warn("? Khng l?y ???c thng tin booking t? booking-service: {}", e.getMessage());
        }
        return null;
    }

    public boolean confirmPayment(Long bookingId, Long paymentId) {
        log.info("? Xc nh?n thanh ton v?i booking-service: bookingId={}, paymentId={}", bookingId, paymentId);
        try {
            restClient.post()
                    .uri("/api/bookings/{id}/confirm-payment?paymentId={paymentId}", bookingId, paymentId)
                    .header("X-User-Id", "1")
                    .header("X-User-Role", "ADMIN")
                    .retrieve()
                    .toBodilessEntity();
            log.info("? Xc nh?n thanh ton thnh cng t?i booking-service");
            return true;
        } catch (Exception e) {
            log.error("? L?i khi g?i confirm-payment sang booking-service: {}", e.getMessage());
            return false;
        }
    }

    private BookingDetailDto mapToBookingDetail(Map<String, Object> data) {
        BookingDetailDto dto = new BookingDetailDto();
        if (data.get("id") != null) {
            dto.setId(Long.valueOf(data.get("id").toString()));
        }
        dto.setBookingCode((String) data.get("bookingCode"));
        if (data.get("userId") != null) {
            dto.setUserId(Long.valueOf(data.get("userId").toString()));
        }
        if (data.get("hotelId") != null) {
            dto.setHotelId(Long.valueOf(data.get("hotelId").toString()));
        }
        dto.setHotelName((String) data.get("hotelName"));
        dto.setRoomTypeName((String) data.get("roomTypeName"));
        dto.setContactName((String) data.get("contactName"));
        dto.setContactEmail((String) data.get("contactEmail"));
        dto.setContactPhone((String) data.get("contactPhone"));
        dto.setStatus((String) data.get("status"));
        return dto;
    }
}
