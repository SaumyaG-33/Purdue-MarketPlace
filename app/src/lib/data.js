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

// Only "nails" has seeded providers, everything else hits the spec'd empty state.
export const PROVIDERS = {
  maya: {
    id: 'maya',
    name: "Maya's Nail Studio",
    serviceId: 'nails',
    categoryId: 'beauty',
    ownerName: 'Maya A.',
    email: 'maya@purdue.edu',
    rating: 4.9,
    reviewCount: 32,
    area: 'Cary Quad area',
    joined: 'Sep 2025',
    bio: "Junior in HTM. I do gel sets in my apartment near Cary — usually 60–90 min. Bring your own inspo pics, I'll match them.",
    portfolioCount: 5,
    venmo: '@maya-nails-pu',
    zelle: '765-555-0142 (Maya A.)',
    applicationStatus: 'approved',
    strikes: 0,
    suspended: false,
    services: [
      { id: 'gel', name: 'Gel manicure', duration: 75, price: 35, deposit: 10 },
      { id: 'gel-ext', name: 'Gel + extensions', duration: 120, price: 60, deposit: 10 },
      { id: 'soak-off', name: 'Soak-off / removal', duration: 30, price: 15, deposit: 0 },
    ],
    reviews: [
      { id: 'r1', author: 'Priya R.', rating: 5, text: 'Lasted three weeks through finals. Booking was easy.', when: '2 weeks ago' },
      { id: 'r2', author: 'Devon M.', rating: 4, text: 'Great set, ran about 20 min behind.', when: '1 month ago' },
    ],
  },
  jordan: {
    id: 'jordan',
    name: 'Nails by Jordan',
    serviceId: 'nails',
    categoryId: 'beauty',
    ownerName: 'Jordan T.',
    email: 'jordan@purdue.edu',
    rating: 4.7,
    reviewCount: 14,
    area: 'Chauncey Hill',
    joined: 'Jan 2026',
    bio: 'Press-ons and simple gel sets, quick turnaround between classes.',
    portfolioCount: 3,
    venmo: '@jordan-nails',
    zelle: '',
    applicationStatus: 'approved',
    strikes: 0,
    suspended: false,
    services: [
      { id: 'press-on', name: 'Press-ons', duration: 45, price: 20, deposit: 5 },
      { id: 'gel-basic', name: 'Gel manicure', duration: 75, price: 30, deposit: 10 },
    ],
    reviews: [{ id: 'r3', author: 'Sam K.', rating: 5, text: 'Fast and cheap, exactly what I needed before formal.', when: '3 weeks ago' }],
  },
  glow: {
    id: 'glow',
    name: 'Glow Bar',
    serviceId: 'nails',
    categoryId: 'beauty',
    ownerName: 'Aria T.',
    email: 'aria@ivytech.edu',
    rating: 5.0,
    reviewCount: 8,
    area: 'drives to you',
    joined: 'Feb 2026',
    bio: 'Gel and nail art, mobile — I bring the kit to your dorm or apartment.',
    portfolioCount: 5,
    venmo: '@glowbar-aria',
    zelle: '',
    applicationStatus: 'approved',
    strikes: 1,
    suspended: false,
    services: [{ id: 'gel-art', name: 'Gel + art', duration: 90, price: 45, deposit: 10 }],
    reviews: [],
  },
}

export const DEMO_USERS = {
  jdoe: { id: 'jdoe', name: 'Jamie Doe', email: 'jdoe@purdue.edu', role: 'client', verified: true },
  maya: { id: 'maya', name: 'Maya A.', email: 'maya@purdue.edu', role: 'provider', verified: true, providerId: 'maya' },
  admin: { id: 'admin', name: 'Admin', email: 'admin@purdue.edu', role: 'admin', verified: true },
}

