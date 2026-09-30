import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import PrescriptionCard from '../../components/PrescriptionCard'
import Modal from '../../components/Modal'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import { Button } from '../../components/ui'

export default function PatientPrescriptions() {
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState(null)
  const [error, setError] = useState('')
  const [viewRx, setViewRx] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setError('')
        const list = await api.get(`/prescriptions/patient/${user.id}`)
        if (!cancelled) setPrescriptions(list)
      } catch (e) {
        if (!cancelled) setError(e.message)
      }
    }
    load()
    return () => { cancelled = true }
  }, [user.id])

  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />
  if (!prescriptions) return <div className="py-24"><LoadingSpinner size="lg" label="Loading prescriptions..." /></div>

  return (
    <div className="mx-auto max-w-4xl animate-fadeUp">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Prescriptions</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your complete digital prescription history.</p>
      </div>

      {prescriptions.length === 0 ? (
        <EmptyState
          icon="💊"
          title="No prescriptions available"
          description="Prescriptions issued by doctors after completed consultations will appear here."
          action={<Link to="/patient/doctors"><Button>Book a Consultation</Button></Link>}
        />
      ) : (
        <div className="space-y-5">
          {prescriptions.map((p) => (
            <PrescriptionCard key={p.id} prescription={p} onView={() => setViewRx(p)} />
          ))}
        </div>
      )}

      <Modal open={!!viewRx} onClose={() => setViewRx(null)} title="Digital Prescription" maxWidth="max-w-2xl">
        {viewRx && <PrescriptionCard prescription={viewRx} />}
      </Modal>
    </div>
  )
}
