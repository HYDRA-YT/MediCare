package com.medicare.repository;

import com.medicare.model.Doctor;
import com.medicare.model.DoctorSlot;
import com.medicare.util.MongoConnection;
import org.bson.Document;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.medicare.repository.MongoDocMapper.docToDoctor;
import static com.medicare.repository.MongoDocMapper.docToSlot;
import static com.medicare.repository.MongoDocMapper.doctorToDoc;
import static com.medicare.repository.MongoDocMapper.lower;
import static com.medicare.repository.MongoDocMapper.slotToDoc;
import static com.medicare.repository.MongoDocMapper.UPSERT;

/**
 * Repository layer: raw MongoDB CRUD for doctor documents and their
 * availability slot documents. Contains NO business decisions.
 */
@Component
public class DoctorRepository {

    private final com.mongodb.client.MongoDatabase db = MongoConnection.getInstance().getDatabase();

    /* ---------------- doctor documents ---------------- */

    public Optional<Doctor> findDoctorById(String id) {
        return Optional.ofNullable(
                docToDoctor(db.getCollection("users")
                        .find(new Document("_id", id).append("role", "DOCTOR")).first()));
    }

    public Optional<Doctor> findDoctorByEmail(String email) {
        return Optional.ofNullable(
                docToDoctor(db.getCollection("users")
                        .find(new Document("email", lower(email)).append("role", "DOCTOR")).first()));
    }

    public List<Doctor> findAllDoctors() {
        List<Doctor> out = new ArrayList<>();
        for (Document d : db.getCollection("users")
                .find(new Document("role", "DOCTOR")).sort(new Document("name", 1))) {
            Doctor doc = docToDoctor(d);
            if (doc != null) {
                out.add(doc);
            }
        }
        return out;
    }

    public void saveDoctor(Doctor doctor) {
        db.getCollection("users").replaceOne(
                new Document("_id", doctor.getId()), doctorToDoc(doctor), UPSERT);
    }

    public boolean emailExists(String email) {
        return db.getCollection("users")
                .find(new Document("email", lower(email))).first() != null;
    }

    /* ---------------- doctor_slots documents ---------------- */

    public void saveSlot(DoctorSlot slot) {
        db.getCollection("doctor_slots").replaceOne(
                new Document("_id", slot.getId()), slotToDoc(slot), UPSERT);
    }

    public Optional<DoctorSlot> findSlotById(String slotId) {
        Document d = db.getCollection("doctor_slots").find(new Document("_id", slotId)).first();
        return d == null ? Optional.empty() : Optional.of(docToSlot(d));
    }

    public List<DoctorSlot> findSlotsByDoctor(String doctorId, LocalDateTime from, boolean onlyFuture) {
        Document filter = new Document("doctorId", doctorId);
        if (onlyFuture) {
            filter.put("slotStart", new Document("$gte", utilDate(from)));
        }
        return findSlotsByFilter(filter);
    }

    public List<DoctorSlot> findSlotsByDoctorAndDate(String doctorId, String isoDate) {
        return findSlotsByFilter(new Document("doctorId", doctorId).append("date", isoDate));
    }

    public List<DoctorSlot> findSlotsByFilter(Document filter) {
        List<DoctorSlot> out = new ArrayList<>();
        for (Document d : db.getCollection("doctor_slots")
                .find(filter).sort(new Document("slotStart", 1))) {
            out.add(docToSlot(d));
        }
        return out;
    }

    public long countAvailableFutureSlots(String doctorId, LocalDateTime from) {
        return db.getCollection("doctor_slots").countDocuments(
                new Document("doctorId", doctorId)
                        .append("status", DoctorSlot.STATUS_AVAILABLE)
                        .append("slotStart", new Document("$gte", utilDate(from))));
    }

    public Optional<DoctorSlot> findNextAvailableSlot(String doctorId, LocalDateTime from) {
        Document d = db.getCollection("doctor_slots").find(
                        new Document("doctorId", doctorId)
                                .append("status", DoctorSlot.STATUS_AVAILABLE)
                                .append("slotStart", new Document("$gte", utilDate(from))))
                .sort(new Document("slotStart", 1)).first();
        return d == null ? Optional.empty() : Optional.of(docToSlot(d));
    }

    public boolean deleteSlot(String slotId) {
        return db.getCollection("doctor_slots").deleteOne(new Document("_id", slotId))
                .getDeletedCount() > 0;
    }

    /** Adds an appointment id to the doctor's appointmentIds list (documented model field). */
    public void addAppointmentReference(String doctorId, String appointmentId) {
        db.getCollection("users").updateOne(
                new Document("_id", doctorId),
                new Document("$addToSet", new Document("appointmentIds", appointmentId)));
    }

    /** Atomic status toggle: only marks the slot BOOKED if it is currently AVAILABLE. */
    public boolean markSlotBooked(String slotId) {
        return db.getCollection("doctor_slots").updateOne(
                new Document("_id", slotId).append("status", DoctorSlot.STATUS_AVAILABLE),
                new Document("$set", new Document("status", DoctorSlot.STATUS_BOOKED)))
                .getModifiedCount() > 0;
    }

    /** Atomic status toggle back to AVAILABLE (used when an appointment is cancelled). */
    public boolean markSlotAvailable(String slotId) {
        return db.getCollection("doctor_slots").updateOne(
                new Document("_id", slotId),
                new Document("$set", new Document("status", DoctorSlot.STATUS_AVAILABLE)))
                .getModifiedCount() > 0;
    }

    public Optional<DoctorSlot> findSlotByDoctorAndStart(String doctorId, LocalDateTime start) {
        Document d = db.getCollection("doctor_slots").find(
                        new Document("doctorId", doctorId)
                                .append("slotStart", utilDate(start)))
                .first();
        return d == null ? Optional.empty() : Optional.of(docToSlot(d));
    }

    private static java.util.Date utilDate(LocalDateTime ldt) {
        return java.util.Date.from(ldt.atZone(ZoneId.systemDefault()).toInstant());
    }
}
