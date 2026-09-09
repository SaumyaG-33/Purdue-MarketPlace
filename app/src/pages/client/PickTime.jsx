import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ClientNav from '../../components/ClientNav'
import { Button, H2, H3, Line, Mono, P, Slot } from '../../components/ui'
import { getSlotsForDay, dateForOffset } from '../../lib/data'
import { formatDay, labelRange, minutesToLabel } from '../../lib/format'
import { useAuth } from '../../lib/auth'
import { usePendingBooking } from '../../lib/pendingBooking'
import { api } from '../../lib/api'

export default function PickTime() {
  const { providerId, serviceId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { setPendingBooking } = usePendingBooking()

  const [provider, setProvider] = useState(null)
  const [loading, setLoading] = useState(true)
  const startOffset = Number(params.get('date') ?? 0)

  useEffect(() => {
    setLoading(true)
    api
      .get(`/api/providers/${providerId}`)
      .then(setProvider)
      .catch(() => setProvider(null))
      .finally(() => setLoading(false))
  }, [providerId])

  const service = provider?.services.find((s) => s.id === serviceId)

  const dayOffsets = [startOffset, startOffset + 1, startOffset + 2]
  const [selected, setSelected] = useState(null)

  const daySlots = useMemo(
    () => (service ? dayOffsets.map((offset) => ({ offset, slots: getSlotsForDay(providerId, service, offset) })) : []),
    [providerId, service, startOffset],
  )

  if (loading) {
    return (
      <div className="min-h-screen">
        <ClientNav />
        <div className="p-6">
          <Mono>Loading…</Mono>
        </div>
      </div>
    )
  }

  if (!provider || !service) {
    return (
      <div className="min-h-screen">
        <ClientNav />
        <div className="p-6">
          <P>Not found.</P>
        </div>
      </div>
    )
  }

  function handleContinue() {
    setPendingBooking({
      providerId,
      providerName: provider.name,
      serviceId,
      serviceName: service.name,
      dayOffset: selected.offset,
      start: selected.slot.start,
      duration: service.duration,
      price: Number(service.price),
      deposit: Number(service.deposit),
      area: provider.area,
    })
    if (!currentUser) {
      navigate('/login', {
        state: {
          redirect: '/booking-request',
          holding: `${service.name} · ${provider.name} · ${formatDay(dateForOffset(selected.offset))}, ${minutesToLabel(selected.slot.start)}`,
        },
      })
    } else {
      navigate('/booking-request')
    }
  }

  return (
    <div className="min-h-screen">
      <ClientNav />
      <div className="px-5 py-4 flex flex-col gap-1.5">
        <Mono>
          Home / Beauty / {service.name} / {provider.name}
        </Mono>
        <H2>
          {service.name} · {service.duration} min · ${service.price}
        </H2>
        <P>Showing only start times with {service.duration} minutes clear, plus a buffer.</P>
      </div>

      <div className="px-5 pb-6 flex flex-col gap-4">
        {daySlots.map(({ offset, slots }) => (
          <div key={offset} className="flex flex-col gap-1.5">
            <H3>{formatDay(dateForOffset(offset))}</H3>
            {slots.length === 0 ? (
              <Mono>Nothing open this day.</Mono>
            ) : (
              <div className="grid grid-cols-5 gap-2">
                {slots.map((slot) => {
                  const isSel = selected && selected.offset === offset && selected.slot.start === slot.start
                  return (
                    <Slot
                      key={slot.start}
                      state={slot.booked ? 'off' : isSel ? 'selected' : 'default'}
                      onClick={() => !slot.booked && setSelected({ offset, slot })}
                    >
                      {minutesToLabel(slot.start)}
                    </Slot>
                  )
                })}
              </div>
            )}
          </div>
        ))}
        <Mono>
          Grayed = booked, or not enough room for {service.duration} min.
        </Mono>

        <Line />

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex-1">
            {selected ? (
              <>
                <H3>
                  {formatDay(dateForOffset(selected.offset))} · {labelRange(selected.slot.start, service.duration)}
                </H3>
                <Mono>
                  ${service.price} {service.deposit > 0 && `· $${service.deposit} deposit to hold it`}
                </Mono>
              </>
            ) : (
              <P>Pick a time above to continue.</P>
            )}
          </div>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Change service
          </Button>
          <Button disabled={!selected} onClick={handleContinue} className="px-6 disabled:opacity-40">
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
