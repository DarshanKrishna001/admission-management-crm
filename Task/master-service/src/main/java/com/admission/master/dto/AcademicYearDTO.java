package com.admission.master.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

public class AcademicYearDTO {

    @Data
    public static class Request {
        @NotBlank(message = "Academic year name is required")
        private String name;
        @NotNull(message = "Start year is required")
        private Integer startYear;
        @NotNull(message = "End year is required")
        private Integer endYear;
        private Boolean isCurrent = false;
    }

    @Data
    public static class Response {
        private Long id;
        private String name;
        private Integer startYear;
        private Integer endYear;
        private Boolean isCurrent;
        private Boolean active;
    }
}