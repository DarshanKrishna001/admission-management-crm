package com.admission.master.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class InstitutionDTO {

    @Data
    public static class Request {
        @NotBlank(message = "Institution name is required")
        private String name;
        private String code;
        private String address;
        private String contactEmail;
        private String contactPhone;
        private Integer jkTotalLimit;
    }

    @Data
    public static class Response {
        private Long id;
        private String name;
        private String code;
        private String address;
        private String contactEmail;
        private String contactPhone;
        private Integer jkTotalLimit;
        private Boolean active;
    }
}