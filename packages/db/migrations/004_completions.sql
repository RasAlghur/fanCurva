CREATE TABLE quest_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES quests(id),
  points_awarded INTEGER DEFAULT 0,
  badge_mint_job_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);

CREATE INDEX idx_completions_user ON quest_completions(user_id);
CREATE INDEX idx_completions_quest ON quest_completions(quest_id);
CREATE INDEX idx_completions_date ON quest_completions(completed_at DESC);