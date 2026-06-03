CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  quest_type VARCHAR(50) NOT NULL,
  points_reward INTEGER DEFAULT 0,
  badge_id UUID,
  match_id VARCHAR(100),
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  eligibility JSONB DEFAULT '{}',
  is_sponsored BOOLEAN DEFAULT FALSE,
  sponsor_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quests_type ON quests(quest_type);
CREATE INDEX idx_quests_active ON quests(is_active, starts_at, expires_at);
CREATE INDEX idx_quests_match ON quests(match_id);