import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { questsApi } from '../lib/api'

export default function Quests() {
  const navigate = useNavigate()
  const [quests, setQuests] = useState<any[]>([])

  useEffect(() => {
    questsApi.list().then(r => setQuests(r.data.data))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ borderBottom: '1px solid #1a1a1a', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1D9E75', margin: 0, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>FanCurva</h1>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>Dashboard</button>
      </div>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
        <h2 style={{ marginBottom: 24 }}>All Quests</h2>
        {quests.map((quest) => (
          <div key={quest.id} style={{ background: '#111', borderRadius: 10, padding: '20px', marginBottom: 12, border: '1px solid #1a1a1a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700 }}>{quest.title}</div>
              <div style={{ color: '#1D9E75', fontWeight: 700 }}>+{quest.points_reward} pts</div>
            </div>
            <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>{quest.description}</div>
            <div style={{ fontSize: 12, color: '#444', marginTop: 8 }}>
              Expires: {new Date(quest.expires_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
