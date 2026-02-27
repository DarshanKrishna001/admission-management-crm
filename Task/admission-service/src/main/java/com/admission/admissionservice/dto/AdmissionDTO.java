package com.admission.admissionservice.dto;

import com.admission.admissionservice.entity.AdmissionRecord;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

public class AdmissionDTO {

    // Request to allocate a seat
    @Data
    public static class AllocateRequest {
        @NotNull(message = "Applicant ID is required")
        private Long applicantId;

        @NotNull(message = "Program ID is required")
        private Long programId;

        @NotNull(message = "Quota type is required")
        private AdmissionRecord.QuotaType quotaType;

        private String allotmentNumber; // Required for KCET/COMEDK
        private String processedBy;

        // Metadata for admission number generation
        private String institutionCode;
        private String programCode;
        private String courseType; // UG / PG
        private Integer academicYear;
    }

    // Response
    @Data
    public static class Response {
        private Long id;
        private Long applicantId;
        private Long programId;
        private String quotaType;
        private String admissionNumber;
        private String status;
        private String allotmentNumber;
        private String institutionCode;
        private String programCode;
        private String courseType;
        private Integer academicYear;
        private LocalDateTime allocatedAt;
        private LocalDateTime confirmedAt;
        private String processedBy;
    }
}