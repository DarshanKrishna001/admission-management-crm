package com.admission.dashboard.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(name = "fee-service", path = "/api/fees")
public interface FeeClient {
    @GetMapping
    List<Map<String, Object>> getAllFees();

    @GetMapping(params = "pendingOnly=true")
    List<Map<String, Object>> getPendingFees(@RequestParam Boolean pendingOnly);
}