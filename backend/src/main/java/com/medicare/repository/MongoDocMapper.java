package com.medicare.repository;

import com.medicare.model.Appointment;
import com.medicare.model.Doctor;
import com.medicare.model.DoctorSlot;
import com.medicare.model.Medicine;
import com.medicare.model.Patient;
import com.medicare.model.Prescription;
import com.medicare.util.DateTimeUtil;
import org.bson.Document;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mappers between MongoDB Documents and the model classes, shared by all
 * repositories so conversion logic is not duplicated.
 */
public final class MongoDocMapper {

    public static final com.mongodb.client.model.ReplaceOptions UPSERT =
            new com.mongodb.client.model.ReplaceOptions().upsert(true);

    private MongoDocMapper() {
    }

    public static String lower(String s) {
        return s == null ? null : s.trim().toLowerCase();
    }

    public static Date toDate(LocalDateTime ldt) {
        return ldt == null ? null : Date.from(ldt.atZone(ZoneId.systemDefault()).toInstant());
    }

    public static LocalDateTime toLocalDateTime(Date date) {
        return date == null ? null : LocalDateTime.ofInstant(date.toInstant(), ZoneId.systemDefault());
    }

    /* ---------------- users: doctor ---------------- */

    public static Document doctorToDoc(Doctor d) {
        List<Date> availability = d.getAvailability() == null ? List.of()
                : d.getAvailability().stream().map(MongoDocMapper::toDate).collect(Collectors.toList());
        return new Document("_id", d.getId())
                .append("role", "DOCTOR")
                .append("name", d.getName())
                .append("email", lower(d.getEmail()))
                .append("passwordHash", d.getPasswordHash())
                .append("phone", d.getPhone())
                .append("appointmentIds", d.getAppointmentIds())
                .append("specialization", d.getSpecialization())
                .append("experienceYears", d.getExperienceYears())
                .append("qualification", d.getQualification())
                .append("bio", d.getBio())
                .append("avatarUrl", d.getAvatarUrl())
                .append("consultationFee", d.getConsultationFee())
                .append("availability", availability)
                .append("createdAt", toDate(d.getCreatedAt()));
    }

    public static Doctor docToDoctor(Document d) {
        if (d == null) {
            return null;
        }
        Doctor doc = new Doctor();
        doc.setId(d.getString("_id"));
        doc.setName(d.getString("name"));
        doc.setEmail(d.getString("email"));
        doc.setPasswordHash(d.getString("passwordHash"));
        doc.setRole("DOCTOR");
        doc.setPhone(d.getString("phone"));
        Object apptIds = d.get("appointmentIds");
        if (apptIds instanceof List) {
            doc.setAppointmentIds(((List<?>) apptIds).stream()
                    .map(String::valueOf).collect(Collectors.toList()));
        }
        doc.setSpecialization(d.getString("specialization"));
        doc.setExperienceYears(d.getInteger("experienceYears", 0));
        doc.setQualification(d.getString("qualification"));
        doc.setBio(d.getString("bio"));
        doc.setAvatarUrl(d.getString("avatarUrl"));
        doc.setConsultationFee(d.getString("consultationFee"));
        Object avail = d.get("availability");
        List<java.time.LocalDateTime> times = new ArrayList<>();
        if (avail instanceof List) {
            for (Object o : (List<?>) avail) {
                if (o instanceof Date) {
                    times.add(toLocalDateTime((Date) o));
                }
            }
        }
        doc.setAvailability(times);
        return doc;
    }

    /* ---------------- users: patient ---------------- */

    public static Document patientToDoc(Patient p) {
        return new Document("_id", p.getId())
                .append("role", "PATIENT")
                .append("name", p.getName())
                .append("email", lower(p.getEmail()))
                .append("passwordHash", p.getPasswordHash())
                .append("phone", p.getPhone())
                .append("appointmentIds", p.getAppointmentIds())
                .append("createdAt", toDate(p.getCreatedAt()));
    }

    public static Patient docToPatient(Document d) {
        if (d == null) {
            return null;
        }
        Patient p = new Patient();
        p.setId(d.getString("_id"));
        p.setName(d.getString("name"));
        p.setEmail(d.getString("email"));
        p.setPasswordHash(d.getString("passwordHash"));
        p.setRole("PATIENT");
        p.setPhone(d.getString("phone"));
        Object apptIds = d.get("appointmentIds");
        if (apptIds instanceof List) {
            p.setAppointmentIds(((List<?>) apptIds).stream()
                    .map(String::valueOf).collect(Collectors.toList()));
        }
        return p;
    }

