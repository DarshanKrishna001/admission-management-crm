package com.admission.admissionservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "fee-service", path = "/api/fees")
public interface FeeServiceClient {

    @GetMapping("/applicant/{applicantId}/status")
    FeeStatusResponse getFeeStatus(@PathVariable Long applicantId);

    record FeeStatusResponse(
            Long applicantId, String status, Boolean isPaid
    ) {}
}