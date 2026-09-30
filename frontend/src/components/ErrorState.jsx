import { Button } from './ui'

export default function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/60 px-6 py-12 text-center dark:border-rose-900/60 dark:bg-rose-950/20">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/10">
        <svg className="h-7 w-7 text-rose-600 dark:text-rose-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5a1 1 0 112 0 1 1 0 01-2 0zm.25-7.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5z" clipRule="evenodd" />
        </svg>
      </div>
      <h3 className="font-display text-base font-semibold text-rose-800 dark:text-rose-300">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-rose-600 dark:text-rose-400">{message}</p>}
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
