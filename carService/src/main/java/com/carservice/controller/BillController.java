package com.carservice.controller;

import com.carservice.entity.Bill;
import com.carservice.entity.User;
import com.carservice.service.BillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;

    @PostMapping
    public ResponseEntity<?> generateBill(Authentication auth, @RequestBody Map<String, Long> body) {
        try {
            User admin = (User) auth.getPrincipal();
            Bill bill = billService.generateBill(body.get("serviceRequestId"), admin.getId());
            return ResponseEntity.ok(toMap(bill));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getBills(Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<Bill> bills;
        if (user.getRole().name().equals("USER")) {
            bills = billService.getUserBills(user.getId());
        } else {
            bills = billService.getAllBills();
        }
        return ResponseEntity.ok(bills.stream().map(this::toMap).toList());
    }

    @GetMapping("/my")
    public ResponseEntity<List<Map<String, Object>>> getMyBills(Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<Bill> bills = billService.getUserBills(user.getId());
        return ResponseEntity.ok(bills.stream().map(this::toMap).toList());
    }

    @PutMapping("/{id}/paid")
    public ResponseEntity<?> markAsPaid(@PathVariable Long id) {
        try {
            Bill bill = billService.markAsPaid(id);
            return ResponseEntity.ok(toMap(bill));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Map<String, Object> toMap(Bill bill) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", bill.getId());
        map.put("subtotal", bill.getSubtotal());
        map.put("tax", bill.getTax());
        map.put("total", bill.getTotal());
        map.put("isPaid", bill.getIsPaid());
        map.put("generatedAt", bill.getGeneratedAt() != null ? bill.getGeneratedAt().toString() : "");

        Map<String, Object> booking = new LinkedHashMap<>();
        booking.put("id", bill.getServiceRequest().getId());
        booking.put("carModel", bill.getServiceRequest().getCarModel());
        booking.put("carNumber", bill.getServiceRequest().getCarNumber());
        booking.put("status", bill.getServiceRequest().getStatus().name());

        Map<String, Object> customer = new LinkedHashMap<>();
        customer.put("id", bill.getServiceRequest().getUser().getId());
        customer.put("name", bill.getServiceRequest().getUser().getName());
        customer.put("email", bill.getServiceRequest().getUser().getEmail());
        customer.put("phone", bill.getServiceRequest().getUser().getPhone());
        booking.put("customer", customer);

        List<Map<String, Object>> services = bill.getServiceRequest().getItems().stream().map(item -> {
            Map<String, Object> s = new LinkedHashMap<>();
            s.put("name", item.getCarService().getName());
            s.put("price", item.getCarService().getPrice());
            return s;
        }).toList();
        booking.put("services", services);

        map.put("booking", booking);

        Map<String, Object> admin = new LinkedHashMap<>();
        admin.put("name", bill.getGeneratedBy().getName());
        map.put("generatedBy", admin);

        return map;
    }
}
