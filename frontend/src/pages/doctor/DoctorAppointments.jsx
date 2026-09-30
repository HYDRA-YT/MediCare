import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'
import AppointmentCard from '../../components/AppointmentCard'
import PrescriptionForm from '../../components/PrescriptionForm'
import Modal from '../../components/Modal'
import ConfirmationModal from '../../components/ConfirmationModal'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'

const TABS = ['Upcoming', 'Completed', 'Cancelled']

export default function DoctorAppointments() {
  const { user } = useAuth()
  const toast = useToast()
  const [appointments, setAppointments] = useState(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('Upcoming')
  const [completing, setCompleting] = useState(null)
  const [completeTarget, setCompleteTarget] = useState(null)
  const [rxTarget, setRxTarget] = useState(null)
  const [viewPatient, setViewPatient] = useState(null)

  async function load() {
    try {
      setError('')
      const list = await api.get(`/appointments/doctor/${user.id}`)
      setAppointments(list)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [user.id])

  async function confirmComplete() {
    setCompleting(completeTarget.id)
    try {
      await api.put(`/appointments/${completeTarget.id}/complete`)
      toast.success('Appointment marked as completed. You can now issue a prescription.')
      setCompleteTarget(null)
      await load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setCompleting(null)
    }
  }

  async function handlePrescriptionSaved() {
    setRxTarget(null)
    toast.success('Prescription issued successfully.')
    await load()
  }

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!appointments) return <div className="py-24"><LoadingSpinner size="lg" label="Loading appointments..." /></div>

  const upcoming = appointments.filter((a) => a.status === 'BOOKED')
  const completed = appointments.filter((a) => a.status === 'COMPLETED')
  const cancelled = appointments.filter((a) => a.status === 'CANCELLED')
  const visible = { Upcoming: upcoming, Completed: completed, Cancelled: cancelled }[tab]

  return (
    <div className="mx-auto max-w-4xl animate-fadeUp">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Appointments</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Only your appointments appear here. Mark visits complete, then issue prescriptions.</p>
      </div>

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
              ({{ Upcoming: upcoming, Completed: completed, Cancelled: cancelled }[t].length})
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
              ? 'When patients book your published slots, visits appear here.'
              : tab === 'Completed'
                ? 'Completed consultations will appear here, ready for prescriptions.'
                : 'Cancelled appointments will appear here.'
          }
        />
      ) : (
        <div className="space-y-4">
          {visible.map((a) => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              variant="doctor"
              busy={completing === a.id}
              onComplete={setCompleteTarget}
              onPrescribe={(appt) => setRxTarget(appt)}
              onViewPatient={setViewPatient}
            />
          ))}
        </div>
      )}

      <ConfirmationModal
        open={!!completeTarget}
        onClose={() => setCompleteTarget(null)}
        onConfirm={confirmComplete}
        loading={completing === completeTarget?.id}
        tone="primary"
        title="Mark as completed?"
        message={completeTarget ? `${completeTarget.patientName} · ${completeTarget.date} at ${completeTarget.timeSlot}. The visit will become eligible for a prescription.` : ''}
        confirmLabel="Mark Completed"
      />

      <Modal open={!!rxTarget} onClose={() => setRxTarget(null)} title="Create Prescription" maxWidth="max-w-2xl">
        {rxTarget && (
          <PrescriptionForm
            appointment={rxTarget}
            onSaved={handlePrescriptionSaved}
            onCancel={() => setRxTarget(null)}
          />
        )}
      </Modal>

      <Modal open={!!viewPatient} onClose={() => setViewPatient(null)} title="Patient" maxWidth="max-w-md">
        {viewPatient && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-400 dark:text-slate-500">Name</span><span className="font-semibold text-slate-800 dark:text-slate-100">{viewPatient.patientName}</span></div>
            <div className="flex justify-between"><span className="text-slate-400 dark:text-slate-500">Phone</span><span className="font-semibold text-slate-800 dark:text-slate-100">{viewPatient.patientPhone || '—'}</span></div>
            <div className="flex justify-between"><span className="text-slate-400 dark:text-slate-500">Date</span><span className="font-semibold text-slate-800 dark:text-slate-100">{viewPatient.date} · {viewPatient.timeSlot}</span></div>
            <div className="flex justify-between"><span className="text-slate-400 dark:text-slate-500">Reason</span><span className="max-w-[60%] text-right font-semibold text-slate-800 dark:text-slate-100">{viewPatient.reason || '—'}</span></div>
            <div className="flex justify-between"><span className="text-slate-400 dark:text-slate-500">Appointment ID</span><span className="font-mono text-xs font-bold text-brand-700 dark:text-brand-300">{viewPatient.id}</span></div>
          </div>
        )}
      </Modal>
    </div>
  )
}
