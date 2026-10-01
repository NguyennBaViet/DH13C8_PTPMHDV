package dh13c8.hotelroomservice.controller;

import dh13c8.hotelroomservice.dto.*;
import dh13c8.hotelroomservice.service.HotelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;

    /** GET /api/hotels?page=0&size=10 – danh sách tất cả khách sạn */
    @GetMapping
    public ResponseEntity<Page<HotelResponse>> getAll(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(hotelService.getAllHotels(page, size));
    }

    /** GET /api/hotels/search?city=Đà Nẵng&minStar=3&maxStar=5 */
    @GetMapping("/search")
    public ResponseEntity<Page<HotelResponse>> search(
            @RequestParam(required = false) String  city,
            @RequestParam(required = false) Integer minStar,
            @RequestParam(required = false) Integer maxStar,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(hotelService.searchHotels(city, minStar, maxStar, page, size));
    }

    /** GET /api/hotels/{id} – chi tiết khách sạn */
    @GetMapping("/{id}")
    public ResponseEntity<HotelResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(hotelService.getById(id));
    }

    /** POST /api/hotels – tạo khách sạn (STAFF, ADMIN) */
    @PostMapping
    public ResponseEntity<HotelResponse> create(
            @Valid @RequestBody HotelRequest req,
            Principal principal) {
        Long userId = extractUserId(principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(hotelService.createHotel(req, userId));
    }

    /** PUT /api/hotels/{id} – cập nhật khách sạn (STAFF, ADMIN) */
    @PutMapping("/{id}")
    public ResponseEntity<HotelResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody HotelRequest req) {
        return ResponseEntity.ok(hotelService.updateHotel(id, req));
    }

    /** DELETE /api/hotels/{id} – xoá mềm khách sạn (ADMIN) */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        hotelService.deleteHotel(id);
        return ResponseEntity.noContent().build();
    }

    private Long extractUserId(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            return (Long) auth.getCredentials();
        }
        return null;
    }
}
