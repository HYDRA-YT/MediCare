import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Avatar } from '../components/ui'
import { Logo } from '../components/Navbar'
import ThemeToggle from '../components/ThemeToggle'
import ErrorBoundary from '../components/ErrorBoundary'

const PATIENT_NAV = [
  { to: '/patient', label: 'Dashboard', icon: 'M3 12l9-9 9 9M5 10v10h14V10', end: true },
  { to: '/patient/doctors', label: 'Find Doctors', icon: 'M12 21a9 9 0 100-18 9 9 0 000 18zm0-5a4 4 0 100-8 4 4 0 000 8z' },
  { to: '/patient/appointments', label: 'My Appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { to: '/patient/prescriptions', label: 'Prescriptions', icon: 'M9 12h6m-6 4h6M9 8h2M7 3h10a2 2 0 012 2v16l-4-2-2 2-2-2-2 2-2-2-2 2V5a2 2 0 012-2z' },
  { to: '/patient/profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21a8 8 0 0116 0' },
]

const DOCTOR_NAV = [
  { to: '/doctor', label: 'Dashboard', icon: 'M3 12l9-9 9 9M5 10v10h14V10', end: true },
  { to: '/doctor/appointments', label: 'Appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { to: '/doctor/availability', label: 'Availability', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { to: '/doctor/patients', label: 'Patients', icon: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-6.4M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { to: '/doctor/prescriptions', label: 'Prescriptions', icon: 'M9 12h6m-6 4h6M9 8h2M7 3h10a2 2 0 012 2v16l-4-2-2 2-2-2-2 2-2-2-2 2V5a2 2 0 012-2z' },
  { to: '/doctor/profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21a8 8 0 0116 0' },
]

function NavIcon({ path }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  )
}

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const nav = role === 'doctor' ? DOCTOR_NAV : PATIENT_NAV

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 px-5 dark:border-slate-800">
        <Logo className="h-8 w-8" />
        <span className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white">MEDICARE</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              }`
            }
          >
            <NavIcon path={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-100 p-4 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-3">
          <Avatar name={user?.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
            <p className="truncate text-xs text-slate-400 dark:text-slate-500">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-1 pb-3">
          <ThemeToggle withLabel className="flex-1 justify-start px-3 py-2.5" />
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 17h5l-1.4 1.4A2 2 0 0117.2 19H15M15 7h5l-1.4-1.4A2 2 0 0017.2 5H15M9 12h11m0 0l-3-3m3 3l-3 3M9 12a9 9 0 01-6-2.2M4 5.5A9 9 0 009 12" transform="rotate(180 12 12)" />
            <path d="M10 17H5a2 2 0 01-2-2V9a2 2 0 012-2h5m3 10l3-3-3-3" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-800/60">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl animate-fadeUp dark:bg-slate-900">{sidebar}</aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        {/* Mobile topbar */}
        <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-900/90">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <Logo className="h-7 w-7" />
            <span className="font-display text-sm font-bold tracking-tight text-slate-900 dark:text-white">MEDICARE</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Avatar name={user?.name} size="sm" />
          </div>
        </div>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
