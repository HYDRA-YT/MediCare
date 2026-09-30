package com.medicare.dto;

import jakarta.validation.constraints.NotBlank;

public class AddSlotRequest {

    /** ISO date, e.g. 2026-10-01 */
    @NotBlank(message = "Date is required")
    private String date;

    /** Slot time as displayed, e.g. "10:30 AM" */
    @NotBlank(message = "Time slot is required")
    private String timeSlot;

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
}
