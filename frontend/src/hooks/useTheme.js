import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'medicare_theme'

function initialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch {
    /* ignore */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

/* ------------------------------------------------------------------ *
 * Shared theme store: every ThemeToggle instance subscribes here, so
 * toggling in the sidebar also updates the navbar (and vice versa).
 * ------------------------------------------------------------------ */
let currentTheme = initialTheme()
const listeners = new Set()

applyTheme(currentTheme)

function setGlobalTheme(next) {
  currentTheme = next
  applyTheme(next)
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn(next))
}

/**
 * Theme state with localStorage persistence and system-preference fallback.
 * The class is also applied pre-paint in index.html to avoid a flash.
 */
export function useTheme() {
  // Initialise from the shared store so this instance is correct immediately.
  const [theme, setLocalTheme] = useState(currentTheme)

  useEffect(() => {
    const listener = (t) => setLocalTheme(t)
    listeners.add(listener)
    // Re-sync in case another instance changed the theme between renders.
    if (currentTheme !== theme) setLocalTheme(currentTheme)
    return () => listeners.delete(listener)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Follow OS changes while the app is open (only when the user hasn't chosen).
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e) => {
      let saved = null
      try {
        saved = localStorage.getItem(STORAGE_KEY)
      } catch {
        /* ignore */
      }
      if (!saved) setGlobalTheme(e.matches ? 'dark' : 'light')
    }
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  const toggle = useCallback(() => {
    setGlobalTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }, [])

  return { theme, setTheme: setGlobalTheme, toggle, isDark: theme === 'dark' }
}
