package dh13c8.userservice.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class HotelRatingSummary {
    private Long   hotelId;
    private Double averageRating;
    private Long   totalReviews;
    private long   count5Star;
    private long   count4Star;
    private long   count3Star;
    private long   count2Star;
    private long   count1Star;
}
