"""End-to-end API test suite for MediCare backend.

Idempotent: safe to run repeatedly against a live backend. Uses unique
per-run accounts and picks genuinely AVAILABLE slots before booking.
"""
import json
import time
import urllib.request
import urllib.error
import sys

BASE = "http://localhost:8080"
RUN = str(int(time.time()))[-6:]
PASSED = 0
FAILED = 0
FAILURES = []


def call(method, path, body=None, headers=None):
    url = BASE + path
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    for k, v in (headers or {}).items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            raw = r.read().decode()
            return r.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, raw


def check(name, cond, extra=""):
    global PASSED, FAILED
    if cond:
        PASSED += 1
        print(f"  PASS  {name}")
    else:
        FAILED += 1
        FAILURES.append(name)
        print(f"  FAIL  {name}  {extra}")


print("== AUTH ==")
s, r = call("POST", "/api/auth/register", {
    "name": "Test Patient", "email": f"test.patient.{RUN}@medicare.com",
    "password": "secret123", "role": "PATIENT", "phone": "+91 90000 00000"})
check("register patient -> 201", s == 201, r)
check("register returns PATIENT role", isinstance(r, dict) and r.get("role") == "PATIENT")
test_patient_id = r.get("userId") if isinstance(r, dict) else None

s, r = call("POST", "/api/auth/register", {
    "name": "Dup", "email": f"test.patient.{RUN}@medicare.com", "password": "secret123", "role": "PATIENT"})
check("duplicate email -> 409", s == 409, r)

s, r = call("POST", "/api/auth/register", {
    "name": "BadDoc", "email": f"baddoc.{RUN}@medicare.com", "password": "secret123", "role": "DOCTOR"})
check("doctor register without specialization -> 400", s == 400, r)

s, r = call("POST", "/api/auth/register", {
    "name": "Bad", "email": "not-an-email", "password": "x", "role": "PATIENT"})
check("invalid email -> 400", s == 400, r)

s, r = call("POST", "/api/auth/login", {"email": "aarav.gupta@medicare.com", "password": "password123"})
check("login seeded patient -> 200", s == 200 and r.get("role") == "PATIENT", r)
patient_id = r.get("userId") if isinstance(r, dict) else None

s, r = call("POST", "/api/auth/login", {"email": "aarav.gupta@medicare.com", "password": "wrongpass"})
check("wrong password -> 401", s == 401, r)

s, r = call("POST", "/api/auth/login", {"email": "ananya.sharma@medicare.com", "password": "password123"})
check("login seeded doctor -> 200 DOCTOR", s == 200 and r.get("role") == "DOCTOR", r)
doctor_id = r.get("userId") if isinstance(r, dict) else None  # doc_seed_001

s, r = call("POST", "/api/auth/login", {"email": "ghost@medicare.com", "password": "password123"})
check("unknown email -> 401", s == 401, r)

print("== DOCTORS ==")
s, r = call("GET", "/api/doctors")
check("list doctors -> 200 (6 seeded)", s == 200 and len(r) == 6, len(r) if isinstance(r, list) else r)
check("doctor card has availability summary", isinstance(r, list) and r and r[0].get("availableSlots", 0) > 0)

s, r = call("GET", "/api/doctors?search=cardio")
check("search 'cardio' -> Cardiology doctor",
      s == 200 and len(r) == 1 and r[0]["specialization"] == "Cardiology", r)

s, r = call("GET", "/api/doctors?specialization=Pediatrics")
check("filter Pediatrics -> Dr. Vikram Rao", s == 200 and len(r) == 1 and "Vikram" in r[0]["name"], r)

s, r = call("GET", "/api/doctors?search=zzzznothing")
check("search no match -> empty list", s == 200 and r == [], r)

s, r = call("GET", f"/api/doctors/{doctor_id}")
check("get doctor by id -> 200", s == 200 and r.get("id") == doctor_id, r)

s, r = call("GET", "/api/doctors/doc_does_not_exist")
check("missing doctor -> 404", s == 404, r)

s, r = call("GET", "/api/doctors/specialization/Cardiology")
check("by specialization endpoint -> 1", s == 200 and len(r) == 1, r)

print("== AVAILABILITY ==")
s, avail = call("GET", f"/api/doctors/{doctor_id}/availability")
check("availability -> 200 with byDate groups", s == 200 and len(avail.get("byDate", {})) > 0, avail)
first_date = sorted(avail["byDate"].keys())[0]
slot = avail["byDate"][first_date][0]
check("slot has id/date/timeSlot/status", all(k in slot for k in ("id", "date", "timeSlot", "status")))

# Pick the first genuinely AVAILABLE future slot (earlier test runs may have
# consumed the first slots by completing their bookings).
slot = None
for d in sorted(avail["byDate"].keys()):
    for s_ in avail["byDate"][d]:
        if s_["status"] == "AVAILABLE":
            slot = s_
            break
    if slot:
        break
