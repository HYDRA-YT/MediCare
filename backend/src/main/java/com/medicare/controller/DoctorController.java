package com.medicare.controller;

import com.medicare.dto.DoctorSummaryDto;
import com.medicare.service.DoctorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Doctor discovery endpoints (public directory + profile).
 */
@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping
    public ResponseEntity<List<DoctorSummaryDto>> listDoctors(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String specialization) {
        return ResponseEntity.ok(doctorService.listDoctors(search, specialization));
    }

    @GetMapping("/specializations")
    public ResponseEntity<List<String>> specializations() {
        return ResponseEntity.ok(List.copyOf(com.medicare.service.AuthService.SPECIALIZATIONS));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDoctor(@PathVariable String id) {
        DoctorSummaryDto dto = doctorService.getDoctorSummary(id);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<List<DoctorSummaryDto>> bySpecialization(
            @PathVariable String specialization) {
        return ResponseEntity.ok(doctorService.listDoctors(null, specialization));
    }
}
