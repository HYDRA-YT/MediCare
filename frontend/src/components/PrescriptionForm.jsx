import { useState } from 'react'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'
import { Button, Input, Textarea, Field } from './ui'
import { formatDate } from '../utils/format'

const EMPTY_MED = { name: '', dosage: '', frequency: '', duration: '' }

export default function PrescriptionForm({ appointment, onSaved, onCancel }) {
  const toast = useToast()
  const [diagnosis, setDiagnosis] = useState('')
  const [notes, setNotes] = useState('')
  const [medicines, setMedicines] = useState([{ ...EMPTY_MED }])
  const [saving, setSaving] = useState(false)

  function setMed(i, key, value) {
    setMedicines((ms) => ms.map((m, idx) => (idx === i ? { ...m, [key]: value } : m)))
  }

  function addMed() {
    setMedicines((ms) => [...ms, { ...EMPTY_MED }])
  }

  function removeMed(i) {
    setMedicines((ms) => (ms.length === 1 ? ms : ms.filter((_, idx) => idx !== i)))
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/prescriptions', {
        appointmentId: appointment.id,
        diagnosis: diagnosis.trim(),
        notes: notes.trim() || undefined,
        medicines: medicines.map((m) => ({
          name: m.name.trim(),
          dosage: m.dosage.trim(),
          frequency: m.frequency.trim(),
          duration: m.duration.trim(),
        })),
      })
      onSaved()
    } catch (err) {
      toast.error(err.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800/60">
        <p className="font-semibold text-slate-800 dark:text-slate-100">{appointment.patientName}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(appointment.date)} · {appointment.timeSlot} · <span className="font-mono">{appointment.id}</span>
        </p>
      </div>

      <Field label="Diagnosis">
        <Input
          required
          placeholder="e.g. Acute pharyngitis"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
        />
      </Field>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="label mb-0">Medicines</p>
          <button type="button" onClick={addMed} className="text-xs font-bold text-brand-700 dark:text-brand-300 hover:underline">
            ＋ Add medicine
          </button>
        </div>
        <div className="space-y-3">
          {medicines.map((m, i) => (
            <div key={i} className="relative rounded-xl border border-slate-200 p-3.5 dark:border-slate-700">
              {medicines.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMed(i)}
                  className="absolute right-2.5 top-2.5 rounded-md p-1 text-slate-300 dark:text-slate-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-500"
                  aria-label="Remove medicine"
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg>
                </button>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Medicine name">
                  <Input required placeholder="e.g. Amoxicillin 500mg" value={m.name} onChange={(e) => setMed(i, 'name', e.target.value)} />
                </Field>
                <Field label="Dosage">
                  <Input required placeholder="e.g. 500 mg" value={m.dosage} onChange={(e) => setMed(i, 'dosage', e.target.value)} />
                </Field>
                <Field label="Frequency">
                  <Input required placeholder="e.g. Three times daily" value={m.frequency} onChange={(e) => setMed(i, 'frequency', e.target.value)} />
                </Field>
                <Field label="Duration">
                  <Input required placeholder="e.g. 7 days" value={m.duration} onChange={(e) => setMed(i, 'duration', e.target.value)} />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Field label="Additional notes (optional)">
        <Textarea placeholder="Advice, follow-up instructions..." value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" loading={saving}>Save Prescription</Button>
      </div>
    </form>
  )
}
