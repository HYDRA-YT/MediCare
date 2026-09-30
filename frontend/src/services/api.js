// Base URL of the MediCare backend.
// - Dev: Vite proxies /api to http://localhost:8080 (see vite.config.js)
// - Prod: set VITE_API_BASE (e.g. https://medicare-api.onrender.com/api) at build time
const BASE = import.meta.env.VITE_API_BASE || '/api'

function headers() {
  const h = { 'Content-Type': 'application/json' }
  try {
    const raw = sessionStorage.getItem('medicare_session')
    if (raw) {
      const s = JSON.parse(raw)
      if (s?.userId) h['X-User-Id'] = s.userId
      if (s?.role) h['X-User-Role'] = s.role
    }
  } catch {
    /* ignore */
  }
  return h
}

async function request(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: headers(),
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }
  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && data.message) ||
      `Request failed (${res.status})`
    const err = new Error(message)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
}
