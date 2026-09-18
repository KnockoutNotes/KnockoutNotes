/**
 * KnockoutNotes CMS Module
 * Comprehensive content management for Clinical Notes, Pearls, Calculators (metadata only), and Updates.
 *
 * Enforces:
 * - Slug uniqueness
 * - Calculator formula immutability (formulas cannot be modified from CMS, code-level only)
 * - Category association and hierarchy
 * - Content-to-file linking
 * - Full audit trail
 */

function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function recordAuditLog(db, adminUsername, action, targetType, targetId, details, ip = '') {
  try {
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : String(details || '');
    await db
      .prepare(`
        INSERT INTO admin_audit_logs (admin_username, action, target_type, target_id, details, ip_address, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `)
      .bind(adminUsername, action, targetType, String(targetId || ''), detailsStr, ip)
      .run();
  } catch (err) {
    console.error('[Audit Log Error]:', err);
  }
}

// ==========================================
// CATEGORIES CRUD
// ==========================================

export async function listCategories(db, options = {}) {
  const type = options.type || 'all';
  let sql = 'SELECT * FROM categories WHERE 1=1';
  const params = [];

  if (type !== 'all') {
    sql += ' AND type = ?';
    params.push(type);
  }

  sql += ' ORDER BY display_order ASC, name ASC';
  const rows = await db.prepare(sql).bind(...params).all();
  return rows?.results || [];
}

export async function createCategory(db, data, adminUsername) {
  const name = (data.name || '').trim();
  if (!name) throw new Error('Category name is required.');

  const slug = slugify(data.slug || name);
  const type = data.type || 'notes';
  const kicker = (data.kicker || '').trim();
  const description = (data.description || '').trim();
  const parentId = data.parent_id ? parseInt(data.parent_id, 10) : null;
  const displayOrder = parseInt(data.display_order || '0', 10);

  const existing = await db.prepare('SELECT id FROM categories WHERE slug = ?').bind(slug).first();
  if (existing) throw new Error(`Category with slug "${slug}" already exists.`);

  const res = await db
    .prepare(`
      INSERT INTO categories (name, slug, parent_id, type, kicker, description, display_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `)
    .bind(name, slug, parentId, type, kicker, description, displayOrder)
    .run();

  const id = res?.meta?.last_row_id;
  await recordAuditLog(db, adminUsername, 'category_create', 'category', id, { name, slug, type });
  return { id, name, slug, type };
}

export async function updateCategory(db, id, data, adminUsername) {
  const cat = await db.prepare('SELECT * FROM categories WHERE id = ?').bind(id).first();
  if (!cat) throw new Error('Category not found.');

  const name = (data.name || cat.name).trim();
  const slug = slugify(data.slug || cat.slug);
  const type = data.type || cat.type;
  const kicker = data.kicker !== undefined ? data.kicker.trim() : cat.kicker;
  const description = data.description !== undefined ? data.description.trim() : cat.description;
  const parentId = data.parent_id !== undefined ? (data.parent_id ? parseInt(data.parent_id, 10) : null) : cat.parent_id;
  const displayOrder = data.display_order !== undefined ? parseInt(data.display_order, 10) : cat.display_order;

  // Prevent circular parent reference
  if (parentId === parseInt(id, 10)) {
    throw new Error('Category cannot be its own parent.');
  }

  // Check unique slug
  const conflict = await db.prepare('SELECT id FROM categories WHERE slug = ? AND id != ?').bind(slug, id).first();
  if (conflict) throw new Error(`Category with slug "${slug}" already exists.`);

  await db
    .prepare(`
      UPDATE categories
      SET name = ?, slug = ?, parent_id = ?, type = ?, kicker = ?, description = ?, display_order = ?, updated_at = datetime('now')
      WHERE id = ?
    `)
    .bind(name, slug, parentId, type, kicker, description, displayOrder, id)
    .run();

  await recordAuditLog(db, adminUsername, 'category_update', 'category', id, { name, slug, type });
  return { id, name, slug, type };
}

export async function deleteCategory(db, id, adminUsername) {
  const cat = await db.prepare('SELECT * FROM categories WHERE id = ?').bind(id).first();
  if (!cat) throw new Error('Category not found.');

  // Check if any content items belong to this category
  const contentCount = await db.prepare('SELECT COUNT(*) as count FROM content WHERE category_id = ?').bind(id).first();
  if (contentCount && contentCount.count > 0) {
    throw new Error(`Cannot delete category. It is associated with ${contentCount.count} content item(s). Reassign them first.`);
  }

  await db.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
  await recordAuditLog(db, adminUsername, 'category_delete', 'category', id, { name: cat.name, slug: cat.slug });
  return { success: true, deleted_id: id };
}

// ==========================================
// CONTENT CRUD (Notes, Pearls, Calculators, Updates)
// ==========================================

