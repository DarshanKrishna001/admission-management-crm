package com.admission.admissionservice.controller;

import com.admission.admissionservice.dto.AdmissionDTO;
import com.admission.admissionservice.entity.AdmissionRecord;
import com.admission.admissionservice.service.AdmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admissions")
@RequiredArgsConstructor
public class AdmissionController {

    private final AdmissionService admissionService;

    // Get all admissions
    @GetMapping
    public ResponseEntity<List<AdmissionDTO.Response>> getAllAdmissions(
            @RequestParam(required = false) AdmissionRecord.AdmissionStatus status,
            @RequestParam(required = false) Long programId) {
        if (status != null) {
            return ResponseEntity.ok(admissionService.getAdmissionsByStatus(status));
        }
        if (programId != null) {
            return ResponseEntity.ok(admissionService.getAdmissionsByProgram(programId));
        }
        return ResponseEntity.ok(admissionService.getAllAdmissions());
    }

    // Get admission by ID
    @GetMapping("/{id}")
    public ResponseEntity<AdmissionDTO.Response> getAdmissionById(@PathVariable Long id) {
        return ResponseEntity.ok(admissionService.getAdmissionById(id));
    }

    // Get admission by applicant ID
    @GetMapping("/applicant/{applicantId}")
    public ResponseEntity<AdmissionDTO.Response> getAdmissionByApplicant(@PathVariable Long applicantId) {
        return ResponseEntity.ok(admissionService.getAdmissionByApplicantId(applicantId));
    }

    // Step 1: Allocate a seat
    @PostMapping("/allocate")
    public ResponseEntity<AdmissionDTO.Response> allocateSeat(@Valid @RequestBody AdmissionDTO.AllocateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(admissionService.allocateSeat(request));
    }

    // Step 2: Confirm admission (requires fee to be paid)
    @PostMapping("/{id}/confirm")
    public ResponseEntity<AdmissionDTO.Response> confirmAdmission(@PathVariable Long id) {
        return ResponseEntity.ok(admissionService.confirmAdmission(id));
    }

    // Cancel admission
    @PostMapping("/{id}/cancel")
    public ResponseEntity<AdmissionDTO.Response> cancelAdmission(@PathVariable Long id) {
        return ResponseEntity.ok(admissionService.cancelAdmission(id));
    }
}