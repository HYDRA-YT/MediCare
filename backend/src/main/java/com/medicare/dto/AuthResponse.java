package com.medicare.dto;

/**
 * Auth response. Token is a random opaque string kept in memory by the SPA;
 * each protected request also carries the caller's id, which the service layer
 * verifies against the users collection (simple but real, no fake auth).
 */
public class AuthResponse {

    private String token;
    private String userId;
    private String role;
    private Object profile;

    public AuthResponse() {
    }

    public AuthResponse(String token, String userId, String role, Object profile) {
        this.token = token;
        this.userId = userId;
        this.role = role;
        this.profile = profile;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Object getProfile() {
        return profile;
    }

    public void setProfile(Object profile) {
        this.profile = profile;
    }
}
