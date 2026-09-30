import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { Card, Avatar, StatusBadge } from '../../components/ui'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import { formatDate } from '../../utils/format'

export default function Patients() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setError('')
        const list = await api.get(`/appointments/doctor/${user.id}`)
        if (!cancelled) setAppointments(list)
      } catch (e) {
        if (!cancelled) setError(e.message)
      }
    }
    load()
    return () => { cancelled = true }
  }, [user.id])

  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />
  if (!appointments) return <div className="py-24"><LoadingSpinner size="lg" label="Loading patients..." /></div>

  // Distinct patients derived from this doctor's real appointments
  const byPatient = new Map()
  for (const a of appointments) {
    const cur = byPatient.get(a.patientId)
    if (!cur) {
      byPatient.set(a.patientId, {
        patientId: a.patientId,
        name: a.patientName,
        phone: a.patientPhone,
        lastVisit: a.date,
        lastStatus: a.status,
        visits: 1,
      })
    } else {
      cur.visits += 1
      if (a.date > cur.lastVisit) {
        cur.lastVisit = a.date
        cur.lastStatus = a.status
      }
    }
  }
  const patients = [...byPatient.values()].sort((a, b) => b.lastVisit.localeCompare(a.lastVisit))

  return (
    <div className="mx-auto max-w-4xl animate-fadeUp">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Patients</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Everyone who has booked a consultation with you.</p>
      </div>

      {patients.length === 0 ? (
        <EmptyState icon="🧑‍🤝‍🧑" title="No patients yet" description="Patients appear here after they book your slots." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {patients.map((p) => (
            <Card key={p.patientId} className="p-5">
              <div className="flex items-center gap-3.5">
                <Avatar name={p.name} size="lg" />
                <div className="min-w-0">
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">{p.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{p.phone || 'Phone not shared'}</p>
                  <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{p.visits} appointment{p.visits > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-slate-800">
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Most recent visit</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatDate(p.lastVisit)}</p>
                </div>
                <StatusBadge status={p.lastStatus} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
