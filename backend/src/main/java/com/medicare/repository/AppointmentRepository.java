package com.medicare.repository;

import com.medicare.model.Appointment;
import com.medicare.util.MongoConnection;
import org.bson.Document;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.medicare.repository.MongoDocMapper.UPSERT;
import static com.medicare.repository.MongoDocMapper.appointmentToDoc;
import static com.medicare.repository.MongoDocMapper.docToAppointment;
import static com.medicare.repository.MongoDocMapper.toDate;

/**
 * Repository layer: raw MongoDB CRUD for appointments — booking, slot-availability
 * checks, status updates, and history queries. No business decisions here.
 */
@Component
public class AppointmentRepository {

    private final com.mongodb.client.MongoDatabase db = MongoConnection.getInstance().getDatabase();

    public Appointment save(Appointment appointment) {
        db.getCollection("appointments").replaceOne(
                new Document("_id", appointment.getId()), appointmentToDoc(appointment), UPSERT);
        return appointment;
    }

    public Optional<Appointment> findById(String id) {
        return Optional.ofNullable(docToAppointment(
                db.getCollection("appointments").find(new Document("_id", id)).first()));
    }

    /**
     * Exact active-slot check used by booking: an active (BOOKED) appointment for the
     * same doctor + same slotStart. Backed by a unique compound index for race safety.
     */
    public boolean activeAppointmentExists(String doctorId, java.util.Date slotStart) {
        return db.getCollection("appointments").find(
                new Document("doctorId", doctorId)
                        .append("slotStart", slotStart)
                        .append("status", Appointment.STATUS_BOOKED)).first() != null;
    }

    public List<Appointment> findByPatient(String patientId) {
        return findSorted(new Document("patientId", patientId));
    }

    public List<Appointment> findByDoctor(String doctorId) {
        return findSorted(new Document("doctorId", doctorId));
    }

    public List<Appointment> findByDoctorAndStatus(String doctorId, String status) {
        return findSorted(new Document("doctorId", doctorId).append("status", status));
    }

    public List<Appointment> findByPatientAndStatus(String patientId, String status) {
        return findSorted(new Document("patientId", patientId).append("status", status));
    }

    public List<Appointment> findTodaysBookedByDoctor(String doctorId, String isoDate) {
        return findSorted(new Document("doctorId", doctorId)
                .append("date", isoDate)
                .append("status", Appointment.STATUS_BOOKED));
    }

    /** Distinct patients (excluding the doctor) who have appointments with this doctor. */
    public List<String> findDistinctPatientIdsByDoctor(String doctorId) {
        List<String> out = new ArrayList<>();
        db.getCollection("appointments").distinct("patientId",
                new Document("doctorId", doctorId), String.class).into(out);
        return out;
    }

    public long countByPatientAndStatus(String patientId, String status) {
        return db.getCollection("appointments").countDocuments(
                new Document("patientId", patientId).append("status", status));
    }

    public long countByDoctorAndStatus(String doctorId, String status) {
        return db.getCollection("appointments").countDocuments(
                new Document("doctorId", doctorId).append("status", status));
    }

    public boolean prescriptionExistsForAppointment(String appointmentId) {
        return db.getCollection("prescriptions")
                .find(new Document("appointmentId", appointmentId)).first() != null;
    }

    public boolean existsById(String id) {
        return db.getCollection("appointments").find(new Document("_id", id)).first() != null;
    }

    public long deleteAll() {
        return db.getCollection("appointments").deleteMany(new Document()).getDeletedCount();
    }

    private List<Appointment> findSorted(Document filter) {
        List<Appointment> out = new ArrayList<>();
        for (Document d : db.getCollection("appointments")
                .find(filter).sort(new Document("slotStart", 1))) {
            out.add(docToAppointment(d));
        }
        return out;
    }
}
