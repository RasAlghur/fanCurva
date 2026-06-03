import { useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useUserStore } from '../store/userStore'

export default function Login() {
  const { login, authenticated, ready } = usePrivy()
  const { isOnboarded } = useUserStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const ref = searchParams.get('ref')

  // Store referral code so onboarding can use it
  if (ref) sessionStorage.setItem('referral_code', ref)

  useEffect(() => {
    if (!ready) return
    if (authenticated && isOnboarded) navigate('/dashboard')
    else if (authenticated) navigate('/onboarding')
  }, [ready, authenticated, isOnboarded])

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: '0 24px' }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: '#1D9E75', marginBottom: 8 }}>FanCurva</h1>
        <p style={{ color: '#888', marginBottom: 40 }}>Sign in to claim your fan passport</p>
        <button
          onClick={login}
          style={{ width: '100%', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, padding: '16px', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}
        >
          Sign In / Sign Up
        </button>
        <p style={{ marginTop: 16, color: '#444', fontSize: 13 }}>
          No wallet required. Sign in with email.
        </p>
      </div>
    </div>
  )
}
