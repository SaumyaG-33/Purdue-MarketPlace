import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Button } from './ui'

export default function ClientNav({ search }) {
  const { currentUser, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-4 px-5 py-3 border-b border-border-nav bg-surface-muted">
      <Link to="/" className="flex items-center gap-2 flex-none">
        <span className="w-8 h-8 bg-gold border border-gold-border rounded-md flex items-center justify-center font-bold text-[13px] text-ink">
          PM
        </span>
        <span className="flex flex-col leading-tight">
          <span className="font-bold text-[15px]">Purdue MarketPlace</span>
          <span className="font-mono text-[8px] tracking-widest text-text-mono uppercase">Boilermaker services</span>
        </span>
      </Link>

      {search}

      <Link to="/categories" className="text-[12px] text-gray-600 hover:text-ink flex-none">
        Browse
      </Link>
      <Link to="/provide" className="text-[12px] text-gray-600 hover:text-ink flex-none">
        Provide a Service
      </Link>
      <Link to="/about" className="text-[12px] text-gray-600 hover:text-ink flex-none">
        About
      </Link>
      <Link to="/account/report" className="text-[12px] text-gray-600 hover:text-ink flex-none">
        Help
      </Link>

      <span className="flex-1" />

      {currentUser ? (
        <>
          <Link to="/account" className="text-[12px] text-gray-600 hover:text-ink flex-none">
            {currentUser.name}
          </Link>
          <span
            onClick={() => {
              signOut()
              navigate('/')
            }}
            className="w-6 h-6 rounded-full bg-box border border-border-soft flex-none cursor-pointer"
            title="Log out"
          />
        </>
      ) : (
        <>
          <Button variant="secondary" onClick={() => navigate('/login')}>
            Log in
          </Button>
          <Button onClick={() => navigate('/login?mode=signup')}>Sign up</Button>
        </>
      )}
    </div>
  )
}
