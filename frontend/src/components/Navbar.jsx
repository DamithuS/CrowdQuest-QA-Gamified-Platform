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

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 38, height: 38, background: '#4338CA', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-3.5-3.5" /><path d="M8 11h6M11 8v6" />
            </svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px' }}>
            <span style={{ color: '#1e1b4b' }}>CrowdQuest</span>
            <span style={{ color: '#4F46E5' }}>QA</span>
          </span>
          <span style={{ fontSize: 11, color: '#6b7280', marginLeft: -4 }}>Test. Report. Earn.</span>
        </Link>

        {/* Centre nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <Link to="/" style={linkStyle('home')}>Home</Link>
          <Link to="/leaderboard" style={linkStyle('leaderboard')}>Leaderboard</Link>
          <Link to="/about" style={linkStyle('about')}>About Us</Link>
        </div>

        {/* Right — auth state aware */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link to="/dashboard" style={{ fontSize: 13, fontWeight: 600, color: '#4b5563', textDecoration: 'none' }}>Dashboard</Link>
            {/* Avatar */}
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
