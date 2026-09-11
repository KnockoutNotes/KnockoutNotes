/* KnockoutNotes Content Library
   Renders lightweight horizontal clickable bars for each content item.
   Initial page load performs ZERO preloading or fetching of image/PDF assets.
*/
(function(){
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  // document viewer, opened when the centred card is clicked). Selected by
  // CATEGORY (see CATEGORY_ICONS below) so the visual communicates the
  // topic immediately, with a generic fallback cycle for categories with no
  // dedicated composition yet.
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
    </svg>`,
    // Induction Agents: vial + ampoule drug-preparation composition.
    "vial-ampoule": `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="14" width="13" height="7.5" rx="1.6" stroke="currentColor" stroke-width="1.7"/>
      <path d="M9.3 21.5h14.4l-1.6 5.2v19.5a3 3 0 0 1-3 3h-5.2a3 3 0 0 1-3-3V26.7z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
      <line x1="8" y1="34" x2="22" y2="34" stroke="currentColor" stroke-width="1.2" opacity="0.5"/>
      <path d="M40 8h6v8h-6z" stroke="currentColor" stroke-width="1.9"/>
      <line x1="36" y1="14" x2="50" y2="14" stroke="currentColor" stroke-width="1.9"/>
      <path d="M37.4 16.6c-3.4 3.4-4.2 7.6-4.2 12.6v11a9.8 9.8 0 0 0 19.6 0v-11c0-5-.8-9.2-4.2-12.6z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>
      <path d="M35 29.6c1.6 3 4.6 5 8 5s6.4-2 8-5z" fill="currentColor" opacity="0.16"/>
    </svg>`,
    // Opioids: ampoule + molecular dose-marker composition.
    opioid: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M26 8h6v8h-6z" stroke="currentColor" stroke-width="1.9"/>
      <line x1="22" y1="14" x2="36" y2="14" stroke="currentColor" stroke-width="1.9"/>
      <path d="M23.4 16.6c-3.4 3.4-4.2 7.6-4.2 12.6v13.6a9.8 9.8 0 0 0 19.6 0V29.2c0-5-.8-9.2-4.2-12.6z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>
      <path d="M21 29.8c1.7 3.2 5 5.4 8.6 5.4s6.9-2.2 8.6-5.4z" fill="currentColor" opacity="0.16"/>
      <circle cx="49" cy="20" r="5" stroke="currentColor" stroke-width="1.6"/>
      <circle cx="49" cy="33" r="3.4" stroke="currentColor" stroke-width="1.6"/>
      <line x1="49" y1="25" x2="49" y2="29.6" stroke="currentColor" stroke-width="1.4" opacity="0.6"/>
    </svg>`,
    // Muscle Relaxants: neuromuscular fibre bundle + pharmaceutical vial.
    "muscle-relaxant": `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 20c6-4 10-4 16 0s10 4 16 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M8 27c6-4 10-4 16 0s10 4 16 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.7"/>
      <path d="M8 34c6-4 10-4 16 0s10 4 16 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.45"/>
      <rect x="41" y="12" width="14" height="8" rx="1.8" stroke="currentColor" stroke-width="1.8"/>
      <path d="M40.3 20h15.4l-1.8 5.6v20.6a3.2 3.2 0 0 1-3.2 3.2H45.3a3.2 3.2 0 0 1-3.2-3.2V25.6z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <line x1="39" y1="33" x2="56" y2="33" stroke="currentColor" stroke-width="1.2" opacity="0.5"/>
      <line x1="39" y1="40" x2="56" y2="40" stroke="currentColor" stroke-width="1.2" opacity="0.5"/>
    </svg>`,
    // Cardiology: heart with a valve leaflet motif.
    heart: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 50S12 37.6 12 23.6C12 15.9 18 10 25.4 10c3.2 0 6.2 1.4 8.4 3.9L32 16.4l1.8-2.5A11.2 11.2 0 0 1 38.6 10C46 10 52 15.9 52 23.6 52 37.6 32 50 32 50z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M22 26c3-3 6-3 10 0s7 3 10 0" stroke="currentColor" stroke-width="1.6" opacity="0.65"/>
      <path d="M20 33h7l3-6 4 11 3-7h7" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>`,
    // Critical Care / ICU: bedside monitor with a live waveform trace.
    monitor: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="14" width="48" height="32" rx="3" stroke="currentColor" stroke-width="2"/>
      <path d="M13 32h7l3-9 5 18 4-13 3 4h9" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="46" cy="22" r="2.2" fill="currentColor" opacity="0.7"/>
      <line x1="22" y1="52" x2="42" y2="52" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="32" y1="46" x2="32" y2="52" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    // Airway: an endotracheal/tracheostomy tube — 15mm connector, curved
    // shaft, inflated cuff, and pilot line + balloon.
    "airway-tube": `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8.5" y="6.5" width="15" height="10" rx="2.2" transform="rotate(-16 16 11.5)" stroke="currentColor" stroke-width="1.8"/>
      <path d="M18 15c9 3 16 11 18 20 1.2 5.6-.3 11-3.6 15" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
      <ellipse cx="33.5" cy="41" rx="6.4" ry="9.4" transform="rotate(35 33.5 41)" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity="0.14"/>
      <path d="M41 45c3.4 2.2 5.4 5.4 5.4 9.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.55"/>
      <circle cx="48" cy="56" r="2.8" stroke="currentColor" stroke-width="1.5"/>
    </svg>`,
    // Pulmonary Function Tests: paired lung lobes off a central trachea,
    // with a light flow-volume-loop swoop beneath to nod at spirometry.
    lungs: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 7v15" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>
      <path d="M32 21c-2 3-5 4-9 4M32 21c2 3 5 4 9 4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
      <path d="M23.5 25c-7.4 2-11.5 9.4-11.5 18.4 0 7 3.9 10.8 7.8 10.8 5 0 8.2-5 9.2-12 1-6.2 1-12.4-1-17.6z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" fill="currentColor" fill-opacity="0.12"/>
      <path d="M40.5 25c7.4 2 11.5 9.4 11.5 18.4 0 7-3.9 10.8-7.8 10.8-5 0-8.2-5-9.2-12-1-6.2-1-12.4 1-17.6z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" fill="currentColor" fill-opacity="0.12"/>
      <path d="M13 47c9 5 14-4 10-11" stroke="currentColor" stroke-width="1.3" opacity="0.55" stroke-linecap="round"/>
    </svg>`
  };
  // Category id -> dedicated pictogram. Anything not listed falls back to a
  // rotating generic cycle so an unmapped category still varies row-to-row.
  const CATEGORY_ICONS = {
    induction: 'vial-ampoule',
    opioids: 'opioid',
    'muscle-relaxant': 'muscle-relaxant',
    vasoactive: 'heart',
    cardiology: 'heart',
    airway: 'airway-tube',
    pft: 'lungs',
    'icu-scoring': 'monitor',
    shock: 'monitor',
    ventilation: 'monitor',
    'critical-care': 'monitor'
  };
  const IMAGE_ICON_CYCLE = ['vial', 'syringe', 'ampoule'];

  // 3D View only: give each topic row a clean medical pictogram (never the
  // actual cropped teaching image — that stays reserved for the real
  // document viewer), a short category descriptor, and a "View Monograph"
  // call to action, then hand the list to the generic carousel engine.
  // Lite's identical .kn-file-row markup never goes through this, so it
  // stays the original flat list untouched.
  function carouselizePanel(panel, catId){
    const fileList = panel.querySelector('.kn-file-list');
    if (!fileList || !window.KnCarousel) return;
    const descriptor = panel.querySelector('.kn-library-head h3')?.textContent || '';

    fileList.querySelectorAll('.kn-file-row').forEach((row, i) => {
      if (!row.querySelector('.kn-file-thumb')) {
        const thumb = document.createElement('div');
        thumb.className = 'kn-file-thumb';
        if (catId) thumb.dataset.cat = catId;
        const isPdf = !row.querySelector('.kn-badge-image');
        const iconKey = isPdf ? 'document' : (CATEGORY_ICONS[catId] || IMAGE_ICON_CYCLE[i % IMAGE_ICON_CYCLE.length]);
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

    // Compact library cards (see library-styles.css) are much narrower than
    // the generic .kn-carousel-card default, so they need a proportionally
    // tighter step spacing — passed here rather than changed globally, so
    // other .kn-carousel consumers (home high-yield grid, critical-care/
    // viva/resources grids) keep their original, wider-card spacing.
    const existing = window.KnCarousel.list.find(c => c.container === fileList);
    if (existing) existing.refresh();
    else window.KnCarousel.mount(fileList, { stepFactor: 0.4 });
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

      // 3D View only: the actual tab buttons live in this inner track,
      // not directly in `tabs` — `tabs` is a fixed clipping viewport
      // (overflow:hidden) and the track is what gets translateX'd so
      // whichever tab was just selected always lands exactly centred in
      // that viewport (which is also the dock/card stack's own
      // horizontal centre, both being centred within the same parent).
      // Lite View keeps the plain wrapping row — tabButtons appends
      // straight to `tabs` there, and `track` stays null.
      const is3D = !!mount.closest('.view-layer-3d');
      let track = null;
      if (is3D) {
        track = document.createElement('div');
        track.className = 'kn-library-tabs-track';
        tabs.appendChild(track);
      }
      const tabButtons = track || tabs;

      // 3D View only: a small glowing pill that slides beneath the tab row
      // to track the active category, so switching categories reads as a
      // light physically moving from one dock position to the next rather
      // than an instant class swap. Lite View never gets this element.
      let indicator = null;
      const moveTabIndicator = (tab, animate) => {
        if (!indicator || !tab) return;
        if (!animate) indicator.style.transition = 'none';
        indicator.style.left = tab.offsetLeft + 'px';
        indicator.style.width = tab.offsetWidth + 'px';
        indicator.classList.add('kn-tab-indicator-ready');
        if (!animate) {
          // eslint-disable-next-line no-unused-expressions
          indicator.offsetWidth; // flush the transition:none before restoring it
          indicator.style.transition = '';
        }
      };

      // The projection beam is a real element positioned against `mount`
      // (not a ::after on the tab) so it can rise above .kn-library-tabs
      // without being clipped by that row's own overflow:hidden.
      // Its horizontal position is a constant, not read from the tab at
      // all: centerActiveTab always slides the active tab to the exact
      // centre of the `tabs` viewport, so that centre point — fixed
      // regardless of which tab it is — is where the beam belongs. Only
      // the vertical position needs the tab's own (transform-immune)
      // offsetTop.
      let beam = null;
      const positionTabBeam = tab => {
        if (!beam || !tab) return;
        beam.style.left = (tabs.offsetLeft + tabs.clientWidth / 2) + 'px';
        beam.style.top = (tabs.offsetTop + tab.offsetTop) + 'px';
      };

      // Slides the whole track so the newly active tab's centre lands on
      // the viewport's centre, clamped so the track never overscrolls
      // past either end and reveals blank space beyond its own content.
      // A plain CSS flex `order` reorder was tried first and does NOT
      // work for this: order only ever affects relative sibling ranking,
      // so a tab already in natural sequence renders in that same
      // sequence no matter which one is "active" — nothing to animate.
      // Sliding one continuous track is what "this tab moves to the
      // middle" actually requires.
      const centerActiveTab = tab => {
        if (!track) return;
        // Measured via getBoundingClientRect against a momentarily-
        // neutralised transform, not offsetLeft/offsetWidth — an
        // offsetLeft-based version of this (relative to track, on the
        // assumption track sits flush at x:0 inside `tabs`) measured
        // consistently correct-looking inputs but produced a track that
        // settled visibly off-window; viewport-relative rects sidestep
        // whatever in that offsetParent chain was actually wrong, using
        // only absolute page coordinates instead.
        const prevTransition = track.style.transition;
        track.style.transition = 'none';
        track.style.transform = 'none';
        const viewportRect = tabs.getBoundingClientRect();
        const tabRect = tab.getBoundingClientRect();
        const trackW = track.scrollWidth;
        const ideal = (viewportRect.left + viewportRect.width / 2) - (tabRect.left + tabRect.width / 2);
        const minOffset = Math.min(0, viewportRect.width - trackW);
        const offset = Math.max(minOffset, Math.min(0, ideal));
        // eslint-disable-next-line no-unused-expressions
        track.offsetWidth; // flush transform:none/transition:none before animating
        track.style.transition = prevTransition;
        track.style.transform = `translateX(${offset}px)`;
      };

      for (let i = 0; i < categories.length; i++) {
        const cat = categories[i];
        const files = resolveCategoryFiles(cat);
        const tab = document.createElement('button');
        tab.className = 'kn-library-tab' + (i === 0 ? ' active' : '');
        tab.innerHTML = `${esc(cat.title)} <span class="kn-tab-count">${files.length}</span>`;
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        tab.dataset.index = i;
        tabButtons.appendChild(tab);

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
          if (is3D) {
            centerActiveTab(tab);
            moveTabIndicator(tab, true);
            tab.classList.remove('kn-neon-activate', 'kn-tab-jump-roll');
            // eslint-disable-next-line no-unused-expressions
            tab.offsetWidth; // force reflow to restart both animations
            tab.classList.add('kn-neon-activate', 'kn-tab-jump-roll');

            const activePanel = panels.querySelector('.kn-library-panel.active');
            if (activePanel) {
              activePanel.classList.remove('kn-panel-drill');
              // eslint-disable-next-line no-unused-expressions
              activePanel.offsetWidth; // force reflow to restart the animation
              activePanel.classList.add('kn-panel-drill');
              carouselizePanel(activePanel, categories[i]?.id);

              // positionTabBeam's vertical position depends on `tabs`'
              // own offsetTop within `mount`, which shifts with however
              // tall the active panel renders (they're both flex children
              // of `mount`, panel before tabs) — call it only after
              // carouselizePanel has collapsed the panel from its raw,
              // pre-carousel flat-list height down to the actual compact
              // carousel height, not before.
              positionTabBeam(tab);

              // The card the tab's beam is now "illuminating" — carouselizePanel
              // runs its layout synchronously, so the newly-active card is
              // already resolvable right here.
              const litCard = activePanel.querySelector('.kn-carousel-card[data-centered="true"]');
              if (litCard) {
                litCard.classList.remove('kn-card-illuminate');
                // eslint-disable-next-line no-unused-expressions
                litCard.offsetWidth;
                litCard.classList.add('kn-card-illuminate');
              }
            }
          }
        });

        const content = renderCategory(cat);
        panel.appendChild(content);
      }

      if (is3D) {
        // Appended last, after every tab button, so it never shifts the
        // tabs' own DOM order (nth-child-based selectors, existing or
        // future, keep addressing the real tab buttons). Lives inside
        // `track` (not `tabs`) so it slides together with the tabs it's
        // tracking, needing no extra math of its own.
        indicator = document.createElement('div');
        indicator.className = 'kn-tab-indicator';
        indicator.setAttribute('aria-hidden', 'true');
        track.appendChild(indicator);

        // Appended to `mount` itself, not `tabs` — see positionTabBeam
        // above for why it needs to live outside the horizontally-
        // scrolling row. Always visible (its own slow always-on
        // dim/bright CSS animation, see library-styles.css) rather than a
        // one-shot triggered flash — the "projection" is meant to be a
        // permanent, continuously breathing light under the active topic.
        beam = document.createElement('div');
        beam.className = 'kn-tab-beam kn-tab-beam-on';
        beam.setAttribute('aria-hidden', 'true');
        mount.appendChild(beam);

        const firstPanel = panels.querySelector('.kn-library-panel');
        if (firstPanel) carouselizePanel(firstPanel, categories[0]?.id);

        // Position the indicator/beam once layout has actually settled
        // (widths are 0 on the same tick the tabs are inserted), with no
        // transition for this first placement so nothing slides in from
        // the left/edge on page load. The default active (first) tab
        // starts at the track's natural left-aligned position rather than
        // being pre-centred — centerActiveTab only kicks in once the
        // visitor actually picks a category.
        const placeInitialIndicator = () => {
          const activeTab = tabs.querySelector('.kn-library-tab.active');
          moveTabIndicator(activeTab, false);
          positionTabBeam(activeTab);
        };
        requestAnimationFrame(placeInitialIndicator);
        window.addEventListener('resize', () => {
          const activeTab = tabs.querySelector('.kn-library-tab.active');
          centerActiveTab(activeTab);
          moveTabIndicator(activeTab, false);
          positionTabBeam(activeTab);
        });

        // The perimeter illuminate sweep (.kn-card-illuminate) fires only
        // on a deliberate category-tab switch, above — it used to also
        // re-fire ambiently every 15-27s, but that stacked with the
        // carousel's own ambient kn-neon-flicker breathing pulse (spatial-
        // scroll.js, 7-15s) into two independent "living" cues running at
        // once, which read as busy/glittery rather than calm. One ambient
        // cue (the flicker) is enough; the sweep stays reserved as a
        // one-shot "you just changed topic" signal.
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
