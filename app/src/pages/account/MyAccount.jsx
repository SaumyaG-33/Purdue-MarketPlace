import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ClientNav from '../../components/ClientNav'
import { Button, Card, H3, Mono, P, Tabs } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { api } from '../../lib/api'
import { firstNameOf, formatDay, timeLabel } from '../../lib/format'

export default function MyAccount() {
  const { currentUser } = useAuth()
  const [tab, setTab] = useState('upcoming')
  const [bookings, setBookings] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser) return
    api.get('/api/bookings/mine').then(setBookings).catch(() => {})
  }, [currentUser])

  if (!currentUser) {
    return (
      <div className="min-h-screen">
        <ClientNav />
        <div className="p-6 flex flex-col gap-3 items-start">
          <P>Log in to see your upcoming services.</P>
          <Button onClick={() => navigate('/login')}>Log in</Button>
        </div>
      </div>
    )
  }

  const upcoming = bookings.filter((b) => b.status === 'confirmed' || b.status === 'requested')
  const past = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled' || b.status === 'declined')

  return (
    <div className="min-h-screen">
      <ClientNav />
      <Tabs
        tabs={[
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'past', label: 'Past' },
          { value: 'info', label: 'Account info' },
          { value: 'reviews', label: 'Reviews I’ve left' },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="p-5 flex flex-col gap-2.5">
        {tab === 'upcoming' && (
          <>
            {upcoming.length === 0 && <P>Nothing booked yet — browse Beauty, Education, Transportation…</P>}
            {upcoming.map((b) => (
              <Card key={b.id} className="flex-row items-center gap-3">
                <div className="w-13 h-13 bg-box border border-border-soft rounded-md flex-none" style={{ width: 52, height: 52 }} />
                <div className="flex-1">
                  <H3>
                    {b.serviceName} · {b.providerName}
                  </H3>
                  <Mono>
                    {formatDay(new Date(b.startAt))}, {timeLabel(new Date(b.startAt))} ·{' '}
                    {b.status === 'confirmed' ? 'Confirmed' : `Pending — waiting on ${firstNameOf(b.providerName)}`} · ${b.price}
                  </Mono>
                </div>
                <Button variant="secondary">Message</Button>
                {b.status === 'confirmed' && <Button variant="secondary">Reschedule</Button>}
                <Button variant="ghost">{b.status === 'confirmed' ? 'Cancel' : 'Withdraw'}</Button>
              </Card>
            ))}
          </>
        )}

        {tab === 'past' && (
          <>
            {past.length === 0 && <Mono>Nothing here yet.</Mono>}
            {past.map((b) => (
              <Card key={b.id} className="flex-row items-center gap-3">
                <div className="flex-1">
                  <H3>Rate your {b.serviceName} session</H3>
                  <Mono>Finished · follow-up email sent</Mono>
                </div>
                <Button>Leave a review</Button>
              </Card>
            ))}
          </>
        )}

        {tab === 'info' && (
          <Card className="max-w-md">
            <H3>{currentUser.name}</H3>
            <Mono>{currentUser.email}</Mono>
            <Mono>Verified</Mono>
          </Card>
        )}

        {tab === 'reviews' && <Mono>You haven't left any reviews yet.</Mono>}
      </div>
    </div>
  )
}
