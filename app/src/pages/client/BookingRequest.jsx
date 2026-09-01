import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import ClientNav from '../../components/ClientNav'
import { Button, Card, Checkbox, Field, H2, H3, Line, Mono, P } from '../../components/ui'
import { useStore } from '../../lib/store'
import { formatDay, labelRange } from '../../lib/format'
import { dateForOffset } from '../../lib/data'

export default function BookingRequest() {
  const { state, currentUser, dispatch } = useStore()
  const navigate = useNavigate()
  const [comments, setComments] = useState('')
  const [confirmationId, setConfirmationId] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')

  const pb = state.pendingBooking
  if (!pb || !currentUser) return <Navigate to="/categories" replace />

  function handleSend(e) {
    e.preventDefault()
    if (!agreed) {
      setError('Please agree to the terms and cancellation policy.')
      return
    }
    if (pb.deposit > 0 && !confirmationId.trim()) {
      setError('Add the deposit confirmation number to send the request.')
      return
    }
    const booking = {
      clientId: currentUser.id,
      clientName: currentUser.name,
      clientEmail: currentUser.email,
      providerId: pb.providerId,
      providerName: pb.providerName,
      serviceId: pb.serviceId,
      serviceName: pb.serviceName,
      dayOffset: pb.dayOffset,
      start: pb.start,
      duration: pb.duration,
      price: pb.price,
      deposit: pb.deposit,
      depositPaid: pb.deposit > 0,
      status: 'confirmed',
      comments,
    }
    dispatch({ type: 'CREATE_BOOKING', payload: booking })
    navigate('/confirmed', { state: { booking } })
  }

  const day = dateForOffset(pb.dayOffset)

  return (
    <div className="min-h-screen">
      <ClientNav />
      <div className="px-5 py-5 flex gap-5 flex-wrap items-start">
        <form onSubmit={handleSend} className="flex-1 min-w-[300px] flex flex-col gap-3.5">
          <H2>Request this booking</H2>

          <div className="flex flex-col gap-2">
            <H3>When</H3>
            <Card className="w-fit">
              <Mono>
                {formatDay(day)} · {labelRange(pb.start, pb.duration)}
              </Mono>
            </Card>
          </div>

          <div className="flex flex-col gap-2">
            <H3>Where</H3>
            <div className="border border-border-field bg-surface-muted rounded-md px-3 py-2.5 text-[12px] text-text-mono">
              {pb.area ?? "Provider's place"}
            </div>
          </div>

          <Field label="Comments for the provider">
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Anything they should know? Inspo links, allergies, parking…"
              className="border border-border-field bg-surface-muted rounded-md px-3 py-2.5 text-[13px] h-[58px] resize-none focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </Field>

          <Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} label="I agree to the terms and cancellation policy." />

          {error && <P className="text-red-600">{error}</P>}

          <div className="flex gap-2">
            <Button type="submit" className="px-6">
              Send request
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>

        <div className="w-[230px] flex-none flex flex-col gap-2.5">
          <Card>
            <H3>{pb.serviceName}</H3>
            <Mono>{pb.providerName}</Mono>
            <Line />
            <P>
              {formatDay(day)} · {labelRange(pb.start, pb.duration)}
            </P>
            <P>Service ${pb.price}</P>
            {pb.deposit > 0 && <P>Deposit due to hold the slot ${pb.deposit}</P>}
            <Line />
            <H3>Balance in person ${pb.price - pb.deposit}</H3>
          </Card>

          {pb.deposit > 0 && (
            <Card>
              <H3>Pay directly</H3>
              <P>This service needs a ${pb.deposit} deposit before it's confirmed. Send it, then drop the confirmation number below.</P>
              <div className="border border-border-field bg-white rounded-md px-3 py-2.5 text-[12px]">Venmo · @provider-handle</div>
              <div className="border border-border-field bg-white rounded-md px-3 py-2.5 text-[12px]">Zelle · 765-555-0142</div>
              <Field>
                <input
                  value={confirmationId}
                  onChange={(e) => setConfirmationId(e.target.value)}
                  placeholder="Confirmation / last 4 of the payment ID"
                  className="border border-border-field bg-surface-muted rounded-md px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </Field>
              <Mono>Balance is settled in person. We don't hold your money.</Mono>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
