/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useNavigate } from 'react-router-dom'
import { usersApi, passportsApi, setAuthToken } from '../lib/api'
import { useUserStore } from '../store/userStore'

const TEAMS = [
  { code: 'BRA', name: 'Brazil', flag: '🇧🇷' },
  { code: 'ARG', name: 'Argentina', flag: '🇦🇷' },
  { code: 'ENG', name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { code: 'FRA', name: 'France', flag: '🇫🇷' },
  { code: 'ESP', name: 'Spain', flag: '🇪🇸' },
  { code: 'GER', name: 'Germany', flag: '🇩🇪' },
  { code: 'NGA', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'GHA', name: 'Ghana', flag: '🇬🇭' },
  { code: 'USA', name: 'USA', flag: '🇺🇸' },
  { code: 'MEX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'POR', name: 'Portugal', flag: '🇵🇹' },
  { code: 'NED', name: 'Netherlands', flag: '🇳🇱' },
]

export default function Onboarding() {
  const { user, getAccessToken } = usePrivy()
  const { setUser } = useUserStore()
  const navigate = useNavigate()

  const [step, setStep] = useState<'profile' | 'team'>('profile')
  const [displayName, setDisplayName] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleProfileSubmit() {
    if (!displayName.trim()) { setError('Please enter a display name'); return }
    setError('')
    setStep('team')
  }

  async function handleComplete() {
    if (!selectedTeam) { setError('Please select a team'); return }
    setLoading(true)
    setError('')

    try {
      const token = await getAccessToken()
      setAuthToken(token)

      const referral_code = sessionStorage.getItem('referral_code') || undefined

      // 1. Create user in our DB
      const userResponse = await usersApi.create({
        display_name: displayName,
        email: user?.email?.address,
        referral_code,
      })
      const newUser = userResponse.data.data

      // 2. Mint passport
      await passportsApi.mint({
        user_id: newUser.id,
        passport_type: 'team',
        team_code: selectedTeam,
      })

      // 3. Clear referral code from session
      sessionStorage.removeItem('referral_code')

      // 4. Fetch fresh user state
      const refreshed = await usersApi.me()
      setUser(refreshed.data.data)

      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 500 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1D9E75', marginBottom: 4 }}>FanCurva</h1>
        <p style={{ color: '#888', marginBottom: 32 }}>Set up your fan passport</p>

        {step === 'profile' && (
          <div>
            <h2 style={{ fontSize: 22, marginBottom: 16 }}>Choose your name</h2>
            <input
              type="text"
              placeholder="e.g. SambaFan99"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: 8, border: '1px solid #333', background: '#111', color: '#fff', fontSize: 16, boxSizing: 'border-box' }}
            />
            {error && <p style={{ color: '#e55', marginTop: 8 }}>{error}</p>}
            <button
              onClick={handleProfileSubmit}
              style={{ marginTop: 16, width: '100%', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, padding: '14px', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
            >
              Continue
            </button>
          </div>
        )}

        {step === 'team' && (
          <div>
            <h2 style={{ fontSize: 22, marginBottom: 4 }}>Pick your team</h2>
            <p style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>This cannot be changed after you confirm.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
              {TEAMS.map((team) => (
                <button
                  key={team.code}
                  onClick={() => setSelectedTeam(team.code)}
                  style={{
                    padding: '12px 8px',
                    borderRadius: 8,
                    border: selectedTeam === team.code ? '2px solid #1D9E75' : '1px solid #333',
                    background: selectedTeam === team.code ? '#0F3D2E' : '#111',
                    color: '#fff',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 24 }}>{team.flag}</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>{team.name}</div>
                </button>
              ))}
            </div>
            {error && <p style={{ color: '#e55', marginTop: 8 }}>{error}</p>}
            <button
              onClick={handleComplete}
              disabled={loading || !selectedTeam}
              style={{ width: '100%', background: loading || !selectedTeam ? '#333' : '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, padding: '14px', fontSize: 16, fontWeight: 700, cursor: loading ? 'wait' : 'pointer' }}
            >
              {loading ? 'Minting your passport...' : 'Claim My Passport'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
