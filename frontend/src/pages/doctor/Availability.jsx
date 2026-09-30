import { useEffect, useMemo, useState } from 'react'
import { api } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'
import { Card, Button, DatePicker, Select } from '../../components/ui'
import ConfirmationModal from '../../components/ConfirmationModal'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import { formatDate, dayName } from '../../utils/format'

const TIME_OPTIONS = []
for (let h = 8; h <= 19; h++) {
  for (const m of [0, 30]) {
    if (h === 19 && m === 30) continue
    const ap = h >= 12 ? 'PM' : 'AM'
    const hh = h % 12 || 12
    TIME_OPTIONS.push(`${hh}:${String(m).padStart(2, '0')} ${ap}`)
  }
}

export default function Availability() {
  const { user } = useAuth()
  const toast = useToast()
  const [availability, setAvailability] = useState(null)
  const [error, setError] = useState('')
  const [date, setDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('09:00 AM')
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState(null)

  async function load() {
    try {
      setError('')
      const a = await api.get(`/doctors/${user.id}/availability?includePast=true`)
      setAvailability(a)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [user.id])

  const dates = useMemo(
    () => (availability ? Object.keys(availability.byDate).sort() : []),
    [availability],
  )

  async function addSlot(e) {
    e.preventDefault()
    if (!date) {
      toast.error('Please select a date first.')
      return
    }
    setAdding(true)
    try {
      await api.post(`/doctors/${user.id}/availability`, { date, timeSlot })
      toast.success(`Slot published: ${formatDate(date)} at ${timeSlot}.`)
      await load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setAdding(false)
    }
  }

  async function removeSlot(slot) {
    setRemoving(slot.id)
    try {
      await api.delete(`/doctors/${user.id}/availability/${slot.id}`)
      toast.success('Slot removed.')
      await load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setRemoving(null)
    }
  }

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!availability) return <div className="py-24"><LoadingSpinner size="lg" label="Loading availability..." /></div>

  return (
    <div className="mx-auto max-w-4xl animate-fadeUp">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Availability</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Publish the time slots patients can book. Booked slots are shown and cannot be removed.
        </p>
      </div>

      {/* Add slot form */}
      <Card className="mb-6 p-5">
        <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">Add a slot</h2>
        <form onSubmit={addSlot} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="label">Date</label>
            <DatePicker value={date} onChange={setDate} min={new Date().toISOString().slice(0, 10)} />
          </div>
          <div className="flex-1">
            <label className="label">Time slot</label>
            <Select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
              {TIME_OPTIONS.map((t) => <option key={t}>{t}</option>)}
            </Select>
          </div>
          <Button type="submit" loading={adding}>＋ Add Slot</Button>
        </form>
      </Card>

      {/* Slots by date */}
      {dates.length === 0 ? (
        <EmptyState
          icon="🕐"
          title="No availability published"
          description="Add your first slot above — patients can only book times you've published."
        />
      ) : (
        <div className="space-y-5">
          {dates.map((d) => {
            const slots = availability.byDate[d]
            const free = slots.filter((s) => s.status === 'AVAILABLE').length
            const booked = slots.filter((s) => s.status === 'BOOKED').length
            return (
              <Card key={d} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                      {formatDate(d)} <span className="font-normal text-slate-400 dark:text-slate-500">({dayName(d)})</span>
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                      {free} available · {booked} booked
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {slots.map((s) => {
                    const isBooked = s.status === 'BOOKED'
                    const isPast = s.status === 'AVAILABLE' && new Date(s.startTime) < new Date()
                    return (
                      <span
                        key={s.id}
                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
                          isBooked
                            ? 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-300'
                            : isPast
                              ? 'border-slate-100 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300'
                        }`}
                        title={isBooked ? 'Booked by a patient' : isPast ? 'Past slot' : 'Available'}
                      >
                        {s.timeSlot}
                        {isBooked && <span className="rounded bg-brand-600 px-1.5 py-0.5 text-[10px] text-white">BOOKED</span>}
                        {!isBooked && !isPast && (
                          <button
                            onClick={() => removeSlot(s)}
                            disabled={removing === s.id}
                            className="rounded p-0.5 text-emerald-500 hover:bg-emerald-100 hover:text-emerald-800 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-200"
                            aria-label={`Remove ${s.timeSlot}`}
                          >
                            {removing === s.id ? '…' : '✕'}
                          </button>
                        )}
                      </span>
                    )
                  })}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
