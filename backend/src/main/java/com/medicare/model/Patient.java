package com.medicare.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Documented Patient model: id, name, email, password, appointmentIds.
 * Phone is an optional UI convenience field.
 */
public class Patient extends User {

    private LocalDateTime createdAt = LocalDateTime.now();

    public Patient() {
    }

    public Patient(String id, String name, String email, String passwordHash) {
        super(id, name, email, passwordHash, ROLE_PATIENT);
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
