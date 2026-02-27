package com.admission.admissionservice.service;

import com.admission.admissionservice.client.FeeServiceClient;
import com.admission.admissionservice.client.SeatMatrixClient;
import com.admission.admissionservice.dto.AdmissionDTO;
import com.admission.admissionservice.entity.AdmissionRecord;
import com.admission.admissionservice.exception.AdmissionException;
import com.admission.admissionservice.exception.ResourceNotFoundException;
import com.admission.admissionservice.repository.AdmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdmissionService {

    private final AdmissionRepository admissionRepository;
    private final SeatMatrixClient seatMatrixClient;
    private final FeeServiceClient feeServiceClient;

    /**
     * Step 1: Allocate a seat.
     * - Check if applicant already has an admission.
     * - Check seat availability via Seat Matrix Service.
     * - Lock the seat.
     * - Save allocation record.
     */
    @Transactional
    public AdmissionDTO.Response allocateSeat(AdmissionDTO.AllocateRequest request) {
        // Check if already admitted
        if (admissionRepository.existsByApplicantId(request.getApplicantId())) {
            throw new AdmissionException("Applicant " + request.getApplicantId() + " already has a seat allocated.");
        }

        // Check seat availability
        SeatMatrixClient.SeatAvailabilityResponse availability =
                seatMatrixClient.checkAvailability(request.getProgramId(), request.getQuotaType().name());

        if (!availability.isAvailable()) {
            throw new AdmissionException("Seat allocation failed: " + availability.message() +
                    " Quota: " + request.getQuotaType() + " for Program: " + request.getProgramId());
        }

        // Lock the seat (pessimistic lock in seat-matrix-service)
        seatMatrixClient.lockSeat(request.getProgramId(), request.getQuotaType().name());

        // Save admission record
        AdmissionRecord record = AdmissionRecord.builder()
                .applicantId(request.getApplicantId())
                .programId(request.getProgramId())
                .quotaType(request.getQuotaType())
                .status(AdmissionRecord.AdmissionStatus.ALLOCATED)
                .allotmentNumber(request.getAllotmentNumber())
                .institutionCode(request.getInstitutionCode())
                .programCode(request.getProgramCode())
                .courseType(request.getCourseType())
                .academicYear(request.getAcademicYear())
                .processedBy(request.getProcessedBy())
                .build();

        return toResponse(admissionRepository.save(record));
    }

    /**
     * Step 2: Confirm Admission.
     * - Requires fee to be PAID.
     * - Generates unique, immutable admission number.
     * Format: INST/2026/UG/CSE/KCET/0001
     */
    @Transactional
    public AdmissionDTO.Response confirmAdmission(Long admissionId) {
        AdmissionRecord record = findById(admissionId);

        if (record.getStatus() == AdmissionRecord.AdmissionStatus.CONFIRMED) {
            throw new AdmissionException("Admission is already confirmed with number: " + record.getAdmissionNumber());
        }

        if (record.getStatus() == AdmissionRecord.AdmissionStatus.CANCELLED) {
            throw new AdmissionException("Cannot confirm a cancelled admission.");
        }

        // Check fee status
        try {
            FeeServiceClient.FeeStatusResponse feeStatus = feeServiceClient.getFeeStatus(record.getApplicantId());
            if (!feeStatus.isPaid()) {
                throw new AdmissionException("Admission cannot be confirmed: Fee is not yet PAID for applicant " + record.getApplicantId());
            }
        } catch (AdmissionException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AdmissionException("Unable to verify fee status. Please ensure fee service is running. Error: " + ex.getMessage());
        }

        // Generate unique, immutable admission number
        String admissionNumber = generateAdmissionNumber(record);
        record.setAdmissionNumber(admissionNumber);
        record.setStatus(AdmissionRecord.AdmissionStatus.CONFIRMED);
        record.setConfirmedAt(LocalDateTime.now());

        return toResponse(admissionRepository.save(record));
    }

    /**
     * Cancel an admission - releases the seat back.
     */
    @Transactional
    public AdmissionDTO.Response cancelAdmission(Long admissionId) {
        AdmissionRecord record = findById(admissionId);

        if (record.getStatus() == AdmissionRecord.AdmissionStatus.CANCELLED) {
            throw new AdmissionException("Admission is already cancelled.");
        }

        // Release the seat back to quota
        seatMatrixClient.releaseSeat(record.getProgramId(), record.getQuotaType().name());

        record.setStatus(AdmissionRecord.AdmissionStatus.CANCELLED);
        return toResponse(admissionRepository.save(record));
    }

    public AdmissionDTO.Response getAdmissionById(Long id) {
        return toResponse(findById(id));
    }

    public AdmissionDTO.Response getAdmissionByApplicantId(Long applicantId) {
        AdmissionRecord record = admissionRepository.findByApplicantId(applicantId)
                .orElseThrow(() -> new ResourceNotFoundException("No admission record found for applicant: " + applicantId));
        return toResponse(record);
    }

    public List<AdmissionDTO.Response> getAllAdmissions() {
        return admissionRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<AdmissionDTO.Response> getAdmissionsByStatus(AdmissionRecord.AdmissionStatus status) {
        return admissionRepository.findByStatus(status).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<AdmissionDTO.Response> getAdmissionsByProgram(Long programId) {
        return admissionRepository.findByProgramId(programId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Generates admission number in format: INST/2026/UG/CSE/KCET/0001
     * This is generated only ONCE and is immutable.
     */
    private String generateAdmissionNumber(AdmissionRecord record) {
        String instCode = record.getInstitutionCode() != null ? record.getInstitutionCode().toUpperCase() : "INST";
        String year = record.getAcademicYear() != null ? String.valueOf(record.getAcademicYear()) : String.valueOf(LocalDateTime.now().getYear());
        String course = record.getCourseType() != null ? record.getCourseType().toUpperCase() : "UG";
        String program = record.getProgramCode() != null ? record.getProgramCode().toUpperCase() : "GEN";
        String quota = record.getQuotaType().name();

        // Get the sequential number for this program+quota combination
        long count = admissionRepository.countByProgramIdAndQuotaType(record.getProgramId(), record.getQuotaType()) + 1;
        String seq = String.format("%04d", count);

        return instCode + "/" + year + "/" + course + "/" + program + "/" + quota + "/" + seq;
    }

    private AdmissionRecord findById(Long id) {
        return admissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admission record not found with id: " + id));
    }

    private AdmissionDTO.Response toResponse(AdmissionRecord r) {
        AdmissionDTO.Response res = new AdmissionDTO.Response();
        res.setId(r.getId());
        res.setApplicantId(r.getApplicantId());
        res.setProgramId(r.getProgramId());
        res.setQuotaType(r.getQuotaType().name());
        res.setAdmissionNumber(r.getAdmissionNumber());
        res.setStatus(r.getStatus().name());
        res.setAllotmentNumber(r.getAllotmentNumber());
        res.setInstitutionCode(r.getInstitutionCode());
        res.setProgramCode(r.getProgramCode());
        res.setCourseType(r.getCourseType());
        res.setAcademicYear(r.getAcademicYear());
        res.setAllocatedAt(r.getAllocatedAt());
        res.setConfirmedAt(r.getConfirmedAt());
        res.setProcessedBy(r.getProcessedBy());
        return res;
    }
}