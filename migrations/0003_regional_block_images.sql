-- KnockoutNotes D1 Database Schema Migration
-- Migration: 0003_regional_block_images.sql
-- Real (or properly licensed reference) ultrasound image overrides for the
-- Regional Anaesthesia section, set per block from the admin panel. Stores a
-- URL + attribution only (no binary) so it does not depend on the R2 bucket
-- binding. See worker/regional-images.js.
--
-- NOT applied automatically by this repo's build (build command is `exit 0`,
-- no CI migration step). Apply manually with your own Cloudflare credentials:
--   wrangler d1 migrations apply knockoutnotes-db --remote

CREATE TABLE IF NOT EXISTS regional_block_images (
    block_id TEXT PRIMARY KEY,             -- matches a block id in regional-data.js, e.g. "tap"
    image_url TEXT NOT NULL,               -- absolute https URL to the real/reference image
    source TEXT NOT NULL DEFAULT 'KnockoutNotes / user-provided', -- 'NYSORA' | 'KnockoutNotes / user-provided' | 'Other'
    attribution TEXT,                      -- e.g. "Source: NYSORA.COM" — required when source = 'NYSORA'
    orientation TEXT,                      -- 'transverse' | 'longitudinal' | 'oblique'
    probe TEXT,                            -- 'linear' | 'curvilinear'
    notes TEXT,                            -- free-text admin notes (not shown publicly)
    updated_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_regional_block_images_updated ON regional_block_images(updated_at);
