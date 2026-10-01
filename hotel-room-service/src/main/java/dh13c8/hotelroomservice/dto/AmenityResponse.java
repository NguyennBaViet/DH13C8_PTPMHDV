package dh13c8.hotelroomservice.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AmenityResponse {
    private Long   id;
    private String name;
    private String icon;
    private String category;
}
