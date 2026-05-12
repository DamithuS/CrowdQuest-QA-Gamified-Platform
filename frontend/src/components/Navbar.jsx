import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

export default function Navbar({ activePage = 'home' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)

  function handleLogout() {
    setDropOpen(false)
    logout()
    navigate('/')
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const linkStyle = (page) => ({
    fontSize: 14, fontWeight: page === activePage ? 600 : 400,
    color: page === activePage ? '#A5B4FC' : '#94A3B8',
    textDecoration: 'none',
    borderBottom: page === activePage ? '2px solid #A5B4FC' : '2px solid transparent',
    paddingBottom: 2,
    transition: 'color 0.15s',
  })

  const NAV_LINKS = [
    { to: '/dashboard',      label: 'Dashboard',       page: 'dashboard' },
    { to: '/submit-bug',     label: 'Submit Bug',       page: 'submit' },
    { to: '/my-submissions', label: 'My Submissions',   page: 'submissions' },
    { to: '/leaderboard',    label: 'Leaderboard',      page: 'leaderboard' },
    { to: '/profile',        label: 'Profile',          page: 'profile' },
  ]

  return (
    <nav style={{ background: '#080D18', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }} />

        {/* Centre nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {NAV_LINKS.map(({ to, label, page }) => (
            <Link key={page} to={to} style={linkStyle(page)}>{label}</Link>
          ))}
        </div>

        {/* Right — auth state aware */}
        {user ? (
          <div ref={dropRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <Avatar user={user} size={36} />
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#F1F5F9', margin: 0, lineHeight: 1.3 }}>{user.username}</p>
                <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>Level {user.level}</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" style={{ marginLeft: 2, transition: 'transform 0.2s', transform: dropOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {dropOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: '#1E293B', borderRadius: 12, minWidth: 180,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)',
                overflow: 'hidden',
              }}>
                <Link to="/profile" onClick={() => setDropOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', textDecoration: 'none', color: '#CBD5E1', fontSize: 14 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Profile
                </Link>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 16px' }} />
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', width: '100%', background: 'none', border: 'none', color: '#F87171', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/login" style={{ padding: '8px 22px', fontSize: 14, fontWeight: 600, color: '#6366F1', border: '1.5px solid #6366F1', borderRadius: 8, textDecoration: 'none' }}>
              Login
            </Link>
            <Link to="/register" style={{ padding: '8px 22px', fontSize: 14, fontWeight: 600, color: '#fff', background: '#6366F1', border: '1.5px solid #6366F1', borderRadius: 8, textDecoration: 'none' }}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
