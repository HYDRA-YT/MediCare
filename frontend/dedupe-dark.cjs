/* Dedupe conflicting dark: tokens inside className strings.
 * If two dark: tokens share the same family (bg, text, border, hover:bg, ...),
 * keep only the LAST one (the intentional one). */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, 'src')

function familyOf(darkToken) {
  // 'dark:bg-slate-900' -> 'bg', 'dark:hover:bg-slate-800' -> 'hover:bg',
  // 'dark:text-slate-100' -> 'text', 'dark:bg-slate-800/60' -> 'bg'
  return darkToken.replace(/^dark:/, '').replace(/-[\w/]+$/, (m) => (m.includes('/') ? '' : m)) === ''
    ? darkToken.replace(/^dark:/, '').split('-')[0]
    : darkToken.replace(/^dark:/, '').replace(/\/[\w.]+$/, '').replace(/-([a-z0-9]+)$/, '')
}

function betterFamily(darkToken) {
  let t = darkToken.replace(/^dark:/, '')
  t = t.replace(/\/[\d.]+$/, '') // strip opacity
  // family = everything before the last color segment: bg-slate-900 -> bg; hover:bg-slate-800 -> hover:bg
  const parts = t.split('-')
  if (['bg', 'text', 'border', 'divide', 'ring', 'shadow'].includes(parts[0])) return parts[0]
  if (parts[0] === 'hover' || parts[0] === 'focus' || parts[0] === 'placeholder') return parts.slice(0, 2).join(':')
  return parts[0]
}

function dedupe(str) {
  const tokens = str.split(/\s+/)
  // collect indices of dark: tokens grouped by family
  const byFamily = new Map()
  tokens.forEach((tk, i) => {
    if (tk.startsWith('dark:')) {
      const fam = betterFamily(tk)
      if (!byFamily.has(fam)) byFamily.set(fam, [])
      byFamily.get(fam).push(i)
    }
  })
  const remove = new Set()
  for (const [fam, idxs] of byFamily) {
    if (idxs.length > 1) {
      // keep the last, drop the rest
      idxs.slice(0, -1).forEach((i) => remove.add(i))
    }
  }
  if (remove.size === 0) return str
  return tokens.filter((_, i) => !remove.has(i)).join(' ')
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(p)
    else if (/\.(jsx?)$/.test(entry.name)) {
      let src = fs.readFileSync(p, 'utf8')
      const before = src
      src = src.replace(/"([^"\n]*)"/g, (m, s) => (s.includes('dark:') ? `"${dedupe(s)}"` : m))
      src = src.replace(/`([^`]*)`/g, (m, s) => (s.includes('dark:') ? `\`${dedupe(s)}\`` : m))
      if (src !== before) {
        fs.writeFileSync(p, src)
        console.log('deduped:', path.relative(ROOT, p))
      }
    }
  }
}

walk(ROOT)
console.log('done')
