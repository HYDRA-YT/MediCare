package com.medicare.service;

import com.medicare.dto.AppointmentViewDto;
import com.medicare.dto.BookAppointmentRequest;
import com.medicare.exception.DoctorNotFoundException;
import com.medicare.exception.InvalidAppointmentException;
import com.medicare.exception.AppointmentNotFoundException;
import com.medicare.exception.PatientNotFoundException;
import com.medicare.exception.SlotUnavailableException;
import com.medicare.exception.UnauthorizedException;
import com.medicare.model.Appointment;
import com.medicare.model.Doctor;
import com.medicare.model.DoctorSlot;
import com.medicare.model.Patient;
import com.medicare.repository.AppointmentRepository;
import com.medicare.repository.DoctorRepository;
import com.medicare.repository.PatientRepository;
import com.medicare.repository.PrescriptionRepository;
import com.medicare.util.DateTimeUtil;
import com.medicare.util.IdGenerator;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Core transactional business logic for appointments.
 *
 * Booking rules enforced here (in order):
 *   1. Patient exists.
 *   2. Doctor exists.
 *   3. Date is present and parses as ISO yyyy-MM-dd.
 *   4. Date is not in the past.
 *   5. Requested slot exists (published by the doctor).
 *   6. Slot is still AVAILABLE.
 *   7. Slot is not already booked (active appointment for doctor+slotStart,
 *      backed by a unique compound index for race safety).
 *   8. Patient has no other active booking for the same slot.
 *
 * Cancellation: BOOKED -> CANCELLED only, by the owning patient; completed
 * appointments are never cancellable; history is never deleted.
 * Completion:   BOOKED -> COMPLETED only, by the owning doctor.
 */
