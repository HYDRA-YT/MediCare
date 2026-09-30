import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import PrescriptionCard from '../../components/PrescriptionCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'

export default function DoctorPrescriptions() {
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setError('')
        const list = await api.get(`/prescriptions/doctor/${user.id}`)
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
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">All prescriptions you have issued.</p>
      </div>

      {prescriptions.length === 0 ? (
        <EmptyState
          icon="💊"
          title="No prescriptions issued yet"
          description="Mark a consultation complete, then create its prescription from the Appointments page."
        />
      ) : (
        <div className="space-y-5">
          {prescriptions.map((p) => <PrescriptionCard key={p.id} prescription={p} />)}
        </div>
      )}
    </div>
  )
}