export const APPLICATIONS_SEED = [
  {
    id: 'app-sam',
    businessName: "Sam's Airport Runs",
    ownerName: 'Sam K.',
    email: 'skoch@purdue.edu',
    category: 'transportation',
    phone: '(765) 555-0110',
    priceRange: '$25 – $45',
    servicesText: 'IND airport runs, $45 one way; local moving help, $25/hr.',
    description: '2019 Civic, can fit 2 people + luggage. Weekends only.',
    docs: ['License.jpg', 'Insurance.pdf'],
    status: 'pending',
    submittedAt: '2026-08-24',
    ageDays: 1,
    internalNote: '',
  },
  {
    id: 'app-glow2',
    businessName: 'Glow Bar',
    ownerName: 'Aria T.',
    email: 'at@ivytech.edu',
    category: 'beauty',
    phone: '(765) 555-0121',
    priceRange: '$30 – $60',
    servicesText: 'Gel + art, mobile service.',
    description: '',
    docs: [],
    status: 'pending',
    submittedAt: '2026-08-23',
    ageDays: 2,
    internalNote: '',
  },
  {
    id: 'app-boiler',
    businessName: 'Boiler Beats DJ',
    ownerName: 'Marcus L.',
    email: 'ml@purdue.edu',
    category: 'entertainment',
    phone: '(765) 555-0133',
    priceRange: '$100 – $300',
    servicesText: 'Parties, tailgates, formals.',
    description: '',
    docs: ['Portfolio.pdf'],
    status: 'pending',
    submittedAt: '2026-08-21',
    ageDays: 4,
    internalNote: '',
  },
  {
    id: 'app-nina',
    businessName: 'Paws by Nina',
    ownerName: 'Nina P.',
    email: 'np@purdue.edu',
    category: 'petcare',
    phone: '(765) 555-0144',
    priceRange: '$10 – $25',
    servicesText: 'Dog walking, drop-in pet sitting.',
    description: '',
    docs: [],
    status: 'pending',
    submittedAt: '2026-08-20',
    ageDays: 5,
    internalNote: '',
  },
]

export const REPORTS_SEED = [
  {
    id: 'rpt-1042',
    kind: 'No-show',
    providerId: null,
    providerName: "Sam's Airport Runs",
    reporterName: 'Priya R.',
    bookingRef: 'booking Sep 13 · $45',
    description: 'Waited 25 minutes, he never answered. Missed my flight.',
    status: 'open',
    flagged: true,
  },
  {
    id: 'rpt-1041',
    kind: 'Not as described',
    providerId: 'glow',
    providerName: 'Glow Bar',
    reporterName: 'Devon M.',
    bookingRef: 'booking Aug 30',
    description: 'Paid for a full set, got a partial.',
    status: 'open',
    flagged: false,
  },
]

export const REVIEW_FLAGS_SEED = [
  { id: 'rf-1', rating: 1, source: 'flagged by provider', when: 'Sep 1', text: '"she was so slow" — provider claims client was 40 min late.' },
  { id: 'rf-2', rating: 5, source: 'auto-flagged · same IP as provider', when: '', text: '"best nails in west lafayette!!"' },
]

export const SUSPENSIONS_SEED = {
  providers: [
    { id: 'sam', name: "Sam's Airport Runs", categoryId: 'transportation', note: '3 strikes — 2 no-shows, 1 unsafe driving · 4 open bookings', status: 'flagged' },
    { id: 'glow', name: 'Glow Bar', categoryId: 'beauty', note: '1 strike — not as described · Aug 30', status: 'active' },
    { id: 'boiler', name: 'Boiler Beats DJ', categoryId: 'entertainment', note: 'Removed Aug 12 · no-shows ×3 · appealed, denied', status: 'removed' },
  ],
  clients: [
    { id: 'devon', name: 'Devon M.', email: 'dm@purdue.edu', note: '3 no-shows reported by 3 different providers · last Aug 26', status: 'flagged' },
    { id: 'nina', name: 'Nina P.', email: 'np@purdue.edu', note: '2 no-shows · 1 late cancel · last Aug 22', status: 'active' },
    { id: 'aria', name: 'Aria T.', email: 'at@ivytech.edu', note: 'Blocked Aug 18 · can browse, can’t book', status: 'blocked' },
  ],
}

// --- scheduling mock ---

const OPEN_MIN = 9 * 60
const CLOSE_MIN = 20 * 60
const STEP = 30

const BUSY_BY_PROVIDER = {
  maya: [
    [0, 8 * 60, 16 * 60], // day offset, busy start, busy end (relative to today)
  ],
}

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

export function getSlotsForDay(providerId, serviceId, dayOffset) {
  const provider = PROVIDERS[providerId]
  const service = provider?.services.find((s) => s.id === serviceId)
  if (!provider || !service) return []
  if (!isProviderFreeOnDay(providerId, dayOffset)) return []

  const slots = []
  for (let start = OPEN_MIN; start + service.duration <= CLOSE_MIN; start += STEP) {
    const h = hashInt(`${providerId}-${serviceId}-${dayOffset}-${start}`)
    const booked = h % 3 === 0
    slots.push({ start, duration: service.duration, booked })
  }
  return slots
}

export function providersForService(serviceId) {
  return Object.values(PROVIDERS).filter((p) => p.serviceId === serviceId)
}

export function anyFreeProviderOnDay(serviceId, dayOffset) {
  return providersForService(serviceId).some((p) => isProviderFreeOnDay(p.id, dayOffset))
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
