-- KnockoutNotes D1 Database Schema Migration
-- Migration: 0006_user_accounts_workspace.sql
-- Adds User Accounts, Sessions, Universal Bookmarks, Personal Notes & Contextual Sticky Notes

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'pending_verification', 'suspended'
    verification_token TEXT UNIQUE,
    verified_at TEXT,
    reset_token TEXT UNIQUE,
    reset_expires_at TEXT,
    last_login_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- 2. USER SESSIONS TABLE
CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- 3. USER BOOKMARKS TABLE (Universal Bookmarking)
CREATE TABLE IF NOT EXISTS user_bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id TEXT NOT NULL,      -- e.g. "hemodynamics-shock-approach", "propofol", "pearl-1"
    content_type TEXT NOT NULL,    -- 'topic', 'drug', 'pearl', 'note', 'question', 'critical_care', 'calculator', 'coderoom', 'regional', 'workstation', 'other'
    title TEXT NOT NULL,           -- Display label
    route TEXT NOT NULL,           -- e.g. "study.html?item=propofol", "pearls.html#pearl-1"
    category TEXT,                 -- e.g. "ICU Shock & Hemodynamics", "Induction Agents"
    metadata TEXT,                 -- JSON blob for extra details (icon, tag, citation)
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, content_id)    -- Prevent duplicate bookmarks per user
);

CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_content ON user_bookmarks(content_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_type ON user_bookmarks(user_id, content_type);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_created_at ON user_bookmarks(created_at);

-- 4. USER PERSONAL NOTES TABLE (Stand-alone and Contextually Linked Notes)
CREATE TABLE IF NOT EXISTS user_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,            -- Formatted text / Markdown
    content_id TEXT,               -- Optional linked content identifier
    content_type TEXT,             -- Optional linked content type
    content_title TEXT,            -- Display title of linked resource
    route TEXT,                    -- Navigation route to linked resource
    tags TEXT,                     -- Comma-separated or JSON array of user tags
    is_pinned INTEGER DEFAULT 0,   -- 1 = pinned at top
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_content_id ON user_notes(user_id, content_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_updated_at ON user_notes(updated_at);

-- 5. USER STICKY NOTES TABLE (Compact Contextual Annotations)
CREATE TABLE IF NOT EXISTS user_sticky_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id TEXT NOT NULL,      -- Linked educational item
    content_type TEXT NOT NULL,
    content_title TEXT NOT NULL,
    route TEXT NOT NULL,
    note_text TEXT NOT NULL,       -- Short annotation
    color TEXT DEFAULT 'yellow',   -- 'yellow', 'cyan', 'green', 'rose', 'purple'
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_user_sticky_notes_user_id ON user_sticky_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sticky_notes_content ON user_sticky_notes(user_id, content_id);
