package com.medicare.dto;

/**
 * Doctor profile returned by auth/user endpoints. Never includes the password hash.
 */
public class DoctorProfileDto {

    private String id;
    private String name;
    private String email;
    private String phone;
    private String role = "DOCTOR";
    private String specialization;
    private int experienceYears;
    private String qualification;
    private String bio;
    private String avatarUrl;
    private String consultationFee;

    public DoctorProfileDto() {
    }

    public DoctorProfileDto(com.medicare.model.Doctor d) {
        this.id = d.getId();
        this.name = d.getName();
        this.email = d.getEmail();
        this.phone = d.getPhone();
        this.role = "DOCTOR";
        this.specialization = d.getSpecialization();
        this.experienceYears = d.getExperienceYears();
        this.qualification = d.getQualification();
        this.bio = d.getBio();
        this.avatarUrl = d.getAvatarUrl();
        this.consultationFee = d.getConsultationFee();
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

    public String getPhone() {
        return phone;
    }

    public String getRole() {
        return role;
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
}
