package com.medicare.exception;

/** Prescription attempted for a non-completed appointment or a duplicate. */
public class PrescriptionNotAllowedException extends RuntimeException {

    public PrescriptionNotAllowedException(String message) {
        super(message);
    }
}
