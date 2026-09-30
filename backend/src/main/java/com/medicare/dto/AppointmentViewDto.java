package com.medicare.dto;

import java.time.LocalDateTime;

/**
 * Appointment enriched with doctor/patient display info so the frontend can
 * render cards without extra requests. enrich* is filled by the service layer.
 */
public class AppointmentViewDto {

    private String id;
    private String doctorId;
    private String patientId;
    private String date;
    private String timeSlot;
    private LocalDateTime slotStart;
    private String status;
    private String reason;
    private LocalDateTime bookedAt;

    /* Enrichment */
    private String doctorName;
    private String doctorSpecialization;
    private String doctorAvatarUrl;
    private String patientName;
    private String patientPhone;

    private boolean prescriptionIssued;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTimeSlot() {
        return timeSlot;
    }

    public void setTimeSlot(String timeSlot) {
        this.timeSlot = timeSlot;
    }

    public LocalDateTime getSlotStart() {
        return slotStart;
    }

    public void setSlotStart(LocalDateTime slotStart) {
        this.slotStart = slotStart;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getBookedAt() {
        return bookedAt;
    }

    public void setBookedAt(LocalDateTime bookedAt) {
        this.bookedAt = bookedAt;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getDoctorSpecialization() {
        return doctorSpecialization;
    }

    public void setDoctorSpecialization(String doctorSpecialization) {
        this.doctorSpecialization = doctorSpecialization;
    }

    public String getDoctorAvatarUrl() {
        return doctorAvatarUrl;
    }

    public void setDoctorAvatarUrl(String doctorAvatarUrl) {
        this.doctorAvatarUrl = doctorAvatarUrl;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getPatientPhone() {
        return patientPhone;
    }

    public void setPatientPhone(String patientPhone) {
        this.patientPhone = patientPhone;
    }

    public boolean isPrescriptionIssued() {
        return prescriptionIssued;
    }

    public void setPrescriptionIssued(boolean prescriptionIssued) {
        this.prescriptionIssued = prescriptionIssued;
    }
}
