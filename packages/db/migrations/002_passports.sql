CREATE TABLE passports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_id INTEGER UNIQUE,
  contract_address VARCHAR(255),
  passport_type VARCHAR(20) NOT NULL,
  team_code VARCHAR(10),
  metadata_uri TEXT,
  tx_hash VARCHAR(255),
  minted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_passports_user ON passports(user_id);
CREATE INDEX idx_passports_token ON passports(token_id);