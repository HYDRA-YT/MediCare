package com.medicare.service;

import com.medicare.dto.AuthResponse;
import com.medicare.dto.DoctorProfileDto;
import com.medicare.dto.LoginRequest;
import com.medicare.dto.PatientProfileDto;
import com.medicare.dto.RegisterRequest;
import com.medicare.exception.DuplicateEmailException;
import com.medicare.exception.InvalidAppointmentException;
import com.medicare.exception.InvalidCredentialsException;
import com.medicare.model.Doctor;
import com.medicare.model.Patient;
import com.medicare.repository.DoctorRepository;
import com.medicare.repository.PatientRepository;
import com.medicare.util.PasswordUtil;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;

/**
 * Business rules for registration and login:
 * - validates role and profile fields,
 * - enforces unique emails,
 * - hashes passwords with BCrypt (never stored in plain text),
 * - issues an opaque session token (kept in SPA memory).
 */
@Service
public class AuthService {

    private static final Set<String> ALLOWED_ROLES = Set.of("PATIENT", "DOCTOR");
    public static final Set<String> SPECIALIZATIONS = Set.of(
            "Cardiology", "Dermatology", "Neurology", "Orthopedics",
            "General Medicine", "Pediatrics");

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public AuthService(PatientRepository patientRepository, DoctorRepository doctorRepository) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    public AuthResponse register(RegisterRequest req) {
        String role = req.getRole() == null ? "" : req.getRole().trim().toUpperCase();
        if (!ALLOWED_ROLES.contains(role)) {
            throw new InvalidAppointmentException("Role must be PATIENT or DOCTOR.");
        }
        if (patientRepository.findPatientByEmail(req.getEmail()).isPresent()
                || doctorRepository.findDoctorByEmail(req.getEmail()).isPresent()) {
            throw new DuplicateEmailException("An account with this email already exists.");
        }

        String id = UUID.randomUUID().toString();
        String hash = PasswordUtil.hash(req.getPassword());

        if ("DOCTOR".equals(role)) {
            String spec = req.getSpecialization() == null ? "" : req.getSpecialization().trim();
            if (spec.isEmpty()) {
                throw new InvalidAppointmentException("Specialization is required for doctor registration.");
            }
            Doctor doc = new Doctor();
            doc.setId(id);
            doc.setName(req.getName().trim());
            doc.setEmail(req.getEmail());
            doc.setPasswordHash(hash);
            doc.setRole("DOCTOR");
            doc.setPhone(req.getPhone());
            doc.setSpecialization(spec);
            doc.setQualification(req.getQualification());
            doc.setExperienceYears(req.getExperienceYears() == null ? 0 : req.getExperienceYears());
            doc.setBio(req.getBio());
            doctorRepository.saveDoctor(doc);
            return buildResponse(id, "DOCTOR", new DoctorProfileDto(doc));
        }

        Patient p = new Patient(id, req.getName().trim(), req.getEmail(), hash);
        p.setPhone(req.getPhone());
        patientRepository.savePatient(p);
        return buildResponse(id, "PATIENT", new PatientProfileDto(p));
    }

    public AuthResponse login(LoginRequest req) {
        var patient = patientRepository.findPatientByEmail(req.getEmail());
        if (patient.isPresent()) {
            if (!PasswordUtil.verify(req.getPassword(), patient.get().getPasswordHash())) {
                throw new InvalidCredentialsException("Invalid email or password.");
            }
            return buildResponse(patient.get().getId(), "PATIENT", new PatientProfileDto(patient.get()));
        }
        var doctor = doctorRepository.findDoctorByEmail(req.getEmail());
        if (doctor.isPresent()) {
            if (!PasswordUtil.verify(req.getPassword(), doctor.get().getPasswordHash())) {
                throw new InvalidCredentialsException("Invalid email or password.");
            }
            return buildResponse(doctor.get().getId(), "DOCTOR", new DoctorProfileDto(doctor.get()));
        }
        throw new InvalidCredentialsException("Invalid email or password.");
    }

    private AuthResponse buildResponse(String userId, String role, Object profile) {
        return new AuthResponse(UUID.randomUUID().toString(), userId, role, profile);
    }
}
