package com.admission.fee.repository;

import com.admission.fee.entity.FeeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeeRepository extends JpaRepository<FeeRecord, Long> {
    Optional<FeeRecord> findByApplicantId(Long applicantId);
    List<FeeRecord> findByStatus(FeeRecord.FeeStatus status);
    boolean existsByApplicantId(Long applicantId);
}