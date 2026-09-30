import { Card, Button, StatusBadge, Avatar } from './ui'
import { formatDate, dayName } from '../utils/format'

/**
 * Variant "patient": shows doctor info + cancel.
 * Variant "doctor": shows patient info + complete / prescribe.
 */
export default function AppointmentCard({ appointment, variant = 'patient', onCancel, onComplete, onPrescribe, onViewPatient, busy }) {
  const a = appointment
  const isPatient = variant === 'patient'

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <Avatar name={isPatient ? a.doctorName : a.patientName} url={isPatient ? a.doctorAvatarUrl : undefined} />
          <div>
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
              {isPatient ? a.doctorName : a.patientName}
            </h3>
            {isPatient ? (
              <p className="text-xs font-medium text-brand-700 dark:text-brand-300">{a.doctorSpecialization}</p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">{a.patientPhone || '—'}</p>
            )}
            {a.reason && <p className="mt-0.5 max-w-xs truncate text-xs text-slate-400 dark:text-slate-500">“{a.reason}”</p>}
          </div>
        </div>
        <StatusBadge status={a.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5 text-sm sm:grid-cols-3 dark:bg-slate-800/60">
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Date</p>
          <p className="font-semibold text-slate-700 dark:text-slate-200">
            {formatDate(a.date)} <span className="hidden font-normal text-slate-400 dark:text-slate-500 sm:inline">({dayName(a.date)})</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Time</p>
          <p className="font-semibold text-slate-700 dark:text-slate-200">{a.timeSlot}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Appointment ID</p>
          <p className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">{a.id}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {a.status === 'BOOKED' && isPatient && (
          <Button variant="danger" size="sm" onClick={() => onCancel?.(a)} disabled={busy}>
            Cancel Appointment
          </Button>
        )}
        {a.status === 'BOOKED' && !isPatient && (
          <>
            <Button variant="secondary" size="sm" onClick={() => onViewPatient?.(a)}>View Patient</Button>
            <Button size="sm" onClick={() => onComplete?.(a)} disabled={busy}>
              Mark Completed
            </Button>
          </>
        )}
        {a.status === 'COMPLETED' && (
          isPatient ? (
            <Button
              variant="accent"
              size="sm"
              onClick={() => onPrescribe?.(a)}
              disabled={!a.prescriptionIssued}
              title={a.prescriptionIssued ? 'View prescription' : 'The doctor has not issued a prescription yet'}
            >
              {a.prescriptionIssued ? 'View Prescription' : 'No Prescription Yet'}
            </Button>
          ) : (
            <Button variant="accent" size="sm" onClick={() => onPrescribe?.(a)} disabled={a.prescriptionIssued}>
              {a.prescriptionIssued ? 'Prescription Issued' : 'Create Prescription'}
            </Button>
          )
        )}
      </div>
    </Card>
  )
}
