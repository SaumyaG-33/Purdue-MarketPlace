import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardNav from '../../components/DashboardNav'
import { Chip, Mono } from '../../components/ui'
import { api } from '../../lib/api'

const ADMIN_LINKS = [
  { to: '/admin', label: 'Applications' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/suspensions', label: 'Suspensions' },
]

const FILTERS = ['Pending', 'Needs info', 'Approved', 'Rejected']
const STATUS_MAP = { Pending: 'pending', 'Needs info': 'needs_info', Approved: 'approved', Rejected: 'rejected' }

function ageDaysOf(submittedAt) {
  return Math.floor((Date.now() - new Date(submittedAt).getTime()) / 86400000)
}

export default function ApplicationsQueue() {
  const [applications, setApplications] = useState([])
  const navigate = useNavigate()
  const [filter, setFilter] = useState('Pending')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/api/applications').then(setApplications).catch(() => {})
  }, [])

  const filtered = applications.filter((a) => {
    if (a.status !== STATUS_MAP[filter]) return false
    if (!search) return true
    return a.businessName.toLowerCase().includes(search.toLowerCase()) || a.ownerName.toLowerCase().includes(search.toLowerCase())
  })

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = applications.filter((a) => a.status === STATUS_MAP[f]).length
    return acc
  }, {})

  return (
    <div className="min-h-screen">
      <DashboardNav mode="admin" links={ADMIN_LINKS} />
      <div className="p-5 flex flex-col gap-3">
        <div className="flex gap-2 items-center flex-wrap">
          {FILTERS.map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f} {counts[f] ? `(${counts[f]})` : ''}
            </Chip>
          ))}
          <span className="flex-1" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-[150px] border border-border-field bg-white rounded-md px-2.5 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <div className="border border-[#d2d2ce] rounded-md overflow-hidden">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_0.9fr_0.8fr] bg-surface-alt">
            <Mono className="p-2">Business</Mono>
            <Mono className="p-2">Owner / email</Mono>
            <Mono className="p-2">Category</Mono>
            <Mono className="p-2">Docs</Mono>
            <Mono className="p-2">Age</Mono>
          </div>
          {filtered.length === 0 && (
            <div className="p-3">
              <Mono>Nothing in this filter.</Mono>
            </div>
          )}
          {filtered.map((a) => {
            const ageDays = ageDaysOf(a.submittedAt)
            return (
              <div
                key={a.id}
                onClick={() => navigate(`/admin/applications/${a.id}`)}
                className="grid grid-cols-[1.4fr_1fr_1fr_0.9fr_0.8fr] border-t border-border cursor-pointer hover:bg-surface-muted"
              >
                <p className="text-[12px] p-2">{a.businessName}</p>
                <p className="text-[12px] p-2">
                  {a.ownerName} · {a.email}
                </p>
                <p className="text-[12px] p-2 capitalize">{a.category}</p>
                <p className="text-[12px] p-2">{a.docs.length ? a.docs.join(', ') : '—'}</p>
                <p className={`text-[12px] p-2 ${ageDays > 3 ? 'text-[#8e793e] font-semibold' : ''}`}>
                  {ageDays} day{ageDays === 1 ? '' : 's'}
                </p>
              </div>
            )
          })}
        </div>
        <Mono>Rows older than 3 days flag amber — the credibility promise is the review turnaround.</Mono>
      </div>
    </div>
  )
}
