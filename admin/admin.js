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
      window.location.replace('/admin/login');
      return;
    }
    const meData = await meRes.json();
    if (meData.username) {
      const el = document.getElementById('adminUsername');
      if (el) el.textContent = meData.username;
    }
  } catch (_) {
    window.location.replace('/admin/login');
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
  const sidebar = document.getElementById('admSidebar');
  const backdrop = document.getElementById('admSidebarBackdrop');

  const closeSidebar = () => {
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  };

  // Sidebar navigation items
  document.querySelectorAll('.adm-nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetView = btn.dataset.view;
      if (targetView) {
        window.location.hash = targetView;
        switchView(targetView);
        closeSidebar();
      }
    });
  });

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobileToggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      if (sidebar) {
        sidebar.classList.toggle('open');
        if (backdrop) backdrop.classList.toggle('open', sidebar.classList.contains('open'));
      }
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeSidebar);
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
    regional: 'Regional Anaesthesia — Real Images',
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
  if (viewName === 'regional') loadRegionalImages();
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
      window.location.replace('/admin/login');
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

  const regionalForm = document.getElementById('regionalForm');
  if (regionalForm) {
    regionalForm.addEventListener('submit', handleRegionalFormSubmit);
  }
  initMarkerEditor();

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
      renderRumBreakdown(data);
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

    renderRumBreakdown(data);
  } catch (err) {
    if (alert) {
      alert.className = 'alert-banner error';
      alert.textContent = `Failed to load analytics: ${err.message}`;
      alert.style.display = 'block';
    }
  }
}

// ------------------------------------------------------------------------
// RUM BREAKDOWN RENDERER (Top Pages / Countries / Devices / Browsers / OS / Referrers)
// ------------------------------------------------------------------------
function renderBarList(containerId, rows) {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (!rows || !rows.length) {
    el.innerHTML = '<div class="adm-empty-state" style="padding: 12px 0;">No data for this period.</div>';
    return;
  }

  const maxCount = Math.max(...rows.map(r => r.count || 0), 1);
  el.innerHTML = rows.map(r => {
    const pct = Math.max(2, Math.round(((r.count || 0) / maxCount) * 100));
    return `
      <div class="adm-bar-row">
        <div class="adm-bar-row-labels">
          <span title="${escapeHtml(r.name)}">${escapeHtml(r.name)}</span>
          <span>${(r.count || 0).toLocaleString()}</span>
        </div>
        <div class="adm-bar-track"><div class="adm-bar-fill" style="width: ${pct}%;"></div></div>
      </div>
    `;
  }).join('');
}

