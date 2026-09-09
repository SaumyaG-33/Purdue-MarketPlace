const DAY_MS = 24 * 60 * 60 * 1000

export function toKey(date) {
  return date.toISOString().slice(0, 10)
}

export function addDays(date, n) {
  return new Date(date.getTime() + n * DAY_MS)
}

export function formatDay(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

export function formatDayShort(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function formatMonthYear(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function minutesToLabel(mins) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`
}

export function labelRange(startMin, durationMin) {
  return `${minutesToLabel(startMin)} – ${minutesToLabel(startMin + durationMin)}`
}

export function firstNameOf(name) {
  if (!name) return ''
  return name.replace(/[’']s\b/, '').split(' ')[0]
}

// Helpers for real timestamps coming back from the API (ISO strings), as
// opposed to the dayOffset+minutes-since-midnight shape used by the local
// mock slot picker before a booking is actually created server-side.
export function timeLabel(date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function rangeLabel(startDate, durationMinutes) {
  const end = new Date(startDate.getTime() + durationMinutes * 60000)
  return `${timeLabel(startDate)} – ${timeLabel(end)}`
}

export function dayOffsetOf(date) {
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return Math.round((startOfDay(date) - startOfDay(new Date())) / DAY_MS)
}

