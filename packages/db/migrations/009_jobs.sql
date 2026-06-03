CREATE TABLE async_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  payload JSONB DEFAULT '{}',
  result JSONB,
  tx_hash VARCHAR(255),
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_status ON async_jobs(status);
CREATE INDEX idx_jobs_type ON async_jobs(job_type);