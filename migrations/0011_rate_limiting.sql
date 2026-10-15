-- 0011_rate_limiting.sql
-- Cloudflare D1 persistent rate-limiting and progressive authentication lockout table

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  first_request_at INTEGER NOT NULL,
  last_request_at INTEGER NOT NULL,
  blocked_until INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked ON rate_limits (key, blocked_until);