export async function listContent(db, options = {}) {
  const type = options.type || 'all';
  const status = options.status || 'all';
  const categoryId = options.category_id || null;
  const query = (options.q || '').trim();
  const page = Math.max(1, parseInt(options.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(options.limit || '20', 10)));
  const offset = (page - 1) * limit;

  let sql = `
    SELECT 
      c.id, c.content_type, c.title, c.slug, c.category_id, c.subcategory,
      c.summary, c.status, c.featured_image, c.author, c.published_at,
      c.created_at, c.updated_at,
      cat.name as category_name, cat.slug as category_slug
    FROM content c
    LEFT JOIN categories cat ON c.category_id = cat.id
    WHERE 1=1
  `;
  let countSql = 'SELECT COUNT(*) as total FROM content WHERE 1=1';
  const params = [];
  const countParams = [];

  if (type !== 'all') {
    sql += ' AND c.content_type = ?';
    countSql += ' AND content_type = ?';
    params.push(type);
    countParams.push(type);
  }

  if (status !== 'all') {
    sql += ' AND c.status = ?';
    countSql += ' AND status = ?';
    params.push(status);
    countParams.push(status);
  }

  if (categoryId) {
    sql += ' AND c.category_id = ?';
    countSql += ' AND category_id = ?';
    params.push(categoryId);
    countParams.push(categoryId);
  }

  if (query) {
    sql += ' AND (c.title LIKE ? OR c.summary LIKE ? OR c.slug LIKE ?)';
    countSql += ' AND (title LIKE ? OR summary LIKE ? OR slug LIKE ?)';
    const wildcard = `%${query}%`;
    params.push(wildcard, wildcard, wildcard);
    countParams.push(wildcard, wildcard, wildcard);
  }

  sql += ' ORDER BY c.updated_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const totalRow = await db.prepare(countSql).bind(...countParams).first();
  const rows = await db.prepare(sql).bind(...params).all();

  return {
    items: rows?.results || [],
    total: totalRow?.total || 0,
    page,
    limit
  };
}

export async function getContentById(db, id) {
  const item = await db
    .prepare(`
      SELECT c.*, cat.name as category_name
      FROM content c
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE c.id = ?
    `)
    .bind(id)
    .first();

  if (!item) return null;

  // Get attached files
  const files = await db
    .prepare(`
      SELECT f.id, f.filename, f.storage_key, f.mime_type, f.file_size, f.public_url, cf.role
      FROM content_files cf
      JOIN files f ON cf.file_id = f.id
      WHERE cf.content_id = ?
    `)
    .bind(id)
    .all();

  return {
    ...item,
    attached_files: files?.results || []
  };
}

export async function createContent(db, data, adminUsername) {
  const title = (data.title || '').trim();
  if (!title) throw new Error('Content title is required.');

  const contentType = data.content_type || 'note';
  if (!['note', 'pearl', 'calculator', 'update'].includes(contentType)) {
    throw new Error('Invalid content type. Must be note, pearl, calculator, or update.');
  }

  const slug = slugify(data.slug || title);
  const existing = await db.prepare('SELECT id FROM content WHERE slug = ?').bind(slug).first();
  if (existing) throw new Error(`Content item with slug "${slug}" already exists.`);

  const categoryId = data.category_id ? parseInt(data.category_id, 10) : null;
  const subcategory = (data.subcategory || '').trim();
  const summary = (data.summary || '').trim();
  const body = data.body || '';
  const status = ['draft', 'published', 'archived'].includes(data.status) ? data.status : 'draft';
  const featuredImage = (data.featured_image || '').trim();
  const author = (data.author || 'KnockoutNotes Editorial').trim();
  const publishedAt = status === 'published' ? (data.published_at || new Date().toISOString()) : null;

  // Extra data: For calculators, safeguard formula ID
  let extraData = {};
  if (data.extra_data) {
    extraData = typeof data.extra_data === 'string' ? JSON.parse(data.extra_data) : data.extra_data;
  }
  if (contentType === 'calculator') {
    // Calculators can store formula reference key, units, and evidence links, but NEVER raw executable JS
    if (extraData.formulaCode) {
      delete extraData.formulaCode; // Strip out any attempt to inject executable code
    }
  }

  const res = await db
    .prepare(`
      INSERT INTO content (
        content_type, title, slug, category_id, subcategory, summary, body, extra_data, status, featured_image, author, published_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `)
    .bind(
      contentType,
      title,
      slug,
      categoryId,
      subcategory,
      summary,
      body,
      JSON.stringify(extraData),
      status,
      featuredImage,
      author,
      publishedAt
    )
    .run();

  const contentId = res?.meta?.last_row_id;

  // Link any specified attached files
  if (Array.isArray(data.file_ids)) {
    for (const fileId of data.file_ids) {
      await db
        .prepare(`INSERT OR IGNORE INTO content_files (content_id, file_id, role, created_at) VALUES (?, ?, 'attachment', datetime('now'))`)
        .bind(contentId, fileId)
        .run();
    }
  }

  await recordAuditLog(db, adminUsername, 'content_create', 'content', contentId, { title, slug, contentType, status });
  return { id: contentId, title, slug, contentType, status };
}

