package com.medicare.repository;

import com.medicare.model.Patient;
import com.medicare.util.MongoConnection;
import org.bson.Document;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.medicare.repository.MongoDocMapper.UPSERT;
import static com.medicare.repository.MongoDocMapper.docToPatient;
import static com.medicare.repository.MongoDocMapper.lower;
import static com.medicare.repository.MongoDocMapper.patientToDoc;

/**
 * Repository layer: raw MongoDB CRUD for patient documents. No business logic.
 */
@Component
public class PatientRepository {

    private final com.mongodb.client.MongoDatabase db = MongoConnection.getInstance().getDatabase();

    public Optional<Patient> findPatientById(String id) {
        Document d = db.getCollection("users")
                .find(new Document("_id", id).append("role", "PATIENT")).first();
        return Optional.ofNullable(docToPatient(d));
    }

    public Optional<Patient> findPatientByEmail(String email) {
        Document d = db.getCollection("users")
                .find(new Document("email", lower(email)).append("role", "PATIENT")).first();
        return Optional.ofNullable(docToPatient(d));
    }

    public void savePatient(Patient patient) {
        db.getCollection("users").replaceOne(
                new Document("_id", patient.getId()), patientToDoc(patient), UPSERT);
    }

    /** Adds an appointment id to the patient's appointmentIds list (documented model field). */
    public void addAppointmentReference(String patientId, String appointmentId) {
        db.getCollection("users").updateOne(
                new Document("_id", patientId),
                new Document("$addToSet", new Document("appointmentIds", appointmentId)));
    }
}
