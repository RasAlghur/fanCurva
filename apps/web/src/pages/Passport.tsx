import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { passportsApi, badgesApi, referralsApi } from '../lib/api'

export default function Passport() {
  const { user } = useUserStore()
  const navigate = useNavigate()
  const [passport, setPassport] = useState<any>(null)
  const [badges, setBadges] = useState<any[]>([])
  const [referralLink, setReferralLink] = useState<any>(null)

  useEffect(() => {
    if (!user) return
    passportsApi.get(user.id).then(r => setPassport(r.data.data)).catch(() => {})
    badgesApi.myBadges(user.id).then(r => setBadges(r.data.data)).catch(() => {})
    referralsApi.getLink(user.id).then(r => setReferralLink(r.data.data)).catch(() => {})
  }, [user])

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ borderBottom: '1px solid #1a1a1a', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1D9E75', margin: 0, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>FanCurva</h1>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>Dashboard</button>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
        {/* Passport card */}
        <div style={{ background: 'linear-gradient(135deg, #0F3D2E, #085041)', borderRadius: 16, padding: '32px', marginBottom: 32, border: '1px solid #1D9E75' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Fan Passport · World Cup 2026</div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{user.display_name}</div>
              <div style={{ fontSize: 16, color: '#9FE1CB', marginTop: 4 }}>
                {passport?.team_code ? 'Team ' + passport.team_code : 'Tournament Passport'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#1D9E75' }}>{user.points}</div>
              <div style={{ fontSize: 12, color: '#9FE1CB' }}>points</div>
            </div>
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 24 }}>
            <div><div style={{ fontSize: 12, color: '#9FE1CB' }}>Status</div><div style={{ fontSize: 16, fontWeight: 700, textTransform: 'capitalize' }}>{user.status_tier.replace('_', ' ')}</div></div>
            <div><div style={{ fontSize: 12, color: '#9FE1CB' }}>Badges</div><div style={{ fontSize: 16, fontWeight: 700 }}>{badges.length}</div></div>
            <div><div style={{ fontSize: 12, color: '#9FE1CB' }}>Joined</div><div style={{ fontSize: 16, fontWeight: 700 }}>{new Date(user.created_at).toLocaleDateString()}</div></div>
          </div>
        </div>

        {/* Referral link */}
        {referralLink && (
          <div style={{ background: '#111', borderRadius: 12, padding: '20px', marginBottom: 32, border: '1px solid #1a1a1a' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Your Referral Link</h3>
            <div style={{ background: '#1a1a1a', borderRadius: 8, padding: '12px', fontSize: 13, color: '#1D9E75', wordBreak: 'break-all', marginBottom: 8 }}>
              {referralLink.referral_url}
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(referralLink.referral_url) }}
              style={{ background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}
            >
              Copy Link
            </button>
          </div>
        )}

        {/* Badges */}
        <h3 style={{ color: '#888', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>My Badges</h3>
        {badges.length === 0 && <p style={{ color: '#444' }}>No badges yet. Complete quests to earn your first badge.</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {badges.map((b) => (
            <div key={b.id} style={{ background: '#111', borderRadius: 10, padding: '16px', textAlign: 'center', border: '1px solid #1a1a1a' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🏅</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{b.name}</div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{b.badge_type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
