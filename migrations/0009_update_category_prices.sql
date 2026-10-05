-- KnockoutNotes D1 Database Schema Migration
-- Migration: 0008_update_category_prices.sql
-- Updates legacy default prices (49 INR) to category specific defaults:
-- - Anaesthesia chapters: ₹9.0
-- - Critical Care chapters: ₹19.0
-- - Drug chapters: ₹12.0
-- Preserves all custom prices previously configured by admin or user.

-- 1. Critical Care chapters (49 -> 19)
UPDATE chapter_prices
SET price_inr = 19.0, updated_at = datetime('now')
WHERE price_inr = 49.0
  AND (
    category LIKE 'cc_%'
    OR category IN ('critical_care', 'critical', 'shock', 'respiratory', 'abg', 'antibiotics', 'poisoning')
    OR chapter_id LIKE 'cc-%'
    OR chapter_id LIKE 'cc_%'
    OR chapter_id IN (
      'icu-analgosedation-padis-delirium',
      'opioid-induced-hyperalgesia-tolerance-tapering',
      'novel-non-opioid-analgesic-pharmacology',
      'trauma-burn-procedural-analgesia-icu',
      'cancer-pain-opioid-rotation-palliative',
      'interventional-sympathetic-nerve-blocks'
    )
  );

-- 2. Drug Monographs (49 -> 12)
UPDATE chapter_prices
SET price_inr = 12.0, updated_at = datetime('now')
WHERE price_inr = 49.0
  AND category IN (
    'induction', 'relaxants', 'reversal', 'opioids', 'nsaids',
    'vasopressors', 'antihypertensives', 'alpha2', 'local',
    'steroids', 'antidiabetics', 'pregnancy', 'miscellaneous', 'drugs'
  );

-- 3. All remaining Anaesthesia chapters (49 -> 9)
UPDATE chapter_prices
SET price_inr = 9.0, updated_at = datetime('now')
WHERE price_inr = 49.0;
