package com.medicare.util;

import com.medicare.exception.InvalidAppointmentException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Locale;

/**
 * Date/time parsing and formatting helpers shared across layers.
 * All slot times are handled as LocalTime on the JVM default zone; the display
 * format is the familiar "10:30 AM" style used throughout the UI.
 */
public final class DateTimeUtil {

    public static final DateTimeFormatter TIME_12H =
            DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH);

    private DateTimeUtil() {
    }

    /** Parses "10:30 AM", "9:00 am", "14:30" etc. into a LocalTime. */
    public static LocalTime parseTime(String raw) {
        if (raw == null) {
            throw new InvalidAppointmentException("Time slot is required.");
        }
        String t = raw.trim().toUpperCase(Locale.ROOT);
        try {
            if (t.contains("AM") || t.contains("PM")) {
                return LocalTime.parse(t, DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH));
            }
            if (t.contains(":")) {
                return LocalTime.parse(t, DateTimeFormatter.ofPattern("HH:mm"));
            }
            // Bare hour like "9" or "9 AM"
            if (t.matches("\\d{1,2}( ?AM| ?PM)?")) {
                String normalized = t.replace(" ", "");
                if (normalized.endsWith("AM") || normalized.endsWith("PM")) {
                    int hour = Integer.parseInt(normalized.substring(0, normalized.length() - 2));
                    boolean pm = normalized.endsWith("PM");
                    return LocalTime.of(to24h(hour, pm), 0);
                }
                return LocalTime.of(Integer.parseInt(normalized), 0);
            }
        } catch (DateTimeParseException | NumberFormatException ignored) {
            // fall through
        }
        throw new InvalidAppointmentException("Invalid time slot format: " + raw);
    }

    private static int to24h(int hour, boolean pm) {
        if (pm && hour < 12) {
            return hour + 12;
        }
        if (!pm && hour == 12) {
            return 0;
        }
        return hour;
    }

    /** Formats a LocalTime as "10:30 AM". */
    public static String format12h(LocalTime time) {
        return time.format(TIME_12H);
    }

    /** Formats a LocalDateTime as "10:30 AM". */
    public static String format12h(LocalDateTime ldt) {
        return ldt.format(TIME_12H);
    }

    /** Parses an ISO date (yyyy-MM-dd) and rejects malformed input. */
    public static LocalDate parseDate(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new InvalidAppointmentException("Date is required.");
        }
        try {
            return LocalDate.parse(raw.trim());
        } catch (DateTimeParseException e) {
            throw new InvalidAppointmentException("Invalid date format. Expected yyyy-MM-dd.");
        }
    }

    /** Combined date + "10:30 AM" -> LocalDateTime. */
    public static LocalDateTime combine(LocalDate date, String timeSlotDisplay) {
        return LocalDateTime.of(date, parseTime(timeSlotDisplay));
    }
}
