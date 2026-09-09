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

  // Clean line-art medical pictograms for the 3D carousel cards — never the
  // actual cropped teaching image (that stays reserved for the real
  // document viewer, opened when the centred card is clicked). Three
  // rotate for image items so a row of cards doesn't look identical; PDFs
  // always get the monograph glyph.
  const PICTOGRAMS = {
    vial: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="24" y="8" width="16" height="9" rx="2" stroke="currentColor" stroke-width="2"/>
      <path d="M23 17h18l-2 6.5v27a4 4 0 0 1-4 4H29a4 4 0 0 1-4-4v-27z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M25.6 34h12.8v14a2 2 0 0 1-2 2h-8.8a2 2 0 0 1-2-2z" fill="currentColor" opacity="0.16"/>
      <line x1="21" y1="34" x2="43" y2="34" stroke="currentColor" stroke-width="1.4" opacity="0.5"/>
      <line x1="21" y1="41" x2="43" y2="41" stroke="currentColor" stroke-width="1.4" opacity="0.5"/>
    </svg>`,
    syringe: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="14" width="30" height="13" rx="2.5" transform="rotate(45 29 20.5)" stroke="currentColor" stroke-width="2"/>
      <line x1="8" y1="10" x2="17" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="42" y1="30" x2="52" y2="40" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
      <line x1="47" y1="35" x2="56" y2="44" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M24 24l-9 9" stroke="currentColor" stroke-width="1.4" opacity="0.55"/>
      <path d="M28 28l-9 9" stroke="currentColor" stroke-width="1.4" opacity="0.55"/>
    </svg>`,
    ampoule: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M29 8h6v9h-6z" stroke="currentColor" stroke-width="2"/>
      <line x1="24" y1="14" x2="40" y2="14" stroke="currentColor" stroke-width="2"/>
      <path d="M26 17c-4 4-5 9-5 15v13a11 11 0 0 0 22 0V32c0-6-1-11-5-15z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M23.2 34c1.6 3.6 5 6 8.8 6s7.2-2.4 8.8-6z" fill="currentColor" opacity="0.16"/>
    </svg>`,
    document: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 10h20l8 8v36a2 2 0 0 1-2 2H18a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M38 10v8h8" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <line x1="22" y1="32" x2="38" y2="32" stroke="currentColor" stroke-width="1.6" opacity="0.6"/>
      <line x1="22" y1="39" x2="38" y2="39" stroke="currentColor" stroke-width="1.6" opacity="0.6"/>
      <line x1="22" y1="46" x2="33" y2="46" stroke="currentColor" stroke-width="1.6" opacity="0.6"/>
    </svg>`
  };
  const IMAGE_ICON_CYCLE = ['vial', 'syringe', 'ampoule'];

  // 3D View only: give each topic row a clean medical pictogram (never the
  // actual cropped teaching image — that stays reserved for the real
  // document viewer), a short category descriptor, and a "View Monograph"
  // call to action, then hand the list to the generic carousel engine.
  // Lite's identical .kn-file-row markup never goes through this, so it
  // stays the original flat list untouched.
  function carouselizePanel(panel){
    const fileList = panel.querySelector('.kn-file-list');
    if (!fileList || !window.KnCarousel) return;
    const descriptor = panel.querySelector('.kn-library-head h3')?.textContent || '';

    fileList.querySelectorAll('.kn-file-row').forEach((row, i) => {
      if (!row.querySelector('.kn-file-thumb')) {
        const thumb = document.createElement('div');
        thumb.className = 'kn-file-thumb';
        const isPdf = !row.querySelector('.kn-badge-image');
        const iconKey = isPdf ? 'document' : IMAGE_ICON_CYCLE[i % IMAGE_ICON_CYCLE.length];
        thumb.innerHTML = PICTOGRAMS[iconKey];
        row.insertBefore(thumb, row.firstChild);
      }
      if (!row.querySelector('.kn-file-descriptor')) {
        const desc = document.createElement('span');
        desc.className = 'kn-file-descriptor';
        desc.textContent = descriptor;
        const titleEl = row.querySelector('.kn-file-title');
        if (titleEl) titleEl.insertAdjacentElement('afterend', desc);
      }
      const arrow = row.querySelector('.kn-file-arrow');
      if (arrow) arrow.textContent = 'View Monograph →';
    });

    const existing = window.KnCarousel.list.find(c => c.container === fileList);
    if (existing) existing.refresh();
    else window.KnCarousel.mount(fileList);
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
    const mounts = document.querySelectorAll('#knLibrary, #knLibrary3d, .kn-library-mount');
    if (!mounts.length) return;

    mounts.forEach(mount => {
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

          // 3D View only: give the newly-selected category a brief "drill
          // forward from depth" entrance so moving CATEGORY -> ITEMS reads
          // as spatial navigation. Lite View never gets this class.
          if (mount.closest('.view-layer-3d')) {
            const activePanel = panels.querySelector('.kn-library-panel.active');
            if (activePanel) {
              activePanel.classList.remove('kn-panel-drill');
              // eslint-disable-next-line no-unused-expressions
              activePanel.offsetWidth; // force reflow to restart the animation
              activePanel.classList.add('kn-panel-drill');
              carouselizePanel(activePanel);
            }
          }
        });

        const content = renderCategory(cat);
        panel.appendChild(content);
      }

      if (mount.closest('.view-layer-3d')) {
        const firstPanel = panels.querySelector('.kn-library-panel');
        if (firstPanel) carouselizePanel(firstPanel);
      }
    });

    window.KNOCKOUTNOTES_LIBRARY = cfg;
    document.dispatchEvent(new CustomEvent('knLibraryReady', { detail: { page, categories } }));
  }

  window.KnockoutNotesLibrary = {
    init: initLibrary,
    config: () => cfgPromise
  };
})();