check("an AVAILABLE slot exists for booking tests", slot is not None)

print("== BOOKING ==")
book = {"doctorId": doctor_id, "date": slot["date"], "timeSlot": slot["timeSlot"], "reason": "API test booking"}
s, appt = call("POST", "/api/appointments", book, {"X-User-Id": patient_id})
check("book valid slot -> 201", s == 201, appt)
check("appointment id has MC- prefix", isinstance(appt, dict) and str(appt.get("id", "")).startswith("MC-"))
check("status BOOKED", isinstance(appt, dict) and appt.get("status") == "BOOKED")
appt_id = appt.get("id") if isinstance(appt, dict) else None

s, r = call("POST", "/api/appointments", book, {"X-User-Id": test_patient_id})
check("double-booking same slot -> 409 'no longer available'",
      s == 409 and "no longer available" in r.get("message", ""), r)

s, r = call("POST", "/api/appointments", book, {"X-User-Id": patient_id})
check("same patient same time -> rejected (400/409)", s in (400, 409), r)

s, r = call("POST", "/api/appointments",
            {"doctorId": doctor_id, "date": "2020-01-01", "timeSlot": "10:00 AM"},
            {"X-User-Id": patient_id})
check("past date -> 400", s == 400, r)

s, r = call("POST", "/api/appointments",
            {"doctorId": doctor_id, "date": "2020-13-45", "timeSlot": "10:00 AM"},
            {"X-User-Id": patient_id})
check("malformed date -> 400", s == 400, r)

s, r = call("POST", "/api/appointments",
            {"doctorId": doctor_id, "date": slot["date"], "timeSlot": "11:11 PM"},
            {"X-User-Id": patient_id})
check("unpublished slot -> 4xx", s in (400, 409), r)

s, r = call("POST", "/api/appointments",
            {"doctorId": "doc_ghost", "date": slot["date"], "timeSlot": slot["timeSlot"]},
            {"X-User-Id": patient_id})
check("booking with missing doctor -> 404", s == 404, r)

s, r = call("POST", "/api/appointments", book, {"X-User-Id": "pat_ghost"})
check("booking with missing patient -> 404", s == 404, r)

print("== APPOINTMENT ACCESS ==")
s, r = call("GET", f"/api/appointments/patient/{patient_id}", None, {"X-User-Id": patient_id})
check("patient appointments list -> 200 includes booking",
      s == 200 and any(a["id"] == appt_id for a in r), len(r) if isinstance(r, list) else r)

s, r = call("GET", f"/api/appointments/patient/{patient_id}", None, {"X-User-Id": test_patient_id})
check("other user's appointment list -> 401", s == 401, r)

s, r = call("GET", f"/api/appointments/doctor/{doctor_id}", None, {"X-User-Id": doctor_id})
check("doctor appointments list -> 200", s == 200 and any(a["id"] == appt_id for a in r),
      len(r) if isinstance(r, list) else r)

print("== CANCELLATION ==")
s, r = call("PUT", "/api/appointments/MC-SEED0001/cancel", None, {"X-User-Id": patient_id})
check("cancel COMPLETED appointment -> 400", s == 400, r)

s, r = call("PUT", f"/api/appointments/{appt_id}/cancel", None, {"X-User-Id": test_patient_id})
check("cancel someone else's appointment -> 401", s == 401, r)

s, r = call("PUT", f"/api/appointments/{appt_id}/cancel", None, {"X-User-Id": patient_id})
check("cancel BOOKED -> 200 CANCELLED", s == 200 and isinstance(r, dict) and r.get("status") == "CANCELLED", r)

s, r = call("PUT", f"/api/appointments/{appt_id}/cancel", None, {"X-User-Id": patient_id})
check("cancel already-cancelled -> 400", s == 400, r)

s, appt2 = call("POST", "/api/appointments", book, {"X-User-Id": test_patient_id})
check("slot freed after cancel -> rebook 201", s == 201, appt2)
appt2_id = appt2.get("id") if isinstance(appt2, dict) else None

print("== COMPLETION ==")
s, r = call("PUT", f"/api/appointments/{appt2_id}/complete", None, {"X-User-Id": doctor_id})
check("doctor completes booked appointment -> 200 COMPLETED",
      s == 200 and isinstance(r, dict) and r.get("status") == "COMPLETED", r)

s, r = call("PUT", f"/api/appointments/{appt2_id}/complete", None, {"X-User-Id": doctor_id})
check("complete already-completed -> 400", s == 400, r)

s, r = call("PUT", "/api/appointments/MC-SEED0007/complete", None, {"X-User-Id": "doc_seed_004"})
check("other doctor cannot complete -> 401", s == 401, r)

