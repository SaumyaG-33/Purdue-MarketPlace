import { useState } from 'react'
import DashboardNav from '../../components/DashboardNav'
import { Card, H3, Mono, Tabs, TextArea } from '../../components/ui'
import { useStore } from '../../lib/store'

const ADMIN_LINKS = [
  { to: '/admin', label: 'Applications' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/suspensions', label: 'Suspensions' },
]

function ActionButton({ children, onClick }) {
  return (
    <span
      onClick={onClick}
      className="text-[12px] font-semibold border border-border-card rounded-md px-3 py-1.5 bg-white cursor-pointer hover:bg-surface-alt whitespace-nowrap"
    >
      {children}
    </span>
  )
}

export default function Suspensions() {
  const { state, dispatch } = useStore()
  const [tab, setTab] = useState('providers')
  const [reasonNote, setReasonNote] = useState('')

  function setStatus(group, id, status) {
    dispatch({ type: 'UPDATE_SUSPENSION', payload: { group, id, status } })
  }

  return (
    <div className="min-h-screen">
      <DashboardNav mode="admin" links={ADMIN_LINKS} />
      <Tabs
        tabs={[
          { value: 'providers', label: 'Providers' },
          { value: 'clients', label: 'Clients' },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="p-5 flex flex-col gap-2.5">
        {tab === 'providers' && (
          <>
            <H3>Providers</H3>
            {state.suspensions.providers.map((p) => (
              <Card key={p.id} className={`flex-row items-center gap-2.5 ${p.status === 'flagged' ? 'border-l-[3px] border-l-gold-dark' : ''}`}>
                <div className="flex-1">
                  <H3>
                    {p.name} · <span className="capitalize font-normal">{p.categoryId}</span>
                  </H3>
                  <Mono>{p.note}</Mono>
                </div>
                {p.status === 'removed' ? (
                  <ActionButton onClick={() => setStatus('providers', p.id, 'active')}>Reinstate</ActionButton>
                ) : (
                  <>
                    <ActionButton onClick={() => setStatus('providers', p.id, 'removed')}>Remove listing</ActionButton>
                    <ActionButton onClick={() => setStatus('providers', p.id, 'paused')}>Pause 30 days</ActionButton>
                    <ActionButton onClick={() => setStatus('providers', p.id, 'active')}>Clear a strike</ActionButton>
                  </>
                )}
              </Card>
            ))}
          </>
        )}

        {tab === 'clients' && (
          <>
            <H3>Clients</H3>
            {state.suspensions.clients.map((c) => (
              <Card key={c.id} className={`flex-row items-center gap-2.5 ${c.status === 'flagged' ? 'border-l-[3px] border-l-gold-dark' : ''}`}>
                <div className="flex-1">
                  <H3>{c.name}</H3>
                  <Mono>{c.email} · {c.note}</Mono>
                </div>
                {c.status === 'blocked' ? (
                  <ActionButton onClick={() => setStatus('clients', c.id, 'active')}>Unblock</ActionButton>
                ) : (
                  <>
                    <ActionButton onClick={() => setStatus('clients', c.id, 'blocked')}>Block account</ActionButton>
                    <ActionButton onClick={() => setStatus('clients', c.id, 'warned')}>Warn by email</ActionButton>
                    <ActionButton onClick={() => setStatus('clients', c.id, 'active')}>Clear a strike</ActionButton>
                  </>
                )}
              </Card>
            ))}
          </>
        )}

        <TextArea
          value={reasonNote}
          onChange={(e) => setReasonNote(e.target.value)}
          placeholder="Reason shown to the account when they're removed or blocked…"
          className="h-11"
        />
        <Mono>
          Threshold is 3 substantiated strikes on either side. Providers: remove hides the listing, cancels open bookings, and
          emails both parties. Clients: block keeps browsing but kills booking. Every action needs a reason and writes an audit row.
        </Mono>
      </div>
    </div>
  )
}
