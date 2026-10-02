package dh13c8.bookingservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class RestClientConfig {

    @Value("${app.hotel-room-service.url:http://localhost:8023}")
    private String hotelRoomUrl;

    // ⚠️ Key này CHƯA có trong application.properties của nhóm trưởng
    // → dùng default http://localhost:8025, sau này hỏi nhóm trưởng để cập nhật
    @Value("${app.payment-service.url:http://localhost:8025}")
    private String paymentUrl;

    @Bean("hotelRoomRestClient")
    public RestClient hotelRoomRestClient() {
        return buildClient(hotelRoomUrl);
    }

    @Bean("paymentRestClient")
    public RestClient paymentRestClient() {
        return buildClient(paymentUrl);
    }

    private RestClient buildClient(String baseUrl) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(10));

        return RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}