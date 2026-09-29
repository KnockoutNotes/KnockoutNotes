/**
 * KnockoutNotes 3D Workstation — Component Marker Overrides
 *
 * Stores admin-customized 3D Anaesthesia Workstation component markers,
 * labels, positions and clinical details in Cloudflare D1.
 *
 * Public page (ventilator.html / ventilator-ui.js) fetches GET /api/workstation-markers
 * to load live admin adjustments, falling back gracefully to ventilator-data.js
 * when no overrides exist or when offline.
 */

async function tableExists(db) {
  try {
    await db.prepare('SELECT 1 FROM workstation_markers LIMIT 1').first();
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

function sanitizeNumber(val, fallback, min = -10, max = 10) {
  const n = parseFloat(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(Math.min(max, Math.max(min, n)) * 1000) / 1000;
}

export function sanitizeComponents(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((c, i) => {
    const id = String(c?.id || `comp-${i + 1}`).trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-').slice(0, 64) || `comp-${i + 1}`;
    const name = String(c?.name || 'Unnamed Component').trim().slice(0, 120);
    const view = c?.view === 'rear' ? 'rear' : 'front';
    const system = String(c?.system || 'ventilator').trim().slice(0, 50);
    const summary = String(c?.summary || '').trim().slice(0, 400);
    const fn = String(c?.function || '').trim().slice(0, 1000);
    const safety = String(c?.safety || '').trim().slice(0, 1000);
    
    let viva = null;
    if (c?.viva && typeof c.viva === 'object') {
      viva = {
        prompt: String(c.viva.prompt || '').trim().slice(0, 500),
        answer: String(c.viva.answer || '').trim().slice(0, 1000)
      };
    }

    const pos = c?.position || {};
    const position = {
      x: sanitizeNumber(pos.x, 0),
      y: sanitizeNumber(pos.y, 1.0),
      z: sanitizeNumber(pos.z, 0)
    };

    const out = {
      id,
      name,
      view,
      system,
      summary,
      function: fn,
      safety,
      position
    };

    if (viva) out.viva = viva;
    if (Array.isArray(c?.schematics)) {
      out.schematics = c.schematics.map(s => String(s).slice(0, 50));
    }
    if (c?.gasZone) {
      out.gasZone = String(c.gasZone).slice(0, 30);
    }

    return out;
  });
}

/**
 * Public reader for workstation markers.
 */
export async function getWorkstationMarkers(db) {
  if (!db || !(await tableExists(db))) return null;
  const row = await db
    .prepare('SELECT components_json, updated_by, updated_at FROM workstation_markers WHERE id = ?')
    .bind('default')
    .first();
  if (!row) return null;
  return {
    components: parseJsonSafe(row.components_json, []),
    updated_by: row.updated_by,
    updated_at: row.updated_at
  };
}

/**
 * Admin upsert for workstation markers.
 */
export async function upsertWorkstationMarkers(db, components, adminUsername) {
  if (!(await tableExists(db))) {
    throw new Error('workstation_markers table not found — run migration 0005_workstation_markers.sql against D1 first.');
  }

  const clean = sanitizeComponents(components);
  if (!clean.length) {
    throw new Error('At least one component marker is required.');
  }

  const json = JSON.stringify(clean);

  await db
    .prepare(`
      INSERT INTO workstation_markers (id, components_json, updated_by, updated_at)
      VALUES ('default', ?, ?, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        components_json = excluded.components_json,
        updated_by = excluded.updated_by,
        updated_at = excluded.updated_at
    `)
    .bind(json, adminUsername)
    .run();

  return {
    success: true,
    components: clean,
    updated_by: adminUsername,
    count: clean.length
  };
}
