package com.admission.master.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

public class DepartmentDTO {

    @Data
    public static class Request {
        @NotBlank(message = "Department name is required")
        private String name;
        private String code;
        @NotNull(message = "Campus ID is required")
        private Long campusId;
    }

    @Data
    public static class Response {
        private Long id;
        private String name;
        private String code;
        private Long campusId;
        private String campusName;
        private Boolean active;
    }
}