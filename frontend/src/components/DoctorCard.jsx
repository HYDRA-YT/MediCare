import { Link } from 'react-router-dom'
import { Card, Button, Avatar } from './ui'

export default function DoctorCard({ doctor }) {
  return (
    <Card className="group flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start gap-4">
        <Avatar name={doctor.name} url={doctor.avatarUrl} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">{doctor.name}</h3>
          <p className="text-sm font-medium text-brand-700 dark:text-brand-300">{doctor.specialization}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {doctor.experienceYears} yrs experience · {doctor.qualification}
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{doctor.bio}</p>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <div>
          {doctor.availableSlots > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Available
              {doctor.nextAvailableSlot ? ` · next ${doctor.nextAvailableSlot}` : ''}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              No slots currently
            </span>
          )}
          {doctor.consultationFee && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{doctor.consultationFee} consultation</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link to={`/patient/doctors/${doctor.id}`}>
            <Button variant="secondary" size="sm">View Profile</Button>
          </Link>
          <Link to={`/patient/doctors/${doctor.id}?book=1`}>
            <Button size="sm">Book</Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
