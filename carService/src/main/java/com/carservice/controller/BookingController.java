package com.carservice.controller;

import com.carservice.dto.BookingRequest;
import com.carservice.entity.ServiceRequest;
import com.carservice.entity.User;
import com.carservice.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // Create booking (USER only)
    @PostMapping
    public ResponseEntity<?> createBooking(Authentication auth, @Valid @RequestBody BookingRequest request) {
        try {
            User user = (User) auth.getPrincipal();
            ServiceRequest sr = bookingService.createBooking(user.getId(), request);
            return ResponseEntity.ok(toMap(sr));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get my bookings (USER)
    @GetMapping("/my")
    public ResponseEntity<List<Map<String, Object>>> getMyBookings(Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<ServiceRequest> bookings = bookingService.getMyBookings(user.getId());
        return ResponseEntity.ok(bookings.stream().map(this::toMap).toList());
    }

    // Get all bookings (ADMIN/MANAGER)
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllBookings(Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<ServiceRequest> bookings;

        if (user.getRole().name().equals("MANAGER")) {
            bookings = bookingService.getManagerBookings(user.getId());
        } else {
            bookings = bookingService.getAllBookings();
        }

        return ResponseEntity.ok(bookings.stream().map(this::toMap).toList());
    }

    // Update status (MANAGER)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            ServiceRequest sr = bookingService.updateStatus(id, body.get("status"));
            return ResponseEntity.ok(toMap(sr));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Assign manager (ADMIN)
    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assignManager(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        try {
            ServiceRequest sr = bookingService.assignManager(id, body.get("managerId"));
            return ResponseEntity.ok(toMap(sr));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Map<String, Object> toMap(ServiceRequest sr) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", sr.getId());
        map.put("carModel", sr.getCarModel());
        map.put("carNumber", sr.getCarNumber());
        map.put("notes", sr.getNotes());
        map.put("status", sr.getStatus().name());
        map.put("createdAt", sr.getCreatedAt() != null ? sr.getCreatedAt().toString() : "");
        map.put("updatedAt", sr.getUpdatedAt() != null ? sr.getUpdatedAt().toString() : "");

        // User info
        Map<String, Object> userMap = new LinkedHashMap<>();
        userMap.put("id", sr.getUser().getId());
        userMap.put("name", sr.getUser().getName());
        userMap.put("email", sr.getUser().getEmail());
        userMap.put("phone", sr.getUser().getPhone());
        map.put("user", userMap);

        // Manager info
        if (sr.getManager() != null) {
            Map<String, Object> mgrMap = new LinkedHashMap<>();
            mgrMap.put("id", sr.getManager().getId());
            mgrMap.put("name", sr.getManager().getName());
            mgrMap.put("email", sr.getManager().getEmail());
            map.put("manager", mgrMap);
        } else {
            map.put("manager", null);
        }

        // Services
        List<Map<String, Object>> items = sr.getItems().stream().map(item -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", item.getCarService().getId());
            m.put("name", item.getCarService().getName());
            m.put("price", item.getCarService().getPrice());
            return m;
        }).toList();
        map.put("services", items);

        // Total
        double total = sr.getItems().stream()
                .mapToDouble(item -> item.getCarService().getPrice())
                .sum();
        map.put("totalAmount", total);

        return map;
    }
}
