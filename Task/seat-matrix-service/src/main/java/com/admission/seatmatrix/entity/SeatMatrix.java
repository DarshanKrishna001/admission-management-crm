package com.admission.seatmatrix.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * SeatMatrix holds the intake and quota configuration for a Program.
 * Each program has ONE SeatMatrix with multiple QuotaSeats.
 */
@Entity
@Table(name = "seat_matrices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatMatrix {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Reference to Program in master-service (no FK across services)
    @Column(nullable = false, unique = true)
    private Long programId;

    @Column(nullable = false)
    private Integer totalIntake; // e.g., 100

    // Supernumerary seats (separate counter, does not count against intake)
    private Integer supernumerarySeats = 0;

    @Column(nullable = false, updatable = false)
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