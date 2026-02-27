package com.admission.seatmatrix.repository;

import com.admission.seatmatrix.entity.SeatMatrix;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SeatMatrixRepository extends JpaRepository<SeatMatrix, Long> {
    Optional<SeatMatrix> findByProgramId(Long programId);
    boolean existsByProgramId(Long programId);
}