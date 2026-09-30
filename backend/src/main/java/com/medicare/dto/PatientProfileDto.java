package com.medicare.dto;

/**
 * Patient profile returned by auth/user endpoints. Never includes the password hash.
 */
public class PatientProfileDto {

    private String id;
    private String name;
    private String email;
    private String phone;
    private String role = "PATIENT";

    public PatientProfileDto() {
    }

    public PatientProfileDto(com.medicare.model.Patient p) {
        this.id = p.getId();
        this.name = p.getName();
        this.email = p.getEmail();
        this.phone = p.getPhone();
        this.role = "PATIENT";
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
}
