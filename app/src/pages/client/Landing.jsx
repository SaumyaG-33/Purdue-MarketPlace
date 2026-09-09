import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ClientNav from '../../components/ClientNav'
import { Button, Card, H1, H3, P, Mono, Line } from '../../components/ui'
import { CATEGORIES } from '../../lib/data'
import { useAuth } from '../../lib/auth'
import { api } from '../../lib/api'

export default function Landing() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [query, setQuery] = useState('')
  const [upcoming, setUpcoming] = useState([])

  useEffect(() => {
    if (!currentUser) {
      setUpcoming([])
      return
    }
    let cancelled = false
    api
      .get('/api/bookings/mine')
      .then((bookings) => {
        if (!cancelled) setUpcoming(bookings.filter((b) => b.status === 'confirmed' || b.status === 'requested'))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [currentUser])

  function onSearch(e) {
    e.preventDefault()
    navigate('/categories')
  }

  return (
    <div className="min-h-screen">
      <ClientNav />

      <div className="flex flex-col gap-4 px-5 py-8 bg-surface-muted">
        <H1>Hire a Boilermaker. Get it done this week.</H1>
        <P className="max-w-md">
          Nails, tutoring, airport rides, DJs, pet sitting — all from students you can actually run into on campus.
        </P>
        <form onSubmit={onSearch} className="flex gap-2 max-w-lg">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='What do you need? e.g. "gel manicure", "CHM 115 tutor"'
            className="flex-1 border border-border-field bg-surface-muted rounded-md px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-gold bg-white"
          />
          <Button type="submit" className="px-6">
            Search
          </Button>
        </form>
        <Mono>Purdue or Ivy Tech email required to book · 240 student providers</Mono>
      </div>

      {upcoming.length > 0 && (
        <div className="px-5 py-5 flex flex-col gap-3">
          <H3>Upcoming services</H3>
          <div className="flex gap-3 overflow-x-auto">
            {upcoming.map((b) => (
              <Card key={b.id} className="flex-row items-center gap-3 min-w-[260px]">
                <div className="w-10 h-10 bg-box border border-border-soft rounded-md flex-none" />
                <div className="flex-1 min-w-0">
                  <H3 className="truncate">{b.serviceName}</H3>
                  <Mono>{b.status === 'confirmed' ? 'Confirmed' : 'Pending'} · ${b.price}</Mono>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 py-6 flex flex-col gap-3">
        <H3>Browse by category</H3>
        <div className="grid grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/browse/${cat.id}`)}
              className="flex-1 min-w-0 h-20 bg-tile border border-border-soft rounded-md flex flex-col justify-end p-2.5 font-semibold text-[12px] cursor-pointer hover:border-gold-border transition-colors"
            >
              {cat.name}
            </div>
          ))}
        </div>
      </div>

      <Line />

      <div className="px-5 py-6 flex flex-col gap-3">
        <H3>How it works</H3>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <H3>1 · Verify your email</H3>
            <P>@purdue.edu or @ivytech.edu — that's the whole gate.</P>
          </Card>
          <Card>
            <H3>2 · Request a time</H3>
            <P>Pick from what the provider actually has open.</P>
          </Card>
          <Card>
            <H3>3 · Meet and pay</H3>
            <P>Pay through the app. Rate them after.</P>
          </Card>
        </div>
      </div>

      <div className="px-5 py-5 bg-surface-alt border-t border-border">
        <Mono>Footer — About / How to use / Demo / Disclaimers & liability / Report an issue</Mono>
      </div>
    </div>
  )
}
