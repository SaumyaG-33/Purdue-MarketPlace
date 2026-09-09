import { fetchAuthSession } from 'aws-amplify/auth'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function toCamel(value) {
  if (Array.isArray(value)) return value.map(toCamel)
  if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()), toCamel(v)]),
    )
  }
  return value
}

export async function apiFetch(path, options = {}) {
  let token = null
  try {
    const session = await fetchAuthSession()
    token = session?.tokens?.idToken?.toString() ?? null
  } catch {
    // not signed in — fine for public GET endpoints, requireAuth routes will 401
  }

  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  if (res.status === 204) return null
  return toCamel(await res.json())
}

export const api = {
  get: (path) => apiFetch(path),
  post: (path, body) => apiFetch(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  patch: (path, body) => apiFetch(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
}
