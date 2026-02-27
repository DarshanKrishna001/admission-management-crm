package com.admission.dashboard.controller;

import com.admission.dashboard.client.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final SeatMatrixClient seatMatrixClient;
    private final ApplicantClient applicantClient;
    private final AdmissionClient admissionClient;
    private final FeeClient feeClient;

    /**
     * Main dashboard overview
     * Shows: total intake vs admitted, quota-wise seats, remaining seats,
     * pending docs, fee pending list
     */
    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview() {
        Map<String, Object> overview = new LinkedHashMap<>();

        // Seat matrix summary
        try {
            List<Map<String, Object>> seatMatrices = seatMatrixClient.getAllSeatMatrices();
            int totalIntake = 0, totalAdmitted = 0, totalAvailable = 0;
            List<Map<String, Object>> programSummaries = new ArrayList<>();

            for (Map<String, Object> matrix : seatMatrices) {
                totalIntake += toInt(matrix.get("totalIntake"));
                totalAdmitted += toInt(matrix.get("totalAdmitted"));
                totalAvailable += toInt(matrix.get("totalAvailable"));

                Map<String, Object> prog = new LinkedHashMap<>();
                prog.put("programId", matrix.get("programId"));
                prog.put("totalIntake", matrix.get("totalIntake"));
                prog.put("totalAdmitted", matrix.get("totalAdmitted"));
                prog.put("totalAvailable", matrix.get("totalAvailable"));
                prog.put("quotas", matrix.get("quotas"));
                programSummaries.add(prog);
            }

            overview.put("totalIntake", totalIntake);
            overview.put("totalAdmitted", totalAdmitted);
            overview.put("totalAvailable", totalAvailable);
            overview.put("programs", programSummaries);
        } catch (Exception e) {
            overview.put("seatMatrixError", "Could not fetch seat data: " + e.getMessage());
        }

        // Applicants with pending documents
        try {
            List<Map<String, Object>> allApplicants = applicantClient.getAllApplicants();
            long pendingDocs = allApplicants.stream()
                    .filter(a -> "DOCUMENTS_PENDING".equals(a.get("status")) || "APPLIED".equals(a.get("status")))
                    .count();
            overview.put("applicantsWithPendingDocs", pendingDocs);
            overview.put("totalApplicants", allApplicants.size());
        } catch (Exception e) {
            overview.put("applicantError", "Could not fetch applicant data: " + e.getMessage());
        }

        // Fee pending list
        try {
            List<Map<String, Object>> pendingFees = feeClient.getPendingFees(true);
            overview.put("feePendingCount", pendingFees.size());
            overview.put("feePendingList", pendingFees);
        } catch (Exception e) {
            overview.put("feeError", "Could not fetch fee data: " + e.getMessage());
        }

        // Admitted count
        try {
            List<Map<String, Object>> admissions = admissionClient.getAllAdmissions();
            long confirmed = admissions.stream()
                    .filter(a -> "CONFIRMED".equals(a.get("status"))).count();
            long allocated = admissions.stream()
                    .filter(a -> "ALLOCATED".equals(a.get("status"))).count();
            overview.put("confirmedAdmissions", confirmed);
            overview.put("pendingConfirmation", allocated);
        } catch (Exception e) {
            overview.put("admissionError", "Could not fetch admission data: " + e.getMessage());
        }

        return ResponseEntity.ok(overview);
    }

    /**
     * Quota-wise seat status for a specific program
     */
    @GetMapping("/seats")
    public ResponseEntity<List<Map<String, Object>>> getSeatStatus() {
        return ResponseEntity.ok(seatMatrixClient.getAllSeatMatrices());
    }

    /**
     * Fee pending list
     */
    @GetMapping("/fees/pending")
    public ResponseEntity<List<Map<String, Object>>> getFeePendingList() {
        return ResponseEntity.ok(feeClient.getPendingFees(true));
    }

    /**
     * Applicants with pending documents
     */
    @GetMapping("/applicants/pending-docs")
    public ResponseEntity<List<Map<String, Object>>> getPendingDocApplicants() {
        return ResponseEntity.ok(applicantClient.getApplicantsByStatus("DOCUMENTS_PENDING"));
    }

    private int toInt(Object val) {
        if (val == null) return 0;
        if (val instanceof Number) return ((Number) val).intValue();
        try { return Integer.parseInt(val.toString()); } catch (Exception e) { return 0; }
    }
}