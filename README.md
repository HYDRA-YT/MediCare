# MediCare 🏥

**Smart Hospital Appointment & Prescription Management**

MediCare digitizes hospital appointment booking and prescription management: doctors publish their available time slots and manage appointments, while patients browse doctors by specialization, book and cancel appointments in real time, and view digital prescriptions — all within a strict layered architecture.

> This is the **web prototype** of the documented console application. The documented tech stack is preserved exactly: **Java 17**, **MongoDB Atlas**, **Apache Maven**, and the layered architecture (UI/Controller → Service → Repository → MongoConnection → MongoDB). A REST controller layer was added for the web UI, as allowed by the project brief.

---

## Problem Statement

Hospitals still rely on manual, paper-based systems for appointment booking and prescription management — leading to inefficiencies, scheduling conflicts, lost prescriptions, and poor patient experience. Doctors cannot efficiently manage time slots, patients have no real-time availability information, and staff struggle with record-keeping.

## Solution

MediCare provides:

- **Appointment Booking** — patients browse doctors, check real-time availability, and book/cancel appointments.
- **Doctor Management** — doctors publish availability slots, manage their schedule, and complete consultations.
- **Prescription System** — digital prescriptions linked to *completed* appointments only.
- **User Auth & Roles** — secure registration/login with role-based access for Patients and Doctors.

---

## Features

| Area | Features |
|---|---|
| Authentication | Register (patient/doctor), login, logout, BCrypt-hashed passwords |
| Doctor Discovery | Search by name/qualification, filter by specialization, availability indicators |
| Booking | Date → slot selection, backend validation, double-booking prevention |
| Appointments | Upcoming / Completed / Cancelled views, cancel (patient), complete (doctor) |
| Availability | Doctors add/remove 30-min slots per day; booked slots protected |
| Prescriptions | Only for COMPLETED appointments; multi-medicine (name/dosage/frequency/duration); printable |
| Dashboards | Live stats computed from real database state for both roles |
| UX | Loading / error / empty states everywhere, toasts, modals, responsive layout |

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.3 (REST runtime), Maven 3.9.x |
| Database | MongoDB Atlas (or any MongoDB via `MONGO_URI`) |
| MongoDB Driver | Official `mongodb-driver-sync` (used directly — no Spring Data) |
| Security | `spring-security-crypto` BCrypt for password hashing |
| Frontend | React 18, Vite 5, Tailwind CSS 3, React Router 6 |
| Version Control | Git & GitHub |

## Architecture

```
             MEDICARE
                │
                ▼
      React + Vite Frontend
                │
             REST API (/api/**)
                │
                ▼
    Java 17 + Spring Boot
                │
        Controller Layer        ← HTTP, validation, status codes
                │
         Service Layer          ← business rules & validation
                │
       Repository Layer         ← raw MongoDB CRUD (no decisions)
                │
     MongoConnection Utility    ← singleton connection lifecycle
                │
         MongoDB Atlas
```

Layering rules enforced in the codebase:

- Controllers contain **no business logic**.
- Services contain all rules (slot validation, double-booking prevention, prescription eligibility, role checks).
- Repositories only translate Java objects ↔ MongoDB documents and run queries.
- `MongoConnection` is the **only** place a `MongoClient` is created; the URI comes from the `MONGO_URI` environment variable and is never hardcoded.

## Folder Structure

```
backend/
├── pom.xml
├── mvnw                        # Maven wrapper (downloads Maven 3.9.9 on first run)
├── api_test.py                 # end-to-end API test suite (58 checks)
└── src/main/
    ├── java/com/medicare/
    │   ├── MediCareApplication.java
    │   ├── config/             # WebConfig (CORS), DataSeeder (demo data + indexes)
    │   ├── controller/         # Auth, Doctor, Availability, Appointment, Prescription, User
    │   ├── dto/                # request/response payloads
    │   ├── exception/          # custom exceptions + GlobalExceptionHandler
    │   ├── model/              # User, Doctor, Patient, Appointment, Prescription, Medicine, DoctorSlot
    │   ├── repository/         # Doctor/Patient/Appointment/Prescription repositories + doc mapper
    │   ├── service/            # AuthService, DoctorService, AppointmentService, PrescriptionService, UserService
    │   └── util/               # MongoConnection, PasswordUtil, DateTimeUtil, IdGenerator
    └── resources/application.properties

frontend/
├── package.json / vite.config.js / tailwind.config.js
└── src/
    ├── components/             # ui primitives, cards, modals, states, form
    ├── context/                # AuthContext, ToastContext
    ├── hooks/                  # useAuth
    ├── layouts/                # DashboardLayout (sidebar)
    ├── pages/                  # Landing, Login, Register, patient/*, doctor/*, shared/*
    ├── services/api.js         # fetch wrapper with session headers
    └── utils/format.js
```

