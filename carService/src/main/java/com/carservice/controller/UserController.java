package com.carservice.controller;

import com.carservice.dto.CreateManagerRequest;
import com.carservice.dto.UpdateProfileRequest;
import com.carservice.entity.User;
import com.carservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Get current user profile
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication auth) {
        User user = (User) auth.getPrincipal();
        User fresh = userService.getById(user.getId());
        return ResponseEntity.ok(toMap(fresh));
    }

    // Update current user profile (any authenticated user)
    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(Authentication auth, @RequestBody UpdateProfileRequest request) {
        try {
            User user = (User) auth.getPrincipal();
            User updated = userService.updateProfile(user.getId(), request);
            return ResponseEntity.ok(toMap(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get all users (ADMIN only)
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<Map<String, Object>> result = users.stream().map(this::toMap).toList();
        return ResponseEntity.ok(result);
    }

    // Get all managers (ADMIN only)
    @GetMapping("/managers")
    public ResponseEntity<List<Map<String, Object>>> getManagers() {
        List<User> managers = userService.getManagers();
        List<Map<String, Object>> result = managers.stream().map(this::toMap).toList();
        return ResponseEntity.ok(result);
    }

    // Create manager (ADMIN only)
    @PostMapping("/manager")
    public ResponseEntity<?> createManager(@Valid @RequestBody CreateManagerRequest request) {
        try {
            User manager = userService.createManager(request);
            return ResponseEntity.ok(toMap(manager));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Update user/manager (ADMIN only)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UpdateProfileRequest request) {
        try {
            User updated = userService.updateUser(id, request);
            return ResponseEntity.ok(toMap(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Delete manager (ADMIN only)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Map<String, Object> toMap(User u) {
        return Map.of(
                "id", u.getId(),
                "name", u.getName(),
                "email", u.getEmail(),
                "phone", u.getPhone(),
                "role", u.getRole().name(),
                "createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : ""
        );
    }
}
