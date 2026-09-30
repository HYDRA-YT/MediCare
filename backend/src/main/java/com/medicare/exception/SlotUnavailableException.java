package com.medicare.exception;

/** Requested slot does not exist, is not published, or is already booked. */
public class SlotUnavailableException extends RuntimeException {

    public SlotUnavailableException(String message) {
        super(message);
    }
}
