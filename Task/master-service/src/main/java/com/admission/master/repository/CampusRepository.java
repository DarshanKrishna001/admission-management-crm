package com.admission.master.repository;

import com.admission.master.entity.Campus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampusRepository extends JpaRepository<Campus, Long> {
    List<Campus> findByInstitutionIdAndActiveTrue(Long institutionId);
    List<Campus> findByActiveTrue();
}