/**
 * KnockoutNotes Administration & CMS Portal Client Controller
 * Lightweight, zero dependencies, high performance, desktop-first SPA architecture
 */

// Application State
const appState = {
  activeView: 'dashboard',
  currentContentType: 'all',
  
  // Content
  contentPage: 1,
  contentLimit: 20,
  contentTotal: 0,
  contentSearch: '',
  contentStatus: 'all',
  contentCategoryId: '',

  // Categories
  categories: [],

  // Files
  filesPage: 1,
  filesLimit: 24,
  filesTotal: 0,
  filesFolder: 'all',
  filesSearch: '',

  // Subscribers
  subscribersPage: 1,
  subscribersLimit: 25,
  subscribersTotal: 0,
  subscribersStatus: 'all',
  subscribersSearch: '',

  // Logs
  logsPage: 1,
  logsLimit: 25,
  logsTotal: 0,

  // Stats
  stats: null,

  // Active File Target for Picker
  activePickerTargetInputId: null,

  // Pending delete target
  pendingDeleteAction: null
};

// ==========================================
// INITIALIZATION & AUTH
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const meRes = await fetch('/api/admin/me');
    if (!meRes.ok) {
      window.location.replace('/admin/login.html');
      return;
    }
    const meData = await meRes.json();
    if (meData.username) {
      const el = document.getElementById('adminUsername');
      if (el) el.textContent = meData.username;
    }
  } catch (_) {
    window.location.replace('/admin/login.html');
    return;
  }

  setupNavigation();
  setupEventListeners();

  // Load Initial Core Datasets
  await Promise.all([
    loadStats(),
    loadCategories()
  ]);

  // Handle Hash Routing
  const initialHash = window.location.hash.replace('#', '') || 'dashboard';
  switchView(initialHash);
});

// ==========================================
// NAVIGATION & ROUTING
// ==========================================
function setupNavigation() {
  // Sidebar navigation items
  document.querySelectorAll('.adm-nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetView = btn.dataset.view;
      if (targetView) {
        window.location.hash = targetView;
        switchView(targetView);
        // On mobile, close sidebar after tap
        const sidebar = document.getElementById('admSidebar');
        if (sidebar) sidebar.classList.remove('open');
      }
    });
  });

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobileToggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const sidebar = document.getElementById('admSidebar');
      if (sidebar) sidebar.classList.toggle('open');
    });
  }

  // Hash change handler
  window.addEventListener('hashchange', () => {
    const view = window.location.hash.replace('#', '') || 'dashboard';
    switchView(view);
  });
}

function switchView(viewName) {
  const targetViewEl = document.getElementById(`view-${viewName}`);
  if (!targetViewEl) return;

  appState.activeView = viewName;

  // Update sidebar active item
  document.querySelectorAll('.adm-nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  // Update view panes
  document.querySelectorAll('.adm-view').forEach(view => {
    view.classList.toggle('active', view.id === `view-${viewName}`);
  });

  // Update header title
  const titleMap = {
    dashboard: 'Dashboard',
    analytics: 'Analytics & Traffic',
    content: 'Content Management',
    categories: 'Category Hierarchy',
    files: 'File & Asset Manager (R2)',
    subscribers: 'Subscribers Directory',
    email: 'Email Broadcasts & Delivery',
    settings: 'System Status & Audit Logs'
  };
  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle) pageTitle.textContent = titleMap[viewName] || 'Administration';

  // Trigger view data loader
  if (viewName === 'dashboard') loadStats();
  if (viewName === 'analytics') loadAnalytics();
  if (viewName === 'content') loadContent();
  if (viewName === 'categories') renderCategoriesTable();
  if (viewName === 'files') loadFiles();
  if (viewName === 'subscribers') loadSubscribers();
  if (viewName === 'email') loadLogs();
  if (viewName === 'settings') loadSettingsAndAudit();
}

