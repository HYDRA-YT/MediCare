package com.medicare.service;

import com.medicare.dto.BookAppointmentRequest;
import com.medicare.dto.PrescriptionRequest;
import com.medicare.dto.PrescriptionViewDto;
import com.medicare.exception.AppointmentNotFoundException;
import com.medicare.exception.DoctorNotFoundException;
import com.medicare.exception.InvalidAppointmentException;
import com.medicare.exception.PatientNotFoundException;
import com.medicare.exception.PrescriptionNotAllowedException;
import com.medicare.model.Appointment;
import com.medicare.model.Doctor;
import com.medicare.model.Patient;
import com.medicare.model.Prescription;
import com.medicare.repository.AppointmentRepository;
import com.medicare.repository.DoctorRepository;
import com.medicare.repository.PatientRepository;
import com.medicare.repository.PrescriptionRepository;
import com.medicare.util.IdGenerator;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Business rules for prescriptions:
 * - can ONLY be created for a COMPLETED appointment (BOOKED/CANCELLED are rejected),
 * - only the owning doctor of that appointment may issue it,
 * - one prescription per appointment,
 * - every medicine entry requires name, dosage, frequency and duration.
 */
@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    public PrescriptionService(PrescriptionRepository prescriptionRepository,
                               AppointmentRepository appointmentRepository,
                               DoctorRepository doctorRepository,
                               PatientRepository patientRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    public PrescriptionViewDto createPrescription(String doctorId, PrescriptionRequest req) {
        Doctor doctor = doctorRepository.findDoctorById(doctorId)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found with id: " + doctorId));

        Appointment appointment = appointmentRepository.findById(req.getAppointmentId())
                .orElseThrow(() -> new AppointmentNotFoundException(
                        "Appointment not found with id: " + req.getAppointmentId()));

        // Ownership: the issuing doctor must own the appointment.
        if (!appointment.getDoctorId().equals(doctor.getId())) {
            throw new PrescriptionNotAllowedException(
                    "You can only issue prescriptions for your own appointments.");
        }

        // CORE RULE: prescriptions attach only to completed appointments.
        if (!Appointment.STATUS_COMPLETED.equals(appointment.getStatus())) {
            throw new PrescriptionNotAllowedException(
                    "Prescriptions can only be issued for completed appointments. Current status: "
                            + appointment.getStatus() + ".");
        }

        // One prescription per appointment.
        if (prescriptionRepository.findByAppointmentId(appointment.getId()).isPresent()) {
            throw new PrescriptionNotAllowedException(
                    "A prescription has already been issued for this appointment.");
        }

        if (req.getMedicines() == null || req.getMedicines().isEmpty()) {
            throw new InvalidAppointmentException("At least one medicine is required.");
        }
        req.getMedicines().forEach(m -> {
            if (m == null || isBlank(m.getName())) {
                throw new InvalidAppointmentException("Each medicine needs a name.");
            }
            if (isBlank(m.getDosage())) {
                throw new InvalidAppointmentException("Medicine \"" + m.getName() + "\" needs a dosage.");
            }
            if (isBlank(m.getFrequency())) {
                throw new InvalidAppointmentException("Medicine \"" + m.getName() + "\" needs a frequency.");
            }
            if (isBlank(m.getDuration())) {
                throw new InvalidAppointmentException("Medicine \"" + m.getName() + "\" needs a duration.");
            }
        });

        Patient patient = patientRepository.findPatientById(appointment.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(
                        "Patient not found with id: " + appointment.getPatientId()));

        Prescription prescription = new Prescription(
                IdGenerator.prescriptionId(), appointment.getId(), doctor.getId(), patient.getId(),
                req.getDiagnosis().trim(), req.getNotes(),
                java.time.LocalDateTime.now());
        prescription.setMedicines(req.getMedicines());
        prescriptionRepository.save(prescription);

        return toView(prescription, doctor, patient, appointment);
    }

    public List<PrescriptionViewDto> getPrescriptionsForPatient(String patientId) {
        Patient patient = patientRepository.findPatientById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with id: " + patientId));
        List<PrescriptionViewDto> out = new ArrayList<>();
        for (Prescription p : prescriptionRepository.findByPatient(patientId)) {
            out.add(toView(p, null, patient, null));
        }
        return out;
    }

    public List<PrescriptionViewDto> getPrescriptionsForDoctor(String doctorId) {
        Doctor doctor = doctorRepository.findDoctorById(doctorId)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found with id: " + doctorId));
        List<PrescriptionViewDto> out = new ArrayList<>();
        for (Prescription p : prescriptionRepository.findByDoctor(doctorId)) {
            out.add(toView(p, doctor, null, null));
        }
        return out;
    }

    public PrescriptionViewDto getByAppointment(String appointmentId, String requesterId, String requesterRole) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentNotFoundException(
                        "Appointment not found with id: " + appointmentId));
        boolean allowed = "DOCTOR".equals(requesterRole)
                ? appointment.getDoctorId().equals(requesterId)
                : appointment.getPatientId().equals(requesterId);
        if (!allowed) {
            throw new PrescriptionNotAllowedException(
                    "You do not have access to this prescription.");
        }
        Prescription prescription = prescriptionRepository.findByAppointmentId(appointmentId)
                .orElse(null);
        if (prescription == null) {
            return null;
        }
        Doctor doctor = doctorRepository.findDoctorById(prescription.getDoctorId()).orElse(null);
        Patient patient = patientRepository.findPatientById(prescription.getPatientId()).orElse(null);
        return toView(prescription, doctor, patient, appointment);
    }

    /* ---------------- helpers ---------------- */

    private PrescriptionViewDto toView(Prescription p, Doctor doctor, Patient patient, Appointment appointment) {
        PrescriptionViewDto v = new PrescriptionViewDto();
        v.setId(p.getId());
        v.setAppointmentId(p.getAppointmentId());
        v.setDoctorId(p.getDoctorId());
        v.setPatientId(p.getPatientId());
        v.setDiagnosis(p.getDiagnosis());
        v.setNotes(p.getNotes());
        v.setMedicines(p.getMedicines());
        v.setTimestamp(p.getTimestamp());
        v.setCreatedAt(p.getCreatedAt());

        Doctor d = doctor;
        if (d == null) {
            d = doctorRepository.findDoctorById(p.getDoctorId()).orElse(null);
        }
        if (d != null) {
            v.setDoctorName(d.getName());
            v.setDoctorSpecialization(d.getSpecialization());
            v.setDoctorAvatarUrl(d.getAvatarUrl());
        }
        Patient pt = patient;
        if (pt == null) {
            pt = patientRepository.findPatientById(p.getPatientId()).orElse(null);
        }
        if (pt != null) {
            v.setPatientName(pt.getName());
        }
        Appointment a = appointment;
        if (a == null) {
            a = appointmentRepository.findById(p.getAppointmentId()).orElse(null);
        }
        if (a != null) {
            v.setAppointmentDate(a.getDate() + " " + a.getTimeSlot());
        }
        return v;
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
