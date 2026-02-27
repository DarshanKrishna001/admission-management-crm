package com.admission.master.service;

import com.admission.master.dto.DepartmentDTO;
import com.admission.master.entity.Campus;
import com.admission.master.entity.Department;
import com.admission.master.exception.ResourceNotFoundException;
import com.admission.master.repository.CampusRepository;
import com.admission.master.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final CampusRepository campusRepository;

    public List<DepartmentDTO.Response> getAllDepartments() {
        return departmentRepository.findByActiveTrue()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<DepartmentDTO.Response> getDepartmentsByCampus(Long campusId) {
        return departmentRepository.findByCampusIdAndActiveTrue(campusId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public DepartmentDTO.Response getDepartmentById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public DepartmentDTO.Response createDepartment(DepartmentDTO.Request request) {
        Campus campus = campusRepository.findById(request.getCampusId())
                .orElseThrow(() -> new ResourceNotFoundException("Campus not found with id: " + request.getCampusId()));

        Department department = Department.builder()
                .name(request.getName())
                .code(request.getCode())
                .campus(campus)
                .active(true)
                .build();
        return toResponse(departmentRepository.save(department));
    }

    @Transactional
    public DepartmentDTO.Response updateDepartment(Long id, DepartmentDTO.Request request) {
        Department department = findById(id);
        Campus campus = campusRepository.findById(request.getCampusId())
                .orElseThrow(() -> new ResourceNotFoundException("Campus not found with id: " + request.getCampusId()));
        department.setName(request.getName());
        department.setCode(request.getCode());
        department.setCampus(campus);
        return toResponse(departmentRepository.save(department));
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department department = findById(id);
        department.setActive(false);
        departmentRepository.save(department);
    }

    private Department findById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
    }

    private DepartmentDTO.Response toResponse(Department d) {
        DepartmentDTO.Response res = new DepartmentDTO.Response();
        res.setId(d.getId());
        res.setName(d.getName());
        res.setCode(d.getCode());
        res.setCampusId(d.getCampus().getId());
        res.setCampusName(d.getCampus().getName());
        res.setActive(d.getActive());
        return res;
    }
}