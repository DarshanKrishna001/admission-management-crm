package com.admission.seatmatrix.dto;

import com.admission.seatmatrix.entity.QuotaSeat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

public class SeatMatrixDTO {

    @Data
    public static class CreateRequest {
        @NotNull(message = "Program ID is required")
        private Long programId;

        @NotNull(message = "Total intake is required")
        @Min(value = 1, message = "Total intake must be at least 1")
        private Integer totalIntake;

        private Integer supernumerarySeats = 0;

        @NotNull(message = "Quota allocations are required")
        private List<QuotaRequest> quotas;
    }

    @Data
    public static class QuotaRequest {
        @NotNull(message = "Quota type is required")
        private QuotaSeat.QuotaType quotaType;

        @NotNull(message = "Total seats for quota is required")
        @Min(value = 0, message = "Seats cannot be negative")
        private Integer totalSeats;
    }

    @Data
    public static class Response {
        private Long id;
        private Long programId;
        private Integer totalIntake;
        private Integer supernumerarySeats;
        private Integer totalAdmitted;
        private Integer totalAvailable;
        private List<QuotaResponse> quotas;
    }

    @Data
    public static class QuotaResponse {
        private Long id;
        private String quotaType;
        private Integer totalSeats;
        private Integer admittedSeats;
        private Integer availableSeats;
        private Boolean isFull;
    }

    @Data
    public static class SeatAvailabilityResponse {
        private Long programId;
        private Long seatMatrixId;
        private String quotaType;
        private Integer totalSeats;
        private Integer admittedSeats;
        private Integer availableSeats;
        private Boolean isAvailable;
        private String message;
    }
}