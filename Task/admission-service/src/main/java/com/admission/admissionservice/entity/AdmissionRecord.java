package com.admission.admissionservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "admission_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdmissionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long applicantId;

    @Column(nullable = false)
    private Long programId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuotaType quotaType;

    // Admission Number - generated ONCE and immutable
    // Format: INST/2026/UG/CSE/KCET/0001
    @Column(unique = true)
    private String admissionNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdmissionStatus status;

    // For Government flow
    private String allotmentNumber;

    // Metadata
    private String institutionCode;
    private String programCode;
    private String courseType;
    private Integer academicYear;

    @Column(updatable = false)
    private LocalDateTime allocatedAt;

    private LocalDateTime confirmedAt;
    private String processedBy;

    @PrePersist
    public void prePersist() {
        this.allocatedAt = LocalDateTime.now();
        if (this.status == null) this.status = AdmissionStatus.ALLOCATED;
    }

    public enum QuotaType {
        KCET, COMEDK, MANAGEMENT
    }

    public enum AdmissionStatus {
        ALLOCATED,      // Seat locked
        CONFIRMED,      // Admission number generated (fee paid)
        CANCELLED
    }
}