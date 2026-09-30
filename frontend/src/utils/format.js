const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December']

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** "2026-09-30" -> "30 Sep 2026" */
export function formatDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]?.slice(0, 3)} ${y}`
}

/** "2026-09-30" -> "Wednesday" */
export function dayName(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return DAYS[new Date(y, m - 1, d).getDay()]
}

/** "2026-09-30" -> "30 September 2026" */
export function formatDateLong(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

/** Local date as ISO yyyy-mm-dd */
export function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function initials(name = '') {
  return name
    .replace(/^Dr\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

const AVATAR_COLORS = [
  'bg-brand-600', 'bg-accent-600', 'bg-teal-600', 'bg-cyan-700',
  'bg-sky-700', 'bg-emerald-700', 'bg-indigo-600',
]

export function avatarColor(name = '') {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

/** ISO datetime (local) -> "30 Sep 2026, 10:30 AM" */
export function formatDateTime(isoDateTime) {
  if (!isoDateTime) return ''
  const d = new Date(isoDateTime)
  const date = `${d.getDate()} ${MONTHS[d.getMonth()]?.slice(0, 3)} ${d.getFullYear()}`
  let h = d.getHours()
  const min = String(d.getMinutes()).padStart(2, '0')
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${date}, ${h}:${min} ${ap}`
}
