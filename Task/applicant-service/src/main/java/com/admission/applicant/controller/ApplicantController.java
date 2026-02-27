package com.admission.applicant.controller;

import com.admission.applicant.dto.ApplicantDTO;
import com.admission.applicant.entity.Applicant;
import com.admission.applicant.service.ApplicantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applicants")
@RequiredArgsConstructor
public class ApplicantController {

    private final ApplicantService applicantService;

    @GetMapping
    public ResponseEntity<List<ApplicantDTO.Response>> getAllApplicants(
            @RequestParam(required = false) Applicant.ApplicantStatus status,
            @RequestParam(required = false) Long programId) {
        if (status != null) {
            return ResponseEntity.ok(applicantService.getApplicantsByStatus(status));
        }
        if (programId != null) {
            return ResponseEntity.ok(applicantService.getApplicantsByProgram(programId));
        }
        return ResponseEntity.ok(applicantService.getAllApplicants());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicantDTO.Response> getApplicantById(@PathVariable Long id) {
        return ResponseEntity.ok(applicantService.getApplicantById(id));
    }

    @PostMapping
    public ResponseEntity<ApplicantDTO.Response> createApplicant(@Valid @RequestBody ApplicantDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicantService.createApplicant(request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApplicantDTO.Response> updateApplicantStatus(
            @PathVariable Long id,
            @RequestParam Applicant.ApplicantStatus status) {
        return ResponseEntity.ok(applicantService.updateApplicantStatus(id, status));
    }

    // Document endpoints
    @GetMapping("/{applicantId}/documents")
    public ResponseEntity<List<ApplicantDTO.DocumentResponse>> getDocuments(@PathVariable Long applicantId) {
        return ResponseEntity.ok(applicantService.getDocumentsByApplicant(applicantId));
    }

    @PostMapping("/{applicantId}/documents")
    public ResponseEntity<ApplicantDTO.DocumentResponse> addDocument(
            @PathVariable Long applicantId,
            @Valid @RequestBody ApplicantDTO.AddDocumentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicantService.addDocument(applicantId, request));
    }

    @PatchMapping("/{applicantId}/documents/{documentId}")
    public ResponseEntity<ApplicantDTO.DocumentResponse> updateDocumentStatus(
            @PathVariable Long applicantId,
            @PathVariable Long documentId,
            @Valid @RequestBody ApplicantDTO.UpdateDocumentRequest request) {
        return ResponseEntity.ok(applicantService.updateDocumentStatus(applicantId, documentId, request));
    }
}