package com.medicare.dto;

/**
 * Doctor card payload for list endpoints. Availability summary is computed by the
 * service layer (count of future AVAILABLE slots + next slot timestamp).
 */
public class DoctorSummaryDto {

    private String id;
    private String name;
    private String email;
    private String specialization;
    private int experienceYears;
    private String qualification;
    private String bio;
    private String avatarUrl;
    private String consultationFee;
    private long availableSlots;
    private String nextAvailableSlot;

    public DoctorSummaryDto() {
    }

    public DoctorSummaryDto(com.medicare.model.Doctor d, long availableSlots, String nextAvailableSlot) {
        this.id = d.getId();
        this.name = d.getName();
        this.email = d.getEmail();
        this.specialization = d.getSpecialization();
        this.experienceYears = d.getExperienceYears();
        this.qualification = d.getQualification();
        this.bio = d.getBio();
        this.avatarUrl = d.getAvatarUrl();
        this.consultationFee = d.getConsultationFee();
        this.availableSlots = availableSlots;
        this.nextAvailableSlot = nextAvailableSlot;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getSpecialization() {
        return specialization;
    }

    public int getExperienceYears() {
        return experienceYears;
    }

    public String getQualification() {
        return qualification;
    }

    public String getBio() {
        return bio;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public String getConsultationFee() {
        return consultationFee;
    }

    public long getAvailableSlots() {
        return availableSlots;
    }

    public String getNextAvailableSlot() {
        return nextAvailableSlot;
    }
}
