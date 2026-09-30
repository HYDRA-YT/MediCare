package com.medicare.exception;

/** Generic user lookup failure (neither doctor nor patient). */
public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(String message) {
        super(message);
    }
}
