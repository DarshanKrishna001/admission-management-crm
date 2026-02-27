package com.admission.applicant.repository;

import com.admission.applicant.entity.Applicant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicantRepository extends JpaRepository<Applicant, Long> {
    Optional<Applicant> findByEmail(String email);
    List<Applicant> findByStatus(Applicant.ApplicantStatus status);
    List<Applicant> findByProgramId(Long programId);
    List<Applicant> findByProgramIdAndQuotaType(Long programId, Applicant.QuotaType quotaType);
    boolean existsByEmail(String email);
    boolean existsByAadharNumber(String aadharNumber);
}