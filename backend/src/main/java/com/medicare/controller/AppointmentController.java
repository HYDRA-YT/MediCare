package com.medicare.controller;

import com.medicare.dto.AppointmentViewDto;
import com.medicare.dto.BookAppointmentRequest;
import com.medicare.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Appointment endpoints. Caller identity comes from the X-User-Id header set by
 * the SPA session; the service layer validates ownership and role rules.
 */
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public ResponseEntity<AppointmentViewDto> book(
            @Valid @RequestBody BookAppointmentRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String patientId) {
        AppointmentViewDto appointment = appointmentService.bookAppointment(patientId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(appointment);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentViewDto>> forPatient(
            @PathVariable String patientId,
            @RequestHeader(value = "X-User-Id", required = false) String callerId) {
        requireSelf(callerId, patientId);
        return ResponseEntity.ok(appointmentService.getAppointmentsForPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentViewDto>> forDoctor(
            @PathVariable String doctorId,
            @RequestHeader(value = "X-User-Id", required = false) String callerId) {
        requireSelf(callerId, doctorId);
        return ResponseEntity.ok(appointmentService.getAppointmentsForDoctor(doctorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentViewDto> getOne(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) String callerId,
            @RequestHeader(value = "X-User-Role", required = false) String callerRole) {
        return ResponseEntity.ok(appointmentService.getAppointment(id, callerId, callerRole));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<AppointmentViewDto> cancel(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) String patientId) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(id, patientId));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<AppointmentViewDto> complete(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) String doctorId) {
        return ResponseEntity.ok(appointmentService.completeAppointment(id, doctorId));
    }

    @GetMapping("/patient/{patientId}/dashboard")
    public ResponseEntity<Map<String, Object>> patientDashboard(
            @PathVariable String patientId,
            @RequestHeader(value = "X-User-Id", required = false) String callerId) {
        requireSelf(callerId, patientId);
        return ResponseEntity.ok(appointmentService.patientDashboard(patientId));
    }

    @GetMapping("/doctor/{doctorId}/dashboard")
    public ResponseEntity<Map<String, Object>> doctorDashboard(
            @PathVariable String doctorId,
            @RequestHeader(value = "X-User-Id", required = false) String callerId) {
        requireSelf(callerId, doctorId);
        return ResponseEntity.ok(appointmentService.doctorDashboard(doctorId));
    }

    private static void requireSelf(String callerId, String pathId) {
        if (callerId == null || !callerId.equals(pathId)) {
            throw new com.medicare.exception.UnauthorizedException(
                    "You are not allowed to access another user's data.");
        }
    }
}
