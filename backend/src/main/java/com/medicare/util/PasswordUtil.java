package com.medicare.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Password hashing helper. Passwords are NEVER stored as plain text;
 * every stored password is a BCrypt hash with a random salt.
 */
public final class PasswordUtil {

    private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder(10);

    private PasswordUtil() {
    }

    public static String hash(String plain) {
        return ENCODER.encode(plain);
    }

    /** Constant-time comparison of a plain candidate against a stored hash. */
    public static boolean verify(String plain, String hash) {
        if (plain == null || hash == null || hash.isBlank()) {
            return false;
        }
        try {
            return ENCODER.matches(plain, hash);
        } catch (IllegalArgumentException e) {
            // Stored value is not a valid bcrypt hash.
            return false;
        }
    }
}
