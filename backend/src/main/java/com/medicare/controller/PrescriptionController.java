package com.medicare.controller;

import com.medicare.dto.PrescriptionRequest;
import com.medicare.dto.PrescriptionViewDto;
import com.medicare.service.PrescriptionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Prescription endpoints. Creation is doctor-only and validated against
 * appointment ownership/completion in the service layer.
 */
@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @PostMapping
    public ResponseEntity<PrescriptionViewDto> create(
            @Valid @RequestBody PrescriptionRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String doctorId) {
        PrescriptionViewDto prescription = prescriptionService.createPrescription(doctorId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(prescription);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<PrescriptionViewDto>> forPatient(
            @PathVariable String patientId,
            @RequestHeader(value = "X-User-Id", required = false) String callerId) {
        requireSelf(callerId, patientId);
        return ResponseEntity.ok(prescriptionService.getPrescriptionsForPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<PrescriptionViewDto>> forDoctor(
            @PathVariable String doctorId,
            @RequestHeader(value = "X-User-Id", required = false) String callerId) {
        requireSelf(callerId, doctorId);
        return ResponseEntity.ok(prescriptionService.getPrescriptionsForDoctor(doctorId));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<Object> byAppointment(
            @PathVariable String appointmentId,
            @RequestHeader(value = "X-User-Id", required = false) String callerId,
            @RequestHeader(value = "X-User-Role", required = false) String callerRole) {
        Object prescription = prescriptionService.getByAppointment(appointmentId, callerId, callerRole);
        if (prescription == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(prescription);
    }

    private static void requireSelf(String callerId, String pathId) {
        if (callerId == null || !callerId.equals(pathId)) {
            throw new com.medicare.exception.UnauthorizedException(
                    "You are not allowed to access another user's data.");
        }
    }
}
