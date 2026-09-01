import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import DashboardNav from '../../components/DashboardNav'
import { Button, Card, Checkbox, Field, H2, H3, Line, Mono, P, Select, TextArea } from '../../components/ui'
import { useMyProvider } from '../../lib/useMyProvider'
import { useStore } from '../../lib/store'
import { dateForOffset } from '../../lib/data'
import { formatDay, labelRange } from '../../lib/format'

const PROVIDER_LINKS = [
  { to: '/provider/calendar', label: 'Schedule' },
  { to: '/provider/availability', label: 'Availability' },
  { to: '/provider/appointments', label: 'Requests' },
]

export default function AppointmentDetail() {
  const { provider } = useMyProvider()
  const { state, dispatch } = useStore()
  const { bookingId } = useParams()
  const navigate = useNavigate()

  const [message, setMessage] = useState('')
  const [reason, setReason] = useState('Sick')
  const [note, setNote] = useState('')
  const [refund, setRefund] = useState(false)
  const [offerNext, setOfferNext] = useState(false)

  if (!provider) return <Navigate to="/provide" replace />

  const booking = state.bookings.find((b) => b.id === bookingId && b.providerId === provider.id)
  if (!booking) return <Navigate to="/provider/calendar" replace />

  const day = dateForOffset(booking.dayOffset)

  function sendMessage(e) {
    e.preventDefault()
    if (!message.trim()) return
    dispatch({ type: 'ADD_BOOKING_MESSAGE', payload: { id: booking.id, text: message } })
    setMessage('')
  }

  function handleCancel(e) {
    e.preventDefault()
    dispatch({ type: 'UPDATE_BOOKING_STATUS', payload: { id: booking.id, status: 'cancelled' } })
    navigate('/provider/calendar')
  }

  function accept() {
    dispatch({ type: 'UPDATE_BOOKING_STATUS', payload: { id: booking.id, status: 'confirmed' } })
  }
  function decline() {
    dispatch({ type: 'UPDATE_BOOKING_STATUS', payload: { id: booking.id, status: 'declined' } })
    navigate('/provider/calendar')
  }

  return (
    <div className="min-h-screen">
      <DashboardNav mode="provider" tag={`${provider.name} · approved`} links={PROVIDER_LINKS} />

      <div className="flex justify-center py-8 px-4">
        <div className="w-full max-w-[420px] border border-border-card rounded-lg bg-white overflow-hidden">
          <div className="flex flex-col gap-1.5 px-5 py-4 bg-surface-muted border-b border-border">
            <Mono
              onClick={() => navigate('/provider/calendar')}
              className="cursor-pointer hover:text-ink"
            >
              ← Back to calendar
            </Mono>
            <H2>
              {booking.serviceName} · {booking.clientName}
            </H2>
            <Mono>
              {formatDay(day)} · {labelRange(booking.start, booking.duration)} ·{' '}
              {booking.status === 'confirmed' ? 'Confirmed' : booking.status}
            </Mono>
          </div>

          <div className="flex flex-col gap-3 p-5">
            <Card>
              <div className="flex gap-2">
                <div className="w-10 h-10 bg-box border border-border-soft rounded-md flex-none" />
                <div className="flex-1">
                  <H3>{booking.clientName}</H3>
                  <Mono>{booking.clientEmail} · verified</Mono>
                </div>
              </div>
              <Line />
              <P>
                ${booking.price} · ${booking.deposit} deposit {booking.depositPaid ? 'received' : 'pending'} · $
                {booking.price - booking.deposit} due in person
              </P>
              {booking.comments && <P>Their note: “{booking.comments}”</P>}
            </Card>

            <div className="flex flex-col gap-1.5">
              <H3>Thread</H3>
              {booking.thread.map((m, i) => (
                <Card key={i}>
                  <Mono>
                    {m.from} · {m.when}
                  </Mono>
                  <P>{m.text}</P>
                </Card>
              ))}
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Reply…"
                  className="flex-1 border border-border-field bg-surface-muted rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-gold"
                />
                <Button type="submit" variant="secondary">
                  Send
                </Button>
              </form>
            </div>

            {booking.status === 'requested' ? (
              <div className="flex gap-2">
                <Button onClick={accept}>Accept</Button>
                <Button variant="secondary" onClick={decline}>
                  Decline
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="secondary">Reschedule</Button>
              </div>
            )}

            {booking.status === 'confirmed' && (
              <>
                <Line />
                <H3>Need to cancel?</H3>
                <P>They're counting on you. Cancel only if you truly can't make it.</P>
                <form onSubmit={handleCancel} className="flex flex-col gap-2.5">
                  <Select value={reason} onChange={(e) => setReason(e.target.value)}>
                    <option>Sick</option>
                    <option>Family emergency</option>
                    <option>Class conflict</option>
                    <option>Transportation</option>
                    <option>Other</option>
                  </Select>
                  <TextArea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Note — they see this word for word."
                    className="h-12"
                  />
                  {booking.deposit > 0 && (
                    <Checkbox checked={refund} onChange={(e) => setRefund(e.target.checked)} label={`I'll send $${booking.deposit} back today`} />
                  )}
                  <Checkbox checked={offerNext} onChange={(e) => setOfferNext(e.target.checked)} label="Offer my next open slot" />
                  <Card className="bg-surface-muted">
                    <Mono>Late cancels are logged. 3 in a term is a strike.</Mono>
                  </Card>
                  <Button type="submit" variant="ghost" className="self-start">
                    Cancel appointment
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
