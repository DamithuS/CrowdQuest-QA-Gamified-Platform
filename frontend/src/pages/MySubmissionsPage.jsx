import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import Avatar from '../components/Avatar'

const API = 'http://localhost:8000'

const STATUS_CONFIG = {
  pending:      { label: 'Pending',      bg: '#e0e7ff', color: '#4338CA' },
  under_review: { label: 'Under Review', bg: '#fef9c3', color: '#92400e' },
  accepted:     { label: 'Accepted',     bg: '#dcfce7', color: '#15803d' },
  rejected:     { label: 'Rejected',     bg: '#fee2e2', color: '#dc2626' },
}

const SEVERITY_CONFIG = {
  low:      { label: 'Low',      bg: '#f0fdf4', color: '#16a34a' },
  medium:   { label: 'Medium',   bg: '#fef9c3', color: '#92400e' },
  high:     { label: 'High',     bg: '#fff7ed', color: '#c2410c' },
  critical: { label: 'Critical', bg: '#fee2e2', color: '#dc2626' },
}

// ── Top bar ───────────────────────────────────────────────────────────────────
function TopBar({ user }) {
  return (
    <div style={{ height: 64, background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0 }}>
      <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
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

// ── Summary stat card ─────────────────────────────────────────────────────────
function SummaryCard({ label, value, bg, color }) {
  return (
    <div style={{ flex: 1, background: '#fff', borderRadius: 14, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 18, fontWeight: 900, color }}>{value}</span>
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', margin: 0 }}>{label}</p>
    </div>
  )
}

// ── Report detail modal ───────────────────────────────────────────────────────
function DetailModal({ report, onClose }) {
  const st = STATUS_CONFIG[report.status]
  const sv = SEVERITY_CONFIG[report.severity]
  const fmt = d => new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '32px', width: 560, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ flex: 1, paddingRight: 16 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: sv.bg, color: sv.color }}>{sv.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color }}>{st.label}</span>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#111827', margin: 0 }}>{report.title}</h2>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>Bug #{report.id} · Submitted {fmt(report.created_at)}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Points banner */}
        {report.points_awarded && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>🎉</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>+{report.points_awarded} points earned</span>
          </div>
        )}

        <Field label="Description" value={report.description} />
        <Field label="Steps to Reproduce" value={report.steps_to_reproduce} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {report.environment    && <Field label="Environment"    value={report.environment} inline />}
          {report.device_browser && <Field label="Device / Browser" value={report.device_browser} inline />}
          {report.version        && <Field label="Version"        value={report.version} inline />}
          {report.quality_score != null && <Field label="Quality Score" value={`${report.quality_score} / 10`} inline />}
        </div>

        {report.updated_at && (
          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Last updated {fmt(report.updated_at)}</p>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, inline }) {
  return (
    <div style={{ marginBottom: inline ? 0 : 16 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>{label}</p>
      <p style={{ fontSize: 13, color: '#374151', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{value}</p>
    </div>
  )
}

// ── Report table row ──────────────────────────────────────────────────────────
function ReportRow({ report, onClick }) {
  const st = STATUS_CONFIG[report.status]
  const sv = SEVERITY_CONFIG[report.severity]
  const timeAgo = d => {
    const mins = Math.floor((Date.now() - new Date(d)) / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <tr
      onClick={onClick}
      style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.12s' }}
      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#9ca3af', width: 60 }}>#{report.id}</td>
      <td style={{ padding: '14px 12px', maxWidth: 280 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{report.title}</p>
        {report.environment && <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{report.environment}</p>}
      </td>
      <td style={{ padding: '14px 12px' }}>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: sv.bg, color: sv.color, whiteSpace: 'nowrap' }}>{sv.label}</span>
      </td>
      <td style={{ padding: '14px 12px' }}>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color, whiteSpace: 'nowrap' }}>{st.label}</span>
      </td>
      <td style={{ padding: '14px 12px', fontSize: 13, color: report.points_awarded ? '#15803d' : '#9ca3af', fontWeight: report.points_awarded ? 700 : 400, whiteSpace: 'nowrap' }}>
        {report.points_awarded ? `+${report.points_awarded} pts` : '—'}
      </td>
      <td style={{ padding: '14px 20px', fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap', textAlign: 'right' }}>
        {timeAgo(report.created_at)}
      </td>
    </tr>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MySubmissionsPage() {
  const { user } = useAuth()
  const [reports, setReports]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [search, setSearch]           = useState('')
  const [selected, setSelected]       = useState(null)

  useEffect(() => {
    if (!user) return
    fetch(`${API}/users/${user.id}/reports`)
      .then(r => r.json())
      .then(data => setReports(Array.isArray(data) ? data : []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }, [user])

  const filtered = reports.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    if (severityFilter !== 'all' && r.severity !== severityFilter) return false
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const counts = {
    total:        reports.length,
    pending:      reports.filter(r => r.status === 'pending').length,
    under_review: reports.filter(r => r.status === 'under_review').length,
    accepted:     reports.filter(r => r.status === 'accepted').length,
    rejected:     reports.filter(r => r.status === 'rejected').length,
  }

  const STATUS_TABS = [
    { key: 'all',          label: 'All' },
    { key: 'pending',      label: 'Pending' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'accepted',     label: 'Accepted' },
    { key: 'rejected',     label: 'Rejected' },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F8F9FF', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar user={user} />

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>

          {/* Heading */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>My Submissions</h1>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0' }}>Track and review all your bug reports.</p>
          </div>

          {/* Summary cards */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
            <SummaryCard label="Total Submitted" value={counts.total}        bg="#EEF2FF" color="#4338CA" />
            <SummaryCard label="Pending"         value={counts.pending}      bg="#e0e7ff" color="#4338CA" />
            <SummaryCard label="Under Review"    value={counts.under_review} bg="#fef9c3" color="#92400e" />
            <SummaryCard label="Accepted"        value={counts.accepted}     bg="#dcfce7" color="#15803d" />
            <SummaryCard label="Rejected"        value={counts.rejected}     bg="#fee2e2" color="#dc2626" />
          </div>

          {/* Filters */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>

              {/* Status tabs */}
              <div style={{ display: 'flex', gap: 4 }}>
                {STATUS_TABS.map(tab => (
                  <button key={tab.key} onClick={() => setStatusFilter(tab.key)} style={{
                    padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
                    background: statusFilter === tab.key ? '#4338CA' : 'transparent',
                    color: statusFilter === tab.key ? '#fff' : '#6b7280',
                  }}>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                {/* Severity filter */}
                <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} style={{ padding: '7px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', color: '#374151', outline: 'none', cursor: 'pointer', background: '#fff' }}>
                  <option value="all">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>

                {/* Search */}
                <div style={{ position: 'relative' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-3.5-3.5"/>
                  </svg>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports" style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', width: 200 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            {loading ? (
              <p style={{ fontSize: 13, color: '#9ca3af', padding: '40px', textAlign: 'center' }}>Loading…</p>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <span style={{ fontSize: 40 }}>🐛</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', margin: '12px 0 4px' }}>
                  {reports.length === 0 ? 'No submissions yet' : 'No reports match your filters'}
                </p>
                <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
                  {reports.length === 0 ? 'Submit your first bug report to get started.' : 'Try adjusting the filters above.'}
                </p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', width: 60 }}>ID</th>
                    <th style={{ padding: '12px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Title</th>
                    <th style={{ padding: '12px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Severity</th>
                    <th style={{ padding: '12px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Status</th>
                    <th style={{ padding: '12px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Points</th>
                    <th style={{ padding: '12px 20px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <ReportRow key={r.id} report={r} onClick={() => setSelected(r)} />
                  ))}
                </tbody>
              </table>
            )}

            {/* Row count footer */}
            {!loading && filtered.length > 0 && (
              <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6', fontSize: 12, color: '#9ca3af' }}>
                Showing {filtered.length} of {reports.length} report{reports.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

        </div>
      </div>

      {selected && <DetailModal report={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
