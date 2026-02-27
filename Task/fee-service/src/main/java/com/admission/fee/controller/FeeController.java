package com.admission.fee.controller;

import com.admission.fee.dto.FeeDTO;
import com.admission.fee.service.FeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fees")
@RequiredArgsConstructor
public class FeeController {

    private final FeeService feeService;

    @GetMapping
    public ResponseEntity<List<FeeDTO.Response>> getAllFees(
            @RequestParam(required = false) Boolean pendingOnly) {
        if (Boolean.TRUE.equals(pendingOnly)) {
            return ResponseEntity.ok(feeService.getPendingFees());
        }
        return ResponseEntity.ok(feeService.getAllFees());
    }

    @GetMapping("/applicant/{applicantId}/status")
    public ResponseEntity<FeeDTO.Response> getFeeByApplicant(@PathVariable Long applicantId) {
        return ResponseEntity.ok(feeService.getFeeByApplicantId(applicantId));
    }

    @PostMapping
    public ResponseEntity<FeeDTO.Response> createFeeRecord(@Valid @RequestBody FeeDTO.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feeService.createFeeRecord(request));
    }

    // Mark fee as PAID or update status
    @PatchMapping("/applicant/{applicantId}")
    public ResponseEntity<FeeDTO.Response> updateFeeStatus(@PathVariable Long applicantId,
                                                            @Valid @RequestBody FeeDTO.UpdateRequest request) {
        return ResponseEntity.ok(feeService.updateFeeStatus(applicantId, request));
    }
}