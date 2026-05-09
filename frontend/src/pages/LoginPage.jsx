import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API = 'http://localhost:8000'

// ── Left panel illustration ───────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div style={{
      background: 'linear-gradient(145deg, #EEF2FF 0%, #E0E7FF 100%)',
      padding: '40px 36px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      {/* Top branding */}
      <div>
        <div style={{ marginBottom: 32 }}>
          <img src="/Logo.png" alt="CrowdQuestQA" style={{ height: 64, width: 'auto' }} />
        </div>

        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1e1b4b', marginBottom: 12, lineHeight: 1.2 }}>
          Welcome Back!
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, maxWidth: 280 }}>
          Login to continue your testing journey and earn exciting rewards.
        </p>
      </div>

      {/* Centre illustration */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
        <div style={{ position: 'relative', width: 220, height: 180 }}>
          {/* Laptop base */}
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 180, height: 8, background: '#c7d2fe', borderRadius: 4 }} />
          {/* Laptop screen */}
          <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 160, height: 110, background: '#fff', borderRadius: '8px 8px 0 0', border: '3px solid #c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, padding: 12 }}>
            <div style={{ width: 32, height: 32, background: '#EEF2FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round">
                <path d="M8 2l1.5 1.5"/><path d="M14.5 3.5L16 2"/>
                <path d="M9 7.5C9 5.6 10.3 4 12 4s3 1.6 3 3.5"/>
                <path d="M6.5 9H4a1 1 0 0 0-1 1v.5a1 1 0 0 0 1 1h2.5"/>
                <path d="M17.5 9H20a1 1 0 0 1 1 1v.5a1 1 0 0 1-1 1h-2.5"/>
                <rect x="9" y="7" width="6" height="13" rx="3"/>
                <path d="M9 12h6"/>
              </svg>
            </div>
            <div style={{ width: '80%', height: 6, background: '#e0e7ff', borderRadius: 3 }} />
            <div style={{ width: '60%', height: 6, background: '#eef2ff', borderRadius: 3 }} />
            <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
              {['#dcfce7', '#fef9c3', '#fee2e2'].map((c, i) => (
                <div key={i} style={{ width: 16, height: 16, background: c, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 6, height: 6, background: c === '#dcfce7' ? '#16a34a' : c === '#fef9c3' ? '#ca8a04' : '#dc2626', borderRadius: '50%' }} />
                </div>
              ))}
            </div>
          </div>
          {/* Floating bug speech bubble */}
          <div style={{ position: 'absolute', top: 10, left: 10, background: '#fff', borderRadius: 10, padding: '6px 10px', boxShadow: '0 2px 8px rgba(79,70,229,0.15)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>🐛</span>
            <div style={{ width: 2, height: 2, background: '#c7d2fe', borderRadius: '50%' }} />
          </div>
          {/* Shield badge */}
          <div style={{ position: 'absolute', top: 20, right: 10, background: '#fff', borderRadius: 10, padding: '6px 10px', boxShadow: '0 2px 8px rgba(79,70,229,0.15)' }}>
            <span style={{ fontSize: 16 }}>🛡️</span>
          </div>
          {/* Checkmark badge */}
          <div style={{ position: 'absolute', top: 60, right: 0, background: '#dcfce7', borderRadius: 8, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a' }}>Verified</span>
          </div>
        </div>
      </div>

      {/* Bottom feature highlights */}
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        {[
          { icon: '👥', label: 'Active Community', sub: 'Join thousands of testers' },
          { icon: '⭐', label: 'Earn Rewards', sub: 'Get points & badges' },
          { icon: '📈', label: 'Improve Software', sub: 'Help build better products' },
        ].map(({ icon, label, sub }) => (
          <div key={label} style={{ textAlign: 'center', maxWidth: 90 }}>
            <div style={{ width: 40, height: 40, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', boxShadow: '0 2px 8px rgba(79,70,229,0.1)', fontSize: 18 }}>
              {icon}
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 2 }}>{label}</p>
            <p style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1.4 }}>{sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Input field ───────────────────────────────────────────────────────────────
function Field({ label, type = 'text', value, onChange, placeholder, icon, extra }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            {icon}
          </div>
        )}
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: '100%', padding: `11px ${isPassword ? '40px' : '12px'} 11px ${icon ? '38px' : '12px'}`,
            border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14,
            outline: 'none', background: '#fff', color: '#111827',
            fontFamily: 'inherit', boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = '#4338CA'}
          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}>
            {show
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            }
          </button>
        )}
      </div>
      {extra}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form state
  const [regUsername, setRegUsername] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Login failed')
      login(data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    if (regPassword !== regConfirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: regUsername, email: regEmail, password: regPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Registration failed')
      // Auto-login after register
      const loginRes = await fetch(`${API}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, password: regPassword }),
      })
      const loginData = await loginRes.json()
      login(loginData.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const tabStyle = (t) => ({
    flex: 1, padding: '12px 0', fontSize: 14, fontWeight: 600,
    background: 'none', border: 'none', cursor: 'pointer',
    borderBottom: tab === t ? '2px solid #4338CA' : '2px solid transparent',
    color: tab === t ? '#4338CA' : '#6b7280',
    transition: 'all 0.15s',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#EEF2FF', display: 'flex', flexDirection: 'column' }}>
      {/* Minimal nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img src="/Logo.png" alt="CrowdQuestQA" style={{ height: 48, width: 'auto' }} />
        </Link>
        <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#6b7280' }}>
          <Link to="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link>
          <Link to="/leaderboard" style={{ color: '#6b7280', textDecoration: 'none' }}>Leaderboard</Link>
          <Link to="/about" style={{ color: '#6b7280', textDecoration: 'none' }}>About Us</Link>
        </div>
      </nav>

      {/* Main card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
        <div style={{ width: '100%', maxWidth: 900, background: '#fff', borderRadius: 20, boxShadow: '0 8px 40px rgba(79,70,229,0.10)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 580 }}>

          {/* Left panel */}
          <LeftPanel />

          {/* Right panel — form */}
          <div style={{ padding: '40px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6', marginBottom: 28 }}>
              <button style={tabStyle('login')} onClick={() => { setTab('login'); setError('') }}>Login</button>
              <button style={tabStyle('register')} onClick={() => { setTab('register'); setError('') }}>Register</button>
            </div>

            {/* Error banner */}
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626' }}>
                {error}
              </div>
            )}

            {/* ── Login form ── */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <Field
                  label="Email Address"
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="Enter your email"
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>}
                />
                <Field
                  label="Password"
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                  extra={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ accentColor: '#4338CA' }} /> Remember me
                      </label>
                      <span style={{ fontSize: 12, color: '#4F46E5', cursor: 'pointer', fontWeight: 600 }}>Forgot password?</span>
                    </div>
                  }
                />
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#4338CA', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}>
                  {loading ? 'Logging in…' : 'Login'}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>or</span>
                  <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
                </div>
                <button type="button" style={{ width: '100%', padding: '11px', border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Continue with Google
                </button>
                <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
                  Don't have an account?{' '}
                  <button type="button" onClick={() => { setTab('register'); setError('') }} style={{ background: 'none', border: 'none', color: '#4F46E5', fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                    Register
                  </button>
                </p>
              </form>
            )}

            {/* ── Register form ── */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field
                  label="Username"
                  value={regUsername}
                  onChange={e => setRegUsername(e.target.value)}
                  placeholder="Choose a username"
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                />
                <Field
                  label="Email Address"
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="Enter your email"
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>}
                />
                <Field
                  label="Password"
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Create a password"
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                />
                <Field
                  label="Confirm Password"
                  type="password"
                  value={regConfirm}
                  onChange={e => setRegConfirm(e.target.value)}
                  placeholder="Confirm your password"
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                />
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#4338CA', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit', marginTop: 4 }}>
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
                <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setTab('login'); setError('') }} style={{ background: 'none', border: 'none', color: '#4F46E5', fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                    Login
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '16px', fontSize: 12, color: '#9ca3af', borderTop: '1px solid #e5e7eb', background: '#fff' }}>
        © 2025 CrowdQuestQA. All rights reserved.
      </footer>
    </div>
  )
}
