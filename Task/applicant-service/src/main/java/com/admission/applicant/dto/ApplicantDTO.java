package com.admission.applicant.dto;

import com.admission.applicant.entity.Applicant;
import com.admission.applicant.entity.DocumentChecklist;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class ApplicantDTO {

    @Data
    public static class Request {
        @NotBlank(message = "First name is required")
        private String firstName;

        @NotBlank(message = "Last name is required")
        private String lastName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Phone is required")
        private String phone;

        private LocalDate dateOfBirth;

        @NotNull(message = "Gender is required")
        private Applicant.Gender gender;

        @NotNull(message = "Category is required")
        private Applicant.Category category;

        @NotNull(message = "Entry type is required")
        private Applicant.EntryType entryType;

        @NotNull(message = "Quota type is required")
        private Applicant.QuotaType quotaType;

        @NotNull(message = "Program ID is required")
        private Long programId;

        private String qualifyingExam;
        private Double qualifyingMarks;
        private String allotmentNumber; // Required for KCET/COMEDK
        private String address;
        private String aadharNumber;
    }

    @Data
    public static class Response {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private LocalDate dateOfBirth;
        private String gender;
        private String category;
        private String entryType;
        private String quotaType;
        private Long programId;
        private String qualifyingExam;
        private Double qualifyingMarks;
        private String allotmentNumber;
        private String address;
        private String aadharNumber;
        private String status;
        private LocalDateTime createdAt;
        private List<DocumentResponse> documents;
    }

    @Data
    public static class DocumentResponse {
        private Long id;
        private String documentName;
        private String status;
        private String remarks;
        private LocalDateTime verifiedAt;
        private String verifiedBy;
    }

    @Data
    public static class UpdateDocumentRequest {
        @NotNull(message = "Document status is required")
        private DocumentChecklist.DocumentStatus status;
        private String remarks;
        private String verifiedBy;
    }

    @Data
    public static class AddDocumentRequest {
        @NotBlank(message = "Document name is required")
        private String documentName;
        private DocumentChecklist.DocumentStatus status = DocumentChecklist.DocumentStatus.PENDING;
    }
}