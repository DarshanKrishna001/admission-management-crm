package com.admission.master.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

public class CampusDTO {

    @Data
    public static class Request {
        @NotBlank(message = "Campus name is required")
        private String name;
        private String code;
        private String location;
        @NotNull(message = "Institution ID is required")
        private Long institutionId;
    }

    @Data
    public static class Response {
        private Long id;
        private String name;
        private String code;
        private String location;
        private Long institutionId;
        private String institutionName;
        private Boolean active;
    }
}