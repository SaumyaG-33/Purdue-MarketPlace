import { Fragment, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import DashboardNav from '../../components/DashboardNav'
import { Button, Mono, P } from '../../components/ui'
import { useMyProvider } from '../../lib/useMyProvider'
import { useStore } from '../../lib/store'
import { hashInt, dateForOffset } from '../../lib/data'
import { formatDayShort } from '../../lib/format'

const HOURS = Array.from({ length: 13 }, (_, i) => 8 + i) // 8am - 8pm
const DAY_OFFSETS = [0, 1, 2, 3, 4, 5, 6]

const PROVIDER_LINKS = [
  { to: '/provider/calendar', label: 'Schedule' },
  { to: '/provider/availability', label: 'Availability' },
  { to: '/provider/appointments', label: 'Requests' },
]

function cellKey(day, hour) {
  return `${day}:${hour}`
}

function defaultFree(providerId, day, hour) {
  return hashInt(`${providerId}-avail-${day}-${hour}`) % 3 !== 0
}

export default function Availability() {
  const { provider } = useMyProvider()
  const { state, dispatch } = useStore()
  const navigate = useNavigate()

  const initialGrid = useMemo(() => {
    if (!provider) return {}
    const stored = provider.availabilityGrid
    if (stored) return stored
    const grid = {}
    for (const day of DAY_OFFSETS) {
      for (const hour of HOURS) {
        grid[cellKey(day, hour)] = defaultFree(provider.id, day, hour)
      }
    }
    return grid
  }, [provider])

  const [grid, setGrid] = useState(initialGrid)
  const [dragValue, setDragValue] = useState(null)
  const [saved, setSaved] = useState(true)

  if (!provider) return <Navigate to="/provide" replace />

  const bookedSet = useMemo(() => {
    const set = new Set()
    state.bookings
      .filter((b) => b.providerId === provider.id && (b.status === 'confirmed' || b.status === 'requested'))
      .forEach((b) => {
        const startHour = Math.floor(b.start / 60)
        const endHour = Math.ceil((b.start + b.duration) / 60)
        for (let h = startHour; h < endHour; h++) set.add(cellKey(b.dayOffset, h))
      })
    return set
  }, [state.bookings, provider.id])

  function paint(day, hour, value) {
    if (bookedSet.has(cellKey(day, hour))) return
    setGrid((g) => ({ ...g, [cellKey(day, hour)]: value }))
    setSaved(false)
  }

  function handleMouseDown(day, hour) {
    const key = cellKey(day, hour)
    if (bookedSet.has(key)) return
    const next = !grid[key]
    setDragValue(next)
    paint(day, hour, next)
  }

  function handleMouseEnter(day, hour) {
    if (dragValue === null) return
    paint(day, hour, dragValue)
  }

  function handleMouseUp() {
    setDragValue(null)
  }

  function handleSave() {
    dispatch({ type: 'UPDATE_PROVIDER_AVAILABILITY', payload: { providerId: provider.id, grid } })
    setSaved(true)
  }

  const freeHours = DAY_OFFSETS.reduce(
    (sum, day) => sum + HOURS.filter((h) => !bookedSet.has(cellKey(day, h)) && grid[cellKey(day, h)]).length,
    0,
  )

  return (
    <div className="min-h-screen select-none" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <DashboardNav mode="provider" tag={`${provider.name} · approved`} links={PROVIDER_LINKS} />

      <div className="p-5 flex gap-5 flex-wrap items-start">
        <div className="flex-1 min-w-[400px] flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <p className="font-semibold text-[13px]">When can you work?</p>
              <Mono>Click and drag to paint the hours you're free. Students only see these.</Mono>
            </div>
          </div>

          <div className="grid gap-[3px]" style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}>
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
                  const key = cellKey(day, hour)
                  const booked = bookedSet.has(key)
                  const free = grid[key]
                  const bg = booked ? 'bg-gold-dark border-[#7a6733]' : free ? 'bg-gold border-gold-border' : 'bg-surface-alt border-border'
                  return (
                    <div
                      key={key}
                      onMouseDown={() => handleMouseDown(day, hour)}
                      onMouseEnter={() => handleMouseEnter(day, hour)}
                      className={`h-[17px] border cursor-pointer ${bg}`}
                      title={booked ? 'Booked — can’t unset' : free ? 'Free' : 'Unavailable'}
                    />
                  )
                })}
              </Fragment>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 items-center mt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 bg-gold border border-gold-border" />
              <Mono>Free</Mono>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 bg-gold-dark border border-[#7a6733]" />
              <Mono>Booked — can't unset</Mono>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 bg-surface-alt border border-border" />
              <Mono>Unavailable</Mono>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <Button onClick={handleSave}>Save availability</Button>
            <Mono>{freeHours} hrs free this week {saved ? '· saved' : '· unsaved changes'}</Mono>
          </div>
        </div>

        <div className="w-[250px] flex-none flex flex-col gap-2.5">
          <div className="border border-border rounded-lg p-3 flex flex-col gap-2 bg-white">
            <p className="font-semibold text-[13px]">Connect a calendar you already use</p>
            <P>We read your busy times and gray them out here. We never write to it or read event details.</P>
            <Mono>Google Calendar / Calendly / Apple / Outlook — not wired up in this prototype.</Mono>
          </div>
        </div>
      </div>
    </div>
  )
}
