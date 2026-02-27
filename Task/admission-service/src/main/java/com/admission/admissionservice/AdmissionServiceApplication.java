package com.admission.admissionservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class AdmissionServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AdmissionServiceApplication.class, args);
    }
}