    /* ---------------- doctor_slots ---------------- */

    public static Document slotToDoc(DoctorSlot s) {
        return new Document("_id", s.getId())
                .append("doctorId", s.getDoctorId())
                .append("slotStart", toDate(s.getSlotStart()))
                .append("date", s.getSlotStart().toLocalDate().toString())
                .append("timeSlot", DateTimeUtil.format12h(s.getSlotStart().toLocalTime()))
                .append("status", s.getStatus());
    }

    public static DoctorSlot docToSlot(Document d) {
        if (d == null) {
            return null;
        }
        DoctorSlot s = new DoctorSlot();
        s.setId(d.getString("_id"));
        s.setDoctorId(d.getString("doctorId"));
        s.setSlotStart(toLocalDateTime(d.getDate("slotStart")));
        s.setStatus(d.getString("status"));
        return s;
    }

    /* ---------------- appointments ---------------- */

    public static Document appointmentToDoc(Appointment a) {
        Document doc = new Document("_id", a.getId())
                .append("doctorId", a.getDoctorId())
                .append("patientId", a.getPatientId())
                .append("date", a.getDate())
                .append("timeSlot", a.getTimeSlot())
                .append("slotStart", toDate(a.getSlotStart()))
                .append("status", a.getStatus())
                .append("bookedAt", toDate(a.getBookedAt()))
                .append("updatedAt", toDate(a.getUpdatedAt()));
        if (a.getReason() != null) {
            doc.append("reason", a.getReason());
        }
        if (a.getNotes() != null) {
            doc.append("notes", a.getNotes());
        }
        return doc;
    }

    public static Appointment docToAppointment(Document d) {
        if (d == null) {
            return null;
        }
        Appointment a = new Appointment();
        a.setId(d.getString("_id"));
        a.setDoctorId(d.getString("doctorId"));
        a.setPatientId(d.getString("patientId"));
        a.setDate(d.getString("date"));
        a.setTimeSlot(d.getString("timeSlot"));
        a.setSlotStart(toLocalDateTime(d.getDate("slotStart")));
        a.setStatus(d.getString("status"));
        a.setReason(d.getString("reason"));
        a.setNotes(d.getString("notes"));
        a.setBookedAt(toLocalDateTime(d.getDate("bookedAt")));
        a.setUpdatedAt(toLocalDateTime(d.getDate("updatedAt")));
        return a;
    }

    /* ---------------- prescriptions ---------------- */

    public static Document prescriptionToDoc(Prescription p) {
        List<Document> meds = p.getMedicines() == null ? List.of()
                : p.getMedicines().stream().map(MongoDocMapper::medicineToDoc).collect(Collectors.toList());
        return new Document("_id", p.getId())
                .append("appointmentId", p.getAppointmentId())
                .append("doctorId", p.getDoctorId())
                .append("patientId", p.getPatientId())
                .append("diagnosis", p.getDiagnosis())
                .append("medicines", meds)
                .append("timestamp", toDate(p.getTimestamp()))
                .append("createdAt", toDate(p.getCreatedAt()));
    }

    public static Prescription docToPrescription(Document d) {
        if (d == null) {
            return null;
        }
        Prescription p = new Prescription();
        p.setId(d.getString("_id"));
        p.setAppointmentId(d.getString("appointmentId"));
        p.setDoctorId(d.getString("doctorId"));
        p.setPatientId(d.getString("patientId"));
        p.setDiagnosis(d.getString("diagnosis"));
        p.setNotes(d.getString("notes"));
        p.setTimestamp(toLocalDateTime(d.getDate("timestamp")));
        p.setCreatedAt(toLocalDateTime(d.getDate("createdAt")));
        Object meds = d.get("medicines");
        List<Medicine> list = new ArrayList<>();
        if (meds instanceof List) {
            for (Object o : (List<?>) meds) {
                if (o instanceof Document) {
                    Document m = (Document) o;
                    list.add(new Medicine(
                            m.getString("name"),
                            m.getString("dosage"),
                            m.getString("frequency"),
                            m.getString("duration")));
                }
            }
        }
        p.setMedicines(list);
        return p;
    }

    private static Document medicineToDoc(Medicine m) {
        return new Document("name", m.getName())
                .append("dosage", m.getDosage())
                .append("frequency", m.getFrequency())
                .append("duration", m.getDuration());
    }
}
