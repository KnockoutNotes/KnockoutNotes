/**
 * KnockoutNotes Admin Dashboard Client Logic
 */

let state = {
  activeTab: 'subscribersTab',
  subscribersPage: 1,
  subscribersLimit: 25,
  subscribersTotal: 0,
  subscribersStatus: 'all',
  subscribersSearch: '',
  logsPage: 1,
  logsLimit: 25,
  logsTotal: 0,
  stats: null
};

// ==========================================
// INITIALIZATION & AUTH CHECK
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
      document.getElementById('adminUsername').textContent = meData.username;
    }
  } catch (_) {
    window.location.replace('/admin/login.html');
    return;
  }

  setupEventListeners();
  generateNewIdempotency();
  await loadStats();
  await loadSubscribers();
});

// ==========================================
// EVENT LISTENERS SETUP
// ==========================================
function setupEventListeners() {
  // Logout
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (_) {}
    window.location.replace('/admin/login.html');
  });

  // Tab Switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetTab = e.target.dataset.tab;
      switchTab(targetTab);
    });
  });

  // Subscriber Controls
  let debounceTimeout = null;
  document.getElementById('subscriberSearch').addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      state.subscribersSearch = e.target.value.trim();
      state.subscribersPage = 1;
      loadSubscribers();
    }, 300);
  });

  document.getElementById('statusFilter').addEventListener('change', (e) => {
    state.subscribersStatus = e.target.value;
    state.subscribersPage = 1;
    loadSubscribers();
  });

  document.getElementById('exportCsvBtn').addEventListener('click', () => {
    window.location.href = '/api/admin/subscribers/export';
  });

  document.getElementById('prevPageBtn').addEventListener('click', () => {
    if (state.subscribersPage > 1) {
      state.subscribersPage--;
      loadSubscribers();
    }
  });

  document.getElementById('nextPageBtn').addEventListener('click', () => {
    const maxPage = Math.ceil(state.subscribersTotal / state.subscribersLimit);
    if (state.subscribersPage < maxPage) {
      state.subscribersPage++;
      loadSubscribers();
    }
  });

  // Regenerate Idempotency
  document.getElementById('refreshIdempotencyBtn').addEventListener('click', generateNewIdempotency);

  // Test Email Toggles
  const pubTestCheck = document.getElementById('pubTestEmailCheck');
  const pubTestWrapper = document.getElementById('pubTestEmailWrapper');
  pubTestCheck.addEventListener('change', () => {
    pubTestWrapper.style.display = pubTestCheck.checked ? 'block' : 'none';
  });

  const bcastTestCheck = document.getElementById('bcastTestEmailCheck');
  const bcastTestWrapper = document.getElementById('bcastTestEmailWrapper');
  bcastTestCheck.addEventListener('change', () => {
    bcastTestWrapper.style.display = bcastTestCheck.checked ? 'block' : 'none';
  });

  // Publish Form Submit
  document.getElementById('publishForm').addEventListener('submit', handlePublishSubmit);

  // Broadcast Form Submit
  document.getElementById('broadcastForm').addEventListener('submit', handleBroadcastSubmit);

  // Logs Controls
  document.getElementById('refreshLogsBtn').addEventListener('click', loadLogs);
  document.getElementById('logsPrevBtn').addEventListener('click', () => {
    if (state.logsPage > 1) {
      state.logsPage--;
      loadLogs();
    }
  });
  document.getElementById('logsNextBtn').addEventListener('click', () => {
    const maxPage = Math.ceil(state.logsTotal / state.logsLimit);
    if (state.logsPage < maxPage) {
      state.logsPage++;
      loadLogs();
    }
  });

  // Modal Cancel
  document.getElementById('modalCancelBtn').addEventListener('click', closeModal);
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === tabId);
  });
  state.activeTab = tabId;

  if (tabId === 'logsTab') {
    loadLogs();
  }
}

function generateNewIdempotency() {
  const key = 'event_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
  document.getElementById('pubIdempotency').value = key;
}

