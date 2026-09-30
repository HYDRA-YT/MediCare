import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { Card, Button, StatusBadge, Avatar } from '../../components/ui'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import { formatDate, dayName } from '../../utils/format'

export default function PatientDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setError('')
        const d = await api.get(`/appointments/patient/${user.id}/dashboard`)
        if (!cancelled) setData(d)
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [user.id])

  if (loading) {
    return <div className="py-24"><LoadingSpinner size="lg" label="Loading your dashboard..." /></div>
  }
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />

  const stats = [
    { label: 'Upcoming Appointments', value: data.upcomingCount, accent: 'text-brand-600', icon: '📅' },
    { label: 'Completed Visits', value: data.completedCount, accent: 'text-emerald-600', icon: '✅' },
    { label: 'Prescriptions', value: data.prescriptionCount, accent: 'text-accent-600', icon: '💊' },
    { label: 'Total Appointments', value: data.totalAppointments, accent: 'text-slate-700', icon: '🗂️' },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fadeUp">
      {/* Welcome */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Welcome back, {user.name?.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Here's an overview of your healthcare activity.</p>
        </div>
        <Link to="/patient/doctors">
          <Button>＋ Find a Doctor</Button>
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming appointment */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-bold text-slate-900 dark:text-white">Next appointment</h2>
          {data.upcomingAppointment ? (
            <Card className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar name={data.upcomingAppointment.doctorName} url={data.upcomingAppointment.doctorAvatarUrl} size="lg" />
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{data.upcomingAppointment.doctorName}</h3>
                    <p className="text-sm font-medium text-brand-700 dark:text-brand-300">{data.upcomingAppointment.doctorSpecialization}</p>
                    {data.upcomingAppointment.reason && (
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">“{data.upcomingAppointment.reason}”</p>
                    )}
                  </div>
                </div>
                <StatusBadge status={data.upcomingAppointment.status} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-3 dark:bg-slate-800/60">
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Date</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {formatDate(data.upcomingAppointment.date)} ({dayName(data.upcomingAppointment.date)})
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Time</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{data.upcomingAppointment.timeSlot}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">ID</p>
                  <p className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">{data.upcomingAppointment.id}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Link to="/patient/appointments">
                  <Button variant="secondary" size="sm">Manage Appointments</Button>
                </Link>
                <Link to={`/patient/doctors/${data.upcomingAppointment.doctorId}`}>
                  <Button variant="ghost" size="sm">View Doctor</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <EmptyState
              icon="🗓️"
              title="No upcoming appointments"
              description="You have no booked visits right now. Browse doctors and book your next consultation."
              action={<Link to="/patient/doctors"><Button>Find a Doctor</Button></Link>}
            />
          )}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="mb-4 font-display text-lg font-bold text-slate-900 dark:text-white">Quick actions</h2>
          <div className="space-y-3">
            {[
              { to: '/patient/doctors', icon: '🔍', t: 'Find a Doctor', d: 'Search by name or specialization' },
              { to: '/patient/appointments', icon: '🗂️', t: 'My Appointments', d: 'View, cancel or review visits' },
              { to: '/patient/prescriptions', icon: '💊', t: 'Prescriptions', d: 'Your digital prescription history' },
            ].map((q) => (
              <Link key={q.to} to={q.to}>
                <Card className="flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-lg dark:bg-brand-500/10">{q.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{q.t}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{q.d}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
