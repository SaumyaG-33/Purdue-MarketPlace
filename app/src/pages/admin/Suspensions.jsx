import { useEffect, useState } from 'react'
import DashboardNav from '../../components/DashboardNav'
import { Card, H3, Mono, Tabs, TextArea } from '../../components/ui'
import { api } from '../../lib/api'

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

function strikeNote(strikes) {
  return `${strikes} strike${strikes === 1 ? '' : 's'}`
}

export default function Suspensions() {
  const [tab, setTab] = useState('providers')
  const [reasonNote, setReasonNote] = useState('')
  const [providers, setProviders] = useState([])
  const [clients, setClients] = useState([])

  function refetch() {
    api.get('/api/suspensions').then((data) => {
      setProviders(data.providers)
      setClients(data.clients)
    })
  }

  useEffect(refetch, [])

  async function setProviderStatus(id, status) {
    await api.patch(`/api/providers/${id}/status`, { status })
    refetch()
  }
  async function clearProviderStrike(id) {
    await api.post(`/api/providers/${id}/clear-strike`)
    refetch()
  }
  async function setClientStatus(id, status) {
    await api.patch(`/api/users/${id}/status`, { status })
    refetch()
  }
  async function clearClientStrike(id) {
    await api.post(`/api/users/${id}/clear-strike`)
    refetch()
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
            {providers.length === 0 && <Mono>No approved providers yet.</Mono>}
            {providers.map((p) => (
              <Card key={p.id} className={`flex-row items-center gap-2.5 ${p.strikes >= 3 ? 'border-l-[3px] border-l-gold-dark' : ''}`}>
                <div className="flex-1">
                  <H3>
                    {p.name} · <span className="capitalize font-normal">{p.categoryId}</span>
                  </H3>
                  <Mono>{strikeNote(p.strikes)}</Mono>
                </div>
                {p.status === 'removed' ? (
                  <ActionButton onClick={() => setProviderStatus(p.id, 'active')}>Reinstate</ActionButton>
                ) : (
                  <>
                    <ActionButton onClick={() => setProviderStatus(p.id, 'removed')}>Remove listing</ActionButton>
                    <ActionButton onClick={() => setProviderStatus(p.id, 'paused')}>Pause 30 days</ActionButton>
                    <ActionButton onClick={() => clearProviderStrike(p.id)}>Clear a strike</ActionButton>
                  </>
                )}
              </Card>
            ))}
          </>
        )}

        {tab === 'clients' && (
          <>
            <H3>Clients</H3>
            {clients.length === 0 && <Mono>No client accounts yet.</Mono>}
            {clients.map((c) => (
              <Card key={c.id} className={`flex-row items-center gap-2.5 ${c.strikes >= 3 ? 'border-l-[3px] border-l-gold-dark' : ''}`}>
                <div className="flex-1">
                  <H3>{c.name}</H3>
                  <Mono>
                    {c.email} · {strikeNote(c.strikes)}
                  </Mono>
                </div>
                {c.status === 'blocked' ? (
                  <ActionButton onClick={() => setClientStatus(c.id, 'active')}>Unblock</ActionButton>
                ) : (
                  <>
                    <ActionButton onClick={() => setClientStatus(c.id, 'blocked')}>Block account</ActionButton>
                    <ActionButton onClick={() => setClientStatus(c.id, 'warned')}>Warn by email</ActionButton>
                    <ActionButton onClick={() => clearClientStrike(c.id)}>Clear a strike</ActionButton>
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
