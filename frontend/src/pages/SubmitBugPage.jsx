import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import Avatar from '../components/Avatar'

const API = 'http://localhost:8000'

const SEVERITY_OPTIONS = [
  { value: 'low',      label: 'Low',      desc: 'Minor issue, cosmetic or trivial',       bg: '#f0fdf4', border: '#86efac', color: '#22c55e' },
  { value: 'medium',   label: 'Medium',   desc: 'Affects functionality, workaround exists', bg: '#fefce8', border: '#fde047', color: '#eab308' },
  { value: 'high',     label: 'High',     desc: 'Significant impact, no workaround',       bg: '#fff7ed', border: '#fdba74', color: '#ef4444' },
  { value: 'critical', label: 'Critical', desc: 'System crash, data loss, security risk',  bg: '#fee2e2', border: '#fca5a5', color: '#991b1b' },
]

const ENVIRONMENT_OPTIONS = ['Windows', 'macOS', 'Linux', 'Android', 'iOS', 'Web', 'Other']

// ── Top bar ───────────────────────────────────────────────────────────────────
function TopBar({ user }) {
  return (
    <div style={{ height: 64, background: '#080D18', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 32px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar user={user} size={36} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#F1F5F9', margin: 0 }}>{user?.username}</p>
          <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>Level {user?.level}</p>
        </div>
      </div>
    </div>
  )
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function FormField({ label, required, hint, error, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
          {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
        </label>
        {hint && <span style={{ fontSize: 11, color: '#9ca3af' }}>{hint}</span>}
      </div>
      {children}
      {error && <p style={{ fontSize: 12, color: '#dc2626', margin: '4px 0 0' }}>{error}</p>}
    </div>
  )
}

const inputStyle = (hasError) => ({
  width: '100%', padding: '10px 12px', border: `1.5px solid ${hasError ? '#fca5a5' : '#e5e7eb'}`,
  borderRadius: 8, fontSize: 14, fontFamily: 'Inter, system-ui, sans-serif',
  outline: 'none', boxSizing: 'border-box', color: '#111827', background: '#fff',
})

// ── Success screen ────────────────────────────────────────────────────────────
function SuccessScreen({ report, onAnother, onView }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '60px 32px', textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>Bug Submitted!</h2>
      <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 4px' }}>
        <strong style={{ color: '#111827' }}>"{report.title}"</strong> has been received.
      </p>
      <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 32px' }}>Bug #{report.id} · Status: Pending review</p>
      <div style={{ background: '#EEF2FF', borderRadius: 12, padding: '14px 24px', marginBottom: 32 }}>
        <p style={{ fontSize: 13, color: '#6366F1', fontWeight: 600, margin: 0 }}>
          You'll earn points once your report is reviewed and accepted.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onAnother} style={{ padding: '10px 24px', border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}>
          Submit Another
        </button>
        <button onClick={onView} style={{ padding: '10px 24px', background: '#6366F1', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
          View My Submissions
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SubmitBugPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '', description: '', steps_to_reproduce: '',
    severity: '', website_name: '', environment: '', device_browser: '', version: '', screenshot_url: '',
  })
  const [errors, setErrors]         = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(null)
  const [apiError, setApiError]     = useState('')
  const [aiDetecting, setAiDetecting]   = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState(null)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.website_name.trim())
      e.website_name = 'Please enter the website or app name.'
    if (!form.title.trim() || form.title.trim().length < 5)
      e.title = 'Title must be at least 5 characters.'
    if (!form.description.trim() || form.description.trim().length < 20)
      e.description = 'Description must be at least 20 characters.'
    if (!form.steps_to_reproduce.trim() || form.steps_to_reproduce.trim().length < 10)
      e.steps_to_reproduce = 'Steps must be at least 10 characters.'
    if (!form.severity)
      e.severity = 'Use AI Detect to classify the severity before submitting.'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    setApiError('')
    try {
      const body = {
        title:               form.title.trim(),
        description:         form.description.trim(),
        steps_to_reproduce:  form.steps_to_reproduce.trim(),
        severity:            form.severity,
        website_name:        form.website_name.trim() || null,
        environment:         form.environment.trim() || null,
        device_browser:      form.device_browser.trim() || null,
        version:             form.version.trim() || null,
        screenshot_url:      form.screenshot_url.trim() || null,
      }
      const res = await fetch(`${API}/reports?user_id=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Submission failed')
      }
      const report = await res.json()
      setSubmitted(report)
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setForm({ title: '', description: '', steps_to_reproduce: '', severity: '', website_name: '', environment: '', device_browser: '', version: '', screenshot_url: '' })
    setErrors({})
    setSubmitted(null)
    setApiError('')
    setAiSuggestion(null)
  }

  async function detectSeverity() {
    if (!form.title.trim() || !form.description.trim() || !form.steps_to_reproduce.trim()) {
      setApiError('Please fill in the title, description, and steps before using AI detection.')
      return
    }
    setAiDetecting(true)
    setAiSuggestion(null)
    setApiError('')
    try {
      const res = await fetch(`${API}/ai/detect-severity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          steps_to_reproduce: form.steps_to_reproduce.trim(),
        }),
      })
      if (!res.ok) throw new Error('AI detection failed')
      const data = await res.json()
      setAiSuggestion(data)
      set('severity', data.severity)
    } catch {
      setApiError('AI detection failed. Please try again or set severity manually.')
    } finally {
      setAiDetecting(false)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#ECEEF5', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar user={user} />

        {submitted ? (
          <SuccessScreen
            report={submitted}
            onAnother={resetForm}
            onView={() => navigate('/my-submissions')}
          />
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>

            {/* Heading */}
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>Submit a Bug</h1>
              <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0' }}>
                Provide as much detail as possible to earn more points.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

                {/* ── Left column: main fields ── */}
                <div style={{ background: '#fff', borderRadius: 16, padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 20px' }}>Bug Details</h2>

                  {apiError && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#dc2626' }}>
                      {apiError}
                    </div>
                  )}

                  {/* Website / App */}
                  <FormField label="Website / App" required error={errors.website_name}>
                    <input
                      value={form.website_name}
                      onChange={e => set('website_name', e.target.value)}
                      maxLength={200}
                      placeholder="e.g. GitHub, Spotify, Amazon"
                      style={inputStyle(!!errors.website_name)}
                      onFocus={e => e.target.style.borderColor = '#6366F1'}
                      onBlur={e => e.target.style.borderColor = errors.website_name ? '#fca5a5' : '#e5e7eb'}
                    />
                  </FormField>

                  {/* Title */}
                  <FormField label="Bug Title" required hint={`${form.title.length}/200`} error={errors.title}>
                    <input
                      value={form.title}
                      onChange={e => set('title', e.target.value)}
                      maxLength={200}
                      placeholder="e.g. Login button unresponsive on mobile"
                      style={inputStyle(!!errors.title)}
                      onFocus={e => e.target.style.borderColor = '#6366F1'}
                      onBlur={e => e.target.style.borderColor = errors.title ? '#fca5a5' : '#e5e7eb'}
                    />
                  </FormField>

                  {/* Description */}
                  <FormField label="Description" required hint={`${form.description.length} chars`} error={errors.description}>
                    <textarea
                      value={form.description}
                      onChange={e => set('description', e.target.value)}
                      rows={4}
                      placeholder="Describe the bug in detail – what happened vs. what you expected"
                      style={{ ...inputStyle(!!errors.description), resize: 'vertical' }}
                      onFocus={e => e.target.style.borderColor = '#6366F1'}
                      onBlur={e => e.target.style.borderColor = errors.description ? '#fca5a5' : '#e5e7eb'}
                    />
                  </FormField>

                  {/* Steps */}
                  <FormField label="Steps to Reproduce" required hint={`${form.steps_to_reproduce.length} chars`} error={errors.steps_to_reproduce}>
                    <textarea
                      value={form.steps_to_reproduce}
                      onChange={e => set('steps_to_reproduce', e.target.value)}
                      rows={4}
                      placeholder={"1. Go to the login page\n2. Enter valid credentials\n3. Click the Login button\n4. Nothing happens"}
                      style={{ ...inputStyle(!!errors.steps_to_reproduce), resize: 'vertical' }}
                      onFocus={e => e.target.style.borderColor = '#6366F1'}
                      onBlur={e => e.target.style.borderColor = errors.steps_to_reproduce ? '#fca5a5' : '#e5e7eb'}
                    />
                  </FormField>

                  {/* Optional info row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <FormField label="Environment">
                      <select
                        value={form.environment}
                        onChange={e => set('environment', e.target.value)}
                        style={{ ...inputStyle(false), cursor: 'pointer' }}
                        onFocus={e => e.target.style.borderColor = '#6366F1'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                      >
                        <option value="">Select platform…</option>
                        {ENVIRONMENT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </FormField>

                    <FormField label="Device / Browser">
                      <input
                        value={form.device_browser}
                        onChange={e => set('device_browser', e.target.value)}
                        placeholder="e.g. Chrome 124, iPhone 15"
                        style={inputStyle(false)}
                        onFocus={e => e.target.style.borderColor = '#6366F1'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </FormField>

                    <FormField label="App Version">
                      <input
                        value={form.version}
                        onChange={e => set('version', e.target.value)}
                        placeholder="e.g. v2.1.4"
                        style={inputStyle(false)}
                        onFocus={e => e.target.style.borderColor = '#6366F1'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </FormField>

                    <FormField label="Screenshot URL">
                      <input
                        value={form.screenshot_url}
                        onChange={e => set('screenshot_url', e.target.value)}
                        placeholder="https://"
                        style={inputStyle(false)}
                        onFocus={e => e.target.style.borderColor = '#6366F1'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </FormField>
                  </div>
                </div>

                {/* ── Right column: severity + submit ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Severity picker */}
                  <div style={{ background: '#fff', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>
                        Severity <span style={{ color: '#dc2626' }}>*</span>
                      </h2>
                      <button
                        type="button"
                        onClick={detectSeverity}
                        disabled={aiDetecting}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '6px 12px', borderRadius: 8, cursor: aiDetecting ? 'not-allowed' : 'pointer',
                          border: '1.5px solid #6366F1', background: aiDetecting ? '#EEF2FF' : '#6366F1',
                          fontSize: 12, fontWeight: 600, color: aiDetecting ? '#6366F1' : '#fff',
                          fontFamily: 'inherit', transition: 'all 0.15s',
                        }}
                      >
                        {aiDetecting ? (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                            </svg>
                            Detecting…
                          </>
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                            </svg>
                            AI Detect
                          </>
                        )}
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {SEVERITY_OPTIONS.map(opt => (
                        <div
                          key={opt.value}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '12px 14px', borderRadius: 10, textAlign: 'left',
                            border: `2px solid ${form.severity === opt.value ? opt.border : '#e5e7eb'}`,
                            background: form.severity === opt.value ? opt.bg : '#fff',
                            transition: 'all 0.15s',
                          }}
                        >
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: form.severity === opt.value ? opt.color : '#374151', margin: 0 }}>
                              {opt.label}
                              {aiSuggestion?.severity === opt.value && (
                                <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: '#6366F1', background: '#EEF2FF', padding: '1px 6px', borderRadius: 20 }}>AI</span>
                              )}
                            </p>
                            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{opt.desc}</p>
                          </div>
                          {form.severity === opt.value && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={opt.color} strokeWidth="3" strokeLinecap="round" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* AI suggestion reasoning */}
                    {aiSuggestion && (
                      <div style={{ marginTop: 14, padding: '12px 14px', background: '#EEF2FF', borderRadius: 10, borderLeft: '3px solid #6366F1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round">
                            <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                          </svg>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#6366F1' }}>
                            AI Suggestion · Confidence: {aiSuggestion.confidence}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: '#3730a3', margin: 0, lineHeight: 1.5 }}>
                          {aiSuggestion.reasoning}
                        </p>
                      </div>
                    )}
                    {errors.severity && (
                      <p style={{ fontSize: 12, color: '#dc2626', margin: '10px 0 0' }}>{errors.severity}</p>
                    )}
                  </div>

                  {/* Points info */}
                  <div style={{ background: '#EEF2FF', borderRadius: 16, padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b', margin: 0 }}>How points work</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {[['Under Review', '+20 pts'], ['Accepted', '+50 pts']].map(([s, p]) => (
                        <div key={s} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <span style={{ color: '#6366F1' }}>{s}</span>
                          <span style={{ fontWeight: 700, color: '#1e1b4b' }}>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: '100%', padding: '14px', background: submitting ? '#9ca3af' : '#6366F1',
                      border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
                      color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'background 0.15s',
                    }}
                  >
                    {submitting ? (
                      'Submitting…'
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                        Submit Bug Report
                      </>
                    )}
                  </button>
                </div>

              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
