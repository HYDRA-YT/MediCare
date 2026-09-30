package com.medicare.model;

import java.time.LocalDateTime;

/**
 * Documented Appointment model: id, doctorId, patientId, date, timeSlot, status.
 * Statuses: BOOKED, COMPLETED, CANCELLED.
 *
 * "date" is the calendar date of the slot and "timeSlot" is the display time
 * (e.g. "10:30 AM"); "slotStart" mirrors the doctor's availability timestamp so
 * bookings are always tied to a published slot.
 */
public class Appointment {

    public static final String STATUS_BOOKED = "BOOKED";
    public static final String STATUS_COMPLETED = "COMPLETED";
    public static final String STATUS_CANCELLED = "CANCELLED";

    private String id;
    private String doctorId;
    private String patientId;
    private String date;
    private String timeSlot;
    private LocalDateTime slotStart;
    private String status;
    private String reason;
    private String notes;
    private LocalDateTime bookedAt;
    private LocalDateTime updatedAt;

    public Appointment() {
    }

    public Appointment(String id, String doctorId, String patientId, String date,
                       String timeSlot, LocalDateTime slotStart, String status) {
        this.id = id;
        this.doctorId = doctorId;
        this.patientId = patientId;
        this.date = date;
        this.timeSlot = timeSlot;
        this.slotStart = slotStart;
        this.status = status;
    }

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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getBookedAt() {
        return bookedAt;
    }

    public void setBookedAt(LocalDateTime bookedAt) {
        this.bookedAt = bookedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
