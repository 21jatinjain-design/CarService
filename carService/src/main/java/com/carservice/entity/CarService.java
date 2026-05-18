package com.carservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "car_services")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CarService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(name = "duration_hours")
    private Double durationHours;

    private String category;

    private String icon;
}
