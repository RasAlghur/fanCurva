CREATE TABLE watch_parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_user_id UUID NOT NULL REFERENCES users(id),
  match_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) DEFAULT 'in_person',
  location JSONB,
  streaming_url TEXT,
  host_code VARCHAR(20) UNIQUE NOT NULL,
  max_attendees INTEGER,
  checkin_opens_at TIMESTAMPTZ,
  checkin_closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE watch_party_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  party_id UUID NOT NULL REFERENCES watch_parties(id),
  user_id UUID NOT NULL REFERENCES users(id),
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(party_id, user_id)
);

CREATE INDEX idx_parties_match ON watch_parties(match_id);
CREATE INDEX idx_checkins_party ON watch_party_checkins(party_id);
CREATE INDEX idx_checkins_user ON watch_party_checkins(user_id);