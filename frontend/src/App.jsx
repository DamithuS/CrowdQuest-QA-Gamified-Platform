import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import LeaderboardPage from './pages/LeaderboardPage'
import MySubmissionsPage from './pages/MySubmissionsPage'
import SubmitBugPage from './pages/SubmitBugPage'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<LoginPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />

      <Route path="/dashboard"       element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/profile"         element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/my-submissions"  element={<ProtectedRoute><MySubmissionsPage /></ProtectedRoute>} />
      <Route path="/submit-bug"      element={<ProtectedRoute><SubmitBugPage /></ProtectedRoute>} />
    </Routes>
  )
}
