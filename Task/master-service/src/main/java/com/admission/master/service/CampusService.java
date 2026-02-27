package com.admission.master.service;

import com.admission.master.dto.CampusDTO;
import com.admission.master.entity.Campus;
import com.admission.master.entity.Institution;
import com.admission.master.exception.ResourceNotFoundException;
import com.admission.master.repository.CampusRepository;
import com.admission.master.repository.InstitutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CampusService {

    private final CampusRepository campusRepository;
    private final InstitutionRepository institutionRepository;

    public List<CampusDTO.Response> getAllCampuses() {
        return campusRepository.findByActiveTrue()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<CampusDTO.Response> getCampusesByInstitution(Long institutionId) {
        return campusRepository.findByInstitutionIdAndActiveTrue(institutionId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public CampusDTO.Response getCampusById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public CampusDTO.Response createCampus(CampusDTO.Request request) {
        Institution institution = institutionRepository.findById(request.getInstitutionId())
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found with id: " + request.getInstitutionId()));

        Campus campus = Campus.builder()
                .name(request.getName())
                .code(request.getCode())
                .location(request.getLocation())
                .institution(institution)
                .active(true)
                .build();
        return toResponse(campusRepository.save(campus));
    }

    @Transactional
    public CampusDTO.Response updateCampus(Long id, CampusDTO.Request request) {
        Campus campus = findById(id);
        Institution institution = institutionRepository.findById(request.getInstitutionId())
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found with id: " + request.getInstitutionId()));
        campus.setName(request.getName());
        campus.setCode(request.getCode());
        campus.setLocation(request.getLocation());
        campus.setInstitution(institution);
        return toResponse(campusRepository.save(campus));
    }

    @Transactional
    public void deleteCampus(Long id) {
        Campus campus = findById(id);
        campus.setActive(false);
        campusRepository.save(campus);
    }

    private Campus findById(Long id) {
        return campusRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campus not found with id: " + id));
    }

    private CampusDTO.Response toResponse(Campus c) {
        CampusDTO.Response res = new CampusDTO.Response();
        res.setId(c.getId());
        res.setName(c.getName());
        res.setCode(c.getCode());
        res.setLocation(c.getLocation());
        res.setInstitutionId(c.getInstitution().getId());
        res.setInstitutionName(c.getInstitution().getName());
        res.setActive(c.getActive());
        return res;
    }
}