package com.admission.master.controller;

import com.admission.master.dto.AcademicYearDTO;
import com.admission.master.service.AcademicYearService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/master/academic-years")
@RequiredArgsConstructor
public class AcademicYearController {

    private final AcademicYearService academicYearService;

    @GetMapping
    public ResponseEntity<List<AcademicYearDTO.Response>> getAllAcademicYears() {
        return ResponseEntity.ok(academicYearService.getAllAcademicYears());
    }

    @GetMapping("/current")
    public ResponseEntity<AcademicYearDTO.Response> getCurrentAcademicYear() {
        return ResponseEntity.ok(academicYearService.getCurrentAcademicYear());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AcademicYearDTO.Response> getAcademicYearById(@PathVariable Long id) {
        return ResponseEntity.ok(academicYearService.getAcademicYearById(id));
    }

    @PostMapping
    public ResponseEntity<AcademicYearDTO.Response> createAcademicYear(@Valid @RequestBody AcademicYearDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(academicYearService.createAcademicYear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AcademicYearDTO.Response> updateAcademicYear(@PathVariable Long id,
                                                                        @Valid @RequestBody AcademicYearDTO.Request request) {
        return ResponseEntity.ok(academicYearService.updateAcademicYear(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAcademicYear(@PathVariable Long id) {
        academicYearService.deleteAcademicYear(id);
        return ResponseEntity.noContent().build();
    }
}