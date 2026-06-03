CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_id INTEGER UNIQUE,
  contract_address VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_uri TEXT,
  badge_type VARCHAR(50) NOT NULL,
  is_soulbound BOOLEAN DEFAULT TRUE,
  max_supply INTEGER,
  minted_count INTEGER DEFAULT 0,
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  attributes JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE badge_holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id),
  token_id INTEGER,
  tx_hash VARCHAR(255),
  minted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_badges_type ON badges(badge_type);
CREATE INDEX idx_holdings_user ON badge_holdings(user_id);
CREATE INDEX idx_holdings_badge ON badge_holdings(badge_id);