CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  privy_id VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  wallet_address VARCHAR(255) UNIQUE,
  wallet_type VARCHAR(20) DEFAULT 'embedded',
  email VARCHAR(255),
  passport_type VARCHAR(20),
  team_code VARCHAR(10),
  status_tier VARCHAR(20) DEFAULT 'supporter',
  points INTEGER DEFAULT 0,
  referral_code VARCHAR(20) UNIQUE,
  referred_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_privy_id ON users(privy_id);
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_team ON users(team_code);
CREATE INDEX idx_users_points ON users(points DESC);