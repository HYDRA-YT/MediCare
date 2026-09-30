import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import { Button, Card, Field, Input, Textarea, Select } from '../components/ui'
import { Logo } from '../components/Navbar'
import ThemeToggle from '../components/ThemeToggle'

const SPECIALIZATIONS = ['Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 'General Medicine', 'Pediatrics']

export default function Register() {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [role, setRole] = useState('PATIENT')
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    specialization: 'Cardiology', qualification: '', experienceYears: '', bio: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role,
        phone: form.phone.trim() || undefined,
      }
      if (role === 'DOCTOR') {
        payload.specialization = form.specialization
        payload.qualification = form.qualification.trim() || undefined
        payload.experienceYears = form.experienceYears ? Number(form.experienceYears) : undefined
        payload.bio = form.bio.trim() || undefined
      }
      const profile = await register(payload)
      toast.success(`Account created. Welcome, ${profile.name}!`)
      navigate(profile.role === 'DOCTOR' ? '/doctor' : '/patient', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
        <div className="w-full max-w-lg animate-fadeUp">
          <Card className="p-8">
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Create your account</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Join MediCare as a patient or a doctor.</p>

            {/* Role toggle */}
            <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5 dark:bg-slate-800">
              {['PATIENT', 'DOCTOR'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                    role === r
                      ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-900 dark:text-brand-300'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {r === 'PATIENT' ? '🧑 Patient' : '🩺 Doctor'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <Field label="Full name">
                <Input required placeholder="Your name" value={form.name} onChange={(e) => set('name', e.target.value)} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email">
                  <Input type="email" required placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
                </Field>
                <Field label="Phone (optional)">
                  <Input placeholder="+91 98765 43210" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                </Field>
              </div>
              <Field label="Password" hint="Minimum 6 characters">
                <Input type="password" required minLength={6} placeholder="••••••••" value={form.password} onChange={(e) => set('password', e.target.value)} />
              </Field>

              {role === 'DOCTOR' && (
                <div className="space-y-4 rounded-xl border border-brand-100 bg-brand-50/50 p-4 dark:border-brand-500/30 dark:bg-brand-500/5">
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Doctor profile</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Specialization">
                      <Select value={form.specialization} onChange={(e) => set('specialization', e.target.value)}>
                        {SPECIALIZATIONS.map((s) => <option key={s}>{s}</option>)}
                      </Select>
                    </Field>
                    <Field label="Experience (years)">
                      <Input type="number" min="0" max="60" placeholder="e.g. 8" value={form.experienceYears} onChange={(e) => set('experienceYears', e.target.value)} />
                    </Field>
                  </div>
                  <Field label="Qualification">
                    <Input placeholder="MBBS, MD ..." value={form.qualification} onChange={(e) => set('qualification', e.target.value)} />
                  </Field>
                  <Field label="Short bio">
                    <Textarea placeholder="A sentence or two about your practice" value={form.bio} onChange={(e) => set('bio', e.target.value)} />
                  </Field>
                </div>
              )}

              {error && (
                <p className="rounded-lg bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>
              )}

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Create account
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-700 hover:underline dark:text-brand-400">Login</Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
