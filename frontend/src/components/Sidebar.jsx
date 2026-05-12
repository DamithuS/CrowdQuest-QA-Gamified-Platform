import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  {
    to: '/dashboard', label: 'Dashboard',
    icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  },
  {
    to: '/submit-bug', label: 'Submit Bug',
    icon: <><path d="M8 2l1.5 1.5"/><path d="M14.5 3.5L16 2"/><path d="M9 7.5C9 5.6 10.3 4 12 4s3 1.6 3 3.5"/><path d="M6.5 9H4a1 1 0 0 0-1 1v.5a1 1 0 0 0 1 1h2.5"/><path d="M17.5 9H20a1 1 0 0 1 1 1v.5a1 1 0 0 1-1 1h-2.5"/><rect x="9" y="7" width="6" height="13" rx="3"/><path d="M9 12h6"/></>,
  },
  {
    to: '/my-submissions', label: 'My Submissions',
    icon: <><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="13" y2="15"/></>,
  },
  {
    to: '/leaderboard', label: 'Leaderboard',
    icon: <><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></>,
  },
  {
    to: '/profile', label: 'Profile',
    icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      background: '#080D18',
      display: 'flex', flexDirection: 'column', height: '100vh',
      position: 'sticky', top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '12px 16px 4px' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img src="/Logo.png" alt="CrowdQuestQA" style={{ width: '180px', height: 'auto', display: 'block', filter: 'brightness(0) invert(1)' }} />
        </Link>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ to, label, icon }) => {
          const active = location.pathname === to
          return (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 10, textDecoration: 'none',
              fontSize: 14, fontWeight: active ? 600 : 400,
              color: active ? '#A5B4FC' : '#64748B',
              background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94A3B8' } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B' } }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {icon}
              </svg>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={handleLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 14px', borderRadius: 10, border: 'none',
          background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 14, fontWeight: 400, color: '#64748B',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94A3B8' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </aside>
  )
}
