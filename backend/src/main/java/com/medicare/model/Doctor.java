package com.medicare.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Doctor profile. Extends the documented base user fields and adds the fields the
 * project allows for a good UI: specialization, experience, qualification, bio,
 * avatar and availability information.
 */
public class Doctor extends User {

    private String specialization;
    private int experienceYears;
    private String qualification;
    private String bio;
    private String avatarUrl;
    private String consultationFee;
    private List<LocalDateTime> availability = new ArrayList<>();
    private LocalDateTime createdAt = LocalDateTime.now();

    public Doctor() {
    }

    public Doctor(String id, String name, String email, String passwordHash,
                  String specialization, int experienceYears, String qualification,
                  String bio, String avatarUrl, String consultationFee) {
        super(id, name, email, passwordHash, ROLE_DOCTOR);
        this.specialization = specialization;
        this.experienceYears = experienceYears;
        this.qualification = qualification;
        this.bio = bio;
        this.avatarUrl = avatarUrl;
        this.consultationFee = consultationFee;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public int getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(int experienceYears) {
        this.experienceYears = experienceYears;
    }

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(String consultationFee) {
        this.consultationFee = consultationFee;
    }

    public List<LocalDateTime> getAvailability() {
        return availability;
    }

    public void setAvailability(List<LocalDateTime> availability) {
        this.availability = availability == null ? new ArrayList<>() : availability;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