s, r = call("PUT", f"/api/appointments/{appt2_id}/cancel", None, {"X-User-Id": test_patient_id})
check("cancel COMPLETED after completion -> 400", s == 400, r)

print("== PRESCRIPTIONS ==")
s, r = call("POST", "/api/prescriptions", {
    "appointmentId": "MC-SEED0007",
    "diagnosis": "Test diagnosis",
    "medicines": [{"name": "Iron supplement", "dosage": "1 tab", "frequency": "Once daily", "duration": "30 days"}],
}, {"X-User-Id": doctor_id})
check("prescription on BOOKED appointment -> 409", s == 409, r)

s, r = call("POST", "/api/prescriptions", {
    "appointmentId": appt2_id,
    "diagnosis": "Seasonal allergic rhinitis",
    "notes": "Avoid dust exposure.",
    "medicines": [
        {"name": "Cetirizine 10mg", "dosage": "10 mg", "frequency": "Once daily at night", "duration": "7 days"},
        {"name": "Vitamin C", "dosage": "500 mg", "frequency": "Once daily", "duration": "14 days"},
    ],
}, {"X-User-Id": doctor_id})
check("prescription on COMPLETED appointment -> 201", s == 201, r)
rx_id = r.get("id") if isinstance(r, dict) else None
check("prescription has 2 medicines", isinstance(r, dict) and len(r.get("medicines", [])) == 2)

s, r = call("POST", "/api/prescriptions", {
    "appointmentId": appt2_id, "diagnosis": "Again",
    "medicines": [{"name": "X", "dosage": "1", "frequency": "1", "duration": "1"}],
}, {"X-User-Id": doctor_id})
check("second prescription same appointment -> 409", s == 409, r)

s, r = call("POST", "/api/prescriptions", {
    "appointmentId": appt2_id, "diagnosis": "Missing meds", "medicines": []},
    {"X-User-Id": doctor_id})
check("empty medicines -> 400", s == 400, r)

s, r = call("GET", f"/api/prescriptions/patient/{test_patient_id}", None, {"X-User-Id": test_patient_id})
check("patient prescription list includes new rx",
      s == 200 and any(p["id"] == rx_id for p in r), len(r) if isinstance(r, list) else r)

s, r = call("GET", f"/api/prescriptions/appointment/{appt2_id}", None,
            {"X-User-Id": test_patient_id, "X-User-Role": "PATIENT"})
check("rx by appointment as patient -> 200", s == 200 and isinstance(r, dict) and r.get("id") == rx_id, r)

s, r = call("GET", f"/api/prescriptions/appointment/{appt2_id}", None,
            {"X-User-Id": patient_id, "X-User-Role": "PATIENT"})
check("rx by appointment as unrelated patient -> 409", s == 409, r)

print("== DASHBOARDS ==")
s, r = call("GET", f"/api/appointments/patient/{patient_id}/dashboard", None, {"X-User-Id": patient_id})
check("patient dashboard counts", s == 200 and all(k in r for k in (
    "totalAppointments", "upcomingCount", "completedCount", "prescriptionCount", "upcomingAppointment")), r)

s, r = call("GET", f"/api/appointments/doctor/{doctor_id}/dashboard", None, {"X-User-Id": doctor_id})
check("doctor dashboard counts", s == 200 and all(k in r for k in (
    "todayAppointmentCount", "upcomingAppointmentCount", "totalPatients", "availableSlots", "todaysAppointments")), r)

s, r = call("GET", f"/api/appointments/patient/{patient_id}/dashboard", None, {"X-User-Id": test_patient_id})
check("dashboard of other user -> 401", s == 401, r)

print("== PROFILE ==")
s, r = call("GET", f"/api/users/{patient_id}", None, {"X-User-Id": patient_id})
check("get profile -> 200 without password", s == 200 and "passwordHash" not in json.dumps(r), r)

s, r = call("PUT", f"/api/users/{patient_id}", {"name": "Aarav Gupta Updated", "phone": "+91 99999 11111"},
            {"X-User-Id": patient_id})
check("update profile -> 200 name changed", s == 200 and r.get("name") == "Aarav Gupta Updated", r)

s, r = call("PUT", f"/api/users/{patient_id}", {"name": "Hacker"}, {"X-User-Id": test_patient_id})
check("update other user's profile -> 401", s == 401, r)

s, r = call("GET", "/api/auth/me?userId=" + str(patient_id))
check("auth/me -> 200", s == 200 and isinstance(r, dict) and r.get("id") == patient_id, r)

s, r = call("POST", "/api/auth/logout")
check("logout -> 200", s == 200, r)

print()
print(f"RESULT: {PASSED} passed, {FAILED} failed")
if FAILURES:
    print("Failures:")
    for f in FAILURES:
        print("  -", f)
sys.exit(1 if FAILED else 0)
