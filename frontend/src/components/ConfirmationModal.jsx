import Modal from './Modal'
import { Button } from './ui'

export default function ConfirmationModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', loading, tone = 'danger' }) {
  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="text-center">
        <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${tone === 'danger' ? 'bg-rose-100 dark:bg-rose-500/10' : 'bg-brand-100 dark:bg-brand-500/10'}`}>
          <svg className={`h-6 w-6 ${tone === 'danger' ? 'text-rose-600 dark:text-rose-400' : 'text-brand-600 dark:text-brand-400'}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Keep it</Button>
          <Button
            onClick={onConfirm}
            loading={loading}
            className={tone === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : ''}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
