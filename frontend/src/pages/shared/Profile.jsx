import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'
import { Card, Button, Field, Input, Textarea, Avatar } from '../../components/ui'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const isDoctor = user.role === 'DOCTOR'

  useEffect(() => {
    async function load() {
      try {
        const p = await api.get(`/users/${user.id}`)
        setForm({
          name: p.name || '',
          email: p.email || '',
          phone: p.phone || '',
          specialization: p.specialization || '',
          qualification: p.qualification || '',
          bio: p.bio || '',
        })
      } catch {
        setForm({ name: user.name || '', email: user.email || '', phone: '', specialization: '', qualification: '', bio: '' })
      }
    }
    load()
  }, [user.id])

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { name: form.name.trim(), phone: form.phone.trim() }
      if (isDoctor) {
        payload.specialization = form.specialization.trim()
        payload.qualification = form.qualification.trim()
        payload.bio = form.bio.trim()
      }
      const updated = await api.put(`/users/${user.id}`, payload)
      updateProfile(updated)
      toast.success('Profile updated successfully.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!form) return <div className="py-24"><LoadingSpinner size="lg" label="Loading profile..." /></div>

  return (
    <div className="mx-auto max-w-2xl animate-fadeUp">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your account details.</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
          <Avatar name={form.name} size="xl" />
          <div>
            <p className="font-display text-lg font-bold text-slate-900 dark:text-white">{form.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{form.email}</p>
            <span className="mt-1.5 inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700 dark:text-brand-300">
              {isDoctor ? 'DOCTOR' : 'PATIENT'}
            </span>
          </div>
        </div>

        <form onSubmit={save} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
            </Field>
          </div>

          {isDoctor && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Specialization">
                  <Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
                </Field>
                <Field label="Qualification">
                  <Input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
                </Field>
              </div>
              <Field label="Bio">
                <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Short professional bio" />
              </Field>
            </>
          )}

          <div className="flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
