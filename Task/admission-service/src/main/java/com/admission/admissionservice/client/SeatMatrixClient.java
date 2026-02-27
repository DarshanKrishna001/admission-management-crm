package com.admission.admissionservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

// ============================
// Seat Matrix Service Client
// ============================
@FeignClient(name = "seat-matrix-service", path = "/api/seats")
public interface SeatMatrixClient {

    @GetMapping("/availability")
    SeatAvailabilityResponse checkAvailability(@RequestParam Long programId,
                                                @RequestParam String quotaType);

    @PostMapping("/lock")
    void lockSeat(@RequestParam Long programId,
                  @RequestParam String quotaType);

    @PostMapping("/release")
    void releaseSeat(@RequestParam Long programId,
                     @RequestParam String quotaType);

    record SeatAvailabilityResponse(
            Long programId, Long seatMatrixId, String quotaType,
            Integer totalSeats, Integer admittedSeats, Integer availableSeats,
            Boolean isAvailable, String message
    ) {}
}