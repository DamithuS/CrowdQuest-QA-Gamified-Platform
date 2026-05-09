import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

export default function Navbar({ activePage = 'home' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  const linkStyle = (page) => ({
    fontSize: 14, fontWeight: page === activePage ? 600 : 500,
    color: page === activePage ? '#4F46E5' : '#4b5563',
    textDecoration: 'none',
    borderBottom: page === activePage ? '2px solid #4F46E5' : '2px solid transparent',
    paddingBottom: 2,
  })

  const NAV_LINKS = [
    { to: '/dashboard',      label: 'Dashboard',       page: 'dashboard' },
    { to: '/submit-bug',     label: 'Submit Bug',       page: 'submit' },
    { to: '/my-submissions', label: 'My Submissions',   page: 'submissions' },
    { to: '/leaderboard',    label: 'Leaderboard',      page: 'leaderboard' },
    { to: '/profile',        label: 'Profile',          page: 'profile' },
  ]

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img src="/Logo.png" alt="CrowdQuestQA" style={{ height: 64, width: 'auto' }} />
        </Link>

        {/* Centre nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {NAV_LINKS.map(({ to, label, page }) => (
            <Link key={page} to={to} style={linkStyle(page)}>{label}</Link>
          ))}
        </div>

        {/* Right — auth state aware */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <Avatar user={user} size={34} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.2 }}>{user.username}</span>
                <span style={{ fontSize: 11, color: '#6b7280' }}>Level {user.level}</span>
              </div>
            </Link>
            <button onClick={handleLogout} style={{ padding: '7px 16px', fontSize: 13, fontWeight: 600, color: '#6b7280', border: '1.5px solid #e5e7eb', borderRadius: 8, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/login" style={{ padding: '8px 22px', fontSize: 14, fontWeight: 600, color: '#4338CA', border: '1.5px solid #4338CA', borderRadius: 8, textDecoration: 'none' }}>
              Login
            </Link>
            <Link to="/register" style={{ padding: '8px 22px', fontSize: 14, fontWeight: 600, color: '#fff', background: '#4338CA', border: '1.5px solid #4338CA', borderRadius: 8, textDecoration: 'none' }}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
