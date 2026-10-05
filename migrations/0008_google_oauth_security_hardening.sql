-- KnockoutNotes D1 Database Schema Migration
-- Migration: 0008_google_oauth_security_hardening.sql
-- Adds Google OAuth verified provider identity columns and indexing

ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'local';
ALTER TABLE users ADD COLUMN google_sub TEXT;

CREATE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub);
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider);
