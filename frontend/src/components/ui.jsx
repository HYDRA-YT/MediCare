import { forwardRef } from 'react'
import { initials, avatarColor } from '../utils/format'

/* ---------------- Button ---------------- */

const VARIANTS = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500/40 shadow-sm',
  secondary:
    'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-400/40 shadow-sm dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800',
  accent:
    'bg-accent-600 text-white hover:bg-accent-700 focus-visible:ring-accent-500/40 shadow-sm',
  danger:
    'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 focus-visible:ring-rose-400/40 dark:bg-slate-900 dark:text-rose-400 dark:border-rose-900/60 dark:hover:bg-rose-950/40',
  ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-lg',
  lg: 'px-5 py-3 text-base rounded-xl',
}

export function Button({ variant = 'primary', size = 'md', className = '', loading, children, disabled, ...rest }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  )
}

/* ---------------- Inputs ---------------- */

export const Input = forwardRef(function Input({ className = '', error, ...rest }, ref) {
  return (
    <input
      ref={ref}
      className={`input ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : ''} ${className}`}
      {...rest}
    />
  )
})

export function Select({ className = '', children, ...rest }) {
  return (
    <select className={`input ${className}`} {...rest}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...rest }) {
  return <textarea className={`input min-h-[80px] ${className}`} {...rest} />
}

export function Field({ label, hint, error, children }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  )
}

/* ---------------- Card ---------------- */

export function Card({ className = '', children }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      {children}
    </div>
  )
}

/* ---------------- StatusBadge ---------------- */

const STATUS_STYLES = {
  BOOKED: 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/30',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30',
  AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
}

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        STATUS_STYLES[status] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

/* ---------------- Avatar ---------------- */

export function Avatar({ name, url, size = 'md', className = '' }) {
  const safeName = typeof name === 'string' ? name : ''
  const sizes = {
    sm: 'h-9 w-9 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-2xl',
  }
  if (url) {
    return <img src={url} alt={safeName} className={`${sizes[size]} rounded-full object-cover ${className}`} />
  }
  return (
    <div
      className={`${sizes[size]} ${avatarColor(safeName)} flex items-center justify-center rounded-full font-semibold text-white ${className}`}
      aria-hidden
    >
      {initials(safeName)}
    </div>
  )
}

/* ---------------- DatePicker (native date input wrapper) ---------------- */

export function DatePicker({ value, onChange, min, className = '', ...rest }) {
  return (
    <input
      type="date"
      value={value}
      min={min}
      onChange={(e) => onChange(e.target.value)}
      className={`input ${className}`}
      {...rest}
    />
  )
}

/* ---------------- Section header ---------------- */

export function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
