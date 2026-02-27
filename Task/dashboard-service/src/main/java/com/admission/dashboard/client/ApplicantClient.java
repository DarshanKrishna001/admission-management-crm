package com.admission.dashboard.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(name = "applicant-service", path = "/api/applicants")
public interface ApplicantClient {
    @GetMapping
    List<Map<String, Object>> getAllApplicants();

    @GetMapping(params = "status")
    List<Map<String, Object>> getApplicantsByStatus(@RequestParam String status);
}