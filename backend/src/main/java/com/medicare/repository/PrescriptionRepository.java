package com.medicare.repository;

import com.medicare.model.Prescription;
import com.medicare.util.MongoConnection;
import org.bson.Document;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.medicare.repository.MongoDocMapper.UPSERT;
import static com.medicare.repository.MongoDocMapper.docToPrescription;
import static com.medicare.repository.MongoDocMapper.prescriptionToDoc;

/**
 * Repository layer: raw MongoDB CRUD for prescription records. No business logic.
 */
@Component
public class PrescriptionRepository {

    private final com.mongodb.client.MongoDatabase db = MongoConnection.getInstance().getDatabase();

    public Prescription save(Prescription prescription) {
        db.getCollection("prescriptions").replaceOne(
                new Document("_id", prescription.getId()), prescriptionToDoc(prescription), UPSERT);
        return prescription;
    }

    public Optional<Prescription> findById(String id) {
        return Optional.ofNullable(docToPrescription(
                db.getCollection("prescriptions").find(new Document("_id", id)).first()));
    }

    public Optional<Prescription> findByAppointmentId(String appointmentId) {
        return Optional.ofNullable(docToPrescription(
                db.getCollection("prescriptions")
                        .find(new Document("appointmentId", appointmentId)).first()));
    }

    public List<Prescription> findByPatient(String patientId) {
        return findSorted(new Document("patientId", patientId));
    }

    public List<Prescription> findByDoctor(String doctorId) {
        return findSorted(new Document("doctorId", doctorId));
    }

    public long deleteAll() {
        return db.getCollection("prescriptions").deleteMany(new Document()).getDeletedCount();
    }

    private List<Prescription> findSorted(Document filter) {
        List<Prescription> out = new ArrayList<>();
        for (Document d : db.getCollection("prescriptions")
                .find(filter).sort(new Document("timestamp", -1))) {
            out.add(docToPrescription(d));
        }
        return out;
    }
}
