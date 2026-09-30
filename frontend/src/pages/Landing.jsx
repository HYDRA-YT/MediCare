import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { Button, Card } from '../components/ui'
import { useAuth } from '../hooks/useAuth'

const STEPS = [
  { n: '01', t: 'Register', d: 'Create a patient or doctor account in seconds.' },
  { n: '02', t: 'Find your doctor', d: 'Search by name or filter by specialization.' },
  { n: '03', t: 'Book a slot', d: 'Pick a date and a published time slot — instantly confirmed.' },
  { n: '04', t: 'Consult & prescribe', d: 'Doctors mark visits complete and issue digital prescriptions.' },
  { n: '05', t: 'View prescriptions', d: 'Patients access their prescription history anytime, anywhere.' },
]

const FEATURES = [
  { icon: '📅', t: 'Smart Appointment Management', d: 'Real-time slot validation prevents double-bookings — the backend rejects conflicting bookings, not just the UI.' },
  { icon: '🩺', t: 'Doctor Availability', d: 'Doctors publish 30-minute slots per day; patients only ever see genuinely open times.' },
  { icon: '💊', t: 'Digital Prescriptions', d: 'Structured prescriptions with medicine, dosage, frequency and duration — linked to completed visits.' },
  { icon: '🔒', t: 'Role-based Access', d: 'Separate patient and doctor workspaces. Doctors see only their own appointments.' },
  { icon: '📊', t: 'Live Dashboards', d: 'Upcoming visits, completed counts and slot stats computed from real database state.' },
  { icon: '⚡', t: 'Instant Confirmations', d: 'Booking, cancellation and completion reflect immediately with clear feedback.' },
]

export default function Landing() {
  const { user } = useAuth()
  const dash = user ? (user.role === 'DOCTOR' ? '/doctor' : '/patient') : '/register'

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-brand-100 blur-3xl opacity-60 dark:bg-brand-900/40" />
          <div className="absolute top-40 -left-24 h-80 w-80 rounded-full bg-accent-100 blur-3xl opacity-50 dark:bg-accent-900/30" />
        </div>
        <div className="container-page grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fadeUp">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              SMART HOSPITAL APPOINTMENT & PRESCRIPTION MANAGEMENT
            </p>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Healthcare, <span className="text-brand-600 dark:text-brand-400">simplified.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Find the right doctor, book appointments, manage schedules, and access digital
              prescriptions from one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={dash}>
                <Button size="lg">Book an Appointment</Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="secondary">Login</Button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {[
                ['30-min', 'consultation slots'],
                ['2 roles', 'patient & doctor portals'],
                ['100%', 'digital prescriptions'],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">{v}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual: booking preview card */}
          <div className="relative hidden lg:block">
            <div className="absolute -right-6 -top-6 h-40 w-40 rounded-3xl bg-accent-100 opacity-70" />
            <Card className="relative z-10 mx-auto max-w-md p-6 shadow-xl">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">AS</div>
                <div>
                  <p className="font-display text-sm font-bold text-slate-900 dark:text-white">Dr. Ananya Sharma</p>
                  <p className="text-xs text-brand-700 dark:text-brand-300">Cardiology · 12 yrs</p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Available
                </span>
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Select time</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '02:00 PM', '02:30 PM'].map((t, i) => (
                  <span
                    key={t}
                    className={`rounded-lg border px-2 py-2 text-center text-xs font-semibold ${ i === 3 ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300' }`}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-brand-50 p-3.5">
                <p className="text-xs font-semibold text-brand-700 dark:text-brand-300">Appointment Confirmed ✓</p>
                <p className="mt-1 text-xs text-brand-600 dark:text-brand-400">Dr. Ananya Sharma · 30 Sep, 10:30 AM · MC-A7K2Q9</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-slate-100 bg-slate-50 py-16 lg:py-20 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">How MediCare Works</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">From booking to prescription, in one flow</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((s) => (
              <Card key={s.n} className="p-5">
                <p className="font-display text-sm font-bold text-brand-600 dark:text-brand-400">{s.n}</p>
                <h3 className="mt-2 font-display text-base font-bold text-slate-900 dark:text-white">{s.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{s.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 lg:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Features</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">Everything a clinic needs, nothing it doesn't</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.t} className="p-6">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl dark:bg-brand-500/10">{f.icon}</div>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">{f.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For patients / For doctors */}
      <section id="for-patients" className="border-y border-slate-100 bg-slate-50 py-16 lg:py-20 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="container-page grid gap-6 lg:grid-cols-2">
          <Card className="p-8" id="for-doctors">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">For Patients</p>
            <h3 className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-white">Your care, organised</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-400">
              {[
                'Search doctors and filter by specialization',
                'See real-time availability before you book',
                'Cancel upcoming appointments in one tap',
                'Keep every prescription in one digital history',
              ].map((li) => (
                <li key={li} className="flex gap-2.5">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent-600 dark:text-accent-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                  {li}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-accent-600 dark:text-accent-400">For Doctors</p>
            <h3 className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-white">Practice without paperwork</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-400">
              {[
                'Publish or remove availability slots per day',
                "See today's schedule at a glance",
                'Mark consultations complete with one action',
                'Issue structured digital prescriptions instantly',
              ].map((li) => (
                <li key={li} className="flex gap-2.5">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent-600 dark:text-accent-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                  {li}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* Digital prescriptions CTA */}
      <section className="py-16 lg:py-20">
        <div className="container-page">
          <div className="overflow-hidden rounded-3xl bg-brand-900 px-8 py-12 text-center sm:px-16 dark:bg-brand-950">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-300">Digital Prescriptions</p>
            <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-bold text-white">
              Prescriptions that never get lost
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-brand-100">
              Every prescription is linked to a completed appointment, structured medicine by medicine,
              and ready to view or print anytime.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link to="/register">
                <Button size="lg" variant="secondary">Create free account</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-950">
      <div className="container-page flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <div>
            <p className="font-display text-sm font-bold text-slate-900 dark:text-white">MEDICARE</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Smart Hospital Appointment & Prescription Management</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Academic prototype · Java 17 · Spring Boot · MongoDB · React — for demonstration only, not medical advice.
        </p>
      </div>
    </footer>
  )
}
