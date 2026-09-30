package com.medicare.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Documented Prescription model: id, appointmentId, doctorId, patientId,
 * diagnosis, medicines (multiple entries), timestamp.
 */
public class Prescription {

    private String id;
    private String appointmentId;
    private String doctorId;
    private String patientId;
    private String diagnosis;
    private String notes;
    private List<Medicine> medicines = new ArrayList<>();
    private LocalDateTime timestamp;
    private LocalDateTime createdAt;

    public Prescription() {
    }

    public Prescription(String id, String appointmentId, String doctorId, String patientId,
                        String diagnosis, String notes, LocalDateTime timestamp) {
        this.id = id;
        this.appointmentId = appointmentId;
        this.doctorId = doctorId;
        this.patientId = patientId;
        this.diagnosis = diagnosis;
        this.notes = notes;
        this.timestamp = timestamp;
        this.createdAt = timestamp;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(String appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getPatientId() {
        return patientId;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<Medicine> getMedicines() {
        return medicines;
    }

    public void setMedicines(List<Medicine> medicines) {
        this.medicines = medicines == null ? new ArrayList<>() : medicines;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
