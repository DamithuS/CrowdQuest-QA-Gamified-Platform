import { useRef, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import LeaderboardPage from './pages/LeaderboardPage'
import MySubmissionsPage from './pages/MySubmissionsPage'
import SubmitBugPage from './pages/SubmitBugPage'
import ProtectedRoute from './components/ProtectedRoute'

const AUTH_PAGES = ['/dashboard', '/profile', '/my-submissions', '/submit-bug', '/leaderboard']

function shouldAnimate(from, to) {
  if (!from || from === to) return false
  if (from === '/' && ['/login', '/register'].includes(to)) return true
  if (['/login', '/register'].includes(from) && to === '/dashboard') return true
  if (AUTH_PAGES.includes(from) && to === '/') return true
  return false
}

export default function App() {
  const location = useLocation()
  const prevPath = useRef(null)
  const animate = shouldAnimate(prevPath.current, location.pathname)

  useEffect(() => {
    prevPath.current = location.pathname
  }, [location.pathname])

  const wrap = (el) => (
    <motion.div
      initial={animate ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ height: '100%' }}
    >
      {el}
    </motion.div>
  )

  return (
    <Routes location={location} key={location.pathname}>
        <Route path="/" element={wrap(<LandingPage />)} />
        <Route path="/login" element={wrap(<LoginPage />)} />
        <Route path="/register" element={wrap(<LoginPage />)} />
        <Route path="/leaderboard" element={wrap(<LeaderboardPage />)} />

        <Route path="/dashboard"      element={wrap(<ProtectedRoute><DashboardPage /></ProtectedRoute>)} />
        <Route path="/profile"        element={wrap(<ProtectedRoute><ProfilePage /></ProtectedRoute>)} />
        <Route path="/my-submissions" element={wrap(<ProtectedRoute><MySubmissionsPage /></ProtectedRoute>)} />
        <Route path="/submit-bug"     element={wrap(<ProtectedRoute><SubmitBugPage /></ProtectedRoute>)} />
      </Routes>
  )
}
