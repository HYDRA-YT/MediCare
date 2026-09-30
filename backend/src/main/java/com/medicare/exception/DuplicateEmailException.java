package com.medicare.exception;

/** Registration with an email that already exists. */
public class DuplicateEmailException extends RuntimeException {

    public DuplicateEmailException(String message) {
        super(message);
    }
}
