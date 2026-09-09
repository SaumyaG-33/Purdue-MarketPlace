import { toKey, addDays } from './format'

export const CATEGORIES = [
  {
    id: 'beauty',
    name: 'Beauty',
    services: [
      { id: 'nails', name: 'Nails', desc: 'Gel, acrylic, press-ons', providers: 9, from: 20 },
      { id: 'lashes', name: 'Lashes', desc: 'Extensions, lifts, fills', providers: 4, from: 45 },
      { id: 'eyebrows', name: 'Eyebrows', desc: 'Shaping, tinting, laminating', providers: 5, from: 15 },
      { id: 'waxing', name: 'Waxing', desc: 'Face, arms, legs', providers: 3, from: 18 },
      { id: 'haircuts', name: 'Haircuts', desc: 'Cuts, line-ups, trims', providers: 7, from: 15 },
      { id: 'braids', name: 'Braids & styling', desc: 'Braids, twists, blowouts', providers: 6, from: 30 },
      { id: 'makeup', name: 'Makeup', desc: 'Formal, photos, everyday', providers: 5, from: 40 },
      { id: 'skincare', name: 'Skincare / facials', desc: 'Facials, dermaplaning', providers: 2, from: 35 },
    ],
  },
  {
    id: 'education',
    name: 'Education',
    services: [
      { id: 'tutoring', name: 'Tutoring', desc: 'STEM, writing, languages', providers: 12, from: 15 },
      { id: 'resume', name: 'Resume help', desc: 'Resumes, cover letters', providers: 3, from: 20 },
      { id: 'exam-prep', name: 'Exam prep', desc: 'MCAT, GRE, LSAT', providers: 4, from: 25 },
    ],
  },
  {
    id: 'transportation',
    name: 'Transportation',
    services: [
      { id: 'airport', name: 'Airport rides', desc: 'IND, Chicago runs', providers: 6, from: 30 },
      { id: 'moving', name: 'Moving help', desc: 'Loading, hauling', providers: 3, from: 25 },
    ],
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    services: [
      { id: 'dj', name: 'DJ', desc: 'Parties, formals, tailgates', providers: 3, from: 100 },
      { id: 'photography', name: 'Photography', desc: 'Portraits, events', providers: 4, from: 50 },
    ],
  },
  {
    id: 'petcare',
    name: 'Pet Care',
    services: [
      { id: 'dog-walking', name: 'Dog walking', desc: 'Daily or one-off', providers: 5, from: 10 },
      { id: 'pet-sitting', name: 'Pet sitting', desc: 'Overnight, drop-in', providers: 3, from: 20 },
    ],
  },
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))

export function findService(serviceId) {
  for (const cat of CATEGORIES) {
    const svc = cat.services.find((s) => s.id === serviceId)
    if (svc) return { category: cat, service: svc }
  }
  return null
}

// --- scheduling mock ---
// There's no real availability/calendar backend yet, so free/busy slots are
// still deterministically faked from provider + day. Real provider identity,
// services, bookings, etc. now come from the API (see lib/api.js).

const OPEN_MIN = 9 * 60
const CLOSE_MIN = 20 * 60
const STEP = 30

export function hashInt(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

export function isProviderFreeOnDay(providerId, dayOffset) {
  // deterministic pseudo-random "some days off" pattern per provider
  const h = hashInt(`${providerId}-${dayOffset}`)
  return h % 5 !== 0
}

// service: { id, duration } for the provider's chosen offering
export function getSlotsForDay(providerId, service, dayOffset) {
  if (!service || !isProviderFreeOnDay(providerId, dayOffset)) return []

  const slots = []
  for (let start = OPEN_MIN; start + service.duration <= CLOSE_MIN; start += STEP) {
    const h = hashInt(`${providerId}-${service.id}-${dayOffset}-${start}`)
    const booked = h % 3 === 0
    slots.push({ start, duration: service.duration, booked })
  }
  return slots
}

export function anyFreeProviderOnDay(providers, dayOffset) {
  return providers.some((p) => isProviderFreeOnDay(p.id, dayOffset))
}

export function today() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function dateForOffset(offset) {
  return addDays(today(), offset)
}

export function keyForOffset(offset) {
  return toKey(dateForOffset(offset))
}
