package com.admission.master.service;

import com.admission.master.dto.ProgramDTO;
import com.admission.master.entity.AcademicYear;
import com.admission.master.entity.Department;
import com.admission.master.entity.Program;
import com.admission.master.exception.ResourceNotFoundException;
import com.admission.master.repository.AcademicYearRepository;
import com.admission.master.repository.DepartmentRepository;
import com.admission.master.repository.ProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgramService {

    private final ProgramRepository programRepository;
    private final DepartmentRepository departmentRepository;
    private final AcademicYearRepository academicYearRepository;

    public List<ProgramDTO.Response> getAllPrograms() {
        return programRepository.findByActiveTrue()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ProgramDTO.Response> getProgramsByDepartment(Long departmentId) {
        return programRepository.findByDepartmentIdAndActiveTrue(departmentId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ProgramDTO.Response> getProgramsByAcademicYear(Long academicYearId) {
        return programRepository.findByAcademicYearIdAndActiveTrue(academicYearId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ProgramDTO.Response getProgramById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public ProgramDTO.Response createProgram(ProgramDTO.Request request) {
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));
        AcademicYear academicYear = academicYearRepository.findById(request.getAcademicYearId())
                .orElseThrow(() -> new ResourceNotFoundException("Academic Year not found with id: " + request.getAcademicYearId()));

        Program program = Program.builder()
                .name(request.getName())
                .code(request.getCode())
                .courseType(request.getCourseType())
                .entryType(request.getEntryType())
                .admissionMode(request.getAdmissionMode())
                .department(department)
                .academicYear(academicYear)
                .durationYears(request.getDurationYears())
                .description(request.getDescription())
                .active(true)
                .build();
        return toResponse(programRepository.save(program));
    }

    @Transactional
    public ProgramDTO.Response updateProgram(Long id, ProgramDTO.Request request) {
        Program program = findById(id);
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));
        AcademicYear academicYear = academicYearRepository.findById(request.getAcademicYearId())
                .orElseThrow(() -> new ResourceNotFoundException("Academic Year not found with id: " + request.getAcademicYearId()));

        program.setName(request.getName());
        program.setCode(request.getCode());
        program.setCourseType(request.getCourseType());
        program.setEntryType(request.getEntryType());
        program.setAdmissionMode(request.getAdmissionMode());
        program.setDepartment(department);
        program.setAcademicYear(academicYear);
        program.setDurationYears(request.getDurationYears());
        program.setDescription(request.getDescription());
        return toResponse(programRepository.save(program));
    }

    @Transactional
    public void deleteProgram(Long id) {
        Program program = findById(id);
        program.setActive(false);
        programRepository.save(program);
    }

    private Program findById(Long id) {
        return programRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Program not found with id: " + id));
    }

    private ProgramDTO.Response toResponse(Program p) {
        ProgramDTO.Response res = new ProgramDTO.Response();
        res.setId(p.getId());
        res.setName(p.getName());
        res.setCode(p.getCode());
        res.setCourseType(p.getCourseType().name());
        res.setEntryType(p.getEntryType().name());
        res.setAdmissionMode(p.getAdmissionMode().name());
        res.setDepartmentId(p.getDepartment().getId());
        res.setDepartmentName(p.getDepartment().getName());
        res.setAcademicYearId(p.getAcademicYear().getId());
        res.setAcademicYearName(p.getAcademicYear().getName());
        res.setDurationYears(p.getDurationYears());
        res.setDescription(p.getDescription());
        res.setActive(p.getActive());
        return res;
    }
}