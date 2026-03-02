//package com.admission.master.service;
//
//import com.admission.master.dto.AcademicYearDTO;
//import com.admission.master.entity.AcademicYear;
//import com.admission.master.exception.ResourceNotFoundException;
//import com.admission.master.repository.AcademicYearRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.Month;
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//@RequiredArgsConstructor
//public class AcademicYearService {
//
//    private final AcademicYearRepository academicYearRepository;
//
//    public List<AcademicYearDTO.Response> getAllAcademicYears() {
//        return academicYearRepository.findByActiveTrue()
//                .stream().map(this::toResponse).collect(Collectors.toList());
//    }
//
//    public AcademicYearDTO.Response getAcademicYearById(Long id) {
//        return toResponse(findById(id));
//    }
//
//    public AcademicYearDTO.Response getCurrentAcademicYear() {
//        AcademicYear ay = academicYearRepository.findByIsCurrentTrue()
//                .orElseThrow(() -> new ResourceNotFoundException("No current academic year set"));
//        return toResponse(ay);
//    }
//
//    @Transactional
//    public AcademicYearDTO.Response createAcademicYear(AcademicYearDTO.Request request) {
//        // If this is set as current, unset others
//        if (Boolean.TRUE.equals(request.getIsCurrent())) {
//            academicYearRepository.findByIsCurrentTrue().ifPresent(ay -> {
//                ay.setIsCurrent(false);
//                academicYearRepository.save(ay);
//            });
//        }
//
//        AcademicYear ay = AcademicYear.builder()
//                .name(request.getName())
//                .startYear(request.getStartYear())
//                .startMonth(request.getStartMonth())
//                .endYear(request.getEndYear())
//                .endMonth(request.getEndMonth())
//                .isCurrent(request.getIsCurrent())
//                .active(true)
//                .build();
//
//        return toResponse(academicYearRepository.save(ay));
//    }
//
//    @Transactional
//    public AcademicYearDTO.Response updateAcademicYear(Long id, AcademicYearDTO.Request request) {
//        AcademicYear ay = findById(id);
//
//        if (Boolean.TRUE.equals(request.getIsCurrent())) {
//            academicYearRepository.findByIsCurrentTrue().ifPresent(existing -> {
//                if (!existing.getId().equals(id)) {
//                    existing.setIsCurrent(false);
//                    academicYearRepository.save(existing);
//                }
//            });
//        }
//
//        ay.setName(request.getName());
//        ay.setStartYear(request.getStartYear());
//        ay.setStartMonth(request.getStartMonth());
//        ay.setEndYear(request.getEndYear());
//        ay.setEndMonth(request.getEndMonth());
//        ay.setIsCurrent(request.getIsCurrent());
//
//        return toResponse(academicYearRepository.save(ay));
//    }
//
//    @Transactional
//    public void deleteAcademicYear(Long id) {
//        AcademicYear ay = findById(id);
//        ay.setActive(false);
//        academicYearRepository.save(ay);
//    }
//
//    // ── Helpers ───────────────────────────────────────────────────────────────
//
//    private AcademicYear findById(Long id) {
//        return academicYearRepository.findById(id)
//                .orElseThrow(() -> new ResourceNotFoundException("Academic Year not found with id: " + id));
//    }
//
//    private AcademicYearDTO.Response toResponse(AcademicYear ay) {
//        AcademicYearDTO.Response res = new AcademicYearDTO.Response();
//        res.setId(ay.getId());
//        res.setName(ay.getName());
//        res.setStartYear(ay.getStartYear());
//        res.setStartMonth(ay.getStartMonth());
//        res.setStartMonthName(monthName(ay.getStartMonth()));
//        res.setEndYear(ay.getEndYear());
//        res.setEndMonth(ay.getEndMonth());
//        res.setEndMonthName(monthName(ay.getEndMonth()));
//        res.setIsCurrent(ay.getIsCurrent());
//        res.setActive(ay.getActive());
//        return res;
//    }
//
//    /** Returns full month name, e.g. 6 → "June" */
//    private String monthName(Integer month) {
//        if (month == null) return null;
//        try {
//            return Month.of(month).getDisplayName(
//                java.time.format.TextStyle.FULL,
//                java.util.Locale.ENGLISH
//            );
//        } catch (Exception e) {
//            return String.valueOf(month);
//        }
//    }
//}






package com.admission.master.service;

import com.admission.master.dto.AcademicYearDTO;
import com.admission.master.entity.AcademicYear;
import com.admission.master.exception.ResourceNotFoundException;
import com.admission.master.repository.AcademicYearRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AcademicYearService {

    private final AcademicYearRepository academicYearRepository;

    public List<AcademicYearDTO.Response> getAllAcademicYears() {
        return academicYearRepository.findByActiveTrue()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public AcademicYearDTO.Response getAcademicYearById(Long id) {
        return toResponse(findById(id));
    }

    public AcademicYearDTO.Response getCurrentAcademicYear() {
        AcademicYear ay = academicYearRepository.findByIsCurrentTrue()
                .orElseThrow(() -> new ResourceNotFoundException("No current academic year set"));
        return toResponse(ay);
    }

    @Transactional
    public AcademicYearDTO.Response createAcademicYear(AcademicYearDTO.Request request) {
        // If this is set as current, unset others
        if (Boolean.TRUE.equals(request.getIsCurrent())) {
            academicYearRepository.findByIsCurrentTrue().ifPresent(ay -> {
                ay.setIsCurrent(false);
                academicYearRepository.save(ay);
            });
        }

        AcademicYear ay = AcademicYear.builder()
                .name(request.getName())
                .startYear(request.getStartYear())
                .endYear(request.getEndYear())
                .isCurrent(request.getIsCurrent())
                .active(true)
                .build();
        return toResponse(academicYearRepository.save(ay));
    }

    @Transactional
    public AcademicYearDTO.Response updateAcademicYear(Long id, AcademicYearDTO.Request request) {
        AcademicYear ay = findById(id);

        if (Boolean.TRUE.equals(request.getIsCurrent())) {
            academicYearRepository.findByIsCurrentTrue().ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    existing.setIsCurrent(false);
                    academicYearRepository.save(existing);
                }
            });
        }

        ay.setName(request.getName());
        ay.setStartYear(request.getStartYear());
        ay.setEndYear(request.getEndYear());
        ay.setIsCurrent(request.getIsCurrent());
        return toResponse(academicYearRepository.save(ay));
    }

    @Transactional
    public void deleteAcademicYear(Long id) {
        AcademicYear ay = findById(id);
        ay.setActive(false);
        academicYearRepository.save(ay);
    }

    private AcademicYear findById(Long id) {
        return academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Academic Year not found with id: " + id));
    }

    private AcademicYearDTO.Response toResponse(AcademicYear ay) {
        AcademicYearDTO.Response res = new AcademicYearDTO.Response();
        res.setId(ay.getId());
        res.setName(ay.getName());
        res.setStartYear(ay.getStartYear());
        res.setEndYear(ay.getEndYear());
        res.setIsCurrent(ay.getIsCurrent());
        res.setActive(ay.getActive());
        return res;
    }
}