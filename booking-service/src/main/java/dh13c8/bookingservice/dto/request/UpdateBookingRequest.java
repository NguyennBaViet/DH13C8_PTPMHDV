package dh13c8.bookingservice.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateBookingRequest {
    @FutureOrPresent private LocalDate checkIn;
    @Future         private LocalDate checkOut;
    @Min(1) @Max(10) private Integer rooms;
    @Min(1) @Max(30) private Integer guests;
    @Size(max = 1000) private String specialRequests;
}