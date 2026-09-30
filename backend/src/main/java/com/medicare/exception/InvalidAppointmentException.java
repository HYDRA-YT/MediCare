package com.medicare.exception;

/** Invalid appointment request (past date, malformed date, bad status transition). */
public class InvalidAppointmentException extends RuntimeException {

    public InvalidAppointmentException(String message) {
        super(message);
    }
}
