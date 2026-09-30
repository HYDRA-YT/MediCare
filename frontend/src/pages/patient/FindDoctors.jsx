import { useEffect, useMemo, useState } from 'react'
import { api } from '../../services/api'
import DoctorCard from '../../components/DoctorCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'
import { Card, Input, Select } from '../../components/ui'

const SPECIALIZATIONS = ['Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 'General Medicine', 'Pediatrics']

export default function FindDoctors() {
  const [doctors, setDoctors] = useState(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [specialization, setSpecialization] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setError('')
        const list = await api.get('/doctors')
        if (!cancelled) setDoctors(list)
      } catch (e) {
        if (!cancelled) setError(e.message)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    if (!doctors) return []
    return doctors.filter((d) => {
      const specOk = !specialization || d.specialization === specialization
      const q = search.trim().toLowerCase()
      const searchOk = !q ||
        d.name?.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q) ||
        d.qualification?.toLowerCase().includes(q) ||
        d.bio?.toLowerCase().includes(q)
      return specOk && searchOk
    })
  }, [doctors, search, specialization])

  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />

  return (
    <div className="mx-auto max-w-6xl animate-fadeUp">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Find Doctors</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Browse our specialists and book a consultation.</p>
      </div>

      {/* Search + filter */}
      <Card className="mb-6 flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
          <Input
            className="pl-10"
            placeholder="Search by name, specialization, qualification..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          className="sm:w-56"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
        >
          <option value="">All Specializations</option>
          {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </Card>

      {!doctors ? (
        <div className="py-24"><LoadingSpinner size="lg" label="Finding doctors..." /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No doctors found"
          description="Try a different search term or clear the specialization filter."
          action={
            <button
              className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400"
              onClick={() => { setSearch(''); setSpecialization('') }}
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((d) => <DoctorCard key={d.id} doctor={d} />)}
        </div>
      )}
    </div>
  )
}
