-- KnockoutNotes D1 Database Schema Migration
-- Migration: 0001_init_subscription_admin.sql

CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    name TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'unsubscribed', 'banned'
    verification_token TEXT UNIQUE,
    verification_expires_at TEXT,
    unsubscribe_token TEXT UNIQUE,
    source_page TEXT DEFAULT 'website',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    verified_at TEXT,
    unsubscribed_at TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_verification_token ON subscribers(verification_token);
CREATE INDEX IF NOT EXISTS idx_subscribers_unsubscribe_token ON subscribers(unsubscribe_token);

CREATE TABLE IF NOT EXISTS admin_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    admin_username TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_session_id ON admin_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);

CREATE TABLE IF NOT EXISTS notification_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL, -- 'update', 'notes', 'calculator', 'resource', 'broadcast'
    title TEXT NOT NULL,
    summary TEXT,
    content_url TEXT,
    idempotency_key TEXT UNIQUE,
    recipient_count INTEGER DEFAULT 0,
    sent_by TEXT DEFAULT 'admin',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notification_events_idempotency_key ON notification_events(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_notification_events_created_at ON notification_events(created_at);

CREATE TABLE IF NOT EXISTS email_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient_email TEXT NOT NULL COLLATE NOCASE,
    email_type TEXT NOT NULL, -- 'confirmation', 'welcome', 'notification', 'broadcast', 'admin_alert'
    status TEXT NOT NULL, -- 'queued', 'sent', 'failed'
    resend_id TEXT,
    error_message TEXT,
    event_id INTEGER REFERENCES notification_events(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_event_id ON email_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);
