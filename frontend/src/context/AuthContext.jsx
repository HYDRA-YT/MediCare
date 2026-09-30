import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../services/api'

export const AuthContext = createContext(null)

/**
 * Session lives in sessionStorage (survives reloads in the tab, cleared on
 * logout/tab close). On boot the profile is re-verified against the backend —
 * there is no frontend-only fake login.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const persistSession = useCallback((data) => {
    const session = {
      userId: data.userId,
      role: data.role,
      token: data.token,
    }
    sessionStorage.setItem('medicare_session', JSON.stringify(session))
    // Profile (without password) comes from the backend response
    sessionStorage.setItem('medicare_profile', JSON.stringify(data.profile))
    setUser(data.profile)
    return data.profile
  }, [])

  useEffect(() => {
    let cancelled = false
    async function boot() {
      try {
        const raw = sessionStorage.getItem('medicare_session')
        if (!raw) return
        const session = JSON.parse(raw)
        if (!session?.userId) return
        const profile = await api.get(`/users/${session.userId}`)
        if (!cancelled) setUser(profile)
      } catch {
        sessionStorage.removeItem('medicare_session')
        sessionStorage.removeItem('medicare_profile')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    boot()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await api.post('/auth/login', { email, password })
    return persistSession(data)
  }, [persistSession])

  const register = useCallback(async (payload) => {
    const data = await api.post('/auth/register', payload)
    return persistSession(data)
  }, [persistSession])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      /* best effort */
    }
    sessionStorage.removeItem('medicare_session')
    sessionStorage.removeItem('medicare_profile')
    setUser(null)
  }, [])

  const updateProfile = useCallback((profile) => {
    setUser(profile)
    sessionStorage.setItem('medicare_profile', JSON.stringify(profile))
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