// ==========================================
// STATS
// ==========================================
async function loadStats() {
  try {
    const res = await fetch('/api/admin/stats');
    if (!res.ok) return;
    const data = await res.json();
    state.stats = data;

    document.getElementById('statActive').textContent = data.subscribers?.active ?? 0;
    document.getElementById('statPending').textContent = data.subscribers?.pending ?? 0;
    document.getElementById('statUnsubscribed').textContent = data.subscribers?.unsubscribed ?? 0;
    document.getElementById('statEmailsSent').textContent = data.emails?.sent ?? 0;
    document.getElementById('statEmailsFailed').textContent = `${data.emails?.failed ?? 0} failed attempts`;

    const activeCount = data.subscribers?.active ?? 0;
    document.getElementById('publishRecipientEstimate').textContent = activeCount;
    document.getElementById('broadcastRecipientEstimate').textContent = activeCount;
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

// ==========================================
// SUBSCRIBERS DIRECTORY
// ==========================================
async function loadSubscribers() {
  const tbody = document.getElementById('subscribersTableBody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--admin-text-muted); padding: 24px;">Loading subscribers...</td></tr>';

  try {
    const params = new URLSearchParams({
      page: state.subscribersPage,
      limit: state.subscribersLimit,
      status: state.subscribersStatus,
      q: state.subscribersSearch
    });

    const res = await fetch(`/api/admin/subscribers?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch subscribers');
    const data = await res.json();

    state.subscribersTotal = data.total || 0;
    renderSubscribers(data.subscribers || []);
    updateSubscribersPagination(data.page, data.totalPages);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--admin-danger); padding: 24px;">Error: ${err.message}</td></tr>`;
  }
}

function renderSubscribers(list) {
  const tbody = document.getElementById('subscribersTableBody');
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--admin-text-muted); padding: 24px;">No subscribers found matching query.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(sub => `
    <tr>
      <td>${sub.id}</td>
      <td style="font-weight: 600; color: #fff;">${escapeHtml(sub.email)}</td>
      <td>${escapeHtml(sub.name || '—')}</td>
      <td><span class="status-pill ${sub.status}">${sub.status}</span></td>
      <td><span style="font-size: 11px; color: var(--admin-text-muted);">${escapeHtml(sub.source_page || 'website')}</span></td>
      <td style="font-size: 12px; color: var(--admin-text-muted);">${formatDate(sub.created_at)}</td>
      <td>
        <div style="display: flex; gap: 6px;">
          ${sub.status === 'active' 
            ? `<button class="btn-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="toggleStatus(${sub.id}, 'unsubscribed')">Deactivate</button>` 
            : `<button class="btn-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="toggleStatus(${sub.id}, 'active')">Activate</button>`}
          <button class="btn-danger" style="padding: 4px 8px; font-size: 11px;" onclick="confirmDeleteSubscriber(${sub.id}, '${escapeHtml(sub.email)}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function updateSubscribersPagination(page, totalPages) {
  totalPages = Math.max(1, totalPages || 1);
  document.getElementById('subscribersPageInfo').textContent = `Showing page ${page} of ${totalPages} (${state.subscribersTotal} total)`;
  document.getElementById('prevPageBtn').disabled = (page <= 1);
  document.getElementById('nextPageBtn').disabled = (page >= totalPages);
}

window.toggleStatus = async function(id, newStatus) {
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

window.confirmDeleteSubscriber = function(id, email) {
  openModal({
    title: 'Delete Subscriber',
    body: `Are you sure you want to permanently delete subscriber "${email}"? This action cannot be undone.`,
    confirmText: 'Delete Permanently',
    onConfirm: async () => {
      try {
        const res = await fetch('/api/admin/subscribers/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        if (res.ok) {
          closeModal();
          await loadSubscribers();
          await loadStats();
        }
      } catch (err) {
        alert('Delete failed: ' + err.message);
      }
    }
  });
};

// ==========================================
// PUBLISH & NOTIFY
// ==========================================
async function handlePublishSubmit(e) {
  e.preventDefault();
  const alertEl = document.getElementById('publishAlert');
  alertEl.style.display = 'none';

  const eventType = document.getElementById('pubEventType').value;
  const title = document.getElementById('pubTitle').value.trim();
  const summary = document.getElementById('pubSummary').value.trim();
  const contentUrl = document.getElementById('pubUrl').value.trim();
  const idempotencyKey = document.getElementById('pubIdempotency').value;
  const isTest = document.getElementById('pubTestEmailCheck').checked;
  const testEmail = document.getElementById('pubTestEmailInput').value.trim();

  if (isTest && !testEmail) {
    showBanner(alertEl, 'Please enter a test email address.', 'error');
    return;
  }

  const proceed = async () => {
    const submitBtn = document.getElementById('publishSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    try {
      const res = await fetch('/api/admin/content/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          title,
          summary,
          contentUrl,
          idempotencyKey,
          sendTestEmail: isTest,
          testEmailAddress: testEmail
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Publish failed');
      }

      showBanner(alertEl, data.message || 'Notification broadcast completed successfully!', 'success');
      generateNewIdempotency();
      await loadStats();
    } catch (err) {
      showBanner(alertEl, err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Queue & Send Notification';
    }
  };

  if (isTest) {
    proceed();
  } else {
    const activeCount = state.stats?.subscribers?.active ?? 0;
    openModal({
      title: 'Confirm Content Broadcast',
      body: `You are about to send an email notification for "${title}" to ALL ${activeCount} active subscriber(s). Proceed?`,
      confirmText: `Send to ${activeCount} Subscribers`,
      onConfirm: () => {
        closeModal();
        proceed();
      }
    });
  }
}

// ==========================================
// MANUAL BROADCAST
// ==========================================
async function handleBroadcastSubmit(e) {
  e.preventDefault();
  const alertEl = document.getElementById('broadcastAlert');
  alertEl.style.display = 'none';

  const subject = document.getElementById('bcastSubject').value.trim();
  const message = document.getElementById('bcastMessage').value.trim();
  const actionText = document.getElementById('bcastActionText').value.trim();
  const actionUrl = document.getElementById('bcastActionUrl').value.trim();
  const isTest = document.getElementById('bcastTestEmailCheck').checked;
  const testEmail = document.getElementById('bcastTestEmailInput').value.trim();

  if (isTest && !testEmail) {
    showBanner(alertEl, 'Please enter a test email address.', 'error');
    return;
  }

  const idempotencyKey = 'bcast_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);

  const proceed = async () => {
    const submitBtn = document.getElementById('broadcastSubmitBtn');
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
      if (!res.ok) {
        throw new Error(data.error || 'Broadcast failed');
      }

      showBanner(alertEl, data.message || 'Broadcast completed successfully!', 'success');
      await loadStats();
    } catch (err) {
      showBanner(alertEl, err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Broadcast to Subscribers';
    }
  };

  if (isTest) {
    proceed();
  } else {
    const activeCount = state.stats?.subscribers?.active ?? 0;
    openModal({
      title: 'Confirm Manual Broadcast',
      body: `You are about to send a custom broadcast email "${subject}" to ALL ${activeCount} active subscriber(s). Are you sure?`,
      confirmText: `Broadcast to ${activeCount} Subscribers`,
      onConfirm: () => {
        closeModal();
        proceed();
      }
    });
  }
}

// ==========================================
// DELIVERY LOGS
// ==========================================
async function loadLogs() {
  const tbody = document.getElementById('logsTableBody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--admin-text-muted); padding: 24px;">Loading delivery logs...</td></tr>';

  try {
    const params = new URLSearchParams({
      page: state.logsPage,
      limit: state.logsLimit
    });

    const res = await fetch(`/api/admin/logs?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch logs');
    const data = await res.json();

    state.logsTotal = data.total || 0;
    renderLogs(data.logs || []);
    updateLogsPagination(data.page, data.totalPages);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--admin-danger); padding: 24px;">Error: ${err.message}</td></tr>`;
  }
}

function renderLogs(logs) {
  const tbody = document.getElementById('logsTableBody');
  if (!logs.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--admin-text-muted); padding: 24px;">No email delivery logs recorded yet.</td></tr>';
    return;
  }

  tbody.innerHTML = logs.map(l => `
    <tr>
      <td>${l.id}</td>
      <td style="font-weight: 500; color: #fff;">${escapeHtml(l.recipient_email)}</td>
      <td><span style="font-size: 11px; text-transform: uppercase; color: var(--admin-accent-cyan);">${escapeHtml(l.email_type)}</span></td>
      <td><span class="status-pill ${l.status}">${l.status}</span></td>
      <td style="font-family: monospace; font-size: 11px; color: var(--admin-text-muted);">${escapeHtml(l.resend_id || '—')}</td>
      <td style="font-size: 12px; color: ${l.error_message ? 'var(--admin-danger)' : 'var(--admin-text-muted)'}; max-width: 200px; word-break: break-all;">
        ${escapeHtml(l.error_message || 'None')}
      </td>
      <td style="font-size: 12px; color: var(--admin-text-muted);">${formatDate(l.created_at)}</td>
    </tr>
  `).join('');
}

function updateLogsPagination(page, totalPages) {
  totalPages = Math.max(1, totalPages || 1);
  document.getElementById('logsPageInfo').textContent = `Showing page ${page} of ${totalPages} (${state.logsTotal} total)`;
  document.getElementById('logsPrevBtn').disabled = (page <= 1);
  document.getElementById('logsNextBtn').disabled = (page >= totalPages);
}

// ==========================================
// MODAL & HELPERS
// ==========================================
let currentConfirmAction = null;

function openModal({ title, body, confirmText, onConfirm }) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').textContent = body;
  const confirmBtn = document.getElementById('modalConfirmBtn');
  confirmBtn.textContent = confirmText || 'Confirm';

  currentConfirmAction = onConfirm;
  confirmBtn.onclick = onConfirm;

  document.getElementById('confirmModal').classList.add('open');
}

function closeModal() {
  document.getElementById('confirmModal').classList.remove('open');
  currentConfirmAction = null;
}

function showBanner(el, message, type = 'error') {
  el.textContent = message;
  el.className = `alert-banner ${type}`;
  el.style.display = 'block';
}

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
