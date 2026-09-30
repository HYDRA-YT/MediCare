export default function LoadingSpinner({ size = 'md', label }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }
  return (
    <div className="flex flex-col items-center justify-center gap-3" role="status" aria-live="polite">
      <svg className={`${sizes[size]} animate-spin text-brand-600 dark:text-brand-400`} viewBox="0 0 24 24" fill="none">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      {label && <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>}
    </div>
  )
}
