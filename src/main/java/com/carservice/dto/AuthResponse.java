package com.carservice.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    private String token;
    private String role;
    private String name;
    private String email;
    private Long userId;
}
