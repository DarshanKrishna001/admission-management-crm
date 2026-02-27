package com.admission.seatmatrix.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * QuotaSeat holds the per-quota allocation for a SeatMatrix.
 * Quota types: KCET, COMEDK, MANAGEMENT
 * Rule: sum of all quota seats must equal totalIntake
 */
@Entity
@Table(name = "quota_seats",
        uniqueConstraints = @UniqueConstraint(columnNames = {"seat_matrix_id", "quotaType"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuotaSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_matrix_id", nullable = false)
    private SeatMatrix seatMatrix;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuotaType quotaType; // KCET / COMEDK / MANAGEMENT

    @Column(nullable = false)
    private Integer totalSeats; // Allocated seats for this quota

    @Column(nullable = false)
    private Integer admittedSeats = 0; // Real-time counter (seats taken)

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Computed fields (not persisted)
    @Transient
    public Integer getAvailableSeats() {
        return totalSeats - admittedSeats;
    }

    @Transient
    public boolean isFull() {
        return admittedSeats >= totalSeats;
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum QuotaType {
        KCET, COMEDK, MANAGEMENT
    }
}