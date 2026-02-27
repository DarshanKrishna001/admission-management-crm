package com.admission.applicant.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "applicants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Applicant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ---- Application Form Fields (max 15 as per BRS) ----
    @Column(nullable = false)
    private String firstName;           // 1

    @Column(nullable = false)
    private String lastName;            // 2

    @Column(nullable = false, unique = true)
    private String email;               // 3

    @Column(nullable = false)
    private String phone;               // 4

    private LocalDate dateOfBirth;      // 5

    @Enumerated(EnumType.STRING)
    private Gender gender;              // 6

    @Enumerated(EnumType.STRING)
    private Category category;          // 7 - GM/SC/ST etc.

    @Enumerated(EnumType.STRING)
    private EntryType entryType;        // 8 - REGULAR/LATERAL

    @Enumerated(EnumType.STRING)
    private QuotaType quotaType;        // 9 - KCET/COMEDK/MANAGEMENT

    private Long programId;             // 10 - selected program

    private String qualifyingExam;      // 11 - e.g., SSLC, PUC, Diploma

    private Double qualifyingMarks;     // 12 - marks/percentage

    private String allotmentNumber;     // 13 - for govt quota (KCET/COMEDK allotment)

    private String address;             // 14

    private String aadharNumber;        // 15

    // ---- Internal Status Fields ----
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicantStatus status;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "applicant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DocumentChecklist> documents;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = ApplicantStatus.APPLIED;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum Gender { MALE, FEMALE, OTHER }

    public enum Category { GM, SC, ST, OBC, EWS, NRI, MANAGEMENT }

    public enum EntryType { REGULAR, LATERAL }

    public enum QuotaType { KCET, COMEDK, MANAGEMENT }

    public enum ApplicantStatus {
        APPLIED,
        DOCUMENTS_PENDING,
        DOCUMENTS_SUBMITTED,
        DOCUMENTS_VERIFIED,
        SEAT_ALLOCATED,
        FEE_PENDING,
        ADMITTED,
        CANCELLED
    }
}