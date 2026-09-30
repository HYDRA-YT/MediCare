package com.medicare.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Generates human-friendly document ids.
 *
 * Appointments and prescriptions get presentation-friendly codes such as
 * MC-A7K2Q9 / MC-PX31RD, while users get prefixed ids (doc_x, pat_x, usr_x).
 */
public final class IdGenerator {

    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyMMddHHmmss");
    private static final AtomicLong SEQ = new AtomicLong(1);

    private IdGenerator() {
    }

    /** Short unique suffix: timestamp base36 + counter + 2 random chars. */
    private static String suffix() {
        long ts = Long.parseLong(LocalDateTime.now().format(TS), 10);
        String base = Long.toString(ts, 36).toUpperCase();
        String seq = Long.toString(SEQ.getAndIncrement(), 36).toUpperCase();
        String rnd = Integer.toString(ThreadLocalRandom.current().nextInt(36 * 36), 36).toUpperCase();
        return base + "-" + seq + "-" + (rnd.length() < 2 ? "0" + rnd : rnd);
    }

    public static String appointmentId() {
        return "MC-" + suffix();
    }

    public static String prescriptionId() {
        return "MC-RX" + Long.toString(System.currentTimeMillis(), 36).toUpperCase()
                + "-" + SEQ.getAndIncrement();
    }

    public static String doctorId() {
        return "doc_" + suffix() + "_" + SEQ.getAndIncrement();
    }

    public static String patientId() {
        return "pat_" + suffix() + "_" + SEQ.getAndIncrement();
    }

    public static String slotId() {
        return "slot_" + suffix() + "_" + SEQ.getAndIncrement();
    }

    public static String seedDoctorId(int n) {
        return "doc_seed_" + String.format("%03d", n);
    }

    public static String seedPatientId(int n) {
        return "pat_seed_" + String.format("%03d", n);
    }

    public static String seedSlotId(String doctorId, String date, int idx) {
        return "slot_" + doctorId + "_" + date + "_" + idx;
    }

    public static String seedAppointmentId(int n) {
        return "MC-SEED" + String.format("%04d", n);
    }

    public static String seedPrescriptionId(int n) {
        return "MC-RXSEED" + String.format("%04d", n);
    }
}
