import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { leaderboardApi } from '../lib/api'
import { useUserStore } from '../store/userStore'

export default function Leaderboard() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const [entries, setEntries] = useState<any[]>([])
  const [scope, setScope] = useState('overall')

  useEffect(() => {
    leaderboardApi.get({ scope, limit: 50 }).then(r => setEntries(r.data.data.entries))
  }, [scope])

  const tierColors: Record<string, string> = {
    supporter: '#888', true_fan: '#4A9EFF', ultras: '#C084FC', legend: '#FFD700'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ borderBottom: '1px solid #1a1a1a', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1D9E75', margin: 0, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>FanCurva</h1>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>Dashboard</button>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
        <h2 style={{ marginBottom: 24 }}>Leaderboard</h2>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['overall', 'team'].map(s => (
            <button key={s} onClick={() => setScope(s)} style={{ background: scope === s ? '#1D9E75' : '#111', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', textTransform: 'capitalize' }}>{s}</button>
          ))}
        </div>

        {entries.map((entry, i) => (
          <div key={entry.id} style={{ background: entry.id === user?.id ? '#0F3D2E' : '#111', borderRadius: 10, padding: '16px 20px', marginBottom: 8, border: entry.id === user?.id ? '1px solid #1D9E75' : '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: i < 3 ? '#FFD700' : '#444', width: 32, textAlign: 'center' }}>#{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{entry.display_name} {entry.id === user?.id ? '(you)' : ''}</div>
              <div style={{ fontSize: 13, color: '#666' }}>{entry.team_code || 'Tournament'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, color: '#1D9E75' }}>{entry.points}</div>
              <div style={{ fontSize: 11, color: tierColors[entry.status_tier] || '#888', textTransform: 'capitalize' }}>{entry.status_tier?.replace('_', ' ')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
