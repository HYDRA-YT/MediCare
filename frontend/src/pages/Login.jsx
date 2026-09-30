import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import { Button, Card, Field, Input } from '../components/ui'
import { Logo } from '../components/Navbar'
import ThemeToggle from '../components/ThemeToggle'

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const profile = await login(form.email.trim(), form.password)
      toast.success(`Welcome back, ${profile.name}!`)
      const dest = location.state?.from?.pathname || (profile.role === 'DOCTOR' ? '/doctor' : '/patient')
      navigate(dest, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function fill(email) {
    setForm({ email, password: 'password123' })
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">MEDICARE</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md animate-fadeUp">
          <Card className="p-8">
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Log in to manage your appointments and prescriptions.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Field label="Email">
                <Input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
              <Field label="Password">
                <Input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </Field>

              {error && (
                <p className="rounded-lg bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>
              )}

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Login
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
              New to MediCare?{' '}
              <Link to="/register" className="font-semibold text-brand-700 hover:underline dark:text-brand-400">Create an account</Link>
            </p>
          </Card>

          {/* Demo credentials */}
          <Card className="mt-4 border-dashed p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Demo credentials</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => fill('aarav.gupta@medicare.com')}
                className="rounded-lg border border-slate-200 px-3 py-2 text-left text-xs transition hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:hover:border-brand-500/50 dark:hover:bg-brand-500/10"
              >
                <span className="block font-semibold text-slate-700 dark:text-slate-200">Patient</span>
                <span className="text-slate-500 dark:text-slate-400">aarav.gupta@medicare.com</span>
              </button>
              <button
                type="button"
                onClick={() => fill('ananya.sharma@medicare.com')}
                className="rounded-lg border border-slate-200 px-3 py-2 text-left text-xs transition hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:hover:border-brand-500/50 dark:hover:bg-brand-500/10"
              >
                <span className="block font-semibold text-slate-700 dark:text-slate-200">Doctor</span>
                <span className="text-slate-500 dark:text-slate-400">ananya.sharma@medicare.com</span>
              </button>
            </div>
            <p className="mt-2.5 text-xs text-slate-400 dark:text-slate-500">Password for all demo accounts: <span className="font-mono font-semibold text-slate-500 dark:text-slate-400">password123</span></p>
          </Card>
        </div>
      </div>
    </div>
  )
}
