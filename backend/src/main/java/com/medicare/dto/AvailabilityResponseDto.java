package com.medicare.dto;

import java.util.List;
import java.util.Map;

/**
 * Availability view for a doctor: flat slot list plus a grouping by ISO date
 * so the UI can render date tabs directly.
 */
public class AvailabilityResponseDto {

    private String doctorId;
    private List<SlotDto> slots;
    private Map<String, List<SlotDto>> byDate;

    public AvailabilityResponseDto() {
    }

    public AvailabilityResponseDto(String doctorId, List<SlotDto> slots, Map<String, List<SlotDto>> byDate) {
        this.doctorId = doctorId;
        this.slots = slots;
        this.byDate = byDate;
    }

    public String getDoctorId() {
        return doctorId;
    }

    public List<SlotDto> getSlots() {
        return slots;
    }

    public Map<String, List<SlotDto>> getByDate() {
        return byDate;
    }

    public static class SlotDto {
        private String id;
        private String date;
        private String timeSlot;
        private String startTime;
        private String status;

        public SlotDto() {
        }

        public SlotDto(String id, String date, String timeSlot, String startTime, String status) {
            this.id = id;
            this.date = date;
            this.timeSlot = timeSlot;
            this.startTime = startTime;
            this.status = status;
        }

        public String getId() {
            return id;
        }

        public String getDate() {
            return date;
        }

        public String getTimeSlot() {
            return timeSlot;
        }

        public String getStartTime() {
            return startTime;
        }

        public String getStatus() {
            return status;
        }
    }
}
