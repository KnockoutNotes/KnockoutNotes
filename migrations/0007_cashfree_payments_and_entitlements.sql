-- KnockoutNotes D1 Database Schema Migration
-- Migration: 0007_cashfree_payments_and_entitlements.sql
-- Implements Live Cashfree Payment Integration, Chapter Pricing, Entitlements & PDF Downloads

-- 1. CHAPTER PRICING TABLE (Server-controlled pricing in INR)
CREATE TABLE IF NOT EXISTS chapter_prices (
    chapter_id TEXT PRIMARY KEY,               -- e.g. "preop-assessment", "default"
    title TEXT NOT NULL,                      -- Display title
    category TEXT,                            -- Category label
    price_inr REAL NOT NULL DEFAULT 49.0,     -- Price in INR
    is_active INTEGER NOT NULL DEFAULT 1,     -- 1 = active, 0 = disabled
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_chapter_prices_active ON chapter_prices(is_active);

-- Insert global default fallback price (₹49)
INSERT OR IGNORE INTO chapter_prices (chapter_id, title, category, price_inr, is_active)
VALUES ('default', 'Standard Chapter PDF', 'Study Notes', 49.0, 1);

-- 2. ORDERS / PURCHASES TABLE
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT UNIQUE NOT NULL,             -- Unique internal ID e.g. "order_kn_1728000000_abc123"
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    chapter_id TEXT NOT NULL,
    chapter_title TEXT NOT NULL,
    amount_inr REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    cf_order_id TEXT,                          -- Cashfree order ID
    cf_payment_id TEXT,                        -- Cashfree payment reference ID
    payment_session_id TEXT,                   -- Cashfree payment session ID
    payment_status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'SUCCESS', 'FAILED', 'USER_DROPPED', 'CANCELLED', 'REFUNDED'
    payment_method TEXT,                       -- 'upi', 'card', 'netbanking', 'wallet'
    raw_cf_response TEXT,                      -- JSON audit log of gateway response
    verified_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_chapter_id ON orders(chapter_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- 3. CHAPTER ENTITLEMENTS TABLE (Grants user verified access to download chapter PDFs)
CREATE TABLE IF NOT EXISTS chapter_entitlements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    chapter_id TEXT NOT NULL,
    order_id TEXT REFERENCES orders(order_id), -- NULL if granted via admin exemption
    granted_by TEXT NOT NULL DEFAULT 'payment', -- 'payment', 'admin_exempt', 'manual'
    download_count INTEGER NOT NULL DEFAULT 0,
    last_downloaded_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, chapter_id)
);

CREATE INDEX IF NOT EXISTS idx_chapter_entitlements_user ON chapter_entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_chapter_entitlements_user_chapter ON chapter_entitlements(user_id, chapter_id);

-- 4. PDF CACHE METADATA TABLE (Optional server-side caching of generated PDF versions)
CREATE TABLE IF NOT EXISTS generated_pdfs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chapter_id TEXT UNIQUE NOT NULL,
    content_hash TEXT NOT NULL,                -- Hash of chapter sections/name
    file_size INTEGER NOT NULL,
    generated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_generated_pdfs_chapter ON generated_pdfs(chapter_id);
