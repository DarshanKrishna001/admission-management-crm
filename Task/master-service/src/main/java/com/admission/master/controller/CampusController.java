package com.admission.master.controller;

import com.admission.master.dto.CampusDTO;
import com.admission.master.service.CampusService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/master/campuses")
@RequiredArgsConstructor
public class CampusController {

    private final CampusService campusService;

    @GetMapping
    public ResponseEntity<List<CampusDTO.Response>> getAllCampuses() {
        return ResponseEntity.ok(campusService.getAllCampuses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CampusDTO.Response> getCampusById(@PathVariable Long id) {
        return ResponseEntity.ok(campusService.getCampusById(id));
    }

    @GetMapping("/institution/{institutionId}")
    public ResponseEntity<List<CampusDTO.Response>> getCampusesByInstitution(@PathVariable Long institutionId) {
        return ResponseEntity.ok(campusService.getCampusesByInstitution(institutionId));
    }

    @PostMapping
    public ResponseEntity<CampusDTO.Response> createCampus(@Valid @RequestBody CampusDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(campusService.createCampus(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CampusDTO.Response> updateCampus(@PathVariable Long id,
                                                            @Valid @RequestBody CampusDTO.Request request) {
        return ResponseEntity.ok(campusService.updateCampus(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCampus(@PathVariable Long id) {
        campusService.deleteCampus(id);
        return ResponseEntity.noContent().build();
    }
}