package com.medicare.service;

import com.medicare.dto.AddSlotRequest;
import com.medicare.dto.AvailabilityResponseDto;
import com.medicare.dto.DoctorSummaryDto;
import com.medicare.exception.DoctorNotFoundException;
import com.medicare.exception.InvalidAppointmentException;
import com.medicare.exception.SlotUnavailableException;
import com.medicare.model.Appointment;
import com.medicare.model.Doctor;
import com.medicare.model.DoctorSlot;
import com.medicare.repository.AppointmentRepository;
import com.medicare.repository.DoctorRepository;
import com.medicare.util.DateTimeUtil;
import com.medicare.util.IdGenerator;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * Business rules for doctor discovery and availability management.
 * Availability is stored as atomic DoctorSlot documents, one per (doctor, start).
 */
@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public DoctorService(DoctorRepository doctorRepository, AppointmentRepository appointmentRepository) {
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    /* ---------------- discovery ---------------- */

    public List<DoctorSummaryDto> listDoctors(String search, String specialization) {
        LocalDateTime now = LocalDateTime.now();
        List<DoctorSummaryDto> out = new ArrayList<>();
        for (Doctor d : doctorRepository.findAllDoctors()) {
            if (specialization != null && !specialization.isBlank()
                    && !specEquals(d.getSpecialization(), specialization)) {
                continue;
            }
            if (search != null && !search.isBlank()) {
                String q = search.toLowerCase();
                boolean match = contains(d.getName(), q) || contains(d.getSpecialization(), q)
                        || contains(d.getQualification(), q) || contains(d.getBio(), q);
                if (!match) {
                    continue;
                }
            }
            long slots = doctorRepository.countAvailableFutureSlots(d.getId(), now);
            String next = doctorRepository.findNextAvailableSlot(d.getId(), now)
                    .map(s -> DateTimeUtil.format12h(s.getSlotStart().toLocalTime()))
                    .orElse(null);
            out.add(new DoctorSummaryDto(d, slots, next));
        }
        return out;
    }

    public DoctorSummaryDto getDoctorSummary(String doctorId) {
        Doctor d = requireDoctor(doctorId);
        LocalDateTime now = LocalDateTime.now();
        long slots = doctorRepository.countAvailableFutureSlots(doctorId, now);
        String next = doctorRepository.findNextAvailableSlot(doctorId, now)
                .map(s -> DateTimeUtil.format12h(s.getSlotStart().toLocalTime()))
                .orElse(null);
        return new DoctorSummaryDto(d, slots, next);
    }

    /* ---------------- availability ---------------- */

    public AvailabilityResponseDto getAvailability(String doctorId, boolean includePast) {
        requireDoctor(doctorId);
        List<DoctorSlot> slots = doctorRepository.findSlotsByDoctor(doctorId, LocalDateTime.now(), !includePast);

        List<AvailabilityResponseDto.SlotDto> flat = new ArrayList<>();
        Map<String, List<AvailabilityResponseDto.SlotDto>> byDate = new TreeMap<>();
        for (DoctorSlot s : slots) {
            AvailabilityResponseDto.SlotDto dto = new AvailabilityResponseDto.SlotDto(
                    s.getId(),
                    s.getSlotStart().toLocalDate().toString(),
                    DateTimeUtil.format12h(s.getSlotStart().toLocalTime()),
                    s.getSlotStart().toString(),
                    s.getStatus());
            flat.add(dto);
            byDate.computeIfAbsent(dto.getDate(), k -> new ArrayList<>()).add(dto);
        }
        return new AvailabilityResponseDto(doctorId, flat, byDate);
    }

    /** Adds a single 30-minute slot. */
    public AvailabilityResponseDto.SlotDto addSlot(String doctorId, AddSlotRequest req) {
        requireDoctor(doctorId);

        LocalDate date = DateTimeUtil.parseDate(req.getDate());
        if (date.isBefore(LocalDate.now())) {
            throw new InvalidAppointmentException("Cannot publish availability in the past.");
        }
        var time = DateTimeUtil.parseTime(req.getTimeSlot());
        LocalDateTime start = LocalDateTime.of(date, time);

        if (start.isBefore(LocalDateTime.now())) {
            throw new InvalidAppointmentException("Cannot publish a slot that has already passed today.");
        }

        // Business rule: no duplicate published slot for the same doctor/date/time.
        if (doctorRepository.findSlotByDoctorAndStart(doctorId, start).isPresent()) {
            throw new SlotUnavailableException("This time slot is already published for the selected date.");
        }

        DoctorSlot slot = new DoctorSlot(IdGenerator.slotId(), doctorId, start, DoctorSlot.STATUS_AVAILABLE);
        doctorRepository.saveSlot(slot);

        return new AvailabilityResponseDto.SlotDto(
                slot.getId(),
                date.toString(),
                DateTimeUtil.format12h(time),
                start.toString(),
                slot.getStatus());
    }

    /** Removes an available slot. Booked slots must be cancelled first. */
    public void removeSlot(String doctorId, String slotId) {
        requireDoctor(doctorId);
        DoctorSlot slot = doctorRepository.findSlotById(slotId)
                .orElseThrow(() -> new SlotUnavailableException("Slot not found."));
        if (!slot.getDoctorId().equals(doctorId)) {
            throw new SlotUnavailableException("Slot does not belong to this doctor.");
        }
        if (DoctorSlot.STATUS_BOOKED.equals(slot.getStatus())) {
            throw new SlotUnavailableException(
                    "This slot is booked. Cancel the appointment before removing the slot.");
        }
        doctorRepository.deleteSlot(slotId);
    }

    /* ---------------- helpers ---------------- */

    public Doctor requireDoctor(String doctorId) {
        return doctorRepository.findDoctorById(doctorId)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found with id: " + doctorId));
    }

    private static boolean specEquals(String a, String b) {
        return a != null && a.equalsIgnoreCase(b.trim());
    }

    private static boolean contains(String value, String q) {
        return value != null && value.toLowerCase().contains(q);
    }
}
