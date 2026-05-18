package com.carservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class BookingRequest {
    @NotBlank
    private String carModel;
    @NotBlank
    private String carNumber;
    private String notes;
    @NotEmpty
    private List<Long> serviceIds;
}
