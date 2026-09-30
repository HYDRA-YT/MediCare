package com.medicare.config;

import com.medicare.model.Appointment;
import com.medicare.model.Doctor;
import com.medicare.model.DoctorSlot;
import com.medicare.model.Medicine;
import com.medicare.model.Patient;
import com.medicare.model.Prescription;
import com.medicare.repository.AppointmentRepository;
import com.medicare.repository.DoctorRepository;
import com.medicare.repository.PatientRepository;
import com.medicare.repository.PrescriptionRepository;
import com.medicare.util.DateTimeUtil;
import com.medicare.util.IdGenerator;
import com.medicare.util.PasswordUtil;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Seeds MongoDB with realistic demo data on first run (idempotent: skips when the
 * users collection already contains doctors).
 *
 * Seeds 6 doctors, 5 patients, availability for the next 10 days, several booked
 * appointments (including today), completed appointments and issued prescriptions
 * so every dashboard is populated for the live demo.
 */
@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;

    public DataSeeder(DoctorRepository doctorRepository,
                      PatientRepository patientRepository,
                      AppointmentRepository appointmentRepository,
                      PrescriptionRepository prescriptionRepository) {
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.prescriptionRepository = prescriptionRepository;
    }

    private boolean seedEnabled() {
        String flag = System.getenv("MEDICARE_SEED_DEMO_DATA");
        return flag == null || flag.equalsIgnoreCase("true");
    }

    @Override
    public void run(ApplicationArguments args) {
        var db = com.medicare.util.MongoConnection.getInstance().getDatabase();

        // Indexes (idempotent). The partial unique index makes double-booking
        // impossible at the database level: only one BOOKED appointment may exist
        // per (doctorId, slotStart).
        db.getCollection("appointments").createIndex(
                new Document("doctorId", 1).append("slotStart", 1),
                new com.mongodb.client.model.IndexOptions()
                        .unique(true)
                        .partialFilterExpression(new Document("status", Appointment.STATUS_BOOKED)));
        db.getCollection("doctor_slots").createIndex(
                new Document("doctorId", 1).append("slotStart", 1),
                new com.mongodb.client.model.IndexOptions().unique(true));

        var users = db.getCollection("users");
        if (!seedEnabled() || users.countDocuments(new Document("role", "DOCTOR")) > 0) {
            log.info("DataSeeder: demo data already present or seeding disabled; skipping.");
            return;
        }
        log.info("DataSeeder: seeding demo data...");
        try {
            seed();
            log.info("DataSeeder: demo data seeded successfully.");
        } catch (Exception e) {
            log.error("DataSeeder: seeding failed", e);
        }
    }

    private void seed() {
        String hash = PasswordUtil.hash("password123");

        /* ---------------- doctors ---------------- */
        List<Doctor> doctors = new ArrayList<>();
        doctors.add(new Doctor(IdGenerator.seedDoctorId(1), "Dr. Ananya Sharma", "ananya.sharma@medicare.com", hash,
                "Cardiology", 12, "MBBS, MD (Cardiology), DM (Cardiology)",
                "Interventional cardiologist focused on preventive heart care, hypertension management and non-invasive cardiac diagnostics.", null, "\u20B9800"));
        doctors.add(new Doctor(IdGenerator.seedDoctorId(2), "Dr. Rohan Mehta", "rohan.mehta@medicare.com", hash,
                "Dermatology", 9, "MBBS, MD (Dermatology)",
                "Clinical dermatologist treating acne, eczema, hair and scalp disorders with evidence-based skincare plans.", null, "\u20B9600"));
        doctors.add(new Doctor(IdGenerator.seedDoctorId(3), "Dr. Kavya Singh", "kavya.singh@medicare.com", hash,
                "Neurology", 14, "MBBS, MD (Medicine), DM (Neurology)",
                "Neurologist specialising in headache medicine, epilepsy and stroke rehabilitation with a patient-first approach.", null, "\u20B9900"));
        doctors.add(new Doctor(IdGenerator.seedDoctorId(4), "Dr. Arjun Malhotra", "arjun.malhotra@medicare.com", hash,
                "Orthopedics", 11, "MBBS, MS (Orthopedics)",
                "Orthopedic surgeon for sports injuries, joint replacement and spine care, with a focus on fast rehabilitation.", null, "\u20B9750"));
        doctors.add(new Doctor(IdGenerator.seedDoctorId(5), "Dr. Neha Kapoor", "neha.kapoor@medicare.com", hash,
                "General Medicine", 8, "MBBS, MD (General Medicine)",
                "Primary care physician managing diabetes, thyroid disorders and everyday family health concerns.", null, "\u20B9500"));
        doctors.add(new Doctor(IdGenerator.seedDoctorId(6), "Dr. Vikram Rao", "vikram.rao@medicare.com", hash,
                "Pediatrics", 10, "MBBS, MD (Pediatrics)",
                "Pediatrician caring for newborns to teens: vaccinations, growth monitoring and childhood asthma care.", null, "\u20B9550"));
        for (Doctor d : doctors) {
            doctorRepository.saveDoctor(d);
        }

        /* ---------------- patients ---------------- */
        List<Patient> patients = new ArrayList<>();
        patients.add(new Patient(IdGenerator.seedPatientId(1), "Aarav Gupta", "aarav.gupta@medicare.com", hash));
        patients.add(new Patient(IdGenerator.seedPatientId(2), "Ishita Verma", "ishita.verma@medicare.com", hash));
        patients.add(new Patient(IdGenerator.seedPatientId(3), "Kabir Nair", "kabir.nair@medicare.com", hash));
        patients.add(new Patient(IdGenerator.seedPatientId(4), "Meera Iyer", "meera.iyer@medicare.com", hash));
        patients.add(new Patient(IdGenerator.seedPatientId(5), "Riya Sen", "riya.sen@medicare.com", hash));
        patients.get(0).setPhone("+91 98110 12345");
        patients.get(1).setPhone("+91 98110 23456");
        patients.get(2).setPhone("+91 98110 34567");
        patients.get(3).setPhone("+91 98110 45678");
        patients.get(4).setPhone("+91 98110 56789");
        for (Patient p : patients) {
            patientRepository.savePatient(p);
        }

        /* ---------------- availability (next 10 days) ---------------- */
        LocalTime[][] slotPatterns = {
                {morning(9, 0), morning(9, 30), morning(10, 0), morning(10, 30), afternoon(2, 0), afternoon(2, 30)},
                {morning(10, 0), morning(10, 30), morning(11, 0), afternoon(3, 0), afternoon(3, 30)},
                {morning(9, 30), morning(10, 0), morning(11, 30), afternoon(4, 0), afternoon(4, 30), afternoon(5, 0)},
                {morning(8, 30), morning(9, 0), morning(9, 30), afternoon(2, 0), afternoon(2, 30), afternoon(3, 0)},
                {morning(9, 0), morning(9, 30), morning(10, 0), afternoon(5, 0), afternoon(5, 30), afternoon(6, 0)},
                {morning(10, 0), morning(10, 30), morning(11, 0), morning(11, 30), afternoon(6, 0), afternoon(6, 30)}
        };

        int slotSeq = 0;
        LocalDate today = LocalDate.now();
        List<DoctorSlot> allSlots = new ArrayList<>();
        for (int day = 1; day <= 10; day++) {
            LocalDate date = today.plusDays(day);
            for (int i = 0; i < doctors.size(); i++) {
                for (LocalTime t : slotPatterns[i]) {
                    allSlots.add(new DoctorSlot(IdGenerator.seedSlotId(doctors.get(i).getId(), date.toString(), slotSeq++),
                            doctors.get(i).getId(), LocalDateTime.of(date, t), DoctorSlot.STATUS_AVAILABLE));
                }
                if (day == 1) {
                    // a couple of same-day slots for today's demo
                    for (LocalTime t : new LocalTime[]{morning(11, 0), afternoon(4, 30)}) {
                        allSlots.add(new DoctorSlot(
                                IdGenerator.seedSlotId(doctors.get(i).getId(), today.toString(), slotSeq++),
                                doctors.get(i).getId(), LocalDateTime.of(today, t), DoctorSlot.STATUS_AVAILABLE));
                    }
                }
            }
        }
        for (DoctorSlot s : allSlots) {
            doctorRepository.saveSlot(s);
        }

        /* ---------------- appointments ---------------- */
        int apptSeq = 1;
        List<Appointment> appointments = new ArrayList<>();

        // Completed + prescriptions (history)
        appointments.add(makeAppointment(IdGenerator.seedAppointmentId(apptSeq++), doctors.get(0), patients.get(0),
                today.minusDays(10), morning(10, 0), Appointment.STATUS_COMPLETED, "Chest tightness while climbing stairs"));
        appointments.add(makeAppointment(IdGenerator.seedAppointmentId(apptSeq++), doctors.get(4), patients.get(0),
                today.minusDays(6), morning(9, 30), Appointment.STATUS_COMPLETED, "Fever and body ache for two days"));
        appointments.add(makeAppointment(IdGenerator.seedAppointmentId(apptSeq++), doctors.get(1), patients.get(1),
                today.minusDays(8), afternoon(3, 0), Appointment.STATUS_COMPLETED, "Persistent acne despite OTC treatment"));
        appointments.add(makeAppointment(IdGenerator.seedAppointmentId(apptSeq++), doctors.get(2), patients.get(2),
                today.minusDays(12), morning(11, 30), Appointment.STATUS_COMPLETED, "Recurrent migraines, 3 episodes this month"));
        appointments.add(makeAppointment(IdGenerator.seedAppointmentId(apptSeq++), doctors.get(3), patients.get(3),
                today.minusDays(5), morning(9, 0), Appointment.STATUS_COMPLETED, "Right knee pain after morning run"));
        appointments.add(makeAppointment(IdGenerator.seedAppointmentId(apptSeq++), doctors.get(5), patients.get(4),
                today.minusDays(3), morning(10, 30), Appointment.STATUS_COMPLETED, "Child fever 101F since last night"));

        // Booked (upcoming + today)
        appointments.add(makeAppointment(IdGenerator.seedAppointmentId(apptSeq++), doctors.get(0), patients.get(1),
                today.plusDays(2), morning(10, 0), Appointment.STATUS_BOOKED, "Follow-up: ECG review"));
        appointments.add(makeAppointment(IdGenerator.seedAppointmentId(apptSeq++), doctors.get(4), patients.get(1),
                today.plusDays(1), morning(9, 0), Appointment.STATUS_BOOKED, "Thyroid report discussion"));
        appointments.add(makeAppointment(IdGenerator.seedAppointmentId(apptSeq++), doctors.get(2), patients.get(3),
                today.plusDays(3), afternoon(4, 0), Appointment.STATUS_BOOKED, "Numbness in left arm"));
        appointments.add(makeAppointment(IdGenerator.seedAppointmentId(apptSeq++), doctors.get(1), patients.get(4),
                today.plusDays(4), afternoon(3, 30), Appointment.STATUS_BOOKED, "Skin rash on forearms"));
        appointments.add(makeAppointment(IdGenerator.seedAppointmentId(apptSeq++), doctors.get(3), patients.get(0),
                today.plusDays(5), morning(9, 0), Appointment.STATUS_BOOKED, "Knee pain follow-up"));

        // A today appointment for the doctor demo flow
        Appointment todayAppt = makeAppointment(IdGenerator.seedAppointmentId(apptSeq++), doctors.get(0), patients.get(2),
                today, morning(11, 0), Appointment.STATUS_BOOKED, "Palpitations during exercise");
        appointments.add(todayAppt);

        for (Appointment a : appointments) {
            appointmentRepository.save(a);
            patientRepository.addAppointmentReference(a.getPatientId(), a.getId());
            doctorRepository.addAppointmentReference(a.getDoctorId(), a.getId());
        }

        // Mark the slots those BOOKED appointments occupy as BOOKED
        for (Appointment a : appointments) {
            if (Appointment.STATUS_BOOKED.equals(a.getStatus())) {
                doctorRepository.findSlotByDoctorAndStart(a.getDoctorId(), a.getSlotStart())
                        .ifPresent(s -> doctorRepository.markSlotBooked(s.getId()));
            }
        }

        /* ---------------- prescriptions (for completed appointments) ---------------- */
        List<Prescription> prescriptions = new ArrayList<>();
        prescriptions.add(makePrescription(IdGenerator.seedPrescriptionId(1), appointments.get(0), doctors.get(0),
                "Stable angina (NYHA class I-II)",
                List.of(new Medicine("Aspirin 75mg", "75 mg", "Once daily, after breakfast", "30 days"),
                        new Medicine("Atorvastatin 20mg", "20 mg", "Once daily at bedtime", "30 days"),
                        new Medicine("Metoprolol 25mg", "25 mg", "Twice daily", "30 days")),
                "Avoid heavy exertion. Review ECG in 4 weeks. Immediate care if chest pain worsens."));
        prescriptions.add(makePrescription(IdGenerator.seedPrescriptionId(2), appointments.get(1), doctors.get(4),
                "Acute viral fever with myalgia",
                List.of(new Medicine("Paracetamol 650mg", "650 mg", "Every 8 hours if fever", "5 days"),
                        new Medicine("Cetirizine 10mg", "10 mg", "Once daily at night", "5 days"),
                        new Medicine("ORS sachets", "1 sachet", "2-3 times daily", "3 days")),
                "Hydrate well. Return if fever persists beyond 3 days or crosses 103F."));
        prescriptions.add(makePrescription(IdGenerator.seedPrescriptionId(3), appointments.get(2), doctors.get(1),
                "Moderate inflammatory acne (Grade II)",
                List.of(new Medicine("Adapalene 0.1% gel", "Thin layer", "Once daily at night", "8 weeks"),
                        new Medicine("Clindamycin 1% gel", "Thin layer", "Twice daily", "4 weeks")),
                "Use a gentle non-comedogenic cleanser. Avoid oily cosmetics. Follow-up after 8 weeks."));
        prescriptions.add(makePrescription(IdGenerator.seedPrescriptionId(4), appointments.get(3), doctors.get(2),
                "Migraine without aura (episodic)",
                List.of(new Medicine("Sumatriptan 50mg", "50 mg", "At onset of attack, max 2/day", "As needed"),
                        new Medicine("Propranolol 40mg", "40 mg", "Once daily", "8 weeks")),
                "Maintain a headache diary. Reduce screen exposure. Review after 8 weeks."));
        prescriptions.add(makePrescription(IdGenerator.seedPrescriptionId(5), appointments.get(4), doctors.get(3),
                "Patellofemoral pain syndrome (right knee)",
                List.of(new Medicine("Ibuprofen 400mg", "400 mg", "Twice daily after food", "7 days"),
                        new Medicine("Calcium + Vitamin D3", "1 tablet", "Once daily", "60 days")),
                "Physiotherapy 3x/week. Avoid stairs and running for 3 weeks. Review with repeat X-ray."));
        prescriptions.add(makePrescription(IdGenerator.seedPrescriptionId(6), appointments.get(5), doctors.get(5),
                "Acute febrile illness (likely viral)",
                List.of(new Medicine("Paracetamol syrup 250mg/5ml", "5 ml", "Every 6 hours if fever", "4 days"),
                        new Medicine("Zinc syrup", "2.5 ml", "Once daily", "14 days")),
                "Sponge with lukewarm water if fever is high. Immediate review if drowsy or refusing feeds."));
        for (Prescription p : prescriptions) {
            prescriptionRepository.save(p);
        }
    }

    private Appointment makeAppointment(String id, Doctor doctor, Patient patient, LocalDate date,
                                        LocalTime time, String status, String reason) {
        LocalDateTime slotStart = LocalDateTime.of(date, time);
        Appointment a = new Appointment(id, doctor.getId(), patient.getId(),
                date.toString(), DateTimeUtil.format12h(time), slotStart, status);
        a.setReason(reason);
        a.setBookedAt(LocalDateTime.now().minusDays(1));
        a.setUpdatedAt(LocalDateTime.now().minusDays(1));
        return a;
    }

    private Prescription makePrescription(String id, Appointment appointment, Doctor doctor,
                                          String diagnosis, List<Medicine> medicines, String notes) {
        Prescription p = new Prescription(id, appointment.getId(), doctor.getId(), appointment.getPatientId(),
                diagnosis, notes, LocalDateTime.now().minusDays(2));
        p.setMedicines(medicines);
        return p;
    }

    private LocalTime morning(int h, int m) {
        return LocalTime.of(h, m);
    }

    private LocalTime afternoon(int h, int m) {
        return LocalTime.of(h, m);
    }
}
