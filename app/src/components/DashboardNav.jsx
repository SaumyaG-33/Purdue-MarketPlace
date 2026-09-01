import { Link, useNavigate } from 'react-router-dom'

export default function DashboardNav({ mode = 'provider', tag, links = [] }) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center gap-4 px-5 py-3 border-b border-border-nav bg-surface-muted">
      <Link to="/" className="flex items-center gap-2 flex-none">
        <span className="w-8 h-8 bg-gold border border-gold-border rounded-md flex items-center justify-center font-bold text-[13px] text-ink">
          PM
        </span>
        <span className="flex flex-col leading-tight">
          <span className="font-bold text-[15px]">Purdue MarketPlace</span>
          <span className="font-mono text-[8px] tracking-widest text-text-mono uppercase">
            {mode === 'admin' ? 'Admin' : 'Boilermaker services'}
          </span>
        </span>
      </Link>

      {links.map((l) => (
        <Link key={l.to} to={l.to} className="text-[12px] text-gray-600 hover:text-ink flex-none whitespace-nowrap">
          {l.label}
        </Link>
      ))}

      <span className="flex-1" />

      {mode === 'provider' && (
        <span onClick={() => navigate('/')} className="text-[12px] text-gray-600 hover:text-ink flex-none cursor-pointer">
          Client view
        </span>
      )}
      {tag && <span className="font-mono text-[11px] text-text-mono flex-none">{tag}</span>}
      <span className="w-6 h-6 rounded-full bg-box border border-border-soft flex-none" />
    </div>
  )
}
