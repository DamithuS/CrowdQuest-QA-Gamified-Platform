import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

// ─── Hero right-side illustration ────────────────────────────────────────────
function HeroIllustration() {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 520, margin: '0 auto', userSelect: 'none', minHeight: 340 }}>

      {/* "+120 Points Earned" floating badge – top left */}
      <div style={{
        position: 'absolute', top: 10, left: 20, zIndex: 10,
        background: '#fff', borderRadius: 12, padding: '8px 14px',
        boxShadow: '0 4px 16px rgba(79,70,229,0.12)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{ width: 30, height: 30, background: '#F8FAFC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>+120 Points Earned</span>
      </div>

      {/* Main screen/device card */}
      <div style={{
        background: '#fff', borderRadius: 20, boxShadow: '0 8px 32px rgba(79,70,229,0.10)',
        padding: '20px 24px 24px', margin: '52px 0 0 60px',
      }}>
        {/* Browser dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fca5a5' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fde68a' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#86efac' }} />
        </div>

        {/* Bug crosshair graphic */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px 0 16px' }}>
          <div style={{ position: 'relative' }}>
            {/* Outer ring */}
            <div style={{
              width: 110, height: 110, borderRadius: '50%',
              border: '3px solid #c7d2fe',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* Bug icon */}
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2l1.5 1.5" /><path d="M14.5 3.5L16 2" />
                <path d="M9 7.5C9 5.6 10.3 4 12 4s3 1.6 3 3.5" />
                <path d="M6.5 9H4a1 1 0 0 0-1 1v.5a1 1 0 0 0 1 1h2.5" />
                <path d="M17.5 9H20a1 1 0 0 1 1 1v.5a1 1 0 0 1-1 1h-2.5" />
                <path d="M6.5 16H4a1 1 0 0 0-1 1v.5a1 1 0 0 0 1 1h2.5" />
                <path d="M17.5 16H20a1 1 0 0 1 1 1v.5a1 1 0 0 1-1 1h-2.5" />
                <rect x="9" y="7" width="6" height="13" rx="3" />
                <path d="M9 12h6" /><path d="M12 7v13" />
              </svg>
            </div>
            {/* Crosshair arms */}
            <div style={{ position: 'absolute', top: '50%', left: -24, width: 20, height: 2, background: '#c7d2fe', marginTop: -1 }} />
            <div style={{ position: 'absolute', top: '50%', right: -24, width: 20, height: 2, background: '#c7d2fe', marginTop: -1 }} />
            <div style={{ position: 'absolute', top: -24, left: '50%', width: 2, height: 20, background: '#c7d2fe', marginLeft: -1 }} />
            <div style={{ position: 'absolute', bottom: -24, left: '50%', width: 2, height: 20, background: '#c7d2fe', marginLeft: -1 }} />
          </div>
        </div>

        {/* Skeleton content lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', marginTop: 12 }}>
          <div style={{ height: 8, width: '70%', background: '#e0e7ff', borderRadius: 4 }} />
          <div style={{ height: 8, width: '45%', background: '#eef2ff', borderRadius: 4 }} />
        </div>
      </div>

      {/* Mini leaderboard floating card – left */}
      <div style={{
        position: 'absolute', top: 100, left: 0, zIndex: 10,
        background: '#fff', borderRadius: 12, padding: '10px 14px',
        boxShadow: '0 4px 16px rgba(79,70,229,0.12)', minWidth: 130,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>Top Testers</span>
        </div>
        {[['Kavindu Perera', '#fde68a'], ['Dilshan Fernando', '#a5b4fc'], ['Thisara Silva', '#6ee7b7']].map(([name, dot], i) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
            <span style={{ fontSize: 11, color: '#9ca3af', width: 10 }}>{i + 1}</span>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: dot }} />
            <span style={{ fontSize: 11, color: '#6b7280' }}>{name}</span>
          </div>
        ))}
      </div>

      {/* "Bug Accepted!" floating badge – right */}
      <div style={{
        position: 'absolute', bottom: 60, right: 0, zIndex: 10,
        background: '#fff', borderRadius: 12, padding: '8px 14px',
        boxShadow: '0 4px 16px rgba(79,70,229,0.12)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{ width: 24, height: 24, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>Bug Accepted!</span>
      </div>

      {/* Trophy */}
      <div style={{ position: 'absolute', bottom: 8, right: 30, opacity: 0.75, zIndex: 5 }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#A5B4FC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
      </div>

      {/* Shield badge */}
      <div style={{ position: 'absolute', bottom: 8, right: -10, opacity: 0.5, zIndex: 4 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A5B4FC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
    </div>
  )
}

// ─── Step card for "How it works" ────────────────────────────────────────────
function StepCard({ number, iconBg, iconStroke, icon, title, description }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, padding: '0 12px' }}>
      {/* Number bubble */}
      <div style={{
        width: 38, height: 38, borderRadius: '50%',
        background: iconBg, color: '#fff',
        fontSize: 15, fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {number}
      </div>
      {/* Icon circle */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: iconBg + '20',
        border: `2px solid ${iconBg}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={iconStroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{title}</h3>
      <p style={{ fontSize: 13, color: '#6b7280', maxWidth: 170, lineHeight: 1.6 }}>{description}</p>
    </div>
  )
}

// ─── Dashed arrow connector ───────────────────────────────────────────────────
function Connector() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', paddingTop: 50, flexShrink: 0 }}>
      <svg width="56" height="14" viewBox="0 0 56 14">
        <line x1="2" y1="7" x2="44" y2="7" stroke="#c7d2fe" strokeWidth="2" strokeDasharray="5 3" />
        <polyline points="38,3 48,7 38,11" fill="none" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

// ─── Feature card for "Why Join" ─────────────────────────────────────────────
function FeatureCard({ iconBg, iconStroke, icon, title, description }) {
  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', boxShadow: '0 1px 8px rgba(79,70,229,0.07)', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ width: 50, height: 50, background: iconBg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{title}</h3>
      <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65 }}>{description}</p>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
const W = { maxWidth: 1200, margin: '0 auto', padding: '0 32px' }

export default function LandingPage() {
  const { user } = useAuth()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ECEEF5' }}>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, #312E81 100%)', width: '100%' }}>
      <section style={{ ...W, width: '100%', padding: '72px 32px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
        {/* Left copy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <img src="/Logo.png" alt="CrowdQuestQA" style={{ width: 280, height: 'auto', filter: 'brightness(0) invert(1)' }} />
          <h1 style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1.5px', color: '#F1F5F9' }}>
            Find Bugs.<br />
            Earn Points.<br />
            <span style={{ color: '#A5B4FC' }}>Improve Software.</span>
          </h1>
          <p style={{ fontSize: 16, color: '#94A3B8', lineHeight: 1.7, maxWidth: 420 }}>
            CrowdQuestQA is a gamified platform where testers like you find bugs,
            earn rewards, and help build better software for everyone.
          </p>
          <div>
            <Link to={user ? '/submit-bug' : '/login'} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#6366F1', color: '#fff', fontWeight: 700,
              fontSize: 15, padding: '13px 28px', borderRadius: 10,
              textDecoration: 'none', border: 'none',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Start Testing Now
            </Link>
          </div>
        </div>

        {/* Right illustration */}
        <HeroIllustration />
      </section>
      </div>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '64px 0' }}>
        <div style={W}>
          <h2 style={{ fontSize: 30, fontWeight: 800, textAlign: 'center', color: '#111827', marginBottom: 48, letterSpacing: '-0.5px' }}>
            How CrowdQuestQA Works
          </h2>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 0 }}>
            <StepCard
              number="1"
              iconBg="#6366F1"
              iconStroke="#6366F1"
              icon={<><path d="M8 2l1.5 1.5"/><path d="M14.5 3.5L16 2"/><path d="M9 7.5C9 5.6 10.3 4 12 4s3 1.6 3 3.5"/><path d="M6.5 9H4a1 1 0 0 0-1 1v.5a1 1 0 0 0 1 1h2.5"/><path d="M17.5 9H20a1 1 0 0 1 1 1v.5a1 1 0 0 1-1 1h-2.5"/><rect x="9" y="7" width="6" height="13" rx="3"/><path d="M9 12h6"/></>}
              title="Report Bugs"
              description="Submit structured bug reports with steps, screenshots, and device details."
            />
            <Connector />
            <StepCard
              number="2"
              iconBg="#22c55e"
              iconStroke="#22c55e"
              icon={<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>}
              title="Earn Points"
              description="Get rewarded based on the quality and accuracy of your reports."
            />
            <Connector />
            <StepCard
              number="3"
              iconBg="#f59e0b"
              iconStroke="#f59e0b"
              icon={<><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></>}
              title="Climb the Leaderboard"
              description="Compete with other testers and gain recognition for your top contributions."
            />
          </div>
        </div>
      </section>

      {/* ── Why Join ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '64px 0' }}>
        <div style={W}>
          <h2 style={{ fontSize: 30, fontWeight: 800, textAlign: 'center', color: '#111827', marginBottom: 40, letterSpacing: '-0.5px' }}>
            Why Join CrowdQuestQA?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            <FeatureCard
              iconBg="#e0e7ff"
              iconStroke="#6366F1"
              icon={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>}
              title="Report Bugs"
              description="Submit structured bug reports with steps, screenshots and device details."
            />
            <FeatureCard
              iconBg="#dcfce7"
              iconStroke="#16a34a"
              icon={<><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></>}
              title="Earn Points"
              description="Get points and badges for valid, high-quality reports."
            />
            <FeatureCard
              iconBg="#fef9c3"
              iconStroke="#ca8a04"
              icon={<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>}
              title="Top the Leaderboard"
              description="Compete with testers worldwide and earn recognition for your contributions."
            />
            <FeatureCard
              iconBg="#dbeafe"
              iconStroke="#2563eb"
              icon={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></>}
              title="Improve Quality"
              description="Help developers build better, more reliable software for everyone."
            />
          </div>
        </div>
      </section>

      <div style={{ flex: 1 }} />
      <Footer />
    </div>
  )
}