function renderRumBreakdown(data) {
  const rumAlert = document.getElementById('analyticsRumAlert');
  const panels = ['rumTopPaths', 'rumTopCountries', 'rumDevices', 'rumBrowsers', 'rumOperatingSystems', 'rumReferrers'];

  if (!data.rumConnected) {
    if (rumAlert) {
      rumAlert.className = 'alert-banner warning';
      rumAlert.textContent = data.rumReason || 'Cloudflare Web Analytics (RUM) is not connected.';
      rumAlert.style.display = 'block';
    }
    panels.forEach(id => renderBarList(id, []));
    return;
  }

  if (rumAlert) rumAlert.style.display = 'none';
  renderBarList('rumTopPaths', data.topPaths);
  renderBarList('rumTopCountries', data.topCountries);
  renderBarList('rumDevices', data.devices);
  renderBarList('rumBrowsers', data.browsers);
  renderBarList('rumOperatingSystems', data.operatingSystems);
  renderBarList('rumReferrers', data.referrers);
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

// ==========================================
// REGIONAL ANAESTHESIA — REAL ULTRASOUND IMAGES
// Attach a real (or properly licensed reference) ultrasound image URL to a
// block. Additive to the existing CMS: its own D1 table, its own routes,
// its own view — does not touch content/files/subscribers/email logic.
// ==========================================

// Kept in sync by hand with regional-data.js's block list (id/short/cat) —
// this admin panel only needs id + a readable label, not the full block data.
const REGIONAL_BLOCKS = [
  { id: 'interscalene', short: 'Interscalene', cat: 'Upper Limb' },
  { id: 'supraclavicular', short: 'Supraclavicular', cat: 'Upper Limb' },
  { id: 'infraclavicular', short: 'Infraclavicular', cat: 'Upper Limb' },
  { id: 'axillary', short: 'Axillary', cat: 'Upper Limb' },
  { id: 'axillary-nerve', short: 'Axillary Nerve (Quadrilateral Space)', cat: 'Upper Limb' },
  { id: 'intercostobrachial', short: 'Intercostobrachial (ICBN)', cat: 'Upper Limb' },
  { id: 'suprascapular', short: 'Suprascapular', cat: 'Upper Limb' },
  { id: 'femoral', short: 'Femoral', cat: 'Lower Limb' },
  { id: 'fascia-iliaca', short: 'Fascia Iliaca', cat: 'Lower Limb' },
  { id: 'fascia-iliaca-suprainguinal', short: 'Fascia Iliaca (Suprainguinal)', cat: 'Lower Limb' },
  { id: 'peng', short: 'PENG', cat: 'Lower Limb' },
  { id: 'lfcn', short: 'LFCN', cat: 'Lower Limb' },
  { id: 'adductor-canal', short: 'Adductor Canal', cat: 'Lower Limb' },
  { id: 'ipack', short: 'iPACK', cat: 'Lower Limb' },
  { id: 'popliteal', short: 'Popliteal Sciatic', cat: 'Lower Limb' },
  { id: 'sciatic-subgluteal', short: 'Sciatic (Subgluteal)', cat: 'Lower Limb' },
  { id: 'sciatic-transgluteal', short: 'Sciatic (Transgluteal)', cat: 'Lower Limb' },
  { id: 'sciatic-anterior', short: 'Sciatic (Anterior)', cat: 'Lower Limb' },
  { id: 'obturator', short: 'Obturator', cat: 'Lower Limb' },
  { id: 'lumbar-plexus', short: 'Lumbar Plexus (Shamrock)', cat: 'Lower Limb' },
  { id: 'ankle', short: 'Ankle Block', cat: 'Lower Limb' },
  { id: 'saphenous-ankle', short: 'Saphenous (Ankle)', cat: 'Lower Limb' },
  { id: 'pecs', short: 'PECS I & II', cat: 'Chest Wall & Paraspinal' },
  { id: 'serratus', short: 'Serratus Anterior', cat: 'Chest Wall & Paraspinal' },
  { id: 'esp', short: 'Erector Spinae (ESP)', cat: 'Chest Wall & Paraspinal' },
  { id: 'tpvb', short: 'Thoracic Paravertebral', cat: 'Chest Wall & Paraspinal' },
  { id: 'tap', short: 'TAP', cat: 'Abdominal Wall' },
  { id: 'subcostal-tap', short: 'Subcostal TAP', cat: 'Abdominal Wall' },
  { id: 'rectus-sheath', short: 'Rectus Sheath', cat: 'Abdominal Wall' },
  { id: 'ql', short: 'Quadratus Lumborum', cat: 'Abdominal Wall' },
  { id: 'transversalis-fascia-plane', short: 'Transversalis Fascia Plane', cat: 'Abdominal Wall' },
  { id: 'ilioinguinal', short: 'Ilioinguinal / Iliohypogastric', cat: 'Abdominal Wall' },
  { id: 'cervical-plexus', short: 'Superficial Cervical Plexus', cat: 'Head & Neck' },
  { id: 'scalp', short: 'Scalp Block', cat: 'Head & Neck' },
  { id: 'spinal', short: 'Spinal', cat: 'Neuraxial' },
  { id: 'epidural', short: 'Epidural', cat: 'Neuraxial' },
  { id: 'caudal', short: 'Caudal', cat: 'Neuraxial' },
  { id: 'paeds-popliteal', short: 'Popliteal Sciatic (Paeds)', cat: 'Paediatric Blocks' },
  { id: 'paeds-femoral', short: 'Femoral (Paeds)', cat: 'Paediatric Blocks' },
  { id: 'paeds-penile', short: 'Penile Nerve Block (Paeds)', cat: 'Paediatric Blocks' },
  { id: 'paeds-caudal', short: 'Caudal (Paeds)', cat: 'Paediatric Blocks' },
  { id: 'paeds-ql', short: 'Quadratus Lumborum (Paeds)', cat: 'Paediatric Blocks' },
  { id: 'paeds-rectus-sheath', short: 'Rectus Sheath (Paeds)', cat: 'Paediatric Blocks' },
  { id: 'paeds-axillary', short: 'Axillary Brachial Plexus (Paeds)', cat: 'Paediatric Blocks' }
];

let regionalImagesCache = {};

function populateRegionalBlockSelect() {
  const sel = document.getElementById('regBlockSelect');
  if (!sel || sel.options.length) return;
  let html = '';
  let lastCat = null;
  REGIONAL_BLOCKS.forEach((b) => {
    if (b.cat !== lastCat) { if (lastCat !== null) html += '</optgroup>'; html += `<optgroup label="${escapeHtml(b.cat)}">`; lastCat = b.cat; }
    html += `<option value="${b.id}">${escapeHtml(b.short)}</option>`;
  });
  html += '</optgroup>';
  sel.innerHTML = html;
}

function renderRegionalTable() {
  const body = document.getElementById('regionalTableBody');
  if (!body) return;
  const rows = Object.values(regionalImagesCache).sort((a, b) => a.block_id.localeCompare(b.block_id));
  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="5" style="color: var(--adm-text-subtle);">No blocks have a real image set yet.</td></tr>';
    return;
  }
  body.innerHTML = rows.map((r) => {
    const label = (REGIONAL_BLOCKS.find((b) => b.id === r.block_id) || {}).short || r.block_id;
    return `<tr>
      <td style="font-weight: 600; color: #fff;">${escapeHtml(label)}</td>
      <td>${escapeHtml(r.source || '—')}</td>
      <td style="font-size: 12px; color: var(--adm-text-subtle);">${escapeHtml([r.orientation, r.probe].filter(Boolean).join(' · ') || '—')}</td>
      <td style="font-size: 12px; color: var(--adm-text-subtle);">${escapeHtml((r.updated_at || '').replace('T', ' ').slice(0, 16))}</td>
      <td>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <a href="${escapeHtml(r.image_url)}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="padding: 3px 8px; font-size: 11px;">View</a>
          <button class="btn-secondary" style="padding: 3px 8px; font-size: 11px;" onclick="editRegionalImage('${r.block_id}')">Edit</button>
          <button class="btn-secondary" style="padding: 3px 8px; font-size: 11px;" onclick="openMarkerEditor('${r.block_id}')">Markers${(r.labels || []).length ? ` (${r.labels.length})` : ''}</button>
          <button class="btn-danger" style="padding: 3px 8px; font-size: 11px;" onclick="promptDeleteRegionalImage('${r.block_id}', '${escapeHtml(label)}')">Delete</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

async function loadRegionalImages() {
  populateRegionalBlockSelect();
  const body = document.getElementById('regionalTableBody');
  if (body) body.innerHTML = '<tr><td colspan="5">Loading…</td></tr>';
  try {
    const res = await fetch('/api/admin/regional-images');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load');
    const notice = document.getElementById('regionalMigrationNotice');
    // A missing table degrades to an empty map server-side (see
    // worker/regional-images.js) — we can't tell "no rows yet" apart from
    // "table not migrated" from here, so this stays informational, not blocking.
    if (notice) notice.style.display = 'none';
    regionalImagesCache = data.images || {};
    renderRegionalTable();
  } catch (err) {
    if (body) body.innerHTML = `<tr><td colspan="5" style="color: var(--adm-danger, #ef4444);">${escapeHtml(err.message)}</td></tr>`;
  }
}

window.editRegionalImage = function(blockId) {
  const r = regionalImagesCache[blockId];
  if (!r) return;
  document.getElementById('regBlockSelect').value = blockId;
  document.getElementById('regImageUrl').value = r.image_url || '';
  document.getElementById('regSource').value = r.source || 'KnockoutNotes / user-provided';
  document.getElementById('regAttribution').value = r.attribution || '';
  document.getElementById('regOrientation').value = r.orientation || '';
  document.getElementById('regProbe').value = r.probe || '';
  document.getElementById('regNotes').value = r.notes || '';
  document.getElementById('regBlockSelect').scrollIntoView({ behavior: 'smooth', block: 'center' });
};

window.promptDeleteRegionalImage = function(blockId, label) {
  document.getElementById('deleteModalTitle').textContent = 'Remove Real Image';
  document.getElementById('deleteModalBody').textContent = `Remove the real ultrasound image set for "${label}"? The block will fall back to its simulated schematic on the public site.`;

  appState.pendingDeleteAction = async () => {
    try {
      const res = await fetch(`/api/admin/regional-images/${encodeURIComponent(blockId)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Deletion failed');
      await loadRegionalImages();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  openModal('deleteModal');
};

async function handleRegionalFormSubmit(e) {
  e.preventDefault();
  const alertEl = document.getElementById('regionalAlert');
  const btn = document.getElementById('regSubmitBtn');
  const payload = {
    block_id: document.getElementById('regBlockSelect').value,
    image_url: document.getElementById('regImageUrl').value.trim(),
    source: document.getElementById('regSource').value,
    attribution: document.getElementById('regAttribution').value.trim(),
    orientation: document.getElementById('regOrientation').value,
    probe: document.getElementById('regProbe').value,
    notes: document.getElementById('regNotes').value.trim()
  };

  if (alertEl) alertEl.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Saving…';

  try {
    const res = await fetch('/api/admin/regional-images', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Save failed');

    if (alertEl) {
      alertEl.className = 'alert-banner success';
      alertEl.textContent = `Saved. "${(REGIONAL_BLOCKS.find((b) => b.id === payload.block_id) || {}).short || payload.block_id}" now shows this real image on the public site.`;
      alertEl.style.display = 'block';
    }
    document.getElementById('regionalForm').reset();
    await loadRegionalImages();
  } catch (err) {
    const notice = document.getElementById('regionalMigrationNotice');
    if (notice && /regional_block_images table not found/i.test(err.message)) notice.style.display = 'block';
    if (alertEl) {
      alertEl.className = 'alert-banner error';
      alertEl.textContent = err.message;
      alertEl.style.display = 'block';
    }
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Image for This Block';
  }
}

// ==========================================
// REGIONAL ANAESTHESIA — MARKER EDITOR
// Click-to-place / drag structure labels, needle line and spread-area
// ellipse directly on a block's real ultrasound image. Saves to
// PUT /api/admin/regional-images/:blockId/markers (separate from the image
// URL form above, so the two can never accidentally clobber each other).
// Coordinates are percent-of-image (0-100), matching regional-sono.js's
// renderReal() on the public page exactly — what you place here is what
// visitors see, at the same position.
// ==========================================

const MARKER_TYPE_COLORS = {
  muscle: '#be123c', nerve: '#f59e0b', artery: '#dc2626', vein: '#2563eb',
  bone: '#475569', pleura: '#0d9488', bowel: '#0f766e', organ: '#7c3aed',
  fascia: '#0891b2', ligament: '#0891b2', sheath: '#0891b2', tendon: '#6b7280',
  space: '#0284c7', marker: '#15803d', point: '#e11d48'
};
const MARKER_TYPES = Object.keys(MARKER_TYPE_COLORS);

let markerState = { blockId: null, imageUrl: '', labels: [], needleOverlay: null, spreadOverlay: [] };
let markerMode = null; // null | 'add' | 'needle' | 'spread'
let markerNeedleStep = 0; // 0 = next click sets "from", 1 = next click sets "to"
let markerDrag = null; // { kind: 'label'|'spread'|'needle-from'|'needle-to', idx }

function clampNum(v, min, max, fallback) {
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
function round1(n) { return Math.round(n * 10) / 10; }

function setMarkerMode(mode) {
  markerMode = mode;
  markerNeedleStep = 0;
  document.querySelectorAll('.marker-mode-btn').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
  const hints = {
    add: 'Click the image to add a structure marker.',
    needle: 'Click the needle entry point, then the tip.',
    spread: 'Click the image to place a spread-area ellipse.'
  };
  const hintEl = document.getElementById('markerModeHint');
  if (hintEl) hintEl.textContent = hints[mode] || '';
  const stage = document.getElementById('markerStage');
  if (stage) stage.style.cursor = mode ? 'crosshair' : 'default';
}

function renderMarkerOverlay() {
  const svg = document.getElementById('markerOverlaySvg');
  if (!svg) return;
  let html = '';
  markerState.spreadOverlay.forEach((s, i) => {
    html += `<ellipse class="marker-dot" data-kind="spread" data-idx="${i}" cx="${s.x}" cy="${s.y}" rx="${s.rx}" ry="${s.ry}" fill="rgba(14,165,233,0.28)" stroke="#0ea5e9" stroke-width="0.6" style="cursor:grab;"></ellipse>`;
  });
  if (markerState.needleOverlay) {
    const n = markerState.needleOverlay;
    html += `<line x1="${n.from[0]}" y1="${n.from[1]}" x2="${n.to[0]}" y2="${n.to[1]}" stroke="#f8fafc" stroke-width="0.6"></line>`;
    html += `<circle class="marker-dot" data-kind="needle-from" cx="${n.from[0]}" cy="${n.from[1]}" r="1.8" fill="#94a3b8" stroke="#0f172a" stroke-width="0.4" style="cursor:grab;"></circle>`;
    html += `<circle class="marker-dot" data-kind="needle-to" cx="${n.to[0]}" cy="${n.to[1]}" r="1.8" fill="#f8fafc" stroke="#0f172a" stroke-width="0.4" style="cursor:grab;"></circle>`;
  }
  markerState.labels.forEach((l, i) => {
    const color = MARKER_TYPE_COLORS[l.type] || MARKER_TYPE_COLORS.marker;
    html += `<circle class="marker-dot" data-kind="label" data-idx="${i}" cx="${l.x}" cy="${l.y}" r="2.4" fill="${color}" stroke="#fff" stroke-width="0.6" style="cursor:grab;"><title>${escapeHtml(l.text)}</title></circle>`;
    html += `<text x="${l.x}" y="${Math.max(3, l.y - 3.4)}" font-size="3.4" fill="#fff" text-anchor="middle" style="paint-order: stroke; stroke: #000; stroke-width: 0.7px; pointer-events: none;">${i + 1}</text>`;
  });
  svg.innerHTML = html;
}

function syncLabelRowInputs(i) {
  const xEl = document.getElementById(`marker-x-${i}`);
  const yEl = document.getElementById(`marker-y-${i}`);
  if (xEl) xEl.value = markerState.labels[i].x;
  if (yEl) yEl.value = markerState.labels[i].y;
}
function syncSpreadRowInputs(i) {
  const xEl = document.getElementById(`spread-x-${i}`);
  const yEl = document.getElementById(`spread-y-${i}`);
  if (xEl) xEl.value = markerState.spreadOverlay[i].x;
  if (yEl) yEl.value = markerState.spreadOverlay[i].y;
}
function syncNeedleInputs() {
  const n = markerState.needleOverlay;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v == null ? '' : v; };
  set('needleFromX', n ? n.from[0] : '');
  set('needleFromY', n ? n.from[1] : '');
  set('needleToX', n ? n.to[0] : '');
  set('needleToY', n ? n.to[1] : '');
}

function renderMarkerList() {
  const body = document.getElementById('markerListBody');
  if (!body) return;
  if (!markerState.labels.length) {
    body.innerHTML = '<tr><td colspan="5" style="color: var(--adm-text-subtle);">No markers yet — use "+ Add Marker" above.</td></tr>';
    return;
  }
  body.innerHTML = markerState.labels.map((l, i) => `
    <tr>
      <td><input type="text" class="form-input" style="min-width: 130px;" value="${escapeHtml(l.text)}" oninput="updateMarkerLabel(${i}, 'text', this.value)"></td>
      <td><select class="form-select" onchange="updateMarkerLabel(${i}, 'type', this.value)">
        ${MARKER_TYPES.map((t) => `<option value="${t}" ${t === l.type ? 'selected' : ''}>${t}</option>`).join('')}
      </select></td>
      <td><input type="number" id="marker-x-${i}" class="form-input" style="width: 70px;" min="0" max="100" step="0.1" value="${l.x}" oninput="updateMarkerLabel(${i}, 'x', this.value)"></td>
      <td><input type="number" id="marker-y-${i}" class="form-input" style="width: 70px;" min="0" max="100" step="0.1" value="${l.y}" oninput="updateMarkerLabel(${i}, 'y', this.value)"></td>
      <td><button type="button" class="btn-danger" style="padding: 3px 8px; font-size: 11px;" onclick="removeMarkerLabel(${i})">×</button></td>
    </tr>`).join('');
}

function renderSpreadList() {
  const body = document.getElementById('spreadListBody');
  if (!body) return;
  if (!markerState.spreadOverlay.length) {
    body.innerHTML = '<tr><td colspan="6" style="color: var(--adm-text-subtle);">None — use "Set Spread Area" above.</td></tr>';
    return;
  }
  body.innerHTML = markerState.spreadOverlay.map((s, i) => `
    <tr>
      <td><input type="number" id="spread-x-${i}" class="form-input" style="width: 65px;" min="0" max="100" step="0.1" value="${s.x}" oninput="updateSpreadField(${i}, 'x', this.value)"></td>
      <td><input type="number" id="spread-y-${i}" class="form-input" style="width: 65px;" min="0" max="100" step="0.1" value="${s.y}" oninput="updateSpreadField(${i}, 'y', this.value)"></td>
      <td><input type="number" id="spread-rx-${i}" class="form-input" style="width: 65px;" min="1" max="100" step="0.1" value="${s.rx}" oninput="updateSpreadField(${i}, 'rx', this.value)"></td>
      <td><input type="number" id="spread-ry-${i}" class="form-input" style="width: 65px;" min="1" max="100" step="0.1" value="${s.ry}" oninput="updateSpreadField(${i}, 'ry', this.value)"></td>
      <td><input type="text" class="form-input" style="min-width: 110px;" value="${escapeHtml(s.note || '')}" oninput="updateSpreadField(${i}, 'note', this.value)"></td>
      <td><button type="button" class="btn-danger" style="padding: 3px 8px; font-size: 11px;" onclick="removeSpread(${i})">×</button></td>
    </tr>`).join('');
}

window.updateMarkerLabel = function(i, field, value) {
  const l = markerState.labels[i];
  if (!l) return;
  if (field === 'x' || field === 'y') l[field] = clampNum(value, 0, 100, l[field]);
  else l[field] = value;
  renderMarkerOverlay();
};
window.removeMarkerLabel = function(i) {
  markerState.labels.splice(i, 1);
  renderMarkerList();
  renderMarkerOverlay();
};
window.updateSpreadField = function(i, field, value) {
  const s = markerState.spreadOverlay[i];
  if (!s) return;
  if (field === 'note') s.note = value;
  else s[field] = clampNum(value, field === 'rx' || field === 'ry' ? 1 : 0, 100, s[field]);
  renderMarkerOverlay();
};
window.removeSpread = function(i) {
  markerState.spreadOverlay.splice(i, 1);
  renderSpreadList();
  renderMarkerOverlay();
};

function updateNeedleField(part, axis, value) {
  if (!markerState.needleOverlay) markerState.needleOverlay = { from: [10, 90], to: [50, 50] };
  const idx = axis === 'x' ? 0 : 1;
  markerState.needleOverlay[part][idx] = clampNum(value, 0, 100, markerState.needleOverlay[part][idx]);
  renderMarkerOverlay();
}

function stageToPct(e) {
  const rect = document.getElementById('markerStage').getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  return [Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y))];
}

function onMarkerStagePointerDown(e) {
  if (!markerState.blockId) return;
  const dot = e.target.closest('.marker-dot');
  if (dot) {
    markerDrag = { kind: dot.dataset.kind, idx: dot.dataset.idx != null && dot.dataset.idx !== '' ? Number(dot.dataset.idx) : null };
    if (e.target.setPointerCapture) { try { e.target.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ } }
    e.preventDefault();
    return;
  }
  const [x, y] = stageToPct(e);
  if (markerMode === 'add') {
    markerState.labels.push({ id: `marker-${Date.now()}-${markerState.labels.length}`, text: 'New structure', type: 'marker', x: round1(x), y: round1(y) });
    renderMarkerList();
    renderMarkerOverlay();
  } else if (markerMode === 'needle') {
    if (markerNeedleStep === 0) {
      markerState.needleOverlay = { from: [round1(x), round1(y)], to: [round1(x), round1(y)] };
      markerNeedleStep = 1;
      const hintEl = document.getElementById('markerModeHint');
      if (hintEl) hintEl.textContent = 'Now click the needle tip.';
    } else {
      markerState.needleOverlay.to = [round1(x), round1(y)];
      setMarkerMode(null);
    }
    syncNeedleInputs();
    renderMarkerOverlay();
  } else if (markerMode === 'spread') {
    markerState.spreadOverlay.push({ shape: 'ellipse', x: round1(x), y: round1(y), rx: 15, ry: 10, note: '', variable: false });
    renderSpreadList();
    renderMarkerOverlay();
    setMarkerMode(null);
  }
}

function onMarkerStagePointerMove(e) {
  if (!markerDrag) return;
  const [x, y] = stageToPct(e);
  const rx = round1(x), ry = round1(y);
  if (markerDrag.kind === 'label') {
    markerState.labels[markerDrag.idx].x = rx;
    markerState.labels[markerDrag.idx].y = ry;
    syncLabelRowInputs(markerDrag.idx);
  } else if (markerDrag.kind === 'spread') {
    markerState.spreadOverlay[markerDrag.idx].x = rx;
    markerState.spreadOverlay[markerDrag.idx].y = ry;
    syncSpreadRowInputs(markerDrag.idx);
  } else if (markerDrag.kind === 'needle-from') {
    markerState.needleOverlay.from = [rx, ry];
    syncNeedleInputs();
  } else if (markerDrag.kind === 'needle-to') {
    markerState.needleOverlay.to = [rx, ry];
    syncNeedleInputs();
  }
  renderMarkerOverlay();
}

function onMarkerStagePointerUp() { markerDrag = null; }

window.openMarkerEditor = function(blockId) {
  const r = regionalImagesCache[blockId];
  if (!r) { alert('Set a real image for this block first, using the form above — markers are placed on top of that image.'); return; }
  const label = (REGIONAL_BLOCKS.find((b) => b.id === blockId) || {}).short || blockId;
  markerState = {
    blockId,
    imageUrl: r.image_url,
    labels: JSON.parse(JSON.stringify(r.labels || [])),
    needleOverlay: r.needleOverlay ? JSON.parse(JSON.stringify(r.needleOverlay)) : null,
    spreadOverlay: JSON.parse(JSON.stringify(r.spreadOverlay || []))
  };
  setMarkerMode(null);
  const titleEl = document.getElementById('markerEditorTitle');
  const imgEl = document.getElementById('markerImage');
  const alertEl = document.getElementById('markerAlert');
  if (titleEl) titleEl.textContent = label;
  if (imgEl) imgEl.src = r.image_url;
  if (alertEl) alertEl.style.display = 'none';
  renderMarkerList();
  renderSpreadList();
  syncNeedleInputs();
  renderMarkerOverlay();
  const card = document.getElementById('markerEditorCard');
  if (card) { card.style.display = 'block'; card.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
};

async function handleMarkerSave() {
  const btn = document.getElementById('markerSaveBtn');
  const alertEl = document.getElementById('markerAlert');
  if (!markerState.blockId) return;
  btn.disabled = true;
  btn.textContent = 'Saving…';
  try {
    const res = await fetch(`/api/admin/regional-images/${encodeURIComponent(markerState.blockId)}/markers`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ labels: markerState.labels, needleOverlay: markerState.needleOverlay, spreadOverlay: markerState.spreadOverlay })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Save failed');
    regionalImagesCache[markerState.blockId] = data.image;
    renderRegionalTable();
    if (alertEl) {
      alertEl.className = 'alert-banner success';
      alertEl.textContent = 'Markers saved — the public page now shows these.';
      alertEl.style.display = 'block';
    }
  } catch (err) {
    if (alertEl) {
      alertEl.className = 'alert-banner error';
      alertEl.textContent = err.message;
      alertEl.style.display = 'block';
    }
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Markers';
  }
}

function initMarkerEditor() {
  document.querySelectorAll('.marker-mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      setMarkerMode(markerMode === mode ? null : mode);
    });
  });
  const stage = document.getElementById('markerStage');
  if (stage) {
    stage.addEventListener('pointerdown', onMarkerStagePointerDown);
    stage.addEventListener('pointermove', onMarkerStagePointerMove);
    window.addEventListener('pointerup', onMarkerStagePointerUp);
  }
  ['needleFromX', 'needleFromY', 'needleToX', 'needleToY'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const part = id.includes('From') ? 'from' : 'to';
    const axis = id.endsWith('X') ? 'x' : 'y';
    el.addEventListener('input', () => updateNeedleField(part, axis, el.value));
  });
  const needleClearBtn = document.getElementById('needleClearBtn');
  if (needleClearBtn) {
    needleClearBtn.addEventListener('click', () => {
      markerState.needleOverlay = null;
      syncNeedleInputs();
      renderMarkerOverlay();
    });
  }
  const saveBtn = document.getElementById('markerSaveBtn');
  if (saveBtn) saveBtn.addEventListener('click', handleMarkerSave);
  const resetBtn = document.getElementById('markerResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (markerState.blockId) window.openMarkerEditor(markerState.blockId);
    });
  }
  const closeBtn = document.getElementById('markerEditorClose');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const card = document.getElementById('markerEditorCard');
      if (card) card.style.display = 'none';
      setMarkerMode(null);
    });
  }
}

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

      const rumEl = document.getElementById('statusRum');
      if (rumEl) {
        rumEl.textContent = data.analytics?.rum_configured ? 'Connected' : 'Not Connected';
        rumEl.style.color = data.analytics?.rum_configured ? '#34d399' : '#fbbf24';
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

