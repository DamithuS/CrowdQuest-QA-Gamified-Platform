import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import Avatar from '../components/Avatar'

const API = 'http://localhost:8000'

const parseDate = (s) => new Date(/Z|[+-]\d\d:\d\d$/.test(s ?? '') ? s : (s ?? '') + 'Z')
const timeAgo = (dateStr) => {
  const diff = Date.now() - parseDate(dateStr)
  if (diff < 60000) return 'just now'
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return parseDate(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const AVATAR_COLORS = [
  '#4338CA', '#7C3AED', '#DB2777', '#DC2626',
  '#EA580C', '#CA8A04', '#16A34A', '#0891B2',
]

// ── Top bar ───────────────────────────────────────────────────────────────────
function TopBar({ user, notifCount }) {
  return (
    <div style={{ height: 64, background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 32px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar user={user} size={36} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>{user?.username}</p>
            <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>Level {user?.level}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, iconStroke, label, value }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      </div>
      <p style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>{value}</p>
      <p style={{ fontSize: 12, color: '#6b7280', margin: 0, textAlign: 'center' }}>{label}</p>
    </div>
  )
}

// ── Activity row ──────────────────────────────────────────────────────────────
function ActivityRow({ report }) {
  const statusConfig = {
    accepted:     { bg: '#dcfce7', stroke: '#16a34a', icon: <polyline points="20 6 9 17 4 12"/>, text: 'accepted', pts: report.points_awarded },
    under_review: { bg: '#fef9c3', stroke: '#ca8a04', icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>, text: 'pending review', pts: null },
    pending:      { bg: '#e0e7ff', stroke: '#4338CA', icon: <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>, text: 'submitted', pts: null },
    rejected:     { bg: '#fee2e2', stroke: '#dc2626', icon: <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>, text: 'rejected', pts: null },
  }
  const cfg = statusConfig[report.status] || statusConfig.pending
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid #f9fafb' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={cfg.stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">{cfg.icon}</svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Bug #{report.id} {cfg.text}
        </p>
        <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{report.title}</p>
      </div>
      <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>{timeAgo(report.created_at)}</span>
    </div>
  )
}

// ── Edit Profile modal ────────────────────────────────────────────────────────
function EditModal({ user, onClose, onSave }) {
  const [bio, setBio] = useState(user.bio || '')
  const [location, setLocation] = useState(user.location || '')
  const [avatarColor, setAvatarColor] = useState(user.avatar_color || '#4338CA')
  const [preview, setPreview] = useState(user.avatar_url ? `${API}${user.avatar_url}` : null)
  const [imageFile, setImageFile] = useState(null)
  const [avatarRemoved, setAvatarRemoved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
    setError('')
  }

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please drop an image file.')
      return
    }
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
    setError('')
  }

  function handleRemovePhoto() {
    setPreview(null)
    setImageFile(null)
    setAvatarRemoved(true)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      let updated = user

      // Remove existing avatar via dedicated DELETE endpoint
      if (avatarRemoved && !imageFile) {
        const delRes = await fetch(`${API}/users/${user.id}/avatar`, { method: 'DELETE' })
        if (!delRes.ok) throw new Error('Failed to remove photo')
        updated = await delRes.json()
      }

      // Upload new image if one was selected
      if (imageFile) {
        const form = new FormData()
        form.append('file', imageFile)
        const imgRes = await fetch(`${API}/users/${user.id}/avatar`, { method: 'POST', body: form })
        if (!imgRes.ok) throw new Error('Image upload failed')
        updated = await imgRes.json()
      }

      // Patch text fields only
      const patchRes = await fetch(`${API}/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, location, avatar_color: avatarColor }),
      })
      if (!patchRes.ok) throw new Error('Failed to save')
      updated = await patchRes.json()

      onSave(updated)
      onClose()
    } catch (err) {
      setError(err.message || 'Could not save changes. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '32px', width: 460, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>Edit Profile</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626' }}>{error}</div>}

        {/* Profile picture upload */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 10 }}>Profile Picture</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Preview */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: '2px solid #e5e7eb' }}>
                {preview ? (
                  <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 28 }}>
                    {user.username?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              {preview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  title="Remove photo"
                  style={{ position: 'absolute', top: -4, right: -4, width: 22, height: 22, borderRadius: '50%', background: '#ef4444', border: '2px solid #fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              style={{ flex: 1, border: '2px dashed #d1d5db', borderRadius: 10, padding: '16px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#4338CA'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#d1d5db'}
            >
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                <span style={{ color: '#4338CA', fontWeight: 600 }}>Click to upload</span> or drag & drop
              </p>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>PNG, JPG, GIF, WebP</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Avatar colour picker */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 10 }}>Avatar Colour <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>(used when no photo)</span></label>
          <div style={{ display: 'flex', gap: 10 }}>
            {AVATAR_COLORS.map(c => (
              <button key={c} onClick={() => setAvatarColor(c)} style={{ width: 34, height: 34, borderRadius: '50%', background: c, border: avatarColor === c ? '3px solid #111827' : '3px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
                {avatarColor === c ? '✓' : user.username?.[0]?.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell us about yourself..." style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = '#4338CA'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
        </div>

        {/* Location */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Location</label>
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Colombo, Sri Lanka" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = '#4338CA'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '11px', background: '#4338CA', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'inherit' }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── XP bar ────────────────────────────────────────────────────────────────────
function XPBar({ xp, level }) {
  const XP_PER_LEVEL = 1000
  const currentLevelXP = xp % XP_PER_LEVEL
  const pct = Math.min((currentLevelXP / XP_PER_LEVEL) * 100, 100)
  const xpToNext = XP_PER_LEVEL - currentLevelXP
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
      <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>🎉</span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#166534', margin: 0 }}>Keep going!</p>
          <p style={{ fontSize: 12, color: '#16a34a', margin: 0 }}>Submit more bugs to level up.</p>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [reports, setReports] = useState([])
  const [rank, setRank] = useState(null)
  const [notifCount, setNotifCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [freshUser, setFreshUser] = useState(null)

  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const [reportsRes, leaderboardRes, notifRes, userRes] = await Promise.all([
          fetch(`${API}/users/${user.id}/reports`),
          fetch(`${API}/leaderboard`),
          fetch(`${API}/users/${user.id}/notifications`),
          fetch(`${API}/users/${user.id}`),
        ])
        const reportsData = await reportsRes.json()
        const leaderboard = await leaderboardRes.json()
        const notifs = await notifRes.json()
        const userData = await userRes.json()
        setReports(Array.isArray(reportsData) ? reportsData : [])
        const entry = leaderboard.find(e => e.user.id === user.id)
        setRank(entry ? entry.rank : null)
        setNotifCount(notifs.filter(n => !n.is_read).length)
        if (userData?.id) {
          setFreshUser(userData)
          updateUser(userData)
        }
      } catch {
        setReports([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id])

  const displayUser = freshUser ?? user
  const accepted = reports.filter(r => r.status === 'accepted').length
  const acceptanceRate = reports.length > 0 ? Math.round((accepted / reports.length) * 100) : 0

  function handleSave(updated) {
    updateUser(updated)
    setFreshUser(updated)
  }

  const joinDate = displayUser?.created_at
    ? new Date(displayUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F8F9FF', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar user={displayUser} notifCount={notifCount} />

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>

          {/* Page heading */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>My Profile</h1>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0' }}>View and manage your profile information and stats.</p>
          </div>

          {/* Profile card */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
              {/* Avatar + info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ position: 'relative' }}>
                  <Avatar user={displayUser} size={80} fontSize={32} />
                  <button onClick={() => setEditOpen(true)} style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: '#4338CA', border: '2px solid #fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                  </button>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>{displayUser?.username}</h2>
                    <span style={{ background: '#EEF2FF', color: '#4338CA', fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>Level {displayUser?.level}</span>
                  </div>
                  {displayUser?.bio && <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 8px' }}>{displayUser.bio}</p>}
                  <div style={{ display: 'flex', gap: 20 }}>
                    {joinDate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#9ca3af' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Member since {joinDate}
                      </div>
                    )}
                    {displayUser?.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#9ca3af' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {displayUser.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit button */}
              <button onClick={() => setEditOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                Edit Profile
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <StatCard iconBg="#EEF2FF" iconStroke="#4338CA" icon={<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>} label="Total Points" value={loading ? '—' : displayUser?.points ?? 0} />
            <StatCard iconBg="#fef9c3" iconStroke="#ca8a04" icon={<><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></>} label="Current Rank" value={loading ? '—' : rank ? `#${rank}` : '—'} />
            <StatCard iconBg="#dbeafe" iconStroke="#2563eb" icon={<><path d="M8 2l1.5 1.5"/><path d="M14.5 3.5L16 2"/><path d="M9 7.5C9 5.6 10.3 4 12 4s3 1.6 3 3.5"/><path d="M6.5 9H4a1 1 0 0 0-1 1v.5a1 1 0 0 0 1 1h2.5"/><path d="M17.5 9H20a1 1 0 0 1 1 1v.5a1 1 0 0 1-1 1h-2.5"/><rect x="9" y="7" width="6" height="13" rx="3"/><path d="M9 12h6"/></>} label="Bugs Submitted" value={loading ? '—' : reports.length} />
            <StatCard iconBg="#dcfce7" iconStroke="#16a34a" icon={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>} label="Bugs Accepted" value={loading ? '—' : accepted} />
            <StatCard iconBg="#fce7f3" iconStroke="#db2777" icon={<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>} label="Acceptance Rate" value={loading ? '—' : `${acceptanceRate}%`} />
          </div>

          {/* Lower two columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
            {/* Recent Activity */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '24px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Recent Activity</h2>
              </div>
              {loading ? (
                <div style={{ paddingTop: 8 }}>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid #f9fafb' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 11, background: '#f3f4f6', borderRadius: 6, marginBottom: 7, width: `${50 + i * 12}%` }} />
                        <div style={{ height: 9, background: '#f3f4f6', borderRadius: 6, width: `${30 + i * 8}%` }} />
                      </div>
                      <div style={{ width: 32, height: 9, background: '#f3f4f6', borderRadius: 6 }} />
                    </div>
                  ))}
                </div>
              ) : reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 0' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4338CA" strokeWidth="2" strokeLinecap="round">
                      <path d="M8 2l1.5 1.5"/><path d="M14.5 3.5L16 2"/>
                      <path d="M9 7.5C9 5.6 10.3 4 12 4s3 1.6 3 3.5"/>
                      <rect x="9" y="7" width="6" height="13" rx="3"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>No submissions yet</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Your submitted bug reports will appear here.</p>
                </div>
              ) : (
                reports.slice(0, 5).map(r => <ActivityRow key={r.id} report={r} />)
              )}
            </div>

            {/* Progress */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '24px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 20px' }}>Your Progress</h2>
              <XPBar xp={displayUser?.xp ?? 0} level={displayUser?.level ?? 1} />
            </div>
          </div>

        </div>
      </div>

      {editOpen && <EditModal user={displayUser} onClose={() => setEditOpen(false)} onSave={handleSave} />}
    </div>
  )
}
