package com.admission.fee.service;

import com.admission.fee.dto.FeeDTO;
import com.admission.fee.entity.FeeRecord;
import com.admission.fee.exception.ResourceNotFoundException;
import com.admission.fee.repository.FeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeeService {

    private final FeeRepository feeRepository;

    public List<FeeDTO.Response> getAllFees() {
        return feeRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<FeeDTO.Response> getPendingFees() {
        return feeRepository.findByStatus(FeeRecord.FeeStatus.PENDING)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public FeeDTO.Response getFeeByApplicantId(Long applicantId) {
        FeeRecord record = feeRepository.findByApplicantId(applicantId)
                .orElseThrow(() -> new ResourceNotFoundException("Fee record not found for applicant: " + applicantId));
        return toResponse(record);
    }

    @Transactional
    public FeeDTO.Response createFeeRecord(FeeDTO.CreateRequest request) {
        if (feeRepository.existsByApplicantId(request.getApplicantId())) {
            throw new IllegalArgumentException("Fee record already exists for applicant: " + request.getApplicantId());
        }
        FeeRecord record = FeeRecord.builder()
                .applicantId(request.getApplicantId())
                .programId(request.getProgramId())
                .status(FeeRecord.FeeStatus.PENDING)
                .amount(request.getAmount())
                .remarks(request.getRemarks())
                .build();
        return toResponse(feeRepository.save(record));
    }

    @Transactional
    public FeeDTO.Response updateFeeStatus(Long applicantId, FeeDTO.UpdateRequest request) {
        FeeRecord record = feeRepository.findByApplicantId(applicantId)
                .orElseThrow(() -> new ResourceNotFoundException("Fee record not found for applicant: " + applicantId));

        record.setStatus(request.getStatus());
        if (request.getAmount() != null) record.setAmount(request.getAmount());
        if (request.getRemarks() != null) record.setRemarks(request.getRemarks());
        record.setUpdatedBy(request.getUpdatedBy());

        if (request.getStatus() == FeeRecord.FeeStatus.PAID) {
            record.setPaidAt(LocalDateTime.now());
        }

        return toResponse(feeRepository.save(record));
    }

    private FeeDTO.Response toResponse(FeeRecord r) {
        FeeDTO.Response res = new FeeDTO.Response();
        res.setId(r.getId());
        res.setApplicantId(r.getApplicantId());
        res.setProgramId(r.getProgramId());
        res.setStatus(r.getStatus().name());
        res.setIsPaid(r.getStatus() == FeeRecord.FeeStatus.PAID);
        res.setAmount(r.getAmount());
        res.setRemarks(r.getRemarks());
        res.setUpdatedBy(r.getUpdatedBy());
        res.setCreatedAt(r.getCreatedAt());
        res.setPaidAt(r.getPaidAt());
        return res;
    }
}