import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { setAuthToken, usersApi } from './lib/api'
import { useUserStore } from './store/userStore'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Passport from './pages/Passport'
import Quests from './pages/Quests'
import Leaderboard from './pages/Leaderboard'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authenticated, ready } = usePrivy()
  const { isOnboarded } = useUserStore()

  if (!ready) return <div className="loading">Loading...</div>
  if (!authenticated) return <Navigate to="/login" replace />
  if (!isOnboarded) return <Navigate to="/onboarding" replace />

  return <>{children}</>
}

function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { authenticated, ready } = usePrivy()
  const { isOnboarded } = useUserStore()

  if (!ready) return <div className="loading">Loading...</div>
  if (!authenticated) return <Navigate to="/login" replace />
  if (isOnboarded) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}

export default function App() {
  const { ready, authenticated, getAccessToken, user } = usePrivy()
  const { setUser, setLoading, reset } = useUserStore()

  useEffect(() => {
    if (!ready) return

    if (!authenticated) {
      setAuthToken(null)
      reset()
      return
    }

    // Get Privy token and sync user with our backend
    async function syncUser() {
      try {
        setLoading(true)
        const token = await getAccessToken()
        setAuthToken(token)

        const response = await usersApi.me()
        setUser(response.data.data)
      } catch (err: any) {
        // 404 means user exists in Privy but not yet in our DB
        // They need to complete onboarding
        if (err.response?.status === 404) {
          setUser(null)
        }
      } finally {
        setLoading(false)
      }
    }

    syncUser()
  }, [ready, authenticated])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/join" element={<Login />} />
        <Route
          path="/onboarding"
          element={
            <OnboardingRoute>
              <Onboarding />
            </OnboardingRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/passport"
          element={
            <ProtectedRoute>
              <Passport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quests"
          element={
            <ProtectedRoute>
              <Quests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
