package com.admission.master.dto;

import com.admission.master.entity.Program;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

public class ProgramDTO {

    @Data
    public static class Request {
        @NotBlank(message = "Program name is required")
        private String name;
        private String code;
        @NotNull(message = "Course type is required")
        private Program.CourseType courseType;
        @NotNull(message = "Entry type is required")
        private Program.EntryType entryType;
        @NotNull(message = "Admission mode is required")
        private Program.AdmissionMode admissionMode;
        @NotNull(message = "Department ID is required")
        private Long departmentId;
        @NotNull(message = "Academic year ID is required")
        private Long academicYearId;
        private Integer durationYears;
        private String description;
    }

    @Data
    public static class Response {
        private Long id;
        private String name;
        private String code;
        private String courseType;
        private String entryType;
        private String admissionMode;
        private Long departmentId;
        private String departmentName;
        private Long academicYearId;
        private String academicYearName;
        private Integer durationYears;
        private String description;
        private Boolean active;
    }
}