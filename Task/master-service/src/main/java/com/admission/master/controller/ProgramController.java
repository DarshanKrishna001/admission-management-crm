package com.admission.master.controller;

import com.admission.master.dto.ProgramDTO;
import com.admission.master.service.ProgramService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/master/programs")
@RequiredArgsConstructor
public class ProgramController {

    private final ProgramService programService;

    @GetMapping
    public ResponseEntity<List<ProgramDTO.Response>> getAllPrograms() {
        return ResponseEntity.ok(programService.getAllPrograms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgramDTO.Response> getProgramById(@PathVariable Long id) {
        return ResponseEntity.ok(programService.getProgramById(id));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<ProgramDTO.Response>> getProgramsByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(programService.getProgramsByDepartment(departmentId));
    }

    @GetMapping("/academic-year/{academicYearId}")
    public ResponseEntity<List<ProgramDTO.Response>> getProgramsByAcademicYear(@PathVariable Long academicYearId) {
        return ResponseEntity.ok(programService.getProgramsByAcademicYear(academicYearId));
    }

    @PostMapping
    public ResponseEntity<ProgramDTO.Response> createProgram(@Valid @RequestBody ProgramDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(programService.createProgram(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgramDTO.Response> updateProgram(@PathVariable Long id,
                                                              @Valid @RequestBody ProgramDTO.Request request) {
        return ResponseEntity.ok(programService.updateProgram(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProgram(@PathVariable Long id) {
        programService.deleteProgram(id);
        return ResponseEntity.noContent().build();
    }
}