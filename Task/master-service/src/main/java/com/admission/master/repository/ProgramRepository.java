package com.admission.master.repository;

import com.admission.master.entity.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgramRepository extends JpaRepository<Program, Long> {
    List<Program> findByDepartmentIdAndActiveTrue(Long departmentId);
    List<Program> findByActiveTrue();
    List<Program> findByAcademicYearIdAndActiveTrue(Long academicYearId);
}