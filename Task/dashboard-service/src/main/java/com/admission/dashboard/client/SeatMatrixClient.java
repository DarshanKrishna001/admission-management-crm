package com.admission.dashboard.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(name = "seat-matrix-service", path = "/api/seats")
public interface SeatMatrixClient {

    @GetMapping("/matrix")
    List<Map<String, Object>> getAllSeatMatrices();
}