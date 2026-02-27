package com.admission.applicant.repository;

import com.admission.applicant.entity.DocumentChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentChecklistRepository extends JpaRepository<DocumentChecklist, Long> {
    List<DocumentChecklist> findByApplicantId(Long applicantId);
    List<DocumentChecklist> findByApplicantIdAndStatus(Long applicantId, DocumentChecklist.DocumentStatus status);
    long countByApplicantIdAndStatus(Long applicantId, DocumentChecklist.DocumentStatus status);
}