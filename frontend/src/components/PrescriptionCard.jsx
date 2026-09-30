import { Card, Button, Avatar } from './ui'
import { formatDate, formatDateTime } from '../utils/format'

export default function PrescriptionCard({ prescription, onView }) {
  const p = prescription
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/40">
        <div className="flex items-center gap-3">
          <Avatar name={p.doctorName} url={p.doctorAvatarUrl} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Prescription</p>
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">{p.doctorName}</h3>
            <p className="text-xs text-brand-700 dark:text-brand-300">{p.doctorSpecialization}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 dark:text-slate-500">Issued</p>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatDateTime(p.timestamp)}</p>
          <p className="font-mono text-[11px] text-slate-400 dark:text-slate-500">{p.id}</p>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Appointment date</p>
            <p className="font-medium text-slate-700 dark:text-slate-200">{p.appointmentDate || '—'}</p>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-400 dark:text-slate-500">Diagnosis</p>
            <p className="font-medium text-slate-800 dark:text-slate-100">{p.diagnosis}</p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <th className="px-3.5 py-2 font-semibold">Medicine</th>
                <th className="px-3.5 py-2 font-semibold">Dosage</th>
                <th className="px-3.5 py-2 font-semibold">Frequency</th>
                <th className="px-3.5 py-2 font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {p.medicines.map((m, i) => (
                <tr key={i} className="text-slate-700 dark:text-slate-300">
                  <td className="px-3.5 py-2.5 font-semibold text-slate-800 dark:text-slate-100">{m.name}</td>
                  <td className="px-3.5 py-2.5">{m.dosage}</td>
                  <td className="px-3.5 py-2.5">{m.frequency}</td>
                  <td className="px-3.5 py-2.5">{m.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {p.notes && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            <span className="font-semibold">Notes: </span>{p.notes}
          </p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          {onView && (
            <Button variant="secondary" size="sm" onClick={onView}>View Full</Button>
          )}
          <Button size="sm" onClick={() => window.print()}>Print Prescription</Button>
        </div>
      </div>
    </Card>
  )
}