@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final PrescriptionRepository prescriptionRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              DoctorRepository doctorRepository,
                              PatientRepository patientRepository,
                              PrescriptionRepository prescriptionRepository) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.prescriptionRepository = prescriptionRepository;
    }

    /* ---------------- booking ---------------- */

    public AppointmentViewDto bookAppointment(String patientId, BookAppointmentRequest req) {
        // 1. Patient exists
        Patient patient = patientRepository.findPatientById(patientId)
                .orElseThrow(() -> new PatientNotFoundException(
                        "Patient not found with id: " + patientId));

        // 2. Doctor exists
        Doctor doctor = doctorRepository.findDoctorById(req.getDoctorId())
                .orElseThrow(() -> new DoctorNotFoundException(
                        "Doctor not found with id: " + req.getDoctorId()));

        // 3. Date parses
        LocalDate date = DateTimeUtil.parseDate(req.getDate());

        // 4. Date is not in the past
        if (date.isBefore(LocalDate.now())) {
            throw new InvalidAppointmentException("Appointment date cannot be in the past.");
        }

        LocalDateTime slotStart;
        try {
            slotStart = DateTimeUtil.combine(date, req.getTimeSlot());
        } catch (Exception e) {
            throw new InvalidAppointmentException(e.getMessage());
        }

        // 5. Requested slot exists (must be published by the doctor)
        DoctorSlot slot = doctorRepository.findSlotByDoctorAndStart(doctor.getId(), slotStart)
                .orElseThrow(() -> new SlotUnavailableException(
                        "The requested time slot is not offered by this doctor on " + req.getDate() + "."));

        // 6. Slot is available
        if (!DoctorSlot.STATUS_AVAILABLE.equals(slot.getStatus())) {
            throw new SlotUnavailableException("Selected slot is no longer available.");
        }

        // 7. Slot is not already booked (active appointment exists?)
        if (appointmentRepository.activeAppointmentExists(doctor.getId(),
                java.util.Date.from(slotStart.atZone(java.time.ZoneId.systemDefault()).toInstant()))) {
            throw new SlotUnavailableException("Selected slot is no longer available.");
        }

        // 8. Patient cannot hold two active bookings for the same slot
        for (Appointment existing : appointmentRepository.findByPatientAndStatus(
                patientId, Appointment.STATUS_BOOKED)) {
            if (slotStart.equals(existing.getSlotStart())) {
                throw new InvalidAppointmentException(
                        "You already have an appointment booked at this time.");
            }
        }

        // Persist appointment
        Appointment appointment = new Appointment(
                IdGenerator.appointmentId(), doctor.getId(), patientId,
                date.toString(), req.getTimeSlot().trim(), slotStart, Appointment.STATUS_BOOKED);
        appointment.setReason(req.getReason());
        appointment.setBookedAt(LocalDateTime.now());
        appointment.setUpdatedAt(LocalDateTime.now());
        appointmentRepository.save(appointment);

        // Mark the slot BOOKED (atomic toggle from AVAILABLE -> BOOKED)
        markSlotBooked(slot.getId());

        // Maintain documented appointment id references on both user documents
        patientRepository.addAppointmentReference(patientId, appointment.getId());
        doctorRepository.addAppointmentReference(doctor.getId(), appointment.getId());

        return enrich(appointment, patient.getName(), patient.getPhone());
    }

    /* ---------------- views ---------------- */

    public List<AppointmentViewDto> getAppointmentsForPatient(String patientId) {
        Patient patient = patientRepository.findPatientById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with id: " + patientId));
        List<AppointmentViewDto> out = new ArrayList<>();
        for (Appointment a : appointmentRepository.findByPatient(patientId)) {
            out.add(enrich(a, patient.getName(), patient.getPhone()));
        }
        return out;
    }

    public List<AppointmentViewDto> getAppointmentsForDoctor(String doctorId) {
        requireDoctor(doctorId);
        List<AppointmentViewDto> out = new ArrayList<>();
        for (Appointment a : appointmentRepository.findByDoctor(doctorId)) {
            out.add(enrich(a, null, null));
        }
        return out;
    }

    public AppointmentViewDto getAppointment(String appointmentId, String requesterId, String requesterRole) {
        Appointment a = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentNotFoundException(
                        "Appointment not found with id: " + appointmentId));
        boolean allowed = "DOCTOR".equals(requesterRole)
                ? a.getDoctorId().equals(requesterId)
                : a.getPatientId().equals(requesterId);
        if (!allowed) {
            throw new UnauthorizedException("You do not have access to this appointment.");
        }
        if ("DOCTOR".equals(requesterRole)) {
            return enrich(a, null, null);
        }
        Patient p = patientRepository.findPatientById(a.getPatientId()).orElse(null);
        return enrich(a, p == null ? null : p.getName(), p == null ? null : p.getPhone());
    }

    /* ---------------- status transitions ---------------- */

    /** Patient cancels a BOOKED appointment. Completed appointments are never cancellable. */
    public AppointmentViewDto cancelAppointment(String appointmentId, String patientId) {
        Patient patient = patientRepository.findPatientById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with id: " + patientId));
        Appointment a = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentNotFoundException(
                        "Appointment not found with id: " + appointmentId));

        if (!a.getPatientId().equals(patientId)) {
            throw new UnauthorizedException("You can only cancel your own appointments.");
        }
        if (Appointment.STATUS_COMPLETED.equals(a.getStatus())) {
            throw new InvalidAppointmentException("Completed appointments cannot be cancelled.");
        }
        if (Appointment.STATUS_CANCELLED.equals(a.getStatus())) {
            throw new InvalidAppointmentException("This appointment is already cancelled.");
        }

        a.setStatus(Appointment.STATUS_CANCELLED);
        a.setUpdatedAt(LocalDateTime.now());
        appointmentRepository.save(a);
        freeSlot(a);
        return enrich(a, patient.getName(), patient.getPhone());
    }

    /** Doctor marks a BOOKED appointment COMPLETED. Only the owning doctor can do this. */
    public AppointmentViewDto completeAppointment(String appointmentId, String doctorId) {
        requireDoctor(doctorId);
        Appointment a = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentNotFoundException(
                        "Appointment not found with id: " + appointmentId));

        if (!a.getDoctorId().equals(doctorId)) {
            throw new UnauthorizedException("You can only manage your own appointments.");
        }
        if (!Appointment.STATUS_BOOKED.equals(a.getStatus())) {
            throw new InvalidAppointmentException(
                    "Only booked appointments can be marked completed.");
        }

        a.setStatus(Appointment.STATUS_COMPLETED);
        a.setUpdatedAt(LocalDateTime.now());
        appointmentRepository.save(a);
        return enrich(a, null, null);
    }

    /* ---------------- dashboards ---------------- */

    public Map<String, Object> patientDashboard(String patientId) {
        patientRepository.findPatientById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with id: " + patientId));
        List<AppointmentViewDto> all = getAppointmentsForPatient(patientId);

        AppointmentViewDto upcoming = all.stream()
                .filter(a -> Appointment.STATUS_BOOKED.equals(a.getStatus()))
                .min(new UpcomingOrder())
                .orElse(null);

        Map<String, Object> m = new HashMap<>();
        m.put("totalAppointments", all.size());
        m.put("upcomingCount", all.stream().filter(a -> Appointment.STATUS_BOOKED.equals(a.getStatus())).count());
        m.put("completedCount", all.stream().filter(a -> Appointment.STATUS_COMPLETED.equals(a.getStatus())).count());
        m.put("cancelledCount", all.stream().filter(a -> Appointment.STATUS_CANCELLED.equals(a.getStatus())).count());
        m.put("prescriptionCount", prescriptionRepository.findByPatient(patientId).size());
        m.put("upcomingAppointment", upcoming);
        return m;
    }

    public Map<String, Object> doctorDashboard(String doctorId) {
        requireDoctor(doctorId);
        String today = LocalDate.now().toString();
        List<AppointmentViewDto> booked = new ArrayList<>();
        for (Appointment a : appointmentRepository.findByDoctorAndStatus(doctorId, Appointment.STATUS_BOOKED)) {
            booked.add(enrich(a, null, null));
        }

        List<AppointmentViewDto> todays = booked.stream()
                .filter(a -> today.equals(a.getDate()))
                .sorted(new UpcomingOrder())
                .collect(java.util.stream.Collectors.toList());
        List<AppointmentViewDto> upcoming = booked.stream()
                .filter(a -> !today.equals(a.getDate()))
                .sorted(new UpcomingOrder())
                .collect(java.util.stream.Collectors.toList());

        long availableSlots = doctorRepository.countAvailableFutureSlots(doctorId, LocalDateTime.now());
        Set<String> patients = new HashSet<>(appointmentRepository.findDistinctPatientIdsByDoctor(doctorId));
        long completed = appointmentRepository.countByDoctorAndStatus(doctorId, Appointment.STATUS_COMPLETED);
        long prescriptions = prescriptionRepository.findByDoctor(doctorId).size();

        Map<String, Object> m = new HashMap<>();
        m.put("todayAppointmentCount", todays.size());
        m.put("upcomingAppointmentCount", upcoming.size());
        m.put("completedCount", completed);
        m.put("totalPatients", patients.size());
        m.put("availableSlots", availableSlots);
        m.put("prescriptionCount", prescriptions);
        m.put("todaysAppointments", todays);
        m.put("upcomingAppointments", upcoming);
        return m;
    }

    /* ---------------- helpers ---------------- */

    /** Atomic toggle AVAILABLE -> BOOKED; guards against concurrent bookings. */
    private void markSlotBooked(String slotId) {
        doctorRepository.markSlotBooked(slotId);
    }

    /** Frees the slot when its appointment is cancelled. */
    private void freeSlot(Appointment a) {
        doctorRepository.findSlotByDoctorAndStart(a.getDoctorId(), a.getSlotStart())
                .ifPresent(slot -> {
                    if (com.medicare.model.DoctorSlot.STATUS_BOOKED.equals(slot.getStatus())) {
                        doctorRepository.markSlotAvailable(slot.getId());
                    }
                });
    }

    private AppointmentViewDto enrich(Appointment a, String patientName, String patientPhone) {
        AppointmentViewDto dto = new AppointmentViewDto();
        dto.setId(a.getId());
        dto.setDoctorId(a.getDoctorId());
        dto.setPatientId(a.getPatientId());
        dto.setDate(a.getDate());
        dto.setTimeSlot(a.getTimeSlot());
        dto.setSlotStart(a.getSlotStart());
        dto.setStatus(a.getStatus());
        dto.setReason(a.getReason());
        dto.setBookedAt(a.getBookedAt());

        doctorRepository.findDoctorById(a.getDoctorId()).ifPresent(d -> {
            dto.setDoctorName(d.getName());
            dto.setDoctorSpecialization(d.getSpecialization());
            dto.setDoctorAvatarUrl(d.getAvatarUrl());
        });

        // Resolve patient display info when not supplied by the caller
        // (doctor-side views pass null here).
        String pName = patientName;
        String pPhone = patientPhone;
        if (pName == null || pPhone == null) {
            Patient p = patientRepository.findPatientById(a.getPatientId()).orElse(null);
            if (p != null) {
                if (pName == null) pName = p.getName();
                if (pPhone == null) pPhone = p.getPhone();
            }
        }
        dto.setPatientName(pName);
        dto.setPatientPhone(pPhone);
        dto.setPrescriptionIssued(
                prescriptionRepository.findByAppointmentId(a.getId()).isPresent());
        return dto;
    }

    private Doctor requireDoctor(String doctorId) {
        return doctorRepository.findDoctorById(doctorId)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found with id: " + doctorId));
    }

    /** Sorts upcoming (BOOKED) appointments soonest-first. */
    static class UpcomingOrder implements java.util.Comparator<AppointmentViewDto> {
        @Override
        public int compare(AppointmentViewDto a, AppointmentViewDto b) {
            var sa = a.getSlotStart();
            var sb = b.getSlotStart();
            if (sa == null && sb == null) return 0;
            if (sa == null) return 1;
            if (sb == null) return -1;
            return sa.compareTo(sb);
        }
    }
}
