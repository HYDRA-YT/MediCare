package com.medicare.service;

import com.medicare.dto.DoctorProfileDto;
import com.medicare.dto.PatientProfileDto;
import com.medicare.dto.UpdateProfileRequest;
import com.medicare.exception.UserNotFoundException;
import com.medicare.model.Doctor;
import com.medicare.model.Patient;
import com.medicare.repository.DoctorRepository;
import com.medicare.repository.PatientRepository;
import org.springframework.stereotype.Service;

/**
 * Profile lookup and update rules. Profiles are always returned without the
 * password hash.
 */
@Service
public class UserService {

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    public UserService(DoctorRepository doctorRepository, PatientRepository patientRepository) {
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    public Object getProfile(String userId) {
        Patient p = patientRepository.findPatientById(userId).orElse(null);
        if (p != null) {
            return new PatientProfileDto(p);
        }
        Doctor d = doctorRepository.findDoctorById(userId).orElse(null);
        if (d != null) {
            return new DoctorProfileDto(d);
        }
        throw new UserNotFoundException("User not found with id: " + userId);
    }

    public Object updateProfile(String userId, UpdateProfileRequest req) {
        Patient p = patientRepository.findPatientById(userId).orElse(null);
        if (p != null) {
            if (notBlank(req.getName())) {
                p.setName(req.getName().trim());
            }
            p.setPhone(req.getPhone());
            patientRepository.savePatient(p);
            return new PatientProfileDto(p);
        }

        Doctor d = doctorRepository.findDoctorById(userId).orElse(null);
        if (d != null) {
            if (notBlank(req.getName())) {
                d.setName(req.getName().trim());
            }
            p = null;
            d.setPhone(req.getPhone());
            if (notBlank(req.getSpecialization())) {
                d.setSpecialization(req.getSpecialization().trim());
            }
            if (req.getBio() != null) {
                d.setBio(req.getBio());
            }
            if (req.getQualification() != null) {
                d.setQualification(req.getQualification());
            }
            doctorRepository.saveDoctor(d);
            return new DoctorProfileDto(d);
        }
        throw new UserNotFoundException("User not found with id: " + userId);
    }

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }
}
