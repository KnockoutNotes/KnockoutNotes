-- KnockoutNotes D1 Database Schema Migration
-- Migration: 0005_workstation_markers.sql
-- Stores admin-customized 3D Anaesthesia Workstation component markers, labels and positions.
-- Allows real-time repositioning and labelling adjustments from the /admin portal.
--
-- NOT applied automatically by this repo's build (build command is `exit 0`,
-- no CI migration step). Apply manually with your own Cloudflare credentials:
--   wrangler d1 migrations apply knockoutnotes-db --remote

CREATE TABLE IF NOT EXISTS workstation_markers (
    id TEXT PRIMARY KEY DEFAULT 'default',  -- single config row 'default'
    components_json TEXT NOT NULL,         -- JSON array of component objects with {id, name, view, system, summary, function, safety, viva, position: {x,y,z}}
    updated_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_workstation_markers_updated ON workstation_markers(updated_at);
