package com.admission.master.repository;

import com.admission.master.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByCampusIdAndActiveTrue(Long campusId);
    List<Department> findByActiveTrue();
}