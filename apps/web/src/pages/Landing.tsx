import { usePrivy } from '@privy-io/react-auth'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'

export default function Landing() {
  const { authenticated } = usePrivy()
  const { isOnboarded } = useUserStore()
  const navigate = useNavigate()

  function handleCTA() {
    if (authenticated && isOnboarded) navigate('/dashboard')
    else if (authenticated) navigate('/onboarding')
    else navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: 600, padding: '0 24px' }}>
        <h1 style={{ fontSize: 56, fontWeight: 800, color: '#1D9E75', marginBottom: 8 }}>FanCurva</h1>
        <p style={{ fontSize: 22, color: '#888', marginBottom: 8 }}>Your passport to the World Cup 2026</p>
        <p style={{ fontSize: 16, color: '#666', marginBottom: 48 }}>
          Collect badges. Complete missions. Represent your team.<br />
          Every match. Every goal. Every moment — earned and owned.
        </p>
        <button
          onClick={handleCTA}
          style={{ background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, padding: '16px 48px', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}
        >
          Get Your Passport
        </button>
        <p style={{ marginTop: 24, color: '#444', fontSize: 14 }}>
          World Cup 2026 · June 11 – July 19 · USA · Canada · Mexico
        </p>
      </div>
    </div>
  )
}
