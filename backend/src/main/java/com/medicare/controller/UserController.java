package com.medicare.controller;

import com.medicare.dto.UpdateProfileRequest;
import com.medicare.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * User profile endpoints.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getProfile(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) String callerId) {
        requireSelf(callerId, id);
        return ResponseEntity.ok(userService.getProfile(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateProfile(
            @PathVariable String id,
            @Valid @RequestBody UpdateProfileRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String callerId) {
        requireSelf(callerId, id);
        return ResponseEntity.ok(userService.updateProfile(id, request));
    }

    private static void requireSelf(String callerId, String pathId) {
        if (callerId == null || !callerId.equals(pathId)) {
            throw new com.medicare.exception.UnauthorizedException(
                    "You are not allowed to access another user's profile.");
        }
    }
}
