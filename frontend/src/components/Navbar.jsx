import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from './ui'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const { user } = useAuth()
  const home = user ? (user.role === 'DOCTOR' ? '/doctor' : '/patient') : '/'

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to={home} className="flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">MEDICARE</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex dark:text-slate-300">
          <a href="/#how-it-works" className="hover:text-brand-700 dark:hover:text-brand-400">How it works</a>
          <a href="/#features" className="hover:text-brand-700 dark:hover:text-brand-400">Features</a>
          <a href="/#for-patients" className="hover:text-brand-700 dark:hover:text-brand-400">For Patients</a>
          <a href="/#for-doctors" className="hover:text-brand-700 dark:hover:text-brand-400">For Doctors</a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <Link to={home}>
              <Button size="sm">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="secondary" size="sm">Login</Button>
              </Link>
              <Link to="/register" className="hidden sm:block">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export function Logo({ className = 'h-9 w-9' }) {
  return (
    <span className={`${className} flex items-center justify-center rounded-xl bg-brand-600 shadow-sm`}>
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </span>
  )
}
