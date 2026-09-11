import { pool } from './db.js'

const client = await pool.connect()

async function upsertUser(u) {
  await client.query(
    `INSERT INTO users (id, email, name, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role`,
    [u.id, u.email, u.name, u.role],
  )
}

async function upsertProvider(p) {
  await client.query(
    `INSERT INTO providers (id, name, service_id, category_id, owner_name, email, rating, review_count, area, joined, bio, portfolio_count, venmo, zelle, application_status, strikes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name, rating = EXCLUDED.rating, review_count = EXCLUDED.review_count,
       area = EXCLUDED.area, bio = EXCLUDED.bio, application_status = EXCLUDED.application_status`,
    [
      p.id, p.name, p.serviceId, p.categoryId, p.ownerName, p.email, p.rating, p.reviewCount,
      p.area, p.joined, p.bio, p.portfolioCount, p.venmo, p.zelle, p.applicationStatus, p.strikes,
    ],
  )
}

async function upsertService(providerId, s) {
  await client.query(
    `INSERT INTO provider_services (id, provider_id, name, duration_minutes, price, deposit)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, duration_minutes = EXCLUDED.duration_minutes, price = EXCLUDED.price, deposit = EXCLUDED.deposit`,
    [`${providerId}-${s.id}`, providerId, s.name, s.duration, s.price, s.deposit],
  )
}

async function upsertReview(providerId, r) {
  await client.query(
    `INSERT INTO reviews (id, provider_id, author, rating, body)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (id) DO NOTHING`,
    [`${providerId}-${r.id}`, providerId, r.author, r.rating, r.text],
  )
}

async function upsertApplication(a) {
  await client.query(
    `INSERT INTO applications (id, business_name, owner_name, email, category, phone, price_range, services_text, description, docs, status, submitted_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     ON CONFLICT (id) DO NOTHING`,
    [
      a.id, a.businessName, a.ownerName, a.email, a.category, a.phone, a.priceRange,
      a.servicesText, a.description, JSON.stringify(a.docs), a.status, a.submittedAt,
    ],
  )
}

async function upsertReport(r) {
  await client.query(
    `INSERT INTO reports (id, kind, provider_id, provider_name, reporter_name, booking_ref, description, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (id) DO NOTHING`,
    [r.id, r.kind, r.providerId, r.providerName, r.reporterName, r.bookingRef, r.description, r.status],
  )
}

