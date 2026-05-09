import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import Avatar from '../components/Avatar'

const API = 'http://localhost:8000'

// ── Top bar (logged-in layout) ────────────────────────────────────────────────
function TopBar({ user }) {
  return (
    <div style={{ height: 64, background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 32px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar user={user} size={36} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>{user?.username}</p>
          <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>Level {user?.level}</p>
        </div>
      </div>
    </div>
  )
}

// ── Podium card (top 3) ───────────────────────────────────────────────────────
const PODIUM = {
  1: { bg: 'linear-gradient(135deg, #fef9c3, #fef08a)', border: '#fbbf24', label: '#92400e', size: 88 },
  2: { bg: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', border: '#94a3b8', label: '#475569', size: 76 },
  3: { bg: 'linear-gradient(135deg, #fef3e2, #fed7aa)', border: '#fb923c', label: '#92400e', size: 72 },
}

function PodiumCard({ entry }) {
  if (!entry) return <div style={{ flex: 1 }} />
  const p = PODIUM[entry.rank]
  const acceptRate = entry.bugs_submitted > 0
    ? Math.round((entry.bugs_accepted / entry.bugs_submitted) * 100)
    : 0

  return (
    <div style={{
      flex: 1, background: p.bg, border: `2px solid ${p.border}`,
      borderRadius: 16, padding: '24px 16px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 10,
      boxShadow: entry.rank === 1 ? '0 8px 30px rgba(251,191,36,0.25)' : '0 2px 10px rgba(0,0,0,0.06)',
      transform: entry.rank === 1 ? 'translateY(-12px)' : 'none',
    }}>
      <Avatar user={entry.user} size={p.size} fontSize={Math.round(p.size * 0.38)} />
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0 }}>{entry.user.username}</p>
        <span style={{ background: '#EEF2FF', color: '#4338CA', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
          Level {entry.user.level}
        </span>
      </div>
      <p style={{ fontSize: 22, fontWeight: 900, color: p.label, margin: 0 }}>
        {entry.user.points.toLocaleString()} pts
      </p>
      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6b7280' }}>
        <span>{entry.bugs_submitted} submitted</span>
        <span>·</span>
        <span>{acceptRate}% accepted</span>
      </div>
    </div>
  )
}

// ── Table row ─────────────────────────────────────────────────────────────────
function TableRow({ entry, isCurrentUser }) {
  const acceptRate = entry.bugs_submitted > 0
    ? Math.round((entry.bugs_accepted / entry.bugs_submitted) * 100)
    : 0

  const rankBadge = entry.rank <= 3
    ? ['', '🥇', '🥈', '🥉'][entry.rank]
    : null

  return (
    <tr style={{
      background: isCurrentUser ? '#EEF2FF' : 'transparent',
      borderBottom: '1px solid #f3f4f6',
      transition: 'background 0.15s',
    }}
    onMouseEnter={e => { if (!isCurrentUser) e.currentTarget.style.background = '#f9fafb' }}
    onMouseLeave={e => { if (!isCurrentUser) e.currentTarget.style.background = 'transparent' }}
    >
      {/* Rank */}
      <td style={{ padding: '14px 20px', width: 60 }}>
        {rankBadge ? (
          <span style={{ fontSize: 20 }}>{rankBadge}</span>
        ) : (
          <span style={{ fontSize: 14, fontWeight: 700, color: isCurrentUser ? '#4338CA' : '#6b7280' }}>
            #{entry.rank}
          </span>
        )}
      </td>

      {/* User */}
      <td style={{ padding: '14px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar user={entry.user} size={38} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{entry.user.username}</span>
              {isCurrentUser && (
                <span style={{ fontSize: 10, fontWeight: 700, color: '#4338CA', background: '#EEF2FF', padding: '1px 7px', borderRadius: 20 }}>You</span>
              )}
            </div>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>Level {entry.user.level}</span>
          </div>
        </div>
      </td>

      {/* Points */}
      <td style={{ padding: '14px 12px', textAlign: 'right' }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: isCurrentUser ? '#4338CA' : '#111827' }}>
          {entry.user.points.toLocaleString()}
        </span>
      </td>

      {/* Submitted */}
      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
        <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{entry.bugs_submitted}</span>
      </td>

      {/* Accepted */}
      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
        <span style={{ fontSize: 14, color: '#16a34a', fontWeight: 600 }}>{entry.bugs_accepted}</span>
      </td>

      {/* Acceptance rate */}
      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 50, height: 6, background: '#e5e7eb', borderRadius: 999 }}>
            <div style={{ height: '100%', width: `${acceptRate}%`, background: '#4338CA', borderRadius: 999 }} />
          </div>
          <span style={{ fontSize: 12, color: '#6b7280', width: 32 }}>{acceptRate}%</span>
        </div>
      </td>
    </tr>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/leaderboard`)
      .then(r => r.json())
      .then(data => setLeaderboard(Array.isArray(data) ? data : []))
      .catch(() => setLeaderboard([]))
      .finally(() => setLoading(false))
  }, [])

  const content = (
    <div style={{ flex: 1, overflowY: 'auto', padding: user ? '32px' : '32px 0' }}>
      <div style={{ maxWidth: user ? undefined : 1000, margin: user ? undefined : '0 auto', padding: user ? undefined : '0 32px' }}>

        {/* Heading */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>Leaderboard</h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0' }}>
            Top bug hunters ranked by total points earned.
          </p>
        </div>

        {loading ? (
          <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ width: 28, height: 11, background: '#f3f4f6', borderRadius: 6, flexShrink: 0 }} />
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#f3f4f6', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 12, background: '#f3f4f6', borderRadius: 6, marginBottom: 6, width: `${30 + i * 7}%` }} />
                  <div style={{ height: 9, background: '#f3f4f6', borderRadius: 6, width: '15%' }} />
                </div>
                <div style={{ width: 48, height: 12, background: '#f3f4f6', borderRadius: 6 }} />
                <div style={{ width: 36, height: 12, background: '#f3f4f6', borderRadius: 6 }} />
                <div style={{ width: 36, height: 12, background: '#f3f4f6', borderRadius: 6 }} />
                <div style={{ width: 60, height: 6, background: '#f3f4f6', borderRadius: 6 }} />
              </div>
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>No rankings yet</p>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Rankings will appear once bug reports have been submitted and reviewed.</p>
          </div>
        ) : (
          <>
            {/* Podium — top 3 */}
            {leaderboard.length >= 1 && (
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginBottom: 32 }}>
                <PodiumCard entry={leaderboard[1] ?? null} />
                <PodiumCard entry={leaderboard[0]} />
                <PodiumCard entry={leaderboard[2] ?? null} />
              </div>
            )}

            {/* Full table */}
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', width: 60 }}>Rank</th>
                    <th style={{ padding: '12px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>User</th>
                    <th style={{ padding: '12px 12px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Points</th>
                    <th style={{ padding: '12px 12px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Submitted</th>
                    <th style={{ padding: '12px 12px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Accepted</th>
                    <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Accept Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map(entry => (
                    <TableRow
                      key={entry.user.id}
                      entry={entry}
                      isCurrentUser={user?.id === entry.user.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )

  // Logged-in layout: Sidebar + TopBar
  if (user) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: '#F8F9FF', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <TopBar user={user} />
          {content}
        </div>
      </div>
    )
  }

  // Public layout: Navbar
  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FF', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar activePage="leaderboard" />
      {content}
    </div>
  )
}
