package com.admission.master.controller;

import com.admission.master.dto.InstitutionDTO;
import com.admission.master.service.InstitutionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/master/institutions")
@RequiredArgsConstructor
public class InstitutionController {

    private final InstitutionService institutionService;

    @GetMapping
    public ResponseEntity<List<InstitutionDTO.Response>> getAllInstitutions() {
        return ResponseEntity.ok(institutionService.getAllInstitutions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InstitutionDTO.Response> getInstitutionById(@PathVariable Long id) {
        return ResponseEntity.ok(institutionService.getInstitutionById(id));
    }

    @PostMapping
    public ResponseEntity<InstitutionDTO.Response> createInstitution(@Valid @RequestBody InstitutionDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(institutionService.createInstitution(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InstitutionDTO.Response> updateInstitution(@PathVariable Long id,
                                                                      @Valid @RequestBody InstitutionDTO.Request request) {
        return ResponseEntity.ok(institutionService.updateInstitution(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInstitution(@PathVariable Long id) {
        institutionService.deleteInstitution(id);
        return ResponseEntity.noContent().build();
    }
}