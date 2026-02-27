package com.admission.admissionservice.repository;

import com.admission.admissionservice.entity.AdmissionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdmissionRepository extends JpaRepository<AdmissionRecord, Long> {
    Optional<AdmissionRecord> findByApplicantId(Long applicantId);
    Optional<AdmissionRecord> findByAdmissionNumber(String admissionNumber);
    List<AdmissionRecord> findByProgramId(Long programId);
    List<AdmissionRecord> findByProgramIdAndQuotaType(Long programId, AdmissionRecord.QuotaType quotaType);
    List<AdmissionRecord> findByStatus(AdmissionRecord.AdmissionStatus status);
    boolean existsByApplicantId(Long applicantId);

    // For sequential admission number generation
    long countByProgramIdAndQuotaType(Long programId, AdmissionRecord.QuotaType quotaType);
}