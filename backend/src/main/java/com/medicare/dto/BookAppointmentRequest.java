package com.medicare.dto;

import jakarta.validation.constraints.NotBlank;

public class BookAppointmentRequest {

    @NotBlank(message = "Doctor is required")
    private String doctorId;

    /** ISO date, e.g. 2026-09-30 */
    @NotBlank(message = "Date is required")
    private String date;

    /** Display slot time as published, e.g. "10:30 AM" */
    @NotBlank(message = "Time slot is required")
    private String timeSlot;

    /** Optional reason for visit */
    private String reason;

    public String getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
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

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
