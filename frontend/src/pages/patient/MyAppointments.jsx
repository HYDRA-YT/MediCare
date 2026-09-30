import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'
import AppointmentCard from '../../components/AppointmentCard'
import Modal from '../../components/Modal'
import PrescriptionCard from '../../components/PrescriptionCard'
import ConfirmationModal from '../../components/ConfirmationModal'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import { Button } from '../../components/ui'

const TABS = ['Upcoming', 'Completed', 'Cancelled']

export default function MyAppointments() {
  const { user } = useAuth()
  const toast = useToast()
  const [appointments, setAppointments] = useState(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('Upcoming')
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [viewRx, setViewRx] = useState(null)
  const [rxLoading, setRxLoading] = useState(false)

  async function load() {
    try {
      setError('')
      const list = await api.get(`/appointments/patient/${user.id}`)
      setAppointments(list)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [user.id])

  async function confirmCancel() {
    setCancelling(true)
    try {
      await api.put(`/appointments/${cancelTarget.id}/cancel`)
      toast.success('Appointment cancelled successfully.')
      setCancelTarget(null)
      await load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setCancelling(false)
    }
  }

  async function openPrescription(a) {
    setRxLoading(true)
    try {
      const rx = await api.get(`/prescriptions/appointment/${a.id}`)
      setViewRx(rx)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setRxLoading(false)
    }
  }

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!appointments) return <div className="py-24"><LoadingSpinner size="lg" label="Loading appointments..." /></div>

  const booked = appointments.filter((a) => a.status === 'BOOKED')
  const completed = appointments.filter((a) => a.status === 'COMPLETED')
  const cancelled = appointments.filter((a) => a.status === 'CANCELLED')
  const visible = { Upcoming: booked, Completed: completed, Cancelled: cancelled }[tab]

  return (
    <div className="mx-auto max-w-4xl animate-fadeUp">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">My Appointments</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your upcoming visits and review your history.</p>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl bg-slate-100 p-1.5 dark:bg-slate-800">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition sm:flex-none sm:px-5 ${
              tab === t
                ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-900 dark:text-brand-300'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t}
            <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500">
              ({{ Upcoming: booked, Completed: completed, Cancelled: cancelled }[t].length})
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={tab === 'Upcoming' ? '🗓️' : tab === 'Completed' ? '✅' : '🚫'}
          title={`No ${tab.toLowerCase()} appointments`}
          description={
            tab === 'Upcoming'
              ? 'You have no booked visits right now.'
              : tab === 'Completed'
                ? 'Completed consultations will appear here with their prescriptions.'
                : 'Cancelled appointments will appear here.'
          }
          action={tab === 'Upcoming' ? <Link to="/patient/doctors"><Button>Find a Doctor</Button></Link> : null}
        />
      ) : (
        <div className="space-y-4">
          {visible.map((a) => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              variant="patient"
              onCancel={setCancelTarget}
              onPrescribe={openPrescription}
            />
          ))}
        </div>
      )}

      <ConfirmationModal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
        loading={cancelling}
        title="Cancel this appointment?"
        message={cancelTarget ? `${cancelTarget.doctorName} · ${cancelTarget.date} at ${cancelTarget.timeSlot}. This slot will be released for other patients.` : ''}
        confirmLabel="Yes, cancel it"
      />

      {/* Prescription viewer */}
      <Modal open={!!viewRx} onClose={() => setViewRx(null)} title="Digital Prescription" maxWidth="max-w-2xl">
        {viewRx && <PrescriptionCard prescription={viewRx} />}
      </Modal>
    </div>
  )
}
