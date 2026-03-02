//package com.admission.master.entity;
//
//import jakarta.persistence.*;
//import jakarta.validation.constraints.NotBlank;
//import lombok.*;
//
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "academic_years")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//public class AcademicYear {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @NotBlank(message = "Academic year name is required")
//    @Column(nullable = false, unique = true)
//    private String name; // e.g., 2025-2026
//
//    @Column(nullable = false)
//    private Integer startYear;
//
//    // 1 = January ... 12 = December
//    @Column(nullable = false)
//    private Integer startMonth; // e.g., 6 (June)
//
//    @Column(nullable = false)
//    private Integer endYear;
//
//    @Column(nullable = false)
//    private Integer endMonth;   // e.g., 5 (May)
//
//    private Boolean isCurrent = false;
//
//    @Column(nullable = false)
//    private Boolean active = true;
//
//    @Column(updatable = false)
//    private LocalDateTime createdAt;
//
//    private LocalDateTime updatedAt;
//
//    @PrePersist
//    public void prePersist() {
//        this.createdAt = LocalDateTime.now();
//        this.updatedAt = LocalDateTime.now();
//        if (this.startMonth == null) this.startMonth = 6;  // default June
//        if (this.endMonth   == null) this.endMonth   = 5;  // default May
//    }
//
//    @PreUpdate
//    public void preUpdate() {
//        this.updatedAt = LocalDateTime.now();
//    }
//}






package com.admission.master.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "academic_years")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademicYear {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Academic year name is required")
    @Column(nullable = false, unique = true)
    private String name; // e.g., 2025-2026

    @Column(nullable = false)
    private Integer startYear;

    @Column(nullable = false)
    private Integer endYear;

    private Boolean isCurrent = false;

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
}