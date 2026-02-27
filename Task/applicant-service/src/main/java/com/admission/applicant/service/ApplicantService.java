package com.admission.applicant.service;

import com.admission.applicant.dto.ApplicantDTO;
import com.admission.applicant.entity.Applicant;
import com.admission.applicant.entity.DocumentChecklist;
import com.admission.applicant.exception.ResourceAlreadyExistsException;
import com.admission.applicant.exception.ResourceNotFoundException;
import com.admission.applicant.repository.ApplicantRepository;
import com.admission.applicant.repository.DocumentChecklistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicantService {

    private final ApplicantRepository applicantRepository;
    private final DocumentChecklistRepository documentRepository;

    public List<ApplicantDTO.Response> getAllApplicants() {
        return applicantRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ApplicantDTO.Response getApplicantById(Long id) {
        return toResponse(findById(id));
    }

    public List<ApplicantDTO.Response> getApplicantsByStatus(Applicant.ApplicantStatus status) {
        return applicantRepository.findByStatus(status).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ApplicantDTO.Response> getApplicantsByProgram(Long programId) {
        return applicantRepository.findByProgramId(programId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ApplicantDTO.Response createApplicant(ApplicantDTO.Request request) {
        if (applicantRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Applicant with email already exists: " + request.getEmail());
        }
        if (request.getAadharNumber() != null && applicantRepository.existsByAadharNumber(request.getAadharNumber())) {
            throw new ResourceAlreadyExistsException("Applicant with Aadhar number already exists");
        }

        Applicant applicant = Applicant.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .category(request.getCategory())
                .entryType(request.getEntryType())
                .quotaType(request.getQuotaType())
                .programId(request.getProgramId())
                .qualifyingExam(request.getQualifyingExam())
                .qualifyingMarks(request.getQualifyingMarks())
                .allotmentNumber(request.getAllotmentNumber())
                .address(request.getAddress())
                .aadharNumber(request.getAadharNumber())
                .status(Applicant.ApplicantStatus.APPLIED)
                .build();

        applicant = applicantRepository.save(applicant);

        // Create default document checklist
        createDefaultDocuments(applicant);

        return toResponse(applicantRepository.findById(applicant.getId()).get());
    }

    private void createDefaultDocuments(Applicant applicant) {
        String[] defaultDocs = {
                "10th Marksheet", "12th/Diploma Marksheet",
                "Transfer Certificate", "Aadhar Card",
                "Passport Photo", "Category Certificate"
        };

        // Add quota-specific document
        if (applicant.getQuotaType() == Applicant.QuotaType.KCET) {
            defaultDocs = new String[]{"10th Marksheet", "12th/PUC Marksheet", "Transfer Certificate",
                    "Aadhar Card", "Passport Photo", "Category Certificate", "KCET Rank Card", "KCET Allotment Letter"};
        } else if (applicant.getQuotaType() == Applicant.QuotaType.COMEDK) {
            defaultDocs = new String[]{"10th Marksheet", "12th/PUC Marksheet", "Transfer Certificate",
                    "Aadhar Card", "Passport Photo", "Category Certificate", "COMEDK Scorecard", "COMEDK Allotment Letter"};
        }

        for (String docName : defaultDocs) {
            DocumentChecklist doc = DocumentChecklist.builder()
                    .applicant(applicant)
                    .documentName(docName)
                    .status(DocumentChecklist.DocumentStatus.PENDING)
                    .build();
            documentRepository.save(doc);
        }
    }

    @Transactional
    public ApplicantDTO.Response updateApplicantStatus(Long id, Applicant.ApplicantStatus status) {
        Applicant applicant = findById(id);
        applicant.setStatus(status);
        return toResponse(applicantRepository.save(applicant));
    }

    // Add a document
    @Transactional
    public ApplicantDTO.DocumentResponse addDocument(Long applicantId, ApplicantDTO.AddDocumentRequest request) {
        Applicant applicant = findById(applicantId);
        DocumentChecklist doc = DocumentChecklist.builder()
                .applicant(applicant)
                .documentName(request.getDocumentName())
                .status(request.getStatus())
                .build();
        return toDocumentResponse(documentRepository.save(doc));
    }

    // Update document status (mark as Submitted or Verified)
    @Transactional
    public ApplicantDTO.DocumentResponse updateDocumentStatus(Long applicantId, Long documentId,
                                                               ApplicantDTO.UpdateDocumentRequest request) {
        findById(applicantId); // ensure applicant exists
        DocumentChecklist doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        doc.setStatus(request.getStatus());
        doc.setRemarks(request.getRemarks());
        if (request.getStatus() == DocumentChecklist.DocumentStatus.VERIFIED) {
            doc.setVerifiedAt(LocalDateTime.now());
            doc.setVerifiedBy(request.getVerifiedBy());
        }
        return toDocumentResponse(documentRepository.save(doc));
    }

    public List<ApplicantDTO.DocumentResponse> getDocumentsByApplicant(Long applicantId) {
        findById(applicantId);
        return documentRepository.findByApplicantId(applicantId)
                .stream().map(this::toDocumentResponse).collect(Collectors.toList());
    }

    private Applicant findById(Long id) {
        return applicantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Applicant not found with id: " + id));
    }

    private ApplicantDTO.Response toResponse(Applicant a) {
        ApplicantDTO.Response res = new ApplicantDTO.Response();
        res.setId(a.getId());
        res.setFirstName(a.getFirstName());
        res.setLastName(a.getLastName());
        res.setEmail(a.getEmail());
        res.setPhone(a.getPhone());
        res.setDateOfBirth(a.getDateOfBirth());
        res.setGender(a.getGender() != null ? a.getGender().name() : null);
        res.setCategory(a.getCategory() != null ? a.getCategory().name() : null);
        res.setEntryType(a.getEntryType() != null ? a.getEntryType().name() : null);
        res.setQuotaType(a.getQuotaType() != null ? a.getQuotaType().name() : null);
        res.setProgramId(a.getProgramId());
        res.setQualifyingExam(a.getQualifyingExam());
        res.setQualifyingMarks(a.getQualifyingMarks());
        res.setAllotmentNumber(a.getAllotmentNumber());
        res.setAddress(a.getAddress());
        res.setAadharNumber(a.getAadharNumber());
        res.setStatus(a.getStatus().name());
        res.setCreatedAt(a.getCreatedAt());

        if (a.getDocuments() != null) {
            res.setDocuments(a.getDocuments().stream().map(this::toDocumentResponse).collect(Collectors.toList()));
        }
        return res;
    }

    private ApplicantDTO.DocumentResponse toDocumentResponse(DocumentChecklist d) {
        ApplicantDTO.DocumentResponse res = new ApplicantDTO.DocumentResponse();
        res.setId(d.getId());
        res.setDocumentName(d.getDocumentName());
        res.setStatus(d.getStatus().name());
        res.setRemarks(d.getRemarks());
        res.setVerifiedAt(d.getVerifiedAt());
        res.setVerifiedBy(d.getVerifiedBy());
        return res;
    }
}