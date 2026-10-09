-- KnockoutNotes D1 Database Schema Migration
-- Migration: 0010_payment_invoices.sql
-- Implements Downloadable PDF Invoices for User Purchases in Workspace & Profile

CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT UNIQUE NOT NULL,      -- e.g. "INV-KN-2026-00001"
    order_id TEXT UNIQUE NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT,
    user_email TEXT NOT NULL,
    item_title TEXT NOT NULL,
    amount_inr REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    cf_payment_id TEXT,
    payment_status TEXT NOT NULL DEFAULT 'PAID',
    payment_method TEXT,
    invoice_date TEXT NOT NULL DEFAULT (datetime('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
