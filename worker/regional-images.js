/**
 * KnockoutNotes Regional Anaesthesia — Real Ultrasound Image Overrides
 *
 * Lets an admin attach a real (or properly licensed reference) ultrasound
 * image URL to a specific block, without a code change or redeploy. This is
 * separate from the R2 file manager: it stores only a URL + attribution
 * metadata in D1 (regional_block_images), not binary uploads, so it works
 * whether or not the R2 bucket binding is attached.
 *
 * The public regional-anaesthesia.html page fetches the full map (GET
 * /api/regional-images, no auth) at load and — for any block with an entry
 * here — shows that real image instead of the simulated fallback frame.
 *
 * Degrades gracefully: if migration 0003_regional_block_images.sql has not
 * been applied yet, every function here returns an empty/no-op result
 * instead of throwing, so neither the admin panel nor the public page break.
 */

const BLOCK_ID_RE = /^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/;
const ALLOWED_SOURCES = new Set(['NYSORA', 'KnockoutNotes / user-provided', 'Other']);
const STRUCTURE_TYPES = new Set([
  'muscle', 'nerve', 'artery', 'vein', 'bone', 'pleura', 'bowel', 'organ',
  'fascia', 'ligament', 'sheath', 'tendon', 'space', 'marker', 'point'
]);

async function tableExists(db) {
  try {
    await db.prepare('SELECT 1 FROM regional_block_images LIMIT 1').first();
    return true;
  } catch (_) {
    return false;
  }
}

// Marker columns (labels_json/needle_json/spread_json) were added by
// migration 0004, after the base table (migration 0003) — check separately
// so a site that has only applied 0003 still gets image overrides working,
// just without marker editing, instead of the whole feature breaking.
async function markerColumnsExist(db) {
  try {
    await db.prepare('SELECT labels_json, needle_json, spread_json FROM regional_block_images LIMIT 1').first();
    return true;
  } catch (_) {
    return false;
  }
}

function parseJsonSafe(text, fallback) {
  if (text == null) return fallback;
  try {
    const parsed = JSON.parse(text);
    return parsed == null ? fallback : parsed;
  } catch (_) {
    return fallback;
  }
}

// Normalises a raw D1 row (which may or may not have the marker columns,
// depending on migration state) into the shape the public page and admin
// panel both expect. labels/spreadOverlay come back as `null` — not `[]` —
// when the column itself is NULL (markers never touched by the marker
// editor), which is deliberately distinct from an actual empty array (the
// admin explicitly cleared every marker and saved) — see getReal() in
// regional-ui.js, which needs to tell "never edited, fall back to the
// hand-authored labels" apart from "edited down to zero, show none".
function shapeRow(r) {
  if (!r) return r;
  const { labels_json, needle_json, spread_json, ...rest } = r;
  return {
    ...rest,
    labels: parseJsonSafe(labels_json, null),
    needleOverlay: parseJsonSafe(needle_json, null),
    spreadOverlay: parseJsonSafe(spread_json, null)
  };
}

/**
 * All block image overrides, keyed by block_id. Used by both the admin
 * panel and the public page.
 */
export async function listRegionalImages(db) {
  if (!db || !(await tableExists(db))) return {};
  const withMarkers = await markerColumnsExist(db);
  const rows = await db
    .prepare(`
      SELECT block_id, image_url, source, attribution, orientation, probe, notes, updated_by, updated_at
        ${withMarkers ? ', labels_json, needle_json, spread_json' : ''}
      FROM regional_block_images
      ORDER BY block_id ASC
    `)
    .all();
  const map = {};
  (rows?.results || []).forEach((r) => { map[r.block_id] = shapeRow(r); });
  return map;
}

export async function getRegionalImage(db, blockId) {
  if (!db || !(await tableExists(db))) return null;
  const withMarkers = await markerColumnsExist(db);
  const row = await db
    .prepare(`
      SELECT block_id, image_url, source, attribution, orientation, probe, notes, updated_by, updated_at
        ${withMarkers ? ', labels_json, needle_json, spread_json' : ''}
      FROM regional_block_images WHERE block_id = ?
    `)
    .bind(blockId)
    .first();
  return shapeRow(row);
}

/**
 * Create or replace the image override for one block.
 */
export async function upsertRegionalImage(db, blockId, data, adminUsername) {
  if (!BLOCK_ID_RE.test(blockId || '')) {
    throw new Error('Invalid block id.');
  }
  const imageUrl = (data.image_url || '').trim();
  if (!/^https?:\/\/\S+$/.test(imageUrl)) {
    throw new Error('image_url must be an absolute http(s) URL.');
  }
  const source = ALLOWED_SOURCES.has(data.source) ? data.source : 'KnockoutNotes / user-provided';
  if (source === 'NYSORA' && !(data.attribution || '').trim()) {
    throw new Error('Attribution is required when the source is NYSORA (e.g. "Source: NYSORA.COM").');
  }
  if (!(await tableExists(db))) {
    throw new Error('regional_block_images table not found — run migration 0003_regional_block_images.sql against the D1 database first.');
  }

  await db
    .prepare(`
      INSERT INTO regional_block_images (block_id, image_url, source, attribution, orientation, probe, notes, updated_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      ON CONFLICT(block_id) DO UPDATE SET
        image_url = excluded.image_url,
        source = excluded.source,
        attribution = excluded.attribution,
        orientation = excluded.orientation,
        probe = excluded.probe,
        notes = excluded.notes,
        updated_by = excluded.updated_by,
        updated_at = datetime('now')
    `)
    .bind(
      blockId,
      imageUrl,
      source,
      (data.attribution || '').trim() || null,
      (data.orientation || '').trim() || null,
      (data.probe || '').trim() || null,
      (data.notes || '').trim() || null,
      adminUsername
    )
    .run();

  return getRegionalImage(db, blockId);
}

function clampPct(n, fallback) {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(100, Math.max(0, v));
}

// Structure markers, needle line and spread ellipses are all placed in
// percent-of-image coordinates (0-100), matching the same convention
// regional-sono.js already uses to render them (see pct() there) — this
// keeps the admin's click-to-place editor and the public overlay in sync
// without a separate coordinate system to translate between.
function sanitizeLabels(labels) {
  if (!Array.isArray(labels)) return [];
  const seen = new Set();
  return labels
    .map((l, i) => {
      const text = String((l && l.text) || '').trim().slice(0, 80);
      if (!text) return null;
      let id = String((l && l.id) || '').trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
      if (!id) id = `marker-${i}`;
      while (seen.has(id)) id = `${id}-${i}`;
      seen.add(id);
      const type = STRUCTURE_TYPES.has(l && l.type) ? l.type : 'marker';
      return { id, text, type, x: clampPct(l && l.x, 50), y: clampPct(l && l.y, 50) };
    })
    .filter(Boolean)
    .slice(0, 60);
}

function sanitizeNeedle(needle) {
  if (!needle || !Array.isArray(needle.from) || !Array.isArray(needle.to)) return null;
  return {
    from: [clampPct(needle.from[0], 10), clampPct(needle.from[1], 90)],
    to: [clampPct(needle.to[0], 50), clampPct(needle.to[1], 50)]
  };
}

function sanitizeSpread(spread) {
  if (!Array.isArray(spread)) return [];
  return spread
    .filter((s) => s && typeof s === 'object')
    .map((s) => ({
      shape: 'ellipse',
      x: clampPct(s.x, 50),
      y: clampPct(s.y, 50),
      rx: clampPct(s.rx, 15),
      ry: clampPct(s.ry, 10),
      note: s.note ? String(s.note).trim().slice(0, 120) : undefined,
      variable: !!s.variable
    }))
    .slice(0, 10);
}

/**
 * Update just the marker overlay (structure labels, needle line, spread
 * area) for a block that already has a real image set. Kept separate from
 * upsertRegionalImage so re-saving markers can never accidentally change
 * the image URL/source/attribution, and vice versa.
 */
export async function upsertRegionalMarkers(db, blockId, markers, adminUsername) {
  if (!BLOCK_ID_RE.test(blockId || '')) {
    throw new Error('Invalid block id.');
  }
  if (!(await tableExists(db))) {
    throw new Error('regional_block_images table not found — run migration 0003_regional_block_images.sql against the D1 database first.');
  }
  if (!(await markerColumnsExist(db))) {
    throw new Error('Marker columns not found — run migration 0004_regional_block_markers.sql against the D1 database first.');
  }
  const existing = await db.prepare('SELECT block_id FROM regional_block_images WHERE block_id = ?').bind(blockId).first();
  if (!existing) {
    throw new Error('Set a real image for this block first (above), then edit its markers.');
  }

  const labels = sanitizeLabels(markers && markers.labels);
  const needleOverlay = sanitizeNeedle(markers && markers.needleOverlay);
  const spreadOverlay = sanitizeSpread(markers && markers.spreadOverlay);

  await db
    .prepare(`
      UPDATE regional_block_images
      SET labels_json = ?, needle_json = ?, spread_json = ?, updated_by = ?, updated_at = datetime('now')
      WHERE block_id = ?
    `)
    .bind(
      JSON.stringify(labels),
      needleOverlay ? JSON.stringify(needleOverlay) : null,
      JSON.stringify(spreadOverlay),
      adminUsername,
      blockId
    )
    .run();

  const updated = await getRegionalImage(db, blockId);
  if (!updated) {
    // The row was deleted by another request between the existence check
    // above and this update — surface it clearly instead of returning a
    // null image the admin UI wouldn't expect.
    throw new Error('This block\'s image was removed while editing markers — reload and set the image again first.');
  }
  return updated;
}

export async function deleteRegionalImage(db, blockId) {
  if (!BLOCK_ID_RE.test(blockId || '')) {
    throw new Error('Invalid block id.');
  }
  if (!(await tableExists(db))) {
    return { success: true, block_id: blockId };
  }
  await db.prepare('DELETE FROM regional_block_images WHERE block_id = ?').bind(blockId).run();
  return { success: true, block_id: blockId };
}
