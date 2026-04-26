import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import Avatar from '../components/Avatar'

const API = 'http://localhost:8000'

// ── Top header bar ────────────────────────────────────────────────────────────
function TopBar({ user, notifCount }) {
  return (
    <div style={{ height: 64, background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0 }}>
      <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Notification bell */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {notifCount > 0 && (
            <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, background: '#4338CA', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>
              {notifCount}
            </div>
          )}
        </div>

        {/* User avatar */}
        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Avatar user={user} size={36} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>{user?.username}</p>
            <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>Level {user?.level}</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </Link>
      </div>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, iconStroke, label, value }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </div>
      <p style={{ fontSize: 28, fontWeight: 800, color: '#111827', margin: 0 }}>{value}</p>
      <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{label}</p>
    </div>
  )
}

// ── Activity row ──────────────────────────────────────────────────────────────
function ActivityRow({ report }) {
  const statusConfig = {
    accepted:     { bg: '#dcfce7', stroke: '#16a34a', icon: <polyline points="20 6 9 17 4 12"/>, label: 'accepted', pts: report.points_awarded },
    under_review: { bg: '#fef9c3', stroke: '#ca8a04', icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>, label: 'pending review', pts: null },
    pending:      { bg: '#e0e7ff', stroke: '#4338CA', icon: <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>, label: 'submitted', pts: null },
    rejected:     { bg: '#fee2e2', stroke: '#dc2626', icon: <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>, label: 'rejected', pts: null },
  }
  const cfg = statusConfig[report.status] || statusConfig.pending

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr)
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid #f9fafb' }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={cfg.stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">{cfg.icon}</svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Bug #{report.id} {cfg.label}
        </p>
        <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{cfg.pts ? `You earned ${cfg.pts} points` : 'Awaiting evaluation'}</p>
      </div>
      <span style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0 }}>{timeAgo(report.created_at)}</span>
    </div>
  )
}

// ── XP progress bar ───────────────────────────────────────────────────────────
function XPBar({ xp, level }) {
  const XP_PER_LEVEL = 1000
  const currentLevelXP = xp % XP_PER_LEVEL
  const pct = Math.min((currentLevelXP / XP_PER_LEVEL) * 100, 100)
  const xpToNext = XP_PER_LEVEL - currentLevelXP

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Level {level}</span>
        <span style={{ fontSize: 12, color: '#6b7280' }}>{currentLevelXP} / {XP_PER_LEVEL} XP</span>
      </div>
      <div style={{ height: 10, background: '#e5e7eb', borderRadius: 999 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #4338CA, #6366f1)', borderRadius: 999, transition: 'width 0.6s ease' }} />
      </div>
      <div style={{ background: '#EEF2FF', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, background: '#4338CA', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
          </svg>
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b', margin: 0 }}>Level {level + 1}</p>
          <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{xpToNext} XP to go</p>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>Progress</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#4338CA', margin: 0 }}>{currentLevelXP} / {XP_PER_LEVEL} XP</p>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [rank, setRank] = useState(null)
  const [notifCount, setNotifCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const [reportsRes, leaderboardRes, notifRes] = await Promise.all([
          fetch(`${API}/users/${user.id}/reports`),
          fetch(`${API}/leaderboard`),
          fetch(`${API}/users/${user.id}/notifications`),
        ])
        const reportsData = await reportsRes.json()
        const leaderboard = await leaderboardRes.json()
        const notifs = await notifRes.json()

        setReports(Array.isArray(reportsData) ? reportsData : [])
        const entry = leaderboard.find(e => e.user.id === user.id)
        setRank(entry ? entry.rank : '—')
        setNotifCount(notifs.filter(n => !n.is_read).length)
      } catch {
        setReports([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const accepted = reports.filter(r => r.status === 'accepted').length
  const recentActivity = reports.slice(0, 4)

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F8F9FF', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar user={user} notifCount={notifCount} />

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>

          {/* Welcome heading */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>
              Welcome back, {user?.username}! 👋
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0' }}>Here's what's happening today.</p>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 28 }}>
            <StatCard
              iconBg="#EEF2FF" iconStroke="#4338CA"
              icon={<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>}
              label="Total Points" value={loading ? '—' : user?.points ?? 0}
            />
            <StatCard
              iconBg="#fef9c3" iconStroke="#ca8a04"
              icon={<><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></>}
              label="Current Rank" value={loading ? '—' : rank ? `#${rank}` : '—'}
            />
            <StatCard
              iconBg="#dbeafe" iconStroke="#2563eb"
              icon={<><path d="M8 2l1.5 1.5"/><path d="M14.5 3.5L16 2"/><path d="M9 7.5C9 5.6 10.3 4 12 4s3 1.6 3 3.5"/><path d="M6.5 9H4a1 1 0 0 0-1 1v.5a1 1 0 0 0 1 1h2.5"/><path d="M17.5 9H20a1 1 0 0 1 1 1v.5a1 1 0 0 1-1 1h-2.5"/><rect x="9" y="7" width="6" height="13" rx="3"/><path d="M9 12h6"/></>}
              label="Bugs Submitted" value={loading ? '—' : reports.length}
            />
            <StatCard
              iconBg="#dcfce7" iconStroke="#16a34a"
              icon={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>}
              label="Bugs Accepted" value={loading ? '—' : accepted}
            />
          </div>

          {/* Two-column lower section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginBottom: 24 }}>

            {/* Recent Activity */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '24px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Recent Activity</h2>
                <Link to="/my-submissions" style={{ fontSize: 13, color: '#4F46E5', fontWeight: 600, textDecoration: 'none' }}>View All &rsaquo;</Link>
              </div>
              {loading ? (
                <p style={{ fontSize: 13, color: '#9ca3af', padding: '20px 0' }}>Loading…</p>
              ) : recentActivity.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9ca3af', padding: '20px 0' }}>No submissions yet. Submit your first bug!</p>
              ) : (
                recentActivity.map(r => <ActivityRow key={r.id} report={r} />)
              )}
            </div>

            {/* Your Progress */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '24px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 20px' }}>Your Progress</h2>
              <XPBar xp={user?.xp ?? 0} level={user?.level ?? 1} />
            </div>
          </div>

          {/* Found a bug CTA */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '24px 32px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ fontSize: 48 }}>📁</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Found a bug?</h3>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Help improve software quality by submitting a new bug report.</p>
            </div>
            <Link to="/submit-bug" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#4338CA', color: '#fff', padding: '12px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M8 2l1.5 1.5"/><path d="M14.5 3.5L16 2"/>
                <path d="M9 7.5C9 5.6 10.3 4 12 4s3 1.6 3 3.5"/>
                <rect x="9" y="7" width="6" height="13" rx="3"/>
              </svg>
              Submit Bug
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
