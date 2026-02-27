package com.admission.master.service;

import com.admission.master.dto.InstitutionDTO;
import com.admission.master.entity.Institution;
import com.admission.master.exception.ResourceAlreadyExistsException;
import com.admission.master.exception.ResourceNotFoundException;
import com.admission.master.repository.InstitutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InstitutionService {

    private final InstitutionRepository institutionRepository;

    public List<InstitutionDTO.Response> getAllInstitutions() {
        return institutionRepository.findByActiveTrue()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public InstitutionDTO.Response getInstitutionById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public InstitutionDTO.Response createInstitution(InstitutionDTO.Request request) {
        if (institutionRepository.existsByName(request.getName())) {
            throw new ResourceAlreadyExistsException("Institution with name '" + request.getName() + "' already exists");
        }
        Institution institution = Institution.builder()
                .name(request.getName())
                .code(request.getCode())
                .address(request.getAddress())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .jkTotalLimit(request.getJkTotalLimit())
                .active(true)
                .build();
        return toResponse(institutionRepository.save(institution));
    }

    @Transactional
    public InstitutionDTO.Response updateInstitution(Long id, InstitutionDTO.Request request) {
        Institution institution = findById(id);
        institution.setName(request.getName());
        institution.setCode(request.getCode());
        institution.setAddress(request.getAddress());
        institution.setContactEmail(request.getContactEmail());
        institution.setContactPhone(request.getContactPhone());
        institution.setJkTotalLimit(request.getJkTotalLimit());
        return toResponse(institutionRepository.save(institution));
    }

    @Transactional
    public void deleteInstitution(Long id) {
        Institution institution = findById(id);
        institution.setActive(false);
        institutionRepository.save(institution);
    }

    private Institution findById(Long id) {
        return institutionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found with id: " + id));
    }

    private InstitutionDTO.Response toResponse(Institution i) {
        InstitutionDTO.Response res = new InstitutionDTO.Response();
        res.setId(i.getId());
        res.setName(i.getName());
        res.setCode(i.getCode());
        res.setAddress(i.getAddress());
        res.setContactEmail(i.getContactEmail());
        res.setContactPhone(i.getContactPhone());
        res.setJkTotalLimit(i.getJkTotalLimit());
        res.setActive(i.getActive());
        return res;
    }
}