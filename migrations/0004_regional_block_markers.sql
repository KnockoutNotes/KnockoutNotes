-- KnockoutNotes D1 Database Schema Migration
-- Migration: 0004_regional_block_markers.sql
-- Adds admin-editable structure-label markers, needle overlay and spread
-- overlay to the existing regional_block_images table, so an admin can fix
-- or add ultrasound annotation markers by hand for a block's real image
-- from the admin panel, instead of only being able to change the image URL.
-- See worker/regional-images.js and admin/index.html (Regional Images view).
--
-- NOT applied automatically by this repo's build (build command is `exit 0`,
-- no CI migration step). Apply manually with your own Cloudflare credentials:
--   wrangler d1 migrations apply knockoutnotes-db --remote

ALTER TABLE regional_block_images ADD COLUMN labels_json TEXT;   -- JSON array of {id,text,type,x,y} — structure markers, x/y are 0-100 (% of image)
ALTER TABLE regional_block_images ADD COLUMN needle_json TEXT;   -- JSON object {from:[x,y],to:[x,y]} or NULL — x/y are 0-100 (% of image)
ALTER TABLE regional_block_images ADD COLUMN spread_json TEXT;   -- JSON array of {shape:'ellipse',x,y,rx,ry,note?,variable?} — x/y/rx/ry are 0-100 (% of image)
