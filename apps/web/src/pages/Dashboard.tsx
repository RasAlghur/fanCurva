import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { useUserStore } from '../store/userStore'
import { questsApi, pointsApi } from '../lib/api'

export default function Dashboard() {
  const { logout } = usePrivy()
  const { user, reset } = useUserStore()
  const navigate = useNavigate()
  const [quests, setQuests] = useState<any[]>([])
  const [points, setPoints] = useState<any>(null)
  const [completing, setCompleting] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    questsApi.list({ status: 'active' }).then(r => setQuests(r.data.data))
    if (user) pointsApi.get(user.id).then(r => setPoints(r.data.data))
  }, [user])

  async function completeQuest(quest_id: string) {
    setCompleting(quest_id)
    setMessage('')
    try {
      const res = await questsApi.complete(quest_id)
      const { points_awarded, new_status_tier } = res.data.data
      setMessage('+ ' + points_awarded + ' pts earned! Status: ' + new_status_tier)
      if (user) pointsApi.get(user.id).then(r => setPoints(r.data.data))
      questsApi.list({ status: 'active' }).then(r => setQuests(r.data.data))
    } catch (err: any) {
      setMessage(err.response?.data?.error?.message || 'Error completing quest')
    } finally {
      setCompleting(null)
    }
  }

  function handleLogout() {
    logout()
    reset()
    navigate('/')
  }

  const tierColors: Record<string, string> = {
    supporter: '#888', true_fan: '#4A9EFF', ultras: '#C084FC', legend: '#FFD700'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1a1a1a', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1D9E75', margin: 0 }}>FanCurva</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => navigate('/passport')} style={{ background: 'none', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>Passport</button>
          <button onClick={() => navigate('/leaderboard')} style={{ background: 'none', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>Leaderboard</button>
          <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #333', color: '#888', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        {/* User stats */}
        {user && (
          <div style={{ background: '#111', borderRadius: 12, padding: '24px', marginBottom: 32, border: '1px solid #1a1a1a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 24 }}>{user.display_name}</h2>
                <p style={{ margin: '4px 0 0', color: '#666', fontSize: 14 }}>
                  {user.team_code ? 'Team ' + user.team_code : 'No team selected'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#1D9E75' }}>{points?.total_points ?? user.points}</div>
                <div style={{ fontSize: 12, color: '#666' }}>points</div>
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 16 }}>
              <span style={{ background: '#1a1a1a', borderRadius: 6, padding: '4px 12px', fontSize: 13, color: tierColors[user.status_tier] || '#888', textTransform: 'capitalize' }}>
                {user.status_tier.replace('_', ' ')}
              </span>
              {points && (
                <span style={{ background: '#1a1a1a', borderRadius: 6, padding: '4px 12px', fontSize: 13, color: '#888' }}>
                  Rank #{points.rank_overall}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div style={{ background: '#0F3D2E', border: '1px solid #1D9E75', borderRadius: 8, padding: '12px 16px', marginBottom: 24, color: '#1D9E75' }}>
            {message}
          </div>
        )}

        {/* Quests */}
        <h3 style={{ color: '#888', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Active Quests</h3>
        {quests.length === 0 && (
          <p style={{ color: '#444' }}>No active quests right now. Check back on match day.</p>
        )}
        {quests.map((quest) => (
          <div key={quest.id} style={{ background: '#111', borderRadius: 10, padding: '20px', marginBottom: 12, border: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{quest.title}</div>
              <div style={{ color: '#666', fontSize: 14 }}>{quest.description}</div>
              <div style={{ marginTop: 8, fontSize: 13, color: '#1D9E75' }}>+{quest.points_reward} pts</div>
            </div>
            <button
              onClick={() => completeQuest(quest.id)}
              disabled={completing === quest.id}
              style={{ background: completing === quest.id ? '#333' : '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap', marginLeft: 16 }}
            >
              {completing === quest.id ? '...' : 'Complete'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
