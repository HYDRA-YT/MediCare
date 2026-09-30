package com.medicare.controller;

import com.medicare.dto.AddSlotRequest;
import com.medicare.dto.AvailabilityResponseDto;
import com.medicare.service.DoctorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Doctor availability endpoints. The doctorId path segment is verified against
 * the authenticated caller by the service layer rules (slots must belong to the
 * caller when mutating).
 */
@RestController
@RequestMapping("/api/doctors/{doctorId}/availability")
public class AvailabilityController {

    private final DoctorService doctorService;

    public AvailabilityController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping
    public ResponseEntity<AvailabilityResponseDto> getAvailability(
            @PathVariable String doctorId,
            @RequestParam(defaultValue = "false") boolean includePast) {
        return ResponseEntity.ok(doctorService.getAvailability(doctorId, includePast));
    }

    @PostMapping
    public ResponseEntity<AvailabilityResponseDto.SlotDto> addSlot(
            @PathVariable String doctorId,
            @Valid @RequestBody AddSlotRequest request) {
        AvailabilityResponseDto.SlotDto slot = doctorService.addSlot(doctorId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(slot);
    }

    @DeleteMapping("/{slotId}")
    public ResponseEntity<?> removeSlot(@PathVariable String doctorId,
                                        @PathVariable String slotId) {
        doctorService.removeSlot(doctorId, slotId);
        return ResponseEntity.ok(java.util.Map.of("message", "Slot removed."));
    }
}
