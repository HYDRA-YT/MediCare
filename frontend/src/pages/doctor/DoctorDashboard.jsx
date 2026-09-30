import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { Card, Button, StatusBadge, Avatar } from '../../components/ui'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import { useToast } from '../../context/ToastContext'
import { formatDate, dayName } from '../../utils/format'

export default function DoctorDashboard() {
  const { user } = useAuth()
  const toast = useToast()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [completing, setCompleting] = useState(null)

  async function load() {
    try {
      setError('')
      const d = await api.get(`/appointments/doctor/${user.id}/dashboard`)
      setData(d)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [user.id])

  async function markComplete(a) {
    setCompleting(a.id)
    try {
      await api.put(`/appointments/${a.id}/complete`)
      toast.success(`Appointment with ${a.patientName} marked completed.`)
      await load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setCompleting(null)
    }
  }

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!data) return <div className="py-24"><LoadingSpinner size="lg" label="Loading your dashboard..." /></div>

  const stats = [
    { label: "Today's Appointments", value: data.todayAppointmentCount, accent: 'text-brand-600', icon: '📅' },
    { label: 'Upcoming', value: data.upcomingAppointmentCount, accent: 'text-sky-600', icon: '⏭️' },
    { label: 'Total Patients', value: data.totalPatients, accent: 'text-accent-600', icon: '🧑‍🤝‍🧑' },
    { label: 'Available Slots', value: data.availableSlots, accent: 'text-emerald-600', icon: '🕐' },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fadeUp">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Good day, Dr. {user.name?.replace(/^Dr\.?\s*/i, '')} 👋</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user.specialization} · Here's your practice overview.</p>
        </div>
        <Link to="/doctor/availability">
          <Button variant="secondary">＋ Publish Availability</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
              <span className="text-lg">{s.icon}</span>
            </div>
            <p className={`mt-2 font-display text-3xl font-extrabold ${s.accent}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Today's appointments */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Today's appointments</h2>
          <Link to="/doctor/appointments" className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400">
            View all →
          </Link>
        </div>
        {data.todaysAppointments.length === 0 ? (
          <EmptyState
            icon="🗓️"
            title="No appointments today"
            description="Booked visits for today will appear here."
            action={<Link to="/doctor/availability"><Button size="sm">Publish more slots</Button></Link>}
          />
        ) : (
          <div className="space-y-3">
            {data.todaysAppointments.map((a) => (
              <Card key={a.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3.5">
                  <Avatar name={a.patientName} />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{a.patientName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{a.timeSlot} · {a.reason || 'General consultation'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <StatusBadge status={a.status} />
                  <Button
                    size="sm"
                    onClick={() => markComplete(a)}
                    loading={completing === a.id}
                  >
                    Mark Completed
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="mb-4 font-display text-lg font-bold text-slate-900 dark:text-white">Upcoming appointments</h2>
        {data.upcomingAppointments.length === 0 ? (
          <EmptyState icon="⏭️" title="No upcoming appointments" description="Future booked visits will appear here." />
        ) : (
          <div className="space-y-3">
            {data.upcomingAppointments.slice(0, 5).map((a) => (
              <Card key={a.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3.5">
                  <Avatar name={a.patientName} />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{a.patientName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{a.reason || 'General consultation'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatDate(a.date)} ({dayName(a.date)})</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{a.timeSlot}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
