package dh13c8.hotelroomservice.controller;

import dh13c8.hotelroomservice.dto.AmenityResponse;
import dh13c8.hotelroomservice.service.AmenityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/amenities")
@RequiredArgsConstructor
public class AmenityController {

    private final AmenityService amenityService;

    /** GET /api/amenities – tất cả tiện nghi */
    @GetMapping
    public ResponseEntity<List<AmenityResponse>> getAll() {
        return ResponseEntity.ok(amenityService.getAll());
    }

    /** GET /api/amenities?category=ROOM – lọc theo loại */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<AmenityResponse>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(amenityService.getByCategory(category));
    }
}
