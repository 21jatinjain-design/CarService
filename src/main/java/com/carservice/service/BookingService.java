package com.carservice.service;

import com.carservice.dto.BookingRequest;
import com.carservice.entity.*;
import com.carservice.repository.CarServiceRepository;
import com.carservice.repository.ServiceRequestRepository;
import com.carservice.repository.UserRepository;
import lombok.Data;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Data
public class BookingService {

    private final ServiceRequestRepository serviceRequestRepository;
    private final CarServiceRepository carServiceRepository;
    private final UserRepository userRepository;

    public BookingService(ServiceRequestRepository serviceRequestRepository, CarServiceRepository carServiceRepository, UserRepository userRepository) {
        this.serviceRequestRepository = serviceRequestRepository;
        this.carServiceRepository = carServiceRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ServiceRequest createBooking(Long userId, BookingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ServiceRequest sr = ServiceRequest.builder()
                .user(user)
                .carModel(request.getCarModel())
                .carNumber(request.getCarNumber())
                .notes(request.getNotes())
                .build();

        // We need to save first to get the ID, then add items
        sr = serviceRequestRepository.save(sr);

        for (Long serviceId : request.getServiceIds()) {
            CarService cs = carServiceRepository.findById(serviceId)
                    .orElseThrow(() -> new RuntimeException("Service not found: " + serviceId));

            ServiceRequestItem item = ServiceRequestItem.builder()
                    .serviceRequest(sr)
                    .carService(cs)
                    .build();

            sr.getItems().add(item);
        }

        return serviceRequestRepository.save(sr);
    }

    public List<ServiceRequest> getMyBookings(Long userId) {
        return serviceRequestRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<ServiceRequest> getManagerBookings(Long managerId) {
        return serviceRequestRepository.findByManagerIdOrderByCreatedAtDesc(managerId);
    }

    public List<ServiceRequest> getAllBookings() {
        return serviceRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public ServiceRequest updateStatus(Long bookingId, String status) {
        ServiceRequest sr = serviceRequestRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        sr.setStatus(RequestStatus.valueOf(status));
        return serviceRequestRepository.save(sr);
    }

    @Transactional
    public ServiceRequest assignManager(Long bookingId, Long managerId) {
        ServiceRequest sr = serviceRequestRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        if (manager.getRole() != Role.MANAGER) {
            throw new RuntimeException("User is not a manager");
        }

        sr.setManager(manager);
        sr.setStatus(RequestStatus.ASSIGNED);
        return serviceRequestRepository.save(sr);
    }

    public ServiceRequest getBookingById(Long id) {
        return serviceRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }
}
