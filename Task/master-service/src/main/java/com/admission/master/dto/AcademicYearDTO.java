//package com.admission.master.dto;
//
//import jakarta.validation.constraints.Max;
//import jakarta.validation.constraints.Min;
//import jakarta.validation.constraints.NotBlank;
//import jakarta.validation.constraints.NotNull;
//import lombok.Data;
//
//public class AcademicYearDTO {
//
//    @Data
//    public static class Request {
//
//        @NotBlank(message = "Academic year name is required")
//        private String name;
//
//        @NotNull(message = "Start year is required")
//        private Integer startYear;
//
//        @NotNull(message = "Start month is required")
//        @Min(value = 1,  message = "Start month must be between 1 and 12")
//        @Max(value = 12, message = "Start month must be between 1 and 12")
//        private Integer startMonth; // 1 = Jan, 12 = Dec
//
//        @NotNull(message = "End year is required")
//        private Integer endYear;
//
//        @NotNull(message = "End month is required")
//        @Min(value = 1,  message = "End month must be between 1 and 12")
//        @Max(value = 12, message = "End month must be between 1 and 12")
//        private Integer endMonth;
//
//        private Boolean isCurrent = false;
//    }
//
//    @Data
//    public static class Response {
//        private Long    id;
//        private String  name;
//        private Integer startYear;
//        private Integer startMonth;
//        private String  startMonthName;  // e.g. "June"
//        private Integer endYear;
//        private Integer endMonth;
//        private String  endMonthName;    // e.g. "May"
//        private Boolean isCurrent;
//        private Boolean active;
//    }
//}







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