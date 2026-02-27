package com.admission.seatmatrix.service;

import com.admission.seatmatrix.dto.SeatMatrixDTO;
import com.admission.seatmatrix.entity.QuotaSeat;
import com.admission.seatmatrix.entity.SeatMatrix;
import com.admission.seatmatrix.exception.QuotaFullException;
import com.admission.seatmatrix.exception.ResourceNotFoundException;
import com.admission.seatmatrix.repository.QuotaSeatRepository;
import com.admission.seatmatrix.repository.SeatMatrixRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeatMatrixService {

    private final SeatMatrixRepository seatMatrixRepository;
    private final QuotaSeatRepository quotaSeatRepository;

    /**
     * Create a seat matrix for a program.
     * Validates: sum of quota seats == totalIntake
     */
    @Transactional
    public SeatMatrixDTO.Response createSeatMatrix(SeatMatrixDTO.CreateRequest request) {
        if (seatMatrixRepository.existsByProgramId(request.getProgramId())) {
            throw new IllegalArgumentException("Seat matrix already exists for program ID: " + request.getProgramId());
        }

        // Validate quota sum == totalIntake
        int quotaSum = request.getQuotas().stream().mapToInt(SeatMatrixDTO.QuotaRequest::getTotalSeats).sum();
        if (quotaSum != request.getTotalIntake()) {
            throw new IllegalArgumentException(
                    "Sum of quota seats (" + quotaSum + ") must equal total intake (" + request.getTotalIntake() + ")");
        }

        SeatMatrix seatMatrix = SeatMatrix.builder()
                .programId(request.getProgramId())
                .totalIntake(request.getTotalIntake())
                .supernumerarySeats(request.getSupernumerarySeats() != null ? request.getSupernumerarySeats() : 0)
                .build();
        seatMatrix = seatMatrixRepository.save(seatMatrix);

        final SeatMatrix savedMatrix = seatMatrix;
        for (SeatMatrixDTO.QuotaRequest quotaReq : request.getQuotas()) {
            QuotaSeat quotaSeat = QuotaSeat.builder()
                    .seatMatrix(savedMatrix)
                    .quotaType(quotaReq.getQuotaType())
                    .totalSeats(quotaReq.getTotalSeats())
                    .admittedSeats(0)
                    .build();
            quotaSeatRepository.save(quotaSeat);
        }

        return toResponse(seatMatrix);
    }

    public SeatMatrixDTO.Response getSeatMatrixByProgramId(Long programId) {
        SeatMatrix matrix = seatMatrixRepository.findByProgramId(programId)
                .orElseThrow(() -> new ResourceNotFoundException("Seat matrix not found for program ID: " + programId));
        return toResponse(matrix);
    }

    public SeatMatrixDTO.Response getSeatMatrixById(Long id) {
        SeatMatrix matrix = seatMatrixRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seat matrix not found with ID: " + id));
        return toResponse(matrix);
    }

    public List<SeatMatrixDTO.Response> getAllSeatMatrices() {
        return seatMatrixRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Check if a seat is available for the given program and quota.
     */
    public SeatMatrixDTO.SeatAvailabilityResponse checkAvailability(Long programId, QuotaSeat.QuotaType quotaType) {
        SeatMatrix matrix = seatMatrixRepository.findByProgramId(programId)
                .orElseThrow(() -> new ResourceNotFoundException("Seat matrix not found for program ID: " + programId));

        QuotaSeat quotaSeat = quotaSeatRepository.findBySeatMatrixIdAndQuotaType(matrix.getId(), quotaType)
                .orElseThrow(() -> new ResourceNotFoundException("Quota " + quotaType + " not configured for this program"));

        SeatMatrixDTO.SeatAvailabilityResponse response = new SeatMatrixDTO.SeatAvailabilityResponse();
        response.setProgramId(programId);
        response.setSeatMatrixId(matrix.getId());
        response.setQuotaType(quotaType.name());
        response.setTotalSeats(quotaSeat.getTotalSeats());
        response.setAdmittedSeats(quotaSeat.getAdmittedSeats());
        response.setAvailableSeats(quotaSeat.getAvailableSeats());
        response.setIsAvailable(!quotaSeat.isFull());
        response.setMessage(quotaSeat.isFull() ? "Quota is FULL. No seats available." : "Seats available.");
        return response;
    }

    /**
     * Lock/Increment a seat for a given program and quota.
     * Uses pessimistic locking to prevent overbooking.
     * Called by Admission Service when confirming an allocation.
     */
    @Transactional
    public void lockSeat(Long programId, QuotaSeat.QuotaType quotaType) {
        SeatMatrix matrix = seatMatrixRepository.findByProgramId(programId)
                .orElseThrow(() -> new ResourceNotFoundException("Seat matrix not found for program ID: " + programId));

        QuotaSeat quotaSeat = quotaSeatRepository.findBySeatMatrixIdAndQuotaTypeForUpdate(matrix.getId(), quotaType)
                .orElseThrow(() -> new ResourceNotFoundException("Quota " + quotaType + " not configured for this program"));

        if (quotaSeat.isFull()) {
            throw new QuotaFullException("Quota " + quotaType + " is full for program ID: " + programId +
                    ". No seats available.");
        }

        quotaSeat.setAdmittedSeats(quotaSeat.getAdmittedSeats() + 1);
        quotaSeatRepository.save(quotaSeat);
    }

    /**
     * Release a seat (for cancellation scenarios).
     */
    @Transactional
    public void releaseSeat(Long programId, QuotaSeat.QuotaType quotaType) {
        SeatMatrix matrix = seatMatrixRepository.findByProgramId(programId)
                .orElseThrow(() -> new ResourceNotFoundException("Seat matrix not found for program ID: " + programId));

        QuotaSeat quotaSeat = quotaSeatRepository.findBySeatMatrixIdAndQuotaTypeForUpdate(matrix.getId(), quotaType)
                .orElseThrow(() -> new ResourceNotFoundException("Quota " + quotaType + " not configured for this program"));

        if (quotaSeat.getAdmittedSeats() > 0) {
            quotaSeat.setAdmittedSeats(quotaSeat.getAdmittedSeats() - 1);
            quotaSeatRepository.save(quotaSeat);
        }
    }

    private SeatMatrixDTO.Response toResponse(SeatMatrix matrix) {
        List<QuotaSeat> quotaSeats = quotaSeatRepository.findBySeatMatrixId(matrix.getId());

        SeatMatrixDTO.Response res = new SeatMatrixDTO.Response();
        res.setId(matrix.getId());
        res.setProgramId(matrix.getProgramId());
        res.setTotalIntake(matrix.getTotalIntake());
        res.setSupernumerarySeats(matrix.getSupernumerarySeats());

        int totalAdmitted = quotaSeats.stream().mapToInt(QuotaSeat::getAdmittedSeats).sum();
        res.setTotalAdmitted(totalAdmitted);
        res.setTotalAvailable(matrix.getTotalIntake() - totalAdmitted);

        List<SeatMatrixDTO.QuotaResponse> quotaResponses = quotaSeats.stream().map(qs -> {
            SeatMatrixDTO.QuotaResponse qr = new SeatMatrixDTO.QuotaResponse();
            qr.setId(qs.getId());
            qr.setQuotaType(qs.getQuotaType().name());
            qr.setTotalSeats(qs.getTotalSeats());
            qr.setAdmittedSeats(qs.getAdmittedSeats());
            qr.setAvailableSeats(qs.getAvailableSeats());
            qr.setIsFull(qs.isFull());
            return qr;
        }).collect(Collectors.toList());

        res.setQuotas(quotaResponses);
        return res;
    }
}