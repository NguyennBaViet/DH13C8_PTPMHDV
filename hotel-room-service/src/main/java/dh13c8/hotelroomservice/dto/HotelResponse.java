package dh13c8.hotelroomservice.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class HotelResponse {
    private Long   id;
    private String name;
    private String description;
    private String address;
    private String city;
    private String district;
    private String country;
    private Integer starRating;
    private String phone;
    private String email;
    private String website;
    private String coverImage;
    private boolean isActive;
    private List<AmenityResponse> amenities;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
