-- KnockoutNotes D1 Database Schema Migration
-- Migration: 0002_admin_cms_r2.sql
-- Adds CMS Content Management, Category Hierarchy, File Assets, and Admin Audit Logging

-- 1. CATEGORIES TABLE (Hierarchical Categories for Notes, Pearls, Calculators, Updates)
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    type TEXT NOT NULL DEFAULT 'notes', -- 'notes', 'pearls', 'calculators', 'updates', 'general'
    kicker TEXT,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- 2. CONTENT TABLE (Unified CMS repository for Notes, Clinical Pearls, Calculator Metadata, Updates)
CREATE TABLE IF NOT EXISTS content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_type TEXT NOT NULL, -- 'note', 'pearl', 'calculator', 'update'
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    subcategory TEXT,
    summary TEXT,
    body TEXT, -- Markdown or formatted HTML
    extra_data TEXT, -- JSON blob for type-specific properties (e.g. calculator formula ID, tags, clinical citations, author info)
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived'
    featured_image TEXT, -- URL or storage key
    author TEXT DEFAULT 'KnockoutNotes Editorial',
    published_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_content_type_status ON content(content_type, status);
CREATE INDEX IF NOT EXISTS idx_content_slug ON content(slug);
CREATE INDEX IF NOT EXISTS idx_content_category ON content(category_id);
CREATE INDEX IF NOT EXISTS idx_content_published_at ON content(published_at);

-- 3. FILES TABLE (Metadata for uploaded documents, monograph images, charts, and media)
CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    storage_key TEXT UNIQUE NOT NULL,
    folder TEXT NOT NULL DEFAULT 'general', -- 'notes', 'pearls', 'calculators', 'updates', 'images', 'documents', 'general'
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL, -- In bytes
    storage_type TEXT NOT NULL DEFAULT 'r2', -- 'r2', 'local', 'external'
    public_url TEXT,
    uploaded_by TEXT DEFAULT 'admin',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_files_storage_key ON files(storage_key);
CREATE INDEX IF NOT EXISTS idx_files_folder ON files(folder);
CREATE INDEX IF NOT EXISTS idx_files_mime_type ON files(mime_type);

-- 4. CONTENT_FILES TABLE (Junction tracking file references to prevent accidental deletion)
CREATE TABLE IF NOT EXISTS content_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE RESTRICT,
    role TEXT DEFAULT 'attachment', -- 'featured_image', 'monograph', 'attachment', 'inline'
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_content_files_content ON content_files(content_id);
CREATE INDEX IF NOT EXISTS idx_content_files_file ON content_files(file_id);

-- 5. ADMIN_AUDIT_LOGS TABLE (Security and action audit trail for administrative activities)
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_username TEXT NOT NULL,
    action TEXT NOT NULL, -- 'login', 'logout', 'content_create', 'content_update', 'content_delete', 'file_upload', 'file_delete', 'broadcast_send', 'subscriber_modify'
    target_type TEXT, -- 'content', 'file', 'subscriber', 'category', 'session', 'broadcast'
    target_id TEXT,
    details TEXT, -- JSON summary or descriptive string
    ip_address TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at);

-- 6. SEED INITIAL CORE CLINICAL CATEGORIES
INSERT OR IGNORE INTO categories (name, slug, type, kicker, description, display_order) VALUES
('Cardiology & Hemodynamics', 'cardiology', 'notes', 'Cardiovascular', 'Clinical cardiology notes, hemodynamic principles, pacing, and vasoactive pharmacology.', 1),
('Airway & Ventilation', 'airway-ventilation', 'notes', 'Respiratory', 'Difficult airway management, videolaryngoscopy algorithms, and lung-protective ventilation modes.', 2),
('Neuroanaesthesia & ICP', 'neuroanaesthesia', 'notes', 'Neuro', 'Intracranial pressure control, cerebral perfusion optimization, and spine surgery management.', 3),
('Obstetric Anaesthesia', 'obstetrics', 'notes', 'Obstetrics', 'Neuraxial techniques, pre-eclampsia protocols, and obstetric hemorrhage bundles.', 4),
('Paediatric Anaesthesia', 'paediatrics', 'notes', 'Paediatrics', 'Weight-based paediatric dosing, airway anatomy, fluid resuscitation, and emergency protocols.', 5),
('Clinical Pearls & High-Yield', 'pearls-general', 'pearls', 'High-Yield Pearls', 'Concise clinical pearls, exam viva rapid-fire reminders, and anesthesia pearls.', 6),
('Medical Calculators & Scores', 'calculators-general', 'calculators', 'Scores & Engines', 'Validated clinical scoring tools, Paediatric charts, and acid-base blood gas engines.', 7),
('Platform Updates & Log', 'updates-general', 'updates', 'Changelog', 'Announcements, content additions, algorithmic revisions, and protocol updates.', 8);
