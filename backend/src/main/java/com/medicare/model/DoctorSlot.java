package com.medicare.model;

import java.time.LocalDateTime;

/**
 * One published availability slot (an atomic slotId + start timestamp).
 * Stored in the doctor_slots collection; uniqueness of (doctorId, slotStart)
 * is enforced with a unique compound index.
 */
public class DoctorSlot {

    public static final String STATUS_AVAILABLE = "AVAILABLE";
    public static final String STATUS_BOOKED = "BOOKED";

    private String id;
    private String doctorId;
    private LocalDateTime slotStart;
    private String status = STATUS_AVAILABLE;

    public DoctorSlot() {
    }

    public DoctorSlot(String id, String doctorId, LocalDateTime slotStart, String status) {
        this.id = id;
        this.doctorId = doctorId;
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
}
