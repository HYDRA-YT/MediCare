import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'
import { Card, Button, Avatar, DatePicker } from '../../components/ui'
import Modal from '../../components/Modal'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import { formatDate, dayName, formatDateLong } from '../../utils/format'

export default function DoctorProfile() {
  const { doctorId } = useParams()
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [doctor, setDoctor] = useState(null)
  const [availability, setAvailability] = useState(null)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [booking, setBooking] = useState(false)
  const [confirmation, setConfirmation] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setError('')
        const [d, a] = await Promise.all([
          api.get(`/doctors/${doctorId}`),
          api.get(`/doctors/${doctorId}/availability`),
        ])
        if (cancelled) return
        setDoctor(d)
        setAvailability(a)
        const firstDate = Object.keys(a.byDate || {}).sort()[0]
        if (firstDate) setSelectedDate(firstDate)
      } catch (e) {
        if (!cancelled) setError(e.message)
      }
    }
    load()
    return () => { cancelled = true }
  }, [doctorId])

  const dates = useMemo(
    () => (availability ? Object.keys(availability.byDate).sort() : []),
    [availability],
  )

  const slotsForDate = useMemo(
    () => (selectedDate ? availability?.byDate?.[selectedDate] || [] : []),
    [availability, selectedDate],
  )

  const minDate = useMemo(() => dates[0] || '', [dates])

  async function book() {
    setBooking(true)
    try {
      const appointment = await api.post('/appointments', {
        doctorId,
        date: selectedSlot.date,
        timeSlot: selectedSlot.timeSlot,
      })
      setConfirmation(appointment)
      setSelectedSlot(null)
      // Refresh availability so the booked slot disappears
      const a = await api.get(`/doctors/${doctorId}/availability`)
      setAvailability(a)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBooking(false)
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl py-16">
        <ErrorState title="Doctor not found" message={error} onRetry={() => navigate('/patient/doctors')} />
      </div>
    )
  }
  if (!doctor || !availability) {
    return <div className="py-24"><LoadingSpinner size="lg" label="Loading doctor profile..." /></div>
  }

  return (
    <div className="mx-auto max-w-5xl animate-fadeUp">
      <Link to="/patient/doctors" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-400">
        ← Back to doctors
      </Link>

      {/* Profile header */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-brand-700 to-brand-500 dark:from-brand-800 dark:to-brand-600" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <Avatar name={doctor.name} url={doctor.avatarUrl} size="xl" className="ring-4 ring-white" />
              <div className="pb-1">
                <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{doctor.name}</h1>
                <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">{doctor.specialization}</p>
              </div>
            </div>
            {doctor.availableSlots > 0 && (
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {doctor.availableSlots} slots available
              </span>
            )}
          </div>

          <div className="mt-5 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-3 dark:bg-slate-800/60">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Experience</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{doctor.experienceYears} years</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Qualification</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{doctor.qualification || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Consultation fee</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{doctor.consultationFee || '—'}</p>
            </div>
          </div>

          {doctor.bio && <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{doctor.bio}</p>}
        </div>
      </Card>

      {/* Booking */}
      <Card className="mt-6 p-6">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Book an appointment</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Select a date, then pick an available time slot.</p>

        {dates.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon="🗓️"
              title="No available slots"
              description="This doctor hasn't published availability yet. Check back later."
            />
          </div>
        ) : (
          <>
            {/* Date chips */}
            <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
              {dates.map((d) => (
                <button
                  key={d}
                  onClick={() => { setSelectedDate(d); setSelectedSlot(null) }}
                  className={`shrink-0 rounded-xl border px-4 py-2.5 text-center transition ${ selectedDate === d ? 'border-brand-600 bg-brand-600 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-500/60' }`}
                >
                  <span className="block text-xs opacity-80">{dayName(d).slice(0, 3)}</span>
                  <span className="block text-sm font-bold">{formatDate(d)}</span>
                </button>
              ))}
            </div>

            {/* Slots */}
            <div className="mt-5">
              <p className="mb-2.5 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Available slots · {formatDateLong(selectedDate)}
              </p>
              {slotsForDate.length === 0 ? (
                <EmptyState icon="🕐" title="No slots on this date" description="Try another date." />
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {slotsForDate.map((s) => {
                    const isBooked = s.status !== 'AVAILABLE'
                    const isSelected = selectedSlot?.id === s.id
                    return (
                      <button
                        key={s.id}
                        disabled={isBooked}
                        onClick={() => setSelectedSlot(s)}
                        className={`rounded-lg border px-2 py-2.5 text-xs font-semibold transition ${
                          isBooked
                            ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600'
                            : isSelected
                              ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-brand-400 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-500/60 dark:hover:text-brand-300'
                        }`}
                        title={isBooked ? 'Already booked' : 'Select this slot'}
                      >
                        {s.timeSlot}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {selectedSlot && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3.5 animate-fadeUp dark:border-brand-500/40 dark:bg-brand-500/10">
                <p className="text-sm text-brand-800 dark:text-brand-300">
                  <span className="font-semibold">{formatDateLong(selectedSlot.date)}</span>
                  {' · '}
                  <span className="font-semibold">{selectedSlot.timeSlot}</span>
                </p>
                <Button onClick={book} loading={booking}>Confirm Booking</Button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Confirmation modal */}
      <Modal open={!!confirmation} onClose={() => setConfirmation(null)} maxWidth="max-w-md">
        {confirmation && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-7 w-7 text-emerald-600 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">Appointment Confirmed ✓</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your appointment has been booked successfully.</p>

            <div className="mt-5 space-y-2.5 rounded-xl bg-slate-50 p-4 text-left text-sm dark:bg-slate-800/60">
              <div className="flex justify-between gap-4"><span className="text-slate-400 dark:text-slate-500">Doctor</span><span className="font-semibold text-slate-800 dark:text-slate-100">{doctor.name}</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-400 dark:text-slate-500">Date</span><span className="font-semibold text-slate-800 dark:text-slate-100">{formatDateLong(confirmation.date)}</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-400 dark:text-slate-500">Time</span><span className="font-semibold text-slate-800 dark:text-slate-100">{confirmation.timeSlot}</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-400 dark:text-slate-500">Appointment ID</span><span className="font-mono text-xs font-bold text-brand-700 dark:text-brand-300">{confirmation.id}</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-400 dark:text-slate-500">Status</span><span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700 dark:text-brand-300">{confirmation.status}</span></div>
            </div>

            <div className="mt-5 flex justify-center gap-3">
              <Button variant="secondary" onClick={() => { setConfirmation(null); navigate('/patient/appointments') }}>
                View Appointment
              </Button>
              <Button onClick={() => { setConfirmation(null); navigate('/patient') }}>Back to Dashboard</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
