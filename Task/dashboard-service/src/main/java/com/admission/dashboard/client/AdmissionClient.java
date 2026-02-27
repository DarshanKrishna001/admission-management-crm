package com.admission.dashboard.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(name = "admission-service", path = "/api/admissions")
public interface AdmissionClient {
    @GetMapping
    List<Map<String, Object>> getAllAdmissions();
}