## Database Schema (MongoDB collections)

| Collection | Key fields |
|---|---|
| `users` | `_id, role (DOCTOR/PATIENT), name, email (unique per doc lookup), passwordHash (BCrypt), phone, appointmentIds[]`; doctors also: `specialization, experienceYears, qualification, bio, avatarUrl, consultationFee, availability[]` |
| `doctor_slots` | `_id, doctorId, slotStart (Date), date, timeSlot, status (AVAILABLE/BOOKED)` — unique index `(doctorId, slotStart)` |
| `appointments` | `_id (MC-XXXXXX), doctorId, patientId, date, timeSlot, slotStart, status (BOOKED/COMPLETED/CANCELLED), reason, bookedAt, updatedAt` — **partial unique index** `(doctorId, slotStart) WHERE status = BOOKED` makes double-booking impossible at DB level |
| `prescriptions` | `_id, appointmentId, doctorId, patientId, diagnosis, medicines[{name, dosage, frequency, duration}], notes, timestamp, createdAt` |

## MongoDB Atlas Setup

1. Create a free account at [cloud.mongodb.com](https://cloud.mongodb.com) and build an **M0 (Free) cluster**.
2. **Database Access** → Add a database user (username + password). Note them down.
3. **Network Access** → Add your current IP (or `0.0.0.0/0` for a college demo).
4. **Connect → Drivers → Java** → copy the SRV connection string.
5. Use it as your `MONGO_URI` (see below). The demo data seeds automatically on first run.

You can also test locally with any MongoDB instance: `MONGO_URI="mongodb://localhost:27017/medicare"`.

## Environment Variables

Copy `.env.example` and set at least:

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `MONGO_URI` | ✅ | — | MongoDB Atlas SRV connection string |
| `MEDICARE_DB_NAME` | — | `medicare` (or the db in the URI) | Database name override |
| `MEDICARE_CORS_ORIGINS` | — | `http://localhost:5173,...` | Allowed frontend origins |
| `MEDICARE_SEED_DEMO_DATA` | — | `true` | Seed demo data on first run |
| `SERVER_PORT` | — | `8080` | Backend port |

> `.env` is git-ignored. Never commit credentials.

## Installation

```bash
git clone <your-repo-url> medicare
cd medicare
```

### Backend Setup

Requirements: **JDK 17**. Maven is bundled via the wrapper (auto-downloads Maven 3.9.9).

```bash
cd backend

# Windows (bash/Git Bash)
export MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/medicare"

# Windows PowerShell
# $env:MONGO_URI = "mongodb+srv://user:pass@cluster.mongodb.net/medicare"

# Linux / macOS
# export MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/medicare"

./mvnw clean package          # verify the build succeeds
```

### Frontend Setup

Requirements: **Node 18+**.

```bash
cd frontend
npm install
```

## Running the Application

Terminal 1 — backend:

```bash
cd backend
export MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/medicare"
java -jar target/medicare-backend-1.0.0.jar
# or: ./mvnw spring-boot:run
```

Terminal 2 — frontend:

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` to `http://localhost:8080`.

Production frontend build: `npm run build` (outputs to `frontend/dist/`).

## Demo Credentials

Password for **all** demo accounts: `password123`

| Role | Name | Email |
|---|---|---|
| Patient | Aarav Gupta | `aarav.gupta@medicare.com` |
| Patient | Ishita Verma | `ishita.verma@medicare.com` |
| Patient | Kabir Nair | `kabir.nair@medicare.com` |
| Patient | Meera Iyer | `meera.iyer@medicare.com` |
| Patient | Riya Sen | `riya.sen@medicare.com` |
| Doctor | Dr. Ananya Sharma (Cardiology) | `ananya.sharma@medicare.com` |
| Doctor | Dr. Rohan Mehta (Dermatology) | `rohan.mehta@medicare.com` |
| Doctor | Dr. Kavya Singh (Neurology) | `kavya.singh@medicare.com` |
| Doctor | Dr. Arjun Malhotra (Orthopedics) | `arjun.malhotra@medicare.com` |
| Doctor | Dr. Neha Kapoor (General Medicine) | `neha.kapoor@medicare.com` |
| Doctor | Dr. Vikram Rao (Pediatrics) | `vikram.rao@medicare.com` |

Seeded data includes 6 doctors across all specializations, availability for the next 10 days, booked appointments (including today), completed appointments and issued prescriptions — so every dashboard is populated.

## API Documentation

Base URL: `http://localhost:8080/api`

### Auth
| Method | Endpoint | Body / Params | Notes |
|---|---|---|---|
| POST | `/auth/register` | `{name, email, password, role: PATIENT\|DOCTOR, phone?, specialization? (doctor)}` | 201; 409 duplicate email |
| POST | `/auth/login` | `{email, password}` | 200 `{token, userId, role, profile}`; 401 invalid |
| GET | `/auth/me?userId=` | — | Current profile |
| POST | `/auth/logout` | — | Stateless session discard |

### Doctors
| Method | Endpoint | Notes |
|---|---|---|
| GET | `/doctors?search=&specialization=` | Directory with availability summary |
| GET | `/doctors/{id}` | Profile + availability summary; 404 if missing |
| GET | `/doctors/specialization/{specialization}` | Filter endpoint |
| GET | `/doctors/specializations` | List of supported specializations |

### Availability
| Method | Endpoint | Notes |
|---|---|---|
| GET | `/doctors/{id}/availability?includePast=` | Slots grouped by date with status |
| POST | `/doctors/{id}/availability` | `{date, timeSlot}` → 201; past/duplicate rejected |
| DELETE | `/doctors/{id}/availability/{slotId}` | Booked slots cannot be removed |

### Appointments
| Method | Endpoint | Notes |
|---|---|---|
| POST | `/appointments` | Header `X-User-Id`; `{doctorId, date, timeSlot, reason?}` → 201 |
| GET | `/appointments/patient/{patientId}` | Own data only (`X-User-Id` must match) |
| GET | `/appointments/doctor/{doctorId}` | Own data only |
| GET | `/appointments/{id}` | Owner (patient or doctor) only |
| PUT | `/appointments/{id}/cancel` | Patient, BOOKED only → CANCELLED |
| PUT | `/appointments/{id}/complete` | Doctor, BOOKED only → COMPLETED |
| GET | `/appointments/patient/{patientId}/dashboard` | Live counters |
| GET | `/appointments/doctor/{doctorId}/dashboard` | Today/upcoming/patients/slots |

### Prescriptions
| Method | Endpoint | Notes |
|---|---|---|
| POST | `/prescriptions` | Header `X-User-Id` (doctor); `{appointmentId, diagnosis, medicines[{name,dosage,frequency,duration}], notes?}` |
| GET | `/prescriptions/patient/{patientId}` | Own prescriptions |
| GET | `/prescriptions/doctor/{doctorId}` | Issued prescriptions |
| GET | `/prescriptions/appointment/{appointmentId}` | Owner only; 204 if none yet |

### Users
| Method | Endpoint | Notes |
|---|---|---|
| GET | `/users/{id}` | Own profile (never includes password hash) |
| PUT | `/users/{id}` | Update name/phone (+ doctor profile fields) |

Error responses are always clean JSON: `{status, error, message, timestamp}` — stack traces never reach the UI.

## Testing

An end-to-end suite covers registration, login, role restrictions, doctor search/filter, availability, booking, double-booking prevention, past-date prevention, cancellation, completion, prescription eligibility, retrievals, dashboards, profiles, and error cases (missing doctor/patient/appointment, invalid inputs).

```bash
# with the backend running
cd backend
python api_test.py          # 58 checks; safe to run repeatedly
```

Manual testing checklist mirrors the same flows through the UI.

## Presentation Demo Flow

1. **Landing page** — show the hero, "How MediCare Works", features.
2. **Login as Patient** — `aarav.gupta@medicare.com` / `password123` (use the quick-fill button).
3. **Patient Dashboard** — point out live stats and the next appointment.
4. **Find Doctors** → search **"Cardiology"** → open **Dr. Ananya Sharma's profile**.
5. **Book a slot** — pick a date, choose a highlighted time, confirm → **Appointment Confirmed ✓** modal with the `MC-XXXXXX` id.
6. **My Appointments** — show the new BOOKED visit under Upcoming.
7. **Logout → Login as Doctor** — `ananya.sharma@medicare.com` / `password123`.
8. **Doctor Dashboard** — today's appointments and stats.
9. **Appointments** → **Mark Completed** on the booking the patient just made (or the pre-seeded one for today).
10. **Create Prescription** — fill diagnosis + 1-2 medicines → **Save Prescription** → "Prescription issued successfully."
11. **Logout → Login as Patient** → **Prescriptions** — the new digital prescription is there.
12. Open it, show medicines table, **Print Prescription**; also show the COMPLETED appointment.
13. **Bonus (defends the "zero conflicts" claim)**: try booking the same slot twice from two accounts — the backend rejects the second with *"Selected slot is no longer available."*

## Troubleshooting

| Problem | Fix |
|---|---|
| `Environment variable MONGO_URI is not set` | Export `MONGO_URI` before starting the backend (see Backend Setup). |
| Atlas connection timeout | Whitelist your IP in Atlas → Network Access; check the DB user's password for special characters that need URL-encoding. |
| `MVN repository download fails` | Check internet/proxy; the wrapper downloads Maven 3.9.9 on first run only. |
| Port 8080 in use | Change `SERVER_PORT` and the Vite proxy target in `frontend/vite.config.js`. |
| CORS errors in browser console | Ensure the frontend origin is in `MEDICARE_CORS_ORIGINS` (defaults include `http://localhost:5173`). |
| "Selected slot is no longer available." | Expected behaviour — another patient booked that slot first. Pick another slot. |
| Demo data missing | Seeding runs once when the `users` collection is empty and `MEDICARE_SEED_DEMO_DATA` is not `false`. Drop the database to re-seed. |
| Frontend can't reach the API | Keep the backend on 8080 or update the proxy in `frontend/vite.config.js`. |

## Deployment (Free Tier)

Recommended stack for a college demo that stays online 24/7:

| Piece | Service | Cost |
|---|---|---|
| Frontend | **Vercel** | Free (Hobby) |
| Backend | **Render** (Web Service) | Free (spins down when idle) |
| Database | **MongoDB Atlas** M0 | Free forever |

### 1. MongoDB Atlas
1. Create an M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. **Database Access** → create a user (e.g. `medicare_app`).
3. **Network Access** → `Add IP Address` → `Allow access from anywhere` `0.0.0.0/0`
   (required because Render/Vercel egress IPs are dynamic).
4. Copy the SRV URI: `mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/medicare`
   → this is your `MONGO_URI`. Demo data seeds itself on first boot.

### 2. Backend on Render
1. Push this repository to **GitHub**.
2. On [render.com](https://render.com): **New → Web Service** → connect the repo.
3. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Java 17 (Render default is fine) — Build: `./mvnw clean package -DskipTests`
   - **Start Command:** `java -jar target/medicare-backend-1.0.0.jar`
   - **Environment variable:** `MONGO_URI` = your Atlas URI (and optionally `MEDICARE_CORS_ORIGINS=https://your-app.vercel.app`)
4. Deploy. Render gives you `https://medicare-api-xxxx.onrender.com`.
5. Verify: `curl https://medicare-api-xxxx.onrender.com/api/doctors`

> The free tier sleeps after ~15 min idle; the first request afterwards takes ~30-60s
> (Atlas keeps data, Render just cold-starts the JVM). Open the app 1 min before presenting,
> or upgrade ($7/mo) to keep it warm. CORS: the WebConfig already allows configuring
> origins via `MEDICARE_CORS_ORIGINS`.

### 3. Frontend on Vercel
1. On [vercel.com](https://vercel.com): **Add New → Project** → import the same GitHub repo.
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (auto-detected) — Build `npm run build`, Output `dist`
   - **Environment variable:** `VITE_API_BASE` = `https://medicare-api-xxxx.onrender.com/api`
     (this is consumed at build time by `frontend/src/services/api.js`)
3. Deploy. You get `https://medicare-xxxx.vercel.app` — SPA rewrites are already
   configured in `frontend/vercel.json`.

**That's it.** The full chain is: Vercel (React) → Render (Spring Boot) → Atlas (MongoDB).
All three steps together take ~15 minutes.

#### Alternative: single-service deployment

If you'd rather deploy **one service only**, serve the built frontend from Spring Boot:

```bash
cd frontend && npm run build
cp -r dist/* ../backend/src/main/resources/static/
cd ../backend && ./mvnw clean package
MONGO_URI=... java -jar target/medicare-backend-1.0.0.jar
```

Then deploy just the backend (Render/Railway/Fly.io/a VPS) — the app is served from
`http://<host>:8080` with the API on the same origin. Rebuild the jar whenever the
frontend changes.

## Known Limitations

- Sessions use opaque tokens + `X-User-Id` headers rather than JWT — deliberate simplicity for an academic prototype; all protected operations still validate the caller against MongoDB.
- Cancellation is allowed any time before completion (the plan documents no deadline rule).
- Print styling is minimal (uses the browser's default print of the prescription view).
- Demo data is fictional; the app makes no medical claims and is for demonstration only.