// ==========================================
// EVENT LISTENERS SETUP
// ==========================================
function setupEventListeners() {
  // Sign Out
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/admin/logout', { method: 'POST' });
      } catch (_) {}
      window.location.replace('/admin/login.html');
    });
  }

  // CONTENT CONTROLS
  document.querySelectorAll('.adm-subnav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.adm-subnav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.currentContentType = btn.dataset.contentType || 'all';
      appState.contentPage = 1;
      loadContent();
    });
  });

  let contentSearchDebounce = null;
  const contentSearch = document.getElementById('contentSearch');
  if (contentSearch) {
    contentSearch.addEventListener('input', (e) => {
      clearTimeout(contentSearchDebounce);
      contentSearchDebounce = setTimeout(() => {
        appState.contentSearch = e.target.value.trim();
        appState.contentPage = 1;
        loadContent();
      }, 300);
    });
  }

  const contentStatusFilter = document.getElementById('contentStatusFilter');
  if (contentStatusFilter) {
    contentStatusFilter.addEventListener('change', (e) => {
      appState.contentStatus = e.target.value;
      appState.contentPage = 1;
      loadContent();
    });
  }

  const contentCategoryFilter = document.getElementById('contentCategoryFilter');
  if (contentCategoryFilter) {
    contentCategoryFilter.addEventListener('change', (e) => {
      appState.contentCategoryId = e.target.value;
      appState.contentPage = 1;
      loadContent();
    });
  }

  const newContentBtn = document.getElementById('newContentBtn');
  if (newContentBtn) {
    newContentBtn.addEventListener('click', () => openNewContentModal('note'));
  }

  const contentPrevBtn = document.getElementById('contentPrevBtn');
  if (contentPrevBtn) {
    contentPrevBtn.addEventListener('click', () => {
      if (appState.contentPage > 1) {
        appState.contentPage--;
        loadContent();
      }
    });
  }

  const contentNextBtn = document.getElementById('contentNextBtn');
  if (contentNextBtn) {
    contentNextBtn.addEventListener('click', () => {
      const maxPage = Math.ceil(appState.contentTotal / appState.contentLimit);
      if (appState.contentPage < maxPage) {
        appState.contentPage++;
        loadContent();
      }
    });
  }

  const saveContentBtn = document.getElementById('saveContentBtn');
  if (saveContentBtn) {
    saveContentBtn.addEventListener('click', handleSaveContent);
  }

  // CATEGORY CONTROLS
  const newCategoryBtn = document.getElementById('newCategoryBtn');
  if (newCategoryBtn) {
    newCategoryBtn.addEventListener('click', () => openCategoryModal());
  }

  const saveCategoryBtn = document.getElementById('saveCategoryBtn');
  if (saveCategoryBtn) {
    saveCategoryBtn.addEventListener('click', handleSaveCategory);
  }

  // FILE CONTROLS
  const fileFolderFilter = document.getElementById('fileFolderFilter');
  if (fileFolderFilter) {
    fileFolderFilter.addEventListener('change', (e) => {
      appState.filesFolder = e.target.value;
      appState.filesPage = 1;
      loadFiles();
    });
  }

  let fileSearchDebounce = null;
  const fileSearch = document.getElementById('fileSearch');
  if (fileSearch) {
    fileSearch.addEventListener('input', (e) => {
      clearTimeout(fileSearchDebounce);
      fileSearchDebounce = setTimeout(() => {
        appState.filesSearch = e.target.value.trim();
        appState.filesPage = 1;
        loadFiles();
      }, 300);
    });
  }

  const uploadAssetBtn = document.getElementById('uploadAssetBtn');
  if (uploadAssetBtn) {
    uploadAssetBtn.addEventListener('click', () => {
      document.getElementById('uploadFileInput').value = '';
      const alert = document.getElementById('uploadModalAlert');
      if (alert) alert.style.display = 'none';
      openModal('uploadModal');
    });
  }

  const startUploadBtn = document.getElementById('startUploadBtn');
  if (startUploadBtn) {
    startUploadBtn.addEventListener('click', handleFileUpload);
  }

  const filePrevBtn = document.getElementById('filePrevBtn');
  if (filePrevBtn) {
    filePrevBtn.addEventListener('click', () => {
      if (appState.filesPage > 1) {
        appState.filesPage--;
        loadFiles();
      }
    });
  }

  const fileNextBtn = document.getElementById('fileNextBtn');
  if (fileNextBtn) {
    fileNextBtn.addEventListener('click', () => {
      const max = Math.ceil(appState.filesTotal / appState.filesLimit);
      if (appState.filesPage < max) {
        appState.filesPage++;
        loadFiles();
      }
    });
  }

  // SUBSCRIBERS CONTROLS
  let subSearchDebounce = null;
  const subscriberSearch = document.getElementById('subscriberSearch');
  if (subscriberSearch) {
    subscriberSearch.addEventListener('input', (e) => {
      clearTimeout(subSearchDebounce);
      subSearchDebounce = setTimeout(() => {
        appState.subscribersSearch = e.target.value.trim();
        appState.subscribersPage = 1;
        loadSubscribers();
      }, 300);
    });
  }

  const subscriberStatusFilter = document.getElementById('subscriberStatusFilter');
  if (subscriberStatusFilter) {
    subscriberStatusFilter.addEventListener('change', (e) => {
      appState.subscribersStatus = e.target.value;
      appState.subscribersPage = 1;
      loadSubscribers();
    });
  }

  const exportCsvBtn = document.getElementById('exportCsvBtn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      window.location.href = '/api/admin/subscribers/export';
    });
  }

  const subscribersPrevBtn = document.getElementById('subscribersPrevBtn');
  if (subscribersPrevBtn) {
    subscribersPrevBtn.addEventListener('click', () => {
      if (appState.subscribersPage > 1) {
        appState.subscribersPage--;
        loadSubscribers();
      }
    });
  }

  const subscribersNextBtn = document.getElementById('subscribersNextBtn');
  if (subscribersNextBtn) {
    subscribersNextBtn.addEventListener('click', () => {
      const max = Math.ceil(appState.subscribersTotal / appState.subscribersLimit);
      if (appState.subscribersPage < max) {
        appState.subscribersPage++;
        loadSubscribers();
      }
    });
  }

  // BROADCAST & EMAIL CONTROLS
  const bcastTestCheck = document.getElementById('bcastTestCheck');
  const bcastTestWrapper = document.getElementById('bcastTestWrapper');
  if (bcastTestCheck && bcastTestWrapper) {
    bcastTestCheck.addEventListener('change', () => {
      bcastTestWrapper.style.display = bcastTestCheck.checked ? 'block' : 'none';
    });
  }

  const broadcastForm = document.getElementById('broadcastForm');
  if (broadcastForm) {
    broadcastForm.addEventListener('submit', handleBroadcastSubmit);
  }

  const refreshLogsBtn = document.getElementById('refreshLogsBtn');
  if (refreshLogsBtn) {
    refreshLogsBtn.addEventListener('click', loadLogs);
  }

  // ANALYTICS CONTROLS
  const refreshAnalyticsBtn = document.getElementById('refreshAnalyticsBtn');
  if (refreshAnalyticsBtn) {
    refreshAnalyticsBtn.addEventListener('click', loadAnalytics);
  }

  const analyticsPeriod = document.getElementById('analyticsPeriod');
  if (analyticsPeriod) {
    analyticsPeriod.addEventListener('change', loadAnalytics);
  }

  // SETTINGS & AUDIT
  const refreshAuditBtn = document.getElementById('refreshAuditBtn');
  if (refreshAuditBtn) {
    refreshAuditBtn.addEventListener('click', loadSettingsAndAudit);
  }

  // DELETE CONFIRMATION BUTTON
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
      if (typeof appState.pendingDeleteAction === 'function') {
        await appState.pendingDeleteAction();
      }
      closeModal('deleteModal');
    });
  }
}

