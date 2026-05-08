package com.carservice.service;

import com.carservice.entity.*;
import com.carservice.repository.BillRepository;
import com.carservice.repository.ServiceRequestRepository;
import com.carservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BillService {

    private final BillRepository billRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final UserRepository userRepository;

    @Transactional
    public Bill generateBill(Long serviceRequestId, Long adminId) {
        // Check if bill already exists
        if (billRepository.findByServiceRequestId(serviceRequestId).isPresent()) {
            throw new RuntimeException("Bill already generated for this booking");
        }

        ServiceRequest sr = serviceRequestRepository.findById(serviceRequestId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (sr.getStatus() != RequestStatus.COMPLETED) {
            throw new RuntimeException("Cannot generate bill. Service is not completed yet.");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        // Calculate subtotal from selected services
        double subtotal = sr.getItems().stream()
                .mapToDouble(item -> item.getCarService().getPrice())
                .sum();

        double tax = subtotal * 0.18; // 18% GST
        double total = subtotal + tax;

        Bill bill = Bill.builder()
                .serviceRequest(sr)
                .subtotal(subtotal)
                .tax(tax)
                .total(total)
                .generatedBy(admin)
                .isPaid(false)
                .build();

        return billRepository.save(bill);
    }

    public List<Bill> getAllBills() {
        return billRepository.findAllByOrderByGeneratedAtDesc();
    }

    public List<Bill> getUserBills(Long userId) {
        return billRepository.findByServiceRequestUserId(userId);
    }

    public Bill getBillByBookingId(Long bookingId) {
        return billRepository.findByServiceRequestId(bookingId).orElse(null);
    }
}
