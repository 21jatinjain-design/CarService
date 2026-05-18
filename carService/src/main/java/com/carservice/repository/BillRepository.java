package com.carservice.repository;

import com.carservice.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Long> {
    Optional<Bill> findByServiceRequestId(Long serviceRequestId);
    List<Bill> findByServiceRequestUserId(Long userId);
    List<Bill> findAllByOrderByGeneratedAtDesc();
}