export async function updateContent(db, id, data, adminUsername) {
  const item = await db.prepare('SELECT * FROM content WHERE id = ?').bind(id).first();
  if (!item) throw new Error('Content item not found.');

  const title = (data.title || item.title).trim();
  const slug = slugify(data.slug || item.slug);

  // Check unique slug
  const conflict = await db.prepare('SELECT id FROM content WHERE slug = ? AND id != ?').bind(slug, id).first();
  if (conflict) throw new Error(`Content item with slug "${slug}" already exists.`);

  const categoryId = data.category_id !== undefined ? (data.category_id ? parseInt(data.category_id, 10) : null) : item.category_id;
  const subcategory = data.subcategory !== undefined ? data.subcategory.trim() : item.subcategory;
  const summary = data.summary !== undefined ? data.summary.trim() : item.summary;
  const body = data.body !== undefined ? data.body : item.body;
  const status = data.status && ['draft', 'published', 'archived'].includes(data.status) ? data.status : item.status;
  const featuredImage = data.featured_image !== undefined ? data.featured_image.trim() : item.featured_image;
  const author = data.author !== undefined ? data.author.trim() : item.author;

  let publishedAt = item.published_at;
  if (status === 'published' && !publishedAt) {
    publishedAt = new Date().toISOString();
  }

  // Calculator formula protection
  let extraData = item.extra_data ? JSON.parse(item.extra_data) : {};
  if (data.extra_data) {
    const incomingExtra = typeof data.extra_data === 'string' ? JSON.parse(data.extra_data) : data.extra_data;
    if (incomingExtra.formulaCode) delete incomingExtra.formulaCode;
    extraData = { ...extraData, ...incomingExtra };
  }

  await db
    .prepare(`
      UPDATE content
      SET title = ?, slug = ?, category_id = ?, subcategory = ?, summary = ?, body = ?, extra_data = ?, status = ?, featured_image = ?, author = ?, published_at = ?, updated_at = datetime('now')
      WHERE id = ?
    `)
    .bind(
      title,
      slug,
      categoryId,
      subcategory,
      summary,
      body,
      JSON.stringify(extraData),
      status,
      featuredImage,
      author,
      publishedAt,
      id
    )
    .run();

  // Update attached files if provided
  if (Array.isArray(data.file_ids)) {
    await db.prepare('DELETE FROM content_files WHERE content_id = ?').bind(id).run();
    for (const fileId of data.file_ids) {
      await db
        .prepare(`INSERT OR IGNORE INTO content_files (content_id, file_id, role, created_at) VALUES (?, ?, 'attachment', datetime('now'))`)
        .bind(id, fileId)
        .run();
    }
  }

  await recordAuditLog(db, adminUsername, 'content_update', 'content', id, { title, slug, status });
  return { id, title, slug, status };
}

export async function setContentStatus(db, id, status, adminUsername) {
  if (!['draft', 'published', 'archived'].includes(status)) {
    throw new Error('Invalid status. Must be draft, published, or archived.');
  }

  const item = await db.prepare('SELECT * FROM content WHERE id = ?').bind(id).first();
  if (!item) throw new Error('Content item not found.');

  const publishedAt = status === 'published' ? (item.published_at || new Date().toISOString()) : item.published_at;

  await db
    .prepare(`
      UPDATE content
      SET status = ?, published_at = ?, updated_at = datetime('now')
      WHERE id = ?
    `)
    .bind(status, publishedAt, id)
    .run();

  await recordAuditLog(db, adminUsername, 'content_status_change', 'content', id, { previous: item.status, new: status });
  return { id, status };
}

export async function deleteContent(db, id, adminUsername) {
  const item = await db.prepare('SELECT * FROM content WHERE id = ?').bind(id).first();
  if (!item) throw new Error('Content item not found.');

  // Remove junction records
  await db.prepare('DELETE FROM content_files WHERE content_id = ?').bind(id).run();
  // Remove content
  await db.prepare('DELETE FROM content WHERE id = ?').bind(id).run();

  await recordAuditLog(db, adminUsername, 'content_delete', 'content', id, { title: item.title, slug: item.slug });
  return { success: true, deleted_id: id, title: item.title };
}

// ==========================================
// AUDIT LOG QUERY
// ==========================================

export async function listAuditLogs(db, options = {}) {
  const page = Math.max(1, parseInt(options.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(options.limit || '30', 10)));
  const offset = (page - 1) * limit;

  const totalRow = await db.prepare('SELECT COUNT(*) as total FROM admin_audit_logs').first();
  const rows = await db
    .prepare('SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT ? OFFSET ?')
    .bind(limit, offset)
    .all();

  return {
    logs: rows?.results || [],
    total: totalRow?.total || 0,
    page,
    limit
  };
}
