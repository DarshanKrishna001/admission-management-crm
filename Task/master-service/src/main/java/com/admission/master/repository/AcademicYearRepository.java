package com.admission.master.repository;

import com.admission.master.entity.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AcademicYearRepository extends JpaRepository<AcademicYear, Long> {
    List<AcademicYear> findByActiveTrue();
    Optional<AcademicYear> findByIsCurrentTrue();
}