package com.admission.fee.dto;

import com.admission.fee.entity.FeeRecord;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

public class FeeDTO {

    @Data
    public static class CreateRequest {
        @NotNull(message = "Applicant ID is required")
        private Long applicantId;
        @NotNull(message = "Program ID is required")
        private Long programId;
        private Double amount;
        private String remarks;
    }

    @Data
    public static class UpdateRequest {
        @NotNull(message = "Fee status is required")
        private FeeRecord.FeeStatus status;
        private Double amount;
        private String remarks;
        private String updatedBy;
    }

    @Data
    public static class Response {
        private Long id;
        private Long applicantId;
        private Long programId;
        private String status;
        private Boolean isPaid;
        private Double amount;
        private String remarks;
        private String updatedBy;
        private LocalDateTime createdAt;
        private LocalDateTime paidAt;
    }
}