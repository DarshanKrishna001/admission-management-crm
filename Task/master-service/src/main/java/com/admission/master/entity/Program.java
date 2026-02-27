package com.admission.master.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "programs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Program {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Program name is required")
    @Column(nullable = false)
    private String name;

    private String code; // e.g., CSE, ECE, MECH

    @NotNull(message = "Course type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CourseType courseType; // UG / PG

    @NotNull(message = "Entry type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EntryType entryType; // REGULAR / LATERAL

    @NotNull(message = "Admission mode is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdmissionMode admissionMode; // GOVERNMENT / MANAGEMENT

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;

    private Integer durationYears;
    private String description;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum CourseType {
        UG, PG
    }

    public enum EntryType {
        REGULAR, LATERAL
    }

    public enum AdmissionMode {
        GOVERNMENT, MANAGEMENT
    }
}