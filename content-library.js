/* KnockoutNotes Content Library
   Renders lightweight horizontal clickable bars for each content item.
   Initial page load performs ZERO preloading or fetching of image/PDF assets.
*/
(function(){
  'use strict';

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
  }[c]));

  function pad(n){
    return String(n).padStart(2, '0');
  }

  function loadConfig(){
    if (window.KNOCKOUTNOTES_CONTENT) {
      return Promise.resolve(window.KNOCKOUTNOTES_CONTENT);
    }
    return fetch('content-config.js?_=' + Date.now(), { cache: 'no-store' })
      .then(r => r.text())
      .then(t => {
        const start = t.indexOf('{');
        const end = t.lastIndexOf('}');
        if (start < 0 || end < 0) throw new Error('Invalid content-config.js');
        return Function('return (' + t.slice(start, end + 1) + ')')();
      });
  }

  const cfgPromise = loadConfig();

  function deriveTitle(url, num, catTitle){
    try {
      const filename = url.split('/').pop().replace(/\.[a-zA-Z0-9]+$/, '');
      const cleaned = filename.replace(/[-_]+/g, ' ').trim();
      if (cleaned) {
        return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      }
    } catch (_) {}
    return `${catTitle || 'Item'} ${num}`;
  }

  function resolveCategoryFiles(cat){
    if (!cat || !Array.isArray(cat.files)) return [];
    return cat.files.map((item, index) => {
      const url = typeof item === 'string' ? item : item.url;
      const isPdf = (typeof item === 'object' && item.type === 'pdf') || /\.pdf(?:$|\?)/i.test(url);
      const type = isPdf ? 'pdf' : 'image';
      const title = (typeof item === 'object' && item.title) ? item.title : deriveTitle(url, index + 1, cat.title);
      return {
        url,
        title,
        type,
        number: index + 1
      };
    });
  }

  function renderCategory(cat){
    const files = resolveCategoryFiles(cat);
    const count = files.length;
    const wrap = document.createElement('section');
    wrap.className = 'kn-library-category';

    const headHtml = `
      <div class="kn-library-head">
        <div>
          <span class="kicker">${esc(cat.kicker || 'CATEGORY')}</span>
          <h3>${esc(cat.title)}</h3>
          <p>${esc(cat.description || '')}</p>
        </div>
        <span class="kn-library-count">${count} ${count === 1 ? 'item' : 'items'}</span>
      </div>
    `;

    if (count === 0) {
      wrap.innerHTML = headHtml + `
        <div class="kn-empty-library">
          <strong>No content yet.</strong>
          <span>Content will appear here once added to this category.</span>
        </div>
      `;
      return wrap;
    }

    const listHtml = `
      <div class="kn-file-list" role="list">
        ${files.map(item => `
          <a class="kn-file-row" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer" role="listitem">
            <span class="kn-file-num">${pad(item.number)}</span>
            <span class="kn-file-title">${esc(item.title)}</span>
            <span class="kn-file-badge kn-badge-${item.type}">${item.type.toUpperCase()}</span>
            <span class="kn-file-arrow" aria-hidden="true">→</span>
          </a>
        `).join('')}
      </div>
    `;

    wrap.innerHTML = headHtml + listHtml;
    return wrap;
  }

  async function initLibrary(page){
    const cfg = await cfgPromise;
    const categories = cfg.pages?.[page]?.categories || [];
    const mount = document.getElementById('knLibrary');
    if (!mount) return;

    mount.innerHTML = `
      <div class="kn-library-tabs" role="tablist" aria-label="Categories"></div>
      <div class="kn-library-panels"></div>
    `;

    const tabs = mount.querySelector('.kn-library-tabs');
    const panels = mount.querySelector('.kn-library-panels');

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const files = resolveCategoryFiles(cat);
      const tab = document.createElement('button');
      tab.className = 'kn-library-tab' + (i === 0 ? ' active' : '');
      tab.innerHTML = `${esc(cat.title)} <span class="kn-tab-count">${files.length}</span>`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      tab.dataset.index = i;
      tabs.appendChild(tab);

      const panel = document.createElement('div');
      panel.className = 'kn-library-panel' + (i === 0 ? ' active' : '');
      panel.hidden = i !== 0;
      panel.dataset.index = i;
      panels.appendChild(panel);

      tab.addEventListener('click', () => {
        tabs.querySelectorAll('.kn-library-tab').forEach((x, j) => {
          const on = j === i;
          x.classList.toggle('active', on);
          x.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        panels.querySelectorAll('.kn-library-panel').forEach((y, k) => {
          y.hidden = k !== i;
          y.classList.toggle('active', k === i);
        });
      });

      const content = renderCategory(cat);
      panel.appendChild(content);
    }

    window.KNOCKOUTNOTES_LIBRARY = cfg;
    document.dispatchEvent(new CustomEvent('knLibraryReady', { detail: { page, categories } }));
  }

  window.KnockoutNotesLibrary = {
    init: initLibrary,
    config: () => cfgPromise
  };
})();
