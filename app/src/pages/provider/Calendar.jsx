import { Fragment, useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import DashboardNav from '../../components/DashboardNav'
import { Card, H3, Mono } from '../../components/ui'
import { useMyProvider } from '../../lib/useMyProvider'
import { api } from '../../lib/api'
import { dateForOffset } from '../../lib/data'
import { formatDayShort, timeLabel, dayOffsetOf } from '../../lib/format'

const HOURS = Array.from({ length: 12 }, (_, i) => 9 + i) // 9am - 8pm
const DAY_OFFSETS = [0, 1, 2, 3, 4, 5, 6]

const PROVIDER_LINKS = [
  { to: '/provider/calendar', label: 'Schedule' },
  { to: '/provider/availability', label: 'Availability' },
  { to: '/provider/appointments', label: 'Requests' },
]

function cellKey(day, hour) {
  return `${day}:${hour}`
}

export default function Calendar() {
  const { provider } = useMyProvider()
  const [myBookings, setMyBookings] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!provider) return
    api.get('/api/bookings/provider').then(setMyBookings).catch(() => {})
  }, [provider])

  const cellStatus = useMemo(() => {
    const map = new Map()
    myBookings.forEach((b) => {
      if (b.status !== 'confirmed' && b.status !== 'requested') return
      const start = new Date(b.startAt)
      const startMinutes = start.getHours() * 60 + start.getMinutes()
      const startHour = Math.floor(startMinutes / 60)
      const endHour = Math.ceil((startMinutes + b.durationMinutes) / 60)
      const day = dayOffsetOf(start)
      for (let h = startHour; h < endHour; h++) {
        const key = cellKey(day, h)
        if (b.status === 'confirmed') map.set(key, 'booked')
        else if (!map.has(key)) map.set(key, 'requested')
      }
    })
    return map
  }, [myBookings])

  if (!provider) return <Navigate to="/provide" replace />

  const upcoming = myBookings
    .filter((b) => b.status === 'confirmed' || b.status === 'requested')
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))

  const weekBookings = myBookings.filter((b) => b.status === 'confirmed' || b.status === 'requested')
  const expected = weekBookings.reduce((sum, b) => sum + b.price, 0)
  const deposits = weekBookings.reduce((sum, b) => sum + (b.depositPaid ? b.deposit : 0), 0)

  return (
    <div className="min-h-screen">
      <DashboardNav mode="provider" tag={`${provider.name} · approved`} links={PROVIDER_LINKS} />

      <div className="p-5 flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <H3>Week of {formatDayShort(dateForOffset(0))} — {weekBookings.length} appointments</H3>
            <Mono>
              ${expected} expected · ${deposits} in deposits received
            </Mono>
          </div>
        </div>

        <div className="grid gap-[3px]" style={{ gridTemplateColumns: '50px repeat(7, 1fr)' }}>
          <span />
          {DAY_OFFSETS.map((d) => (
            <Mono key={d} className="text-center">
              {formatDayShort(dateForOffset(d))}
            </Mono>
          ))}
          {HOURS.map((hour) => (
            <Fragment key={hour}>
              <Mono className="text-right pr-1">
                {hour <= 12 ? hour : hour - 12}
                {hour < 12 ? 'AM' : 'PM'}
              </Mono>
              {DAY_OFFSETS.map((day) => {
                const status = cellStatus.get(cellKey(day, hour))
                const bg =
                  status === 'booked'
                    ? 'bg-[#6e6e68] border-[#56564f]'
                    : status === 'requested'
                      ? 'bg-[#b4b4ae] border-[#9e9e98]'
                      : 'bg-[#e2e2de] border-[#d2d2ce]'
                return <div key={day} className={`h-[19px] border ${bg}`} />
              })}
            </Fragment>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 bg-[#6e6e68] border border-[#56564f]" />
            <Mono>Booked</Mono>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 bg-[#b4b4ae] border border-[#9e9e98]" />
            <Mono>Requested</Mono>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 bg-[#e2e2de] border border-[#d2d2ce]" />
            <Mono>Free</Mono>
          </div>
        </div>

        <div className="h-px bg-border" />
        <H3>Next up</H3>
        {upcoming.length === 0 && <Mono>Nothing booked — paint more hours on the Availability tab.</Mono>}
        {upcoming.map((b) => (
          <Card
            key={b.id}
            onClick={() => navigate(`/provider/appointments/${b.id}`)}
            className={`flex-row items-center gap-2.5 cursor-pointer border-l-[3px] ${
              b.status === 'confirmed' ? 'border-l-[#6e6e68]' : 'border-l-[#b4b4ae]'
            }`}
          >
            <Mono className="w-[100px]">
              {formatDayShort(new Date(b.startAt))} {timeLabel(new Date(b.startAt))}
            </Mono>
            <div className="w-8 h-8 bg-box border border-border-soft rounded-md flex-none" />
            <div className="flex-1">
              <H3>
                {b.serviceName} · {b.clientName}
              </H3>
              <Mono>
                {b.status === 'confirmed'
                  ? `${b.durationMinutes} min · $${b.price} · $${b.deposit} deposit ${b.depositPaid ? 'received' : 'pending'}`
                  : 'Requested — respond by tonight'}
              </Mono>
            </div>
            <span className="text-[12px] font-semibold border border-border-card rounded-md px-3 py-1.5 bg-white">Open</span>
          </Card>
        ))}
      </div>
    </div>
  )
}