try {
  await client.query('BEGIN')

  // Demo users — matches app/src/lib/data.js DEMO_USERS
  await upsertUser({ id: 'jdoe', email: 'jdoe@purdue.edu', name: 'Jamie Doe', role: 'client' })
  await upsertUser({ id: 'maya', email: 'maya@purdue.edu', name: 'Maya A.', role: 'client' })
  await upsertUser({ id: 'admin', email: 'admin@purdue.edu', name: 'Admin', role: 'admin' })

  // Providers
  await upsertProvider({
    id: 'maya', name: "Maya's Nail Studio", serviceId: 'nails', categoryId: 'beauty',
    ownerName: 'Maya A.', email: 'maya@purdue.edu', rating: 4.9, reviewCount: 32, area: 'Cary Quad area',
    joined: 'Sep 2025', bio: "Junior in HTM. I do gel sets in my apartment near Cary — usually 60–90 min. Bring your own inspo pics, I'll match them.",
    portfolioCount: 5, venmo: '@maya-nails-pu', zelle: '765-555-0142 (Maya A.)', applicationStatus: 'approved', strikes: 0,
  })
  await upsertService('maya', { id: 'gel', name: 'Gel manicure', duration: 75, price: 35, deposit: 10 })
  await upsertService('maya', { id: 'gel-ext', name: 'Gel + extensions', duration: 120, price: 60, deposit: 10 })
  await upsertService('maya', { id: 'soak-off', name: 'Soak-off / removal', duration: 30, price: 15, deposit: 0 })
  await upsertReview('maya', { id: 'r1', author: 'Priya R.', rating: 5, text: 'Lasted three weeks through finals. Booking was easy.' })
  await upsertReview('maya', { id: 'r2', author: 'Devon M.', rating: 4, text: 'Great set, ran about 20 min behind.' })

  await upsertProvider({
    id: 'jordan', name: 'Nails by Jordan', serviceId: 'nails', categoryId: 'beauty',
    ownerName: 'Jordan T.', email: 'jordan@purdue.edu', rating: 4.7, reviewCount: 14, area: 'Chauncey Hill',
    joined: 'Jan 2026', bio: 'Press-ons and simple gel sets, quick turnaround between classes.',
    portfolioCount: 3, venmo: '@jordan-nails', zelle: '', applicationStatus: 'approved', strikes: 0,
  })
  await upsertService('jordan', { id: 'press-on', name: 'Press-ons', duration: 45, price: 20, deposit: 5 })
  await upsertService('jordan', { id: 'gel-basic', name: 'Gel manicure', duration: 75, price: 30, deposit: 10 })
  await upsertReview('jordan', { id: 'r3', author: 'Sam K.', rating: 5, text: 'Fast and cheap, exactly what I needed before formal.' })

  await upsertProvider({
    id: 'glow', name: 'Glow Bar', serviceId: 'nails', categoryId: 'beauty',
    ownerName: 'Aria T.', email: 'aria@ivytech.edu', rating: 5.0, reviewCount: 8, area: 'drives to you',
    joined: 'Feb 2026', bio: 'Gel and nail art, mobile — I bring the kit to your dorm or apartment.',
    portfolioCount: 5, venmo: '@glowbar-aria', zelle: '', applicationStatus: 'approved', strikes: 1,
  })
  await upsertService('glow', { id: 'gel-art', name: 'Gel + art', duration: 90, price: 45, deposit: 10 })

  // Applications
  await upsertApplication({
    id: 'app-sam', businessName: "Sam's Airport Runs", ownerName: 'Sam K.', email: 'skoch@purdue.edu',
    category: 'transportation', phone: '(765) 555-0110', priceRange: '$25 – $45',
    servicesText: 'IND airport runs, $45 one way; local moving help, $25/hr.',
    description: '2019 Civic, can fit 2 people + luggage. Weekends only.',
    docs: ['License.jpg', 'Insurance.pdf'], status: 'pending', submittedAt: '2026-08-24',
  })
  await upsertApplication({
    id: 'app-glow2', businessName: 'Glow Bar', ownerName: 'Aria T.', email: 'at@ivytech.edu',
    category: 'beauty', phone: '(765) 555-0121', priceRange: '$30 – $60',
    servicesText: 'Gel + art, mobile service.', description: '', docs: [], status: 'pending', submittedAt: '2026-08-23',
  })
  await upsertApplication({
    id: 'app-boiler', businessName: 'Boiler Beats DJ', ownerName: 'Marcus L.', email: 'ml@purdue.edu',
    category: 'entertainment', phone: '(765) 555-0133', priceRange: '$100 – $300',
    servicesText: 'Parties, tailgates, formals.', description: '', docs: ['Portfolio.pdf'], status: 'pending', submittedAt: '2026-08-21',
  })
  await upsertApplication({
    id: 'app-nina', businessName: 'Paws by Nina', ownerName: 'Nina P.', email: 'np@purdue.edu',
    category: 'petcare', phone: '(765) 555-0144', priceRange: '$10 – $25',
    servicesText: 'Dog walking, drop-in pet sitting.', description: '', docs: [], status: 'pending', submittedAt: '2026-08-20',
  })

  // Reports
  await upsertReport({
    id: 'rpt-1042', kind: 'No-show', providerId: null, providerName: "Sam's Airport Runs",
    reporterName: 'Priya R.', bookingRef: 'booking Sep 13 · $45',
    description: 'Waited 25 minutes, he never answered. Missed my flight.', status: 'open',
  })
  await upsertReport({
    id: 'rpt-1041', kind: 'Not as described', providerId: 'glow', providerName: 'Glow Bar',
    reporterName: 'Devon M.', bookingRef: 'booking Aug 30', description: 'Paid for a full set, got a partial.', status: 'open',
  })

  await client.query('COMMIT')
  console.log('Seed complete.')
} catch (err) {
  await client.query('ROLLBACK')
  console.error('Seed failed:', err)
  process.exitCode = 1
} finally {
  client.release()
  await pool.end()
}