// ==========================================
// VIEW 1: DASHBOARD STATS
// ==========================================
async function loadStats() {
  try {
    const res = await fetch('/api/admin/stats');
    if (!res.ok) return;
    const data = await res.json();
    appState.stats = data;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('dashSubscribers', data.subscribers?.active ?? 0);
    setVal('dashNotes', data.content?.notes ?? 0);
    setVal('dashPearls', data.content?.pearls ?? 0);
    setVal('dashCalculators', data.content?.calculators ?? 0);
    setVal('dashFiles', data.files?.total ?? 0);
    setVal('dashEmailsSent', data.emails?.sent ?? 0);
    setVal('dashEmailsFailed', `${data.emails?.failed ?? 0} failed`);

    const r2Sub = document.getElementById('dashFilesSub');
    if (r2Sub) {
      r2Sub.textContent = data.files?.r2_configured ? 'Cloudflare R2: Bound' : 'Cloudflare R2: Unbound';
    }

    // Render Recent Events
    const listEl = document.getElementById('recentEventsList');
    if (listEl) {
      const events = data.recentEvents || [];
      if (!events.length) {
        listEl.innerHTML = '<div class="adm-empty-state">No broadcast notifications sent yet.</div>';
      } else {
        listEl.innerHTML = `
          <table class="adm-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Recipients</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${events.map(ev => `
                <tr>
                  <td style="font-weight: 500; color: #fff;">${escapeHtml(ev.title)}</td>
                  <td>${ev.recipient_count}</td>
                  <td>${formatDate(ev.created_at)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
    }
  } catch (err) {
    console.error('[Dashboard Stats Error]:', err);
  }
}

// ==========================================
// VIEW 2: ANALYTICS CONTROLLER
// ==========================================
async function loadAnalytics() {
  const alert = document.getElementById('analyticsAlert');
  if (alert) alert.style.display = 'none';

  const periodSelect = document.getElementById('analyticsPeriod');
  const period = periodSelect ? periodSelect.value : '7d';

  try {
    const res = await fetch(`/api/admin/analytics?period=${period}`);
    if (!res.ok) throw new Error(`Analytics fetch failed: ${res.status}`);
    const data = await res.json();

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    if (!data.connected) {
      if (alert) {
        alert.className = 'alert-banner warning';
        alert.textContent = `Cloudflare Web Analytics is not connected. ${data.reason || data.error || 'Configure CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID in Worker secrets.'}`;
        alert.style.display = 'block';
      }
      setVal('anaPageviews', '0');
      setVal('anaUniques', '0');
      setVal('anaRequests', '0');

      const tbody = document.getElementById('analyticsTableBody');
      if (tbody) {
        tbody.innerHTML = `
          <tr><td colspan="4" style="text-align: center; color: var(--adm-text-subtle); padding: 24px;">
            Analytics credentials not connected. Set Worker secrets <code>CLOUDFLARE_API_TOKEN</code> and <code>CLOUDFLARE_ZONE_ID</code> to display aggregate data.
          </td></tr>
        `;
      }
      return;
    }

    setVal('anaPageviews', (data.summary?.pageViews || 0).toLocaleString());
    setVal('anaUniques', (data.summary?.uniqueVisitors || 0).toLocaleString());
    setVal('anaRequests', (data.summary?.requests || 0).toLocaleString());

    const tbody = document.getElementById('analyticsTableBody');
    if (tbody) {
      const series = data.timeseries || [];
      if (!series.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--adm-text-subtle); padding: 24px;">No traffic records for this period.</td></tr>';
      } else {
        tbody.innerHTML = series.map(row => `
          <tr>
            <td style="font-family: var(--adm-font-mono);">${row.date || '—'}</td>
            <td style="font-weight: 600; color: #fff;">${(row.pageViews || 0).toLocaleString()}</td>
            <td>${(row.requests || 0).toLocaleString()}</td>
            <td>${(row.uniqueVisitors || 0).toLocaleString()}</td>
          </tr>
        `).join('');
      }
    }
  } catch (err) {
    if (alert) {
      alert.className = 'alert-banner error';
      alert.textContent = `Failed to load analytics: ${err.message}`;
      alert.style.display = 'block';
    }
  }
}

// ==========================================
// VIEW 3: CONTENT CONTROLLER
// ==========================================
async function loadContent() {
  const tbody = document.getElementById('contentTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" class="adm-empty-state">Loading content items...</td></tr>';

  try {
    const params = new URLSearchParams({
      type: appState.currentContentType,
      status: appState.contentStatus,
      category_id: appState.contentCategoryId,
      q: appState.contentSearch,
      page: appState.contentPage,
      limit: appState.contentLimit
    });

    const res = await fetch(`/api/admin/content?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch content');
    const data = await res.json();

    appState.contentTotal = data.total || 0;
    renderContentTable(data.items || []);
    updateContentPagination(data.page, Math.ceil(data.total / data.limit));
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="adm-empty-state" style="color: var(--adm-danger);">Error: ${err.message}</td></tr>`;
  }
}

function renderContentTable(items) {
  const tbody = document.getElementById('contentTableBody');
  if (!tbody) return;

  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="adm-empty-state">No content items found matching current filters.</td></tr>';
    return;
  }

  tbody.innerHTML = items.map(item => `
    <tr>
      <td><span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--adm-primary);">${item.content_type}</span></td>
      <td>
        <div style="font-weight: 600; color: #fff;">${escapeHtml(item.title)}</div>
        <div style="font-size: 11px; color: var(--adm-text-subtle); font-family: var(--adm-font-mono);">${escapeHtml(item.slug)}</div>
      </td>
      <td>${escapeHtml(item.category_name || '—')}</td>
      <td><span class="status-pill ${item.status}">${item.status}</span></td>
      <td style="font-size: 11px; color: var(--adm-text-muted);">${formatDate(item.published_at)}</td>
      <td style="font-size: 11px; color: var(--adm-text-muted);">${formatDate(item.updated_at)}</td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="btn-secondary" style="padding: 3px 8px; font-size: 11px;" onclick="openEditContentModal(${item.id})">Edit</button>
          ${item.status === 'published' 
            ? `<button class="btn-secondary" style="padding: 3px 8px; font-size: 11px;" onclick="setContentStatus(${item.id}, 'draft')">Unpublish</button>`
            : `<button class="btn-secondary" style="padding: 3px 8px; font-size: 11px;" onclick="setContentStatus(${item.id}, 'published')">Publish</button>`}
          <button class="btn-danger" style="padding: 3px 8px; font-size: 11px;" onclick="promptDeleteContent(${item.id}, '${escapeHtml(item.title)}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function updateContentPagination(page, totalPages) {
  totalPages = Math.max(1, totalPages || 1);
  const info = document.getElementById('contentPageInfo');
  if (info) info.textContent = `Showing page ${page} of ${totalPages} (${appState.contentTotal} items)`;

  const prev = document.getElementById('contentPrevBtn');
  const next = document.getElementById('contentNextBtn');
  if (prev) prev.disabled = (page <= 1);
  if (next) next.disabled = (page >= totalPages);
}

window.openNewContentModal = function(defaultType = 'note') {
  document.getElementById('contentForm').reset();
  document.getElementById('editContentId').value = '';
  document.getElementById('contentModalTitle').textContent = 'Add Content Item';
  document.getElementById('contentFormType').value = defaultType;
  document.getElementById('contentFormStatus').value = 'draft';

  populateCategorySelect('contentFormCategory');
  const alert = document.getElementById('contentModalAlert');
  if (alert) alert.style.display = 'none';

  openModal('contentModal');
};

window.openEditContentModal = async function(contentId) {
  try {
    const res = await fetch(`/api/admin/content/${contentId}`);
    if (!res.ok) throw new Error('Content not found');
    const { content } = await res.json();

    document.getElementById('editContentId').value = content.id;
    document.getElementById('contentModalTitle').textContent = `Edit Content: ${content.title}`;
    document.getElementById('contentFormType').value = content.content_type;
    document.getElementById('contentFormTitle').value = content.title;
    document.getElementById('contentFormSlug').value = content.slug;
    document.getElementById('contentFormStatus').value = content.status;
    document.getElementById('contentFormSummary').value = content.summary || '';
    document.getElementById('contentFormBody').value = content.body || '';
    document.getElementById('contentFormImage').value = content.featured_image || '';

    populateCategorySelect('contentFormCategory', content.category_id);
    const alert = document.getElementById('contentModalAlert');
    if (alert) alert.style.display = 'none';

    openModal('contentModal');
  } catch (err) {
    alert('Failed to load content for editing: ' + err.message);
  }
};

async function handleSaveContent(e) {
  e.preventDefault();
  const alert = document.getElementById('contentModalAlert');
  if (alert) alert.style.display = 'none';

  const editId = document.getElementById('editContentId').value;
  const payload = {
    content_type: document.getElementById('contentFormType').value,
    category_id: document.getElementById('contentFormCategory').value || null,
    title: document.getElementById('contentFormTitle').value.trim(),
    slug: document.getElementById('contentFormSlug').value.trim(),
    status: document.getElementById('contentFormStatus').value,
    summary: document.getElementById('contentFormSummary').value.trim(),
    body: document.getElementById('contentFormBody').value,
    featured_image: document.getElementById('contentFormImage').value.trim()
  };

  if (!payload.title) {
    if (alert) {
      alert.className = 'alert-banner error';
      alert.textContent = 'Please enter a title for the content item.';
      alert.style.display = 'block';
    }
    return;
  }

  const saveBtn = document.getElementById('saveContentBtn');
  saveBtn.disabled = true;

  try {
    const url = editId ? `/api/admin/content/${editId}` : '/api/admin/content';
    const method = editId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save content');

    closeModal('contentModal');
    await loadContent();
    await loadStats();
  } catch (err) {
    if (alert) {
      alert.className = 'alert-banner error';
      alert.textContent = err.message;
      alert.style.display = 'block';
    }
  } finally {
    saveBtn.disabled = false;
  }
}

window.setContentStatus = async function(contentId, newStatus) {
  try {
    const res = await fetch(`/api/admin/content/${contentId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      await loadContent();
      await loadStats();
    }
  } catch (err) {
    alert('Failed to change status: ' + err.message);
  }
};

window.promptDeleteContent = function(contentId, title) {
  document.getElementById('deleteModalTitle').textContent = 'Delete Content Item';
  document.getElementById('deleteModalBody').textContent = `Are you sure you want to permanently delete "${title}"? This cannot be undone.`;

  appState.pendingDeleteAction = async () => {
    try {
      const res = await fetch(`/api/admin/content/${contentId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Deletion failed');
      await loadContent();
      await loadStats();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  openModal('deleteModal');
};

// ==========================================
// VIEW 4: CATEGORIES CONTROLLER
// ==========================================
async function loadCategories() {
  try {
    const res = await fetch('/api/admin/categories');
    if (!res.ok) return;
    const data = await res.json();
    appState.categories = data.categories || [];
    renderCategoriesTable();
    populateCategorySelect('contentCategoryFilter', appState.contentCategoryId, true);
  } catch (err) {
    console.error('[Categories Error]:', err);
  }
}

function renderCategoriesTable() {
  const tbody = document.getElementById('categoriesTableBody');
  if (!tbody) return;

  const cats = appState.categories || [];
  if (!cats.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="adm-empty-state">No categories configured.</td></tr>';
    return;
  }

  tbody.innerHTML = cats.map(cat => `
    <tr>
      <td>${cat.display_order ?? 0}</td>
      <td style="font-weight: 600; color: #fff;">${escapeHtml(cat.name)}</td>
      <td style="font-family: var(--adm-font-mono); color: var(--adm-text-subtle);">${escapeHtml(cat.slug)}</td>
      <td><span style="font-size: 11px; text-transform: uppercase; color: var(--adm-primary); font-weight: 600;">${cat.type}</span></td>
      <td><span class="status-pill active">${escapeHtml(cat.kicker || '—')}</span></td>
      <td style="max-width: 260px; font-size: 12px; color: var(--adm-text-muted);">${escapeHtml(cat.description || '—')}</td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="btn-secondary" style="padding: 3px 8px; font-size: 11px;" onclick="openEditCategoryModal(${cat.id})">Edit</button>
          <button class="btn-danger" style="padding: 3px 8px; font-size: 11px;" onclick="promptDeleteCategory(${cat.id}, '${escapeHtml(cat.name)}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function populateCategorySelect(selectId, selectedValue = '', includeAllOption = false) {
  const select = document.getElementById(selectId);
  if (!select) return;

  let optionsHtml = includeAllOption ? '<option value="">All Categories</option>' : '<option value="">(None)</option>';
  (appState.categories || []).forEach(cat => {
    const isSelected = String(cat.id) === String(selectedValue) ? 'selected' : '';
    optionsHtml += `<option value="${cat.id}" ${isSelected}>${escapeHtml(cat.name)} (${cat.type})</option>`;
  });
  select.innerHTML = optionsHtml;
}

window.openCategoryModal = function() {
  document.getElementById('categoryForm').reset();
  document.getElementById('editCategoryId').value = '';
  document.getElementById('categoryModalTitle').textContent = 'Add Category';
  const alert = document.getElementById('categoryModalAlert');
  if (alert) alert.style.display = 'none';
  openModal('categoryModal');
};

window.openEditCategoryModal = function(catId) {
  const cat = (appState.categories || []).find(c => c.id === catId);
  if (!cat) return;

  document.getElementById('editCategoryId').value = cat.id;
  document.getElementById('categoryModalTitle').textContent = `Edit Category: ${cat.name}`;
  document.getElementById('catFormName').value = cat.name;
  document.getElementById('catFormSlug').value = cat.slug;
  document.getElementById('catFormType').value = cat.type;
  document.getElementById('catFormKicker').value = cat.kicker || '';
  document.getElementById('catFormDesc').value = cat.description || '';

  const alert = document.getElementById('categoryModalAlert');
  if (alert) alert.style.display = 'none';
  openModal('categoryModal');
};

async function handleSaveCategory(e) {
  e.preventDefault();
  const alert = document.getElementById('categoryModalAlert');
  if (alert) alert.style.display = 'none';

  const editId = document.getElementById('editCategoryId').value;
  const payload = {
    name: document.getElementById('catFormName').value.trim(),
    slug: document.getElementById('catFormSlug').value.trim(),
    type: document.getElementById('catFormType').value,
    kicker: document.getElementById('catFormKicker').value.trim(),
    description: document.getElementById('catFormDesc').value.trim()
  };

  if (!payload.name) {
    if (alert) {
      alert.className = 'alert-banner error';
      alert.textContent = 'Category name is required.';
      alert.style.display = 'block';
    }
    return;
  }

  const saveBtn = document.getElementById('saveCategoryBtn');
  saveBtn.disabled = true;

  try {
    const url = editId ? `/api/admin/categories/${editId}` : '/api/admin/categories';
    const method = editId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save category');

    closeModal('categoryModal');
    await loadCategories();
  } catch (err) {
    if (alert) {
      alert.className = 'alert-banner error';
      alert.textContent = err.message;
      alert.style.display = 'block';
    }
  } finally {
    saveBtn.disabled = false;
  }
}

window.promptDeleteCategory = function(catId, catName) {
  document.getElementById('deleteModalTitle').textContent = 'Delete Category';
  document.getElementById('deleteModalBody').textContent = `Are you sure you want to delete category "${catName}"? This category must not contain any content items.`;

  appState.pendingDeleteAction = async () => {
    try {
      const res = await fetch(`/api/admin/categories/${catId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Deletion failed');
      await loadCategories();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  openModal('deleteModal');
};

// ==========================================
// VIEW 5: FILE MANAGER (Cloudflare R2)
// ==========================================
async function loadFiles() {
  const grid = document.getElementById('fileGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="adm-empty-state" style="grid-column: 1/-1;">Loading files...</div>';

  try {
    const params = new URLSearchParams({
      folder: appState.filesFolder,
      q: appState.filesSearch,
      page: appState.filesPage,
      limit: appState.filesLimit
    });

    const res = await fetch(`/api/admin/files?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch files');
    const data = await res.json();

    appState.filesTotal = data.total || 0;

    const r2Notice = document.getElementById('r2Notice');
    if (r2Notice) {
      r2Notice.style.display = data.r2_configured ? 'none' : 'block';
    }

    renderFileGrid(data.files || []);
    updateFilePagination(data.page, Math.ceil(data.total / data.limit));
  } catch (err) {
    grid.innerHTML = `<div class="adm-empty-state" style="grid-column: 1/-1; color: var(--adm-danger);">Error: ${err.message}</div>`;
  }
}

function renderFileGrid(files) {
  const grid = document.getElementById('fileGrid');
  if (!grid) return;

  if (!files.length) {
    grid.innerHTML = '<div class="adm-empty-state" style="grid-column: 1/-1;">No files found. Click "+ Upload Asset" to upload monographs, charts, or clinical PDFs.</div>';
    return;
  }

  grid.innerHTML = files.map(f => {
    const isImage = f.mime_type.startsWith('image/');
    const preview = isImage
      ? `<img src="${f.public_url}" alt="${escapeHtml(f.filename)}" loading="lazy">`
      : `<span style="font-size: 24px;">📄</span>`;

    const sizeStr = f.file_size ? `${(f.file_size / 1024).toFixed(1)} KB` : '';

    return `
      <div class="adm-file-card">
        <div class="adm-file-thumb">${preview}</div>
        <div class="adm-file-name" title="${escapeHtml(f.filename)}">${escapeHtml(f.filename)}</div>
        <div class="adm-file-meta">${f.folder} &bull; ${sizeStr}</div>
        <div class="adm-file-actions">
          <button class="btn-secondary" style="padding: 3px 6px; font-size: 10px; flex: 1;" onclick="copyToClipboard('${f.public_url}')">Copy Link</button>
          <button class="btn-danger" style="padding: 3px 6px; font-size: 10px;" onclick="promptDeleteFile(${f.id}, '${escapeHtml(f.filename)}', ${f.reference_count || 0})">Del</button>
        </div>
      </div>
    `;
  }).join('');
}

function updateFilePagination(page, totalPages) {
  totalPages = Math.max(1, totalPages || 1);
  const info = document.getElementById('filePageInfo');
  if (info) info.textContent = `Showing page ${page} of ${totalPages} (${appState.filesTotal} files)`;

  const prev = document.getElementById('filePrevBtn');
  const next = document.getElementById('fileNextBtn');
  if (prev) prev.disabled = (page <= 1);
  if (next) next.disabled = (page >= totalPages);
}

async function handleFileUpload(e) {
  e.preventDefault();
  const fileInput = document.getElementById('uploadFileInput');
  const folder = document.getElementById('uploadFolder').value;
  const alert = document.getElementById('uploadModalAlert');

  if (!fileInput.files.length) {
    if (alert) {
      alert.className = 'alert-banner error';
      alert.textContent = 'Please choose a file to upload.';
      alert.style.display = 'block';
    }
    return;
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const startBtn = document.getElementById('startUploadBtn');
  startBtn.disabled = true;
  startBtn.textContent = 'Uploading...';

  try {
    const res = await fetch('/api/admin/files/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');

    closeModal('uploadModal');
    await loadFiles();
    await loadStats();
  } catch (err) {
    if (alert) {
      alert.className = 'alert-banner error';
      alert.textContent = err.message;
      alert.style.display = 'block';
    }
  } finally {
    startBtn.disabled = false;
    startBtn.textContent = 'Upload File';
  }
}

window.promptDeleteFile = function(fileId, filename, refCount) {
  if (refCount > 0) {
    alert(`Cannot delete file "${filename}". It is currently referenced by ${refCount} content item(s). Remove the attachment from those items first.`);
    return;
  }

  document.getElementById('deleteModalTitle').textContent = 'Delete Asset';
  document.getElementById('deleteModalBody').textContent = `Are you sure you want to delete "${filename}"? This will remove the file from Cloudflare R2 and the database.`;

  appState.pendingDeleteAction = async () => {
    try {
      const res = await fetch(`/api/admin/files/${fileId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Deletion failed');
      await loadFiles();
      await loadStats();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  openModal('deleteModal');
};

window.openFilePicker = function(targetInputId) {
  appState.activePickerTargetInputId = targetInputId;
  switchView('files');
};

window.copyToClipboard = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert(`Link copied to clipboard: ${text}`);
    if (appState.activePickerTargetInputId) {
      const target = document.getElementById(appState.activePickerTargetInputId);
      if (target) {
        target.value = text;
        appState.activePickerTargetInputId = null;
        switchView('content');
        openModal('contentModal');
      }
    }
  }).catch(() => {
    prompt('Copy asset URL:', text);
  });
};

// ==========================================
// VIEW 6: SUBSCRIBERS DIRECTORY
// ==========================================
async function loadSubscribers() {
  const tbody = document.getElementById('subscribersTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" class="adm-empty-state">Loading subscribers...</td></tr>';

  try {
    const params = new URLSearchParams({
      page: appState.subscribersPage,
      limit: appState.subscribersLimit,
      status: appState.subscribersStatus,
      q: appState.subscribersSearch
    });

    const res = await fetch(`/api/admin/subscribers?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch subscribers');
    const data = await res.json();

    appState.subscribersTotal = data.total || 0;
    renderSubscribers(data.subscribers || []);
    updateSubscribersPagination(data.page, data.totalPages);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="adm-empty-state" style="color: var(--adm-danger);">Error: ${err.message}</td></tr>`;
  }
}

function renderSubscribers(list) {
  const tbody = document.getElementById('subscribersTableBody');
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="adm-empty-state">No subscribers found matching query.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(sub => `
    <tr>
      <td>${sub.id}</td>
      <td style="font-weight: 600; color: #fff;">${escapeHtml(sub.email)}</td>
      <td>${escapeHtml(sub.name || '—')}</td>
      <td><span class="status-pill ${sub.status}">${sub.status}</span></td>
      <td style="font-size: 11px; color: var(--adm-text-muted);">${escapeHtml(sub.source_page || 'website')}</td>
      <td style="font-size: 11px; color: var(--adm-text-muted);">${formatDate(sub.created_at)}</td>
      <td>
        <div style="display: flex; gap: 6px;">
          ${sub.status === 'active' 
            ? `<button class="btn-secondary" style="padding: 3px 8px; font-size: 11px;" onclick="toggleSubscriberStatus(${sub.id}, 'unsubscribed')">Deactivate</button>` 
            : `<button class="btn-secondary" style="padding: 3px 8px; font-size: 11px;" onclick="toggleSubscriberStatus(${sub.id}, 'active')">Activate</button>`}
          <button class="btn-danger" style="padding: 3px 8px; font-size: 11px;" onclick="promptDeleteSubscriber(${sub.id}, '${escapeHtml(sub.email)}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function updateSubscribersPagination(page, totalPages) {
  totalPages = Math.max(1, totalPages || 1);
  const info = document.getElementById('subscribersPageInfo');
  if (info) info.textContent = `Showing page ${page} of ${totalPages} (${appState.subscribersTotal} total)`;

  const prev = document.getElementById('subscribersPrevBtn');
  const next = document.getElementById('subscribersNextBtn');
  if (prev) prev.disabled = (page <= 1);
  if (next) next.disabled = (page >= totalPages);
}

window.toggleSubscriberStatus = async function(id, newStatus) {
  try {
    const res = await fetch('/api/admin/subscribers/toggle-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    });
    if (res.ok) {
      await loadSubscribers();
      await loadStats();
    }
  } catch (err) {
    alert('Failed to change status: ' + err.message);
  }
};

window.promptDeleteSubscriber = function(id, email) {
  document.getElementById('deleteModalTitle').textContent = 'Delete Subscriber';
  document.getElementById('deleteModalBody').textContent = `Are you sure you want to permanently delete subscriber "${email}"?`;

  appState.pendingDeleteAction = async () => {
    try {
      const res = await fetch('/api/admin/subscribers/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        await loadSubscribers();
        await loadStats();
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  openModal('deleteModal');
};

// ==========================================
// VIEW 7: BROADCAST & DELIVERY LOGS
// ==========================================
async function handleBroadcastSubmit(e) {
  e.preventDefault();
  const alertEl = document.getElementById('broadcastAlert');
  if (alertEl) alertEl.style.display = 'none';

  const subject = document.getElementById('bcastSubject').value.trim();
  const message = document.getElementById('bcastMessage').value.trim();
  const actionText = document.getElementById('bcastActionText').value.trim();
  const actionUrl = document.getElementById('bcastActionUrl').value.trim();
  const isTest = document.getElementById('bcastTestCheck').checked;
  const testEmail = document.getElementById('bcastTestEmail').value.trim();

  if (isTest && !testEmail) {
    if (alertEl) {
      alertEl.className = 'alert-banner error';
      alertEl.textContent = 'Please enter a test email recipient address.';
      alertEl.style.display = 'block';
    }
    return;
  }

  const idempotencyKey = 'bcast_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);

  const executeSend = async () => {
    const submitBtn = document.getElementById('bcastSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Broadcasting...';

    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          message,
          actionText,
          actionUrl,
          idempotencyKey,
          sendTestEmail: isTest,
          testEmailAddress: testEmail
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Broadcast dispatch failed');

      if (alertEl) {
        alertEl.className = 'alert-banner success';
        alertEl.textContent = data.message || 'Broadcast queued successfully!';
        alertEl.style.display = 'block';
      }

      await loadStats();
      await loadLogs();
    } catch (err) {
      if (alertEl) {
        alertEl.className = 'alert-banner error';
        alertEl.textContent = err.message;
        alertEl.style.display = 'block';
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Review & Send Broadcast';
    }
  };

  if (isTest) {
    executeSend();
  } else {
    const activeCount = appState.stats?.subscribers?.active ?? 0;
    document.getElementById('deleteModalTitle').textContent = 'Confirm Broadcast Dispatch';
    document.getElementById('deleteModalBody').textContent = `You are about to broadcast email "${subject}" to ALL ${activeCount} active subscriber(s). This cannot be undone. Proceed?`;
    document.getElementById('confirmDeleteBtn').textContent = `Send to ${activeCount} Subscribers`;

    appState.pendingDeleteAction = () => {
      document.getElementById('confirmDeleteBtn').textContent = 'Delete';
      executeSend();
    };

    openModal('deleteModal');
  }
}

async function loadLogs() {
  const tbody = document.getElementById('logsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="4" class="adm-empty-state">Loading delivery logs...</td></tr>';

  try {
    const params = new URLSearchParams({ page: appState.logsPage, limit: appState.logsLimit });
    const res = await fetch(`/api/admin/logs?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch logs');
    const data = await res.json();

    const logs = data.logs || [];
    if (!logs.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="adm-empty-state">No email delivery logs recorded yet.</td></tr>';
      return;
    }

    tbody.innerHTML = logs.map(l => `
      <tr>
        <td style="font-weight: 500; color: #fff;">${escapeHtml(l.recipient_email)}</td>
        <td><span style="font-size: 10px; text-transform: uppercase; color: var(--adm-primary); font-weight: 600;">${escapeHtml(l.email_type)}</span></td>
        <td><span class="status-pill ${l.status}">${l.status}</span></td>
        <td style="font-size: 11px; color: var(--adm-text-muted);">${formatDate(l.created_at)}</td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" class="adm-empty-state" style="color: var(--adm-danger);">Error: ${err.message}</td></tr>`;
  }
}

// ==========================================
// VIEW 8: SETTINGS & AUDIT LOGS
// ==========================================
async function loadSettingsAndAudit() {
  // Service status
  try {
    const res = await fetch('/api/admin/settings/status');
    if (res.ok) {
      const data = await res.json();

      const r2El = document.getElementById('statusR2');
      if (r2El) {
        r2El.textContent = data.r2_storage?.configured ? 'Bound' : 'Not Configured';
        r2El.style.color = data.r2_storage?.configured ? '#34d399' : '#fbbf24';
      }

      const anaEl = document.getElementById('statusAnalytics');
      if (anaEl) {
        anaEl.textContent = data.analytics?.configured ? 'Connected' : 'Not Connected';
        anaEl.style.color = data.analytics?.configured ? '#34d399' : '#fbbf24';
      }

      const mailerDomain = document.getElementById('statusMailerSendDomain');
      if (mailerDomain && data.mailersend?.from_email) {
        mailerDomain.textContent = data.mailersend.from_email;
      }
    }
  } catch (err) {
    console.error('[Settings Status Error]:', err);
  }

  // Audit table
  const tbody = document.getElementById('auditTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" class="adm-empty-state">Loading audit logs...</td></tr>';

  try {
    const res = await fetch('/api/admin/audit-logs');
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    const data = await res.json();

    const logs = data.logs || [];
    if (!logs.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="adm-empty-state">No audit logs recorded yet.</td></tr>';
      return;
    }

    tbody.innerHTML = logs.map(l => `
      <tr>
        <td style="font-size: 11px; color: var(--adm-text-muted); font-family: var(--adm-font-mono);">${formatDate(l.created_at)}</td>
        <td style="font-weight: 600; color: #fff;">${escapeHtml(l.admin_username)}</td>
        <td><span class="status-pill active">${escapeHtml(l.action)}</span></td>
        <td>${escapeHtml(l.target_type || '—')} ${l.target_id ? `(${escapeHtml(l.target_id)})` : ''}</td>
        <td style="max-width: 240px; font-size: 11px; color: var(--adm-text-subtle); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(l.details || '')}">${escapeHtml(l.details || '—')}</td>
        <td style="font-family: var(--adm-font-mono); font-size: 11px; color: var(--adm-text-subtle);">${escapeHtml(l.ip_address || '—')}</td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="adm-empty-state" style="color: var(--adm-danger);">Error: ${err.message}</td></tr>`;
  }
}

// ==========================================
// MODAL CONTROLS & UTILITIES
// ==========================================
window.openModal = function(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.add('open');
};

window.closeModal = function(modalId) {
  if (modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('open');
  } else {
    document.querySelectorAll('.adm-modal-backdrop').forEach(m => m.classList.remove('open'));
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (_) {
    return iso;
  }
}

