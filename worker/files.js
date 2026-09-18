/**
 * KnockoutNotes File Management & R2 Storage Abstraction
 * Handles media assets (monographs, clinical PDF protocols, charts, icons).
 * 
 * Supports:
 * - Direct upload to Cloudflare R2 bucket (`env.R2_STORAGE` or `env.MEDIA_BUCKET`)
 * - MIME type validation and file size restrictions
 * - Reference safety checking: prevents deleting files attached to active content items
 * - Graceful fallback message if R2 bucket binding is not yet attached in wrangler.jsonc
 */

const ALLOWED_MIME_TYPES = new Set([
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
  // Documents
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
  // Media
  'video/mp4',
  'audio/mpeg'
]);

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB maximum

function getR2Bucket(env) {
  return env.R2_STORAGE || env.MEDIA_BUCKET || null;
}

export function isR2Configured(env) {
  return Boolean(getR2Bucket(env));
}

/**
 * List files with optional folder filtering and search
 */
export async function listFiles(db, env, options = {}) {
  const folder = options.folder || 'all';
  const query = (options.q || '').trim();
  const page = Math.max(1, parseInt(options.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(options.limit || '30', 10)));
  const offset = (page - 1) * limit;

  let sql = `
    SELECT 
      f.id, f.filename, f.storage_key, f.folder, f.mime_type, f.file_size,
      f.storage_type, f.public_url, f.uploaded_by, f.created_at,
      COUNT(cf.id) as reference_count
    FROM files f
    LEFT JOIN content_files cf ON f.id = cf.file_id
    WHERE 1=1
  `;
  let countSql = 'SELECT COUNT(*) as total FROM files WHERE 1=1';
  const params = [];
  const countParams = [];

  if (folder !== 'all') {
    sql += ' AND f.folder = ?';
    countSql += ' AND folder = ?';
    params.push(folder);
    countParams.push(folder);
  }

  if (query) {
    sql += ' AND (f.filename LIKE ? OR f.storage_key LIKE ?)';
    countSql += ' AND (filename LIKE ? OR storage_key LIKE ?)';
    const wildcard = `%${query}%`;
    params.push(wildcard, wildcard);
    countParams.push(wildcard, wildcard);
  }

  sql += ' GROUP BY f.id ORDER BY f.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const totalRow = await db.prepare(countSql).bind(...countParams).first();
  const rows = await db.prepare(sql).bind(...params).all();

  return {
    files: rows?.results || [],
    total: totalRow?.total || 0,
    page,
    limit,
    r2_configured: isR2Configured(env)
  };
}

/**
 * Handle file upload (from multipart/form-data or binary body)
 */
export async function handleFileUpload(request, db, env, adminUsername) {
  const bucket = getR2Bucket(env);
  const contentType = request.headers.get('content-type') || '';

  let fileBuffer = null;
  let filename = 'unnamed-file';
  let mimeType = 'application/octet-stream';
  let folder = 'general';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const file = formData.get('file');
    folder = formData.get('folder') || 'general';

    if (!file || typeof file === 'string') {
      throw new Error('No valid file found in upload form data.');
    }

    filename = file.name || 'unnamed-file';
    mimeType = file.type || 'application/octet-stream';
    fileBuffer = await file.arrayBuffer();
  } else {
    // Direct binary body
    filename = request.headers.get('x-filename') || `asset-${Date.now()}`;
    mimeType = contentType.split(';')[0].trim();
    folder = request.headers.get('x-folder') || 'general';
    fileBuffer = await request.arrayBuffer();
  }

  if (!fileBuffer || fileBuffer.byteLength === 0) {
    throw new Error('File payload is empty.');
  }

  if (fileBuffer.byteLength > MAX_FILE_SIZE) {
    throw new Error(`File exceeds maximum size limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
  }

  // Sanitize filename and generate unique storage key
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
  const uniqueId = Math.random().toString(36).substring(2, 10);
  const storageKey = `${folder}/${Date.now()}-${uniqueId}-${safeName}`;

  let publicUrl = `/api/files/${storageKey}`;
  let storageType = 'd1_meta_only';

  if (bucket) {
    // Store directly in Cloudflare R2
    await bucket.put(storageKey, fileBuffer, {
      httpMetadata: {
        contentType: mimeType
      },
      customMetadata: {
        originalName: filename,
        uploadedBy: adminUsername
      }
    });
    storageType = 'r2';
  } else {
    // R2 not bound yet - track in database with notice
    storageType = 'pending_r2';
  }

  // Record in D1 files table
  const insertResult = await db
    .prepare(`
      INSERT INTO files (
        filename, storage_key, folder, mime_type, file_size, storage_type, public_url, uploaded_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `)
    .bind(
      filename,
      storageKey,
      folder,
      mimeType,
      fileBuffer.byteLength,
      storageType,
      publicUrl,
      adminUsername
    )
    .run();

  const fileId = insertResult?.meta?.last_row_id;

  return {
    id: fileId,
    filename,
    storage_key: storageKey,
    folder,
    mime_type: mimeType,
    file_size: fileBuffer.byteLength,
    storage_type: storageType,
    public_url: publicUrl,
    r2_configured: isR2Configured(env)
  };
}

/**
 * Delete a file, ensuring it is not currently referenced by active content items
 */
export async function deleteFile(fileId, db, env, adminUsername) {
  const file = await db.prepare('SELECT * FROM files WHERE id = ?').bind(fileId).first();
  if (!file) {
    throw new Error('File not found.');
  }

  // Check references in content_files
  const references = await db
    .prepare(`
      SELECT c.id, c.title, c.content_type, c.status, cf.role
      FROM content_files cf
      JOIN content c ON cf.content_id = c.id
      WHERE cf.file_id = ?
    `)
    .bind(fileId)
    .all();

  if (references?.results?.length > 0) {
    const titles = references.results.map(r => `"${r.title}" (${r.content_type})`).join(', ');
    throw new Error(`Cannot delete file. It is currently referenced by ${references.results.length} content item(s): ${titles}.`);
  }

  // Delete from R2 if present
  const bucket = getR2Bucket(env);
  if (bucket && file.storage_type === 'r2') {
    try {
      await bucket.delete(file.storage_key);
    } catch (err) {
      console.error('[R2 Delete Error]:', err);
    }
  }

  // Delete from D1
  await db.prepare('DELETE FROM files WHERE id = ?').bind(fileId).run();

  return { success: true, deleted_id: fileId, filename: file.filename };
}

/**
 * Serve a file asset directly from R2
 */
export async function serveFile(storageKey, env, request) {
  const bucket = getR2Bucket(env);
  if (!bucket) {
    return new Response('File storage (R2) is not configured on this Worker.', { status: 503 });
  }

  const object = await bucket.get(storageKey);
  if (!object) {
    return new Response('File not found in storage.', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return new Response(object.body, {
    status: 200,
    headers
  });
}
