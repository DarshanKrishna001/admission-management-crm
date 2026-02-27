package com.admission.seatmatrix.repository;

import com.admission.seatmatrix.entity.QuotaSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuotaSeatRepository extends JpaRepository<QuotaSeat, Long> {
    List<QuotaSeat> findBySeatMatrixId(Long seatMatrixId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT qs FROM QuotaSeat qs WHERE qs.seatMatrix.id = :seatMatrixId AND qs.quotaType = :quotaType")
    Optional<QuotaSeat> findBySeatMatrixIdAndQuotaTypeForUpdate(Long seatMatrixId, QuotaSeat.QuotaType quotaType);

    Optional<QuotaSeat> findBySeatMatrixIdAndQuotaType(Long seatMatrixId, QuotaSeat.QuotaType quotaType);

    @Query("SELECT SUM(qs.totalSeats) FROM QuotaSeat qs WHERE qs.seatMatrix.id = :seatMatrixId")
    Integer sumTotalSeatsBySeatMatrixId(Long seatMatrixId);
}