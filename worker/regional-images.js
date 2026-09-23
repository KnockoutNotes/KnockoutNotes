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

async function tableExists(db) {
  try {
    await db.prepare('SELECT 1 FROM regional_block_images LIMIT 1').first();
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * All block image overrides, keyed by block_id. Used by both the admin
 * panel and the public page.
 */
export async function listRegionalImages(db) {
  if (!db || !(await tableExists(db))) return {};
  const rows = await db
    .prepare(`
      SELECT block_id, image_url, source, attribution, orientation, probe, notes, updated_by, updated_at
      FROM regional_block_images
      ORDER BY block_id ASC
    `)
    .all();
  const map = {};
  (rows?.results || []).forEach((r) => { map[r.block_id] = r; });
  return map;
}

export async function getRegionalImage(db, blockId) {
  if (!db || !(await tableExists(db))) return null;
  return db
    .prepare(`
      SELECT block_id, image_url, source, attribution, orientation, probe, notes, updated_by, updated_at
      FROM regional_block_images WHERE block_id = ?
    `)
    .bind(blockId)
    .first();
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
