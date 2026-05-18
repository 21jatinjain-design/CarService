package com.carservice.controller;

import com.carservice.entity.CarService;
import com.carservice.repository.CarServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class CarServiceController {

    private final CarServiceRepository carServiceRepository;

    @GetMapping
    public ResponseEntity<List<CarService>> getAllServices() {
        return ResponseEntity.ok(carServiceRepository.findAll());
    }
}
