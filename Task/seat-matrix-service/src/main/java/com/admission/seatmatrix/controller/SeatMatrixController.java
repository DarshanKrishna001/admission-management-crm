package com.admission.seatmatrix.controller;

import com.admission.seatmatrix.dto.SeatMatrixDTO;
import com.admission.seatmatrix.entity.QuotaSeat;
import com.admission.seatmatrix.service.SeatMatrixService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
public class SeatMatrixController {

    private final SeatMatrixService seatMatrixService;

    // Create seat matrix for a program
    @PostMapping("/matrix")
    public ResponseEntity<SeatMatrixDTO.Response> createSeatMatrix(@Valid @RequestBody SeatMatrixDTO.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(seatMatrixService.createSeatMatrix(request));
    }

    // Get all seat matrices
    @GetMapping("/matrix")
    public ResponseEntity<List<SeatMatrixDTO.Response>> getAllSeatMatrices() {
        return ResponseEntity.ok(seatMatrixService.getAllSeatMatrices());
    }

    // Get seat matrix by ID
    @GetMapping("/matrix/{id}")
    public ResponseEntity<SeatMatrixDTO.Response> getSeatMatrixById(@PathVariable Long id) {
        return ResponseEntity.ok(seatMatrixService.getSeatMatrixById(id));
    }

    // Get seat matrix by program ID
    @GetMapping("/matrix/program/{programId}")
    public ResponseEntity<SeatMatrixDTO.Response> getSeatMatrixByProgram(@PathVariable Long programId) {
        return ResponseEntity.ok(seatMatrixService.getSeatMatrixByProgramId(programId));
    }

    // Check availability for a quota (used by Admission Officers before allocating)
    @GetMapping("/availability")
    public ResponseEntity<SeatMatrixDTO.SeatAvailabilityResponse> checkAvailability(
            @RequestParam Long programId,
            @RequestParam QuotaSeat.QuotaType quotaType) {
        return ResponseEntity.ok(seatMatrixService.checkAvailability(programId, quotaType));
    }

    // Lock a seat (called internally by Admission Service)
    @PostMapping("/lock")
    public ResponseEntity<Void> lockSeat(
            @RequestParam Long programId,
            @RequestParam QuotaSeat.QuotaType quotaType) {
        seatMatrixService.lockSeat(programId, quotaType);
        return ResponseEntity.ok().build();
    }

    // Release a seat (cancellation)
    @PostMapping("/release")
    public ResponseEntity<Void> releaseSeat(
            @RequestParam Long programId,
            @RequestParam QuotaSeat.QuotaType quotaType) {
        seatMatrixService.releaseSeat(programId, quotaType);
        return ResponseEntity.ok().build();
    }
}