/**
 * KnockoutNotes — Test Suite for Responsive Defect Remediation & Verification
 * Covers DEF-11, DEF-12, DEF-13 across all 9 target viewports.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ PASS: ${message}`);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const ROOT = path.resolve(__dirname, '..');
const PORT = 8180;
const CDP_PORT = 9295;

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  if (urlPath === '/api/auth/me') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ authenticated: false, user: null, isAdmin: false }));
    return;
  }

  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

  let filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found: ' + urlPath);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

const VIEWPORTS = [
  { name: '320x568 (iPhone SE 1st gen)', width: 320, height: 568 },
  { name: '360x800 (Galaxy S20)', width: 360, height: 800 },
  { name: '390x844 (iPhone 12/13/14)', width: 390, height: 844 },
  { name: '768x1024 (iPad Portrait)', width: 768, height: 1024 },
  { name: '800x1024 (Tablet Portrait)', width: 800, height: 1024 },
  { name: '900x900 (Square/Foldable)', width: 900, height: 900 },
  { name: '1024x768 (iPad Landscape)', width: 1024, height: 768 },
  { name: '1280x800 (Small Laptop/WXGA)', width: 1280, height: 800 },
  { name: '1440x900 (Desktop HD)', width: 1440, height: 900 }
];

const PAGES = [
  { path: '/index.html', name: 'Homepage' },
  { path: '/study.html?topic=propofol', name: 'Study Mode (Propofol)' },
  { path: '/calculators.html', name: 'Calculators' },
  { path: '/resuscitation-chamber.html', name: 'Resuscitation Chamber' },
  { path: '/study.html?domain=critical&cat=all', name: 'Critical Care' }
];

server.listen(PORT, '127.0.0.1', async () => {
  console.log(`Responsive Test Server running on port ${PORT}`);

  const chromePath = process.env.CHROME_PATH || (
    process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : 'google-chrome'
  );

  const userDataDir = path.join(ROOT, 'scratch/chrome-profile-' + Date.now());
  fs.mkdirSync(userDataDir, { recursive: true });

  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--window-size=1280,800',
    '--disable-extensions',
    '--disable-gpu',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(1500);

  async function getTargetWsUrl() {
    const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const tabs = await res.json();
    const pageTab = tabs.find(t => t.type === 'page');
    return pageTab ? pageTab.webSocketDebuggerUrl : tabs[0].webSocketDebuggerUrl;
  }

  const wsUrl = await getTargetWsUrl();
  const ws = new WebSocket(wsUrl);

  let msgId = 1;
  const pendingRequests = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pendingRequests.has(msg.id)) {
      const { resolve, reject } = pendingRequests.get(msg.id);
      pendingRequests.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await new Promise(r => {
    if (ws.readyState === WebSocket.OPEN) r();
    else ws.onopen = r;
  });

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  try {
    await send('Page.enable');
    await send('DOM.enable');

    console.log('\n======================================================');
    console.log('PART 1: ZERO HORIZONTAL OVERFLOW ACROSS 9 VIEWPORTS & 5 PAGES');
    console.log('======================================================');

    for (const vp of VIEWPORTS) {
      console.log(`\n--- Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width < 768
      });

      for (const pg of PAGES) {
        await send('Page.navigate', { url: `http://127.0.0.1:${PORT}${pg.path}` });
        await delay(1200);

        const evalRes = await send('Runtime.evaluate', {
          expression: `(() => {
            const docEl = document.documentElement;
            const body = document.body;
            const scrollW = Math.max(docEl ? docEl.scrollWidth : 0, body ? body.scrollWidth : 0);
            const clientW = window.innerWidth;
            const overflow = Math.max(0, scrollW - clientW);
            const culprits = [];
            if (overflow > 1) {
              document.querySelectorAll('*').forEach(el => {
                const r = el.getBoundingClientRect();
                if (r.right > clientW + 1) {
                  culprits.push({ tag: el.tagName, cls: el.className, right: r.right, w: r.width });
                }
              });
            }
            return { scrollW, clientW, overflow, culprits: culprits.slice(0, 5) };
          })()`,
          returnByValue: true
        });

        const { scrollW, clientW, overflow, culprits } = evalRes.result.value;
        if (overflow > 1) {
          console.error(`Overflow culprits for [${vp.name}] ${pg.name}:`, JSON.stringify(culprits));
        }
        const pass = overflow <= 1; // allow subpixel 1px
        assert(pass, `[${vp.name}] ${pg.name} overflow is ${overflow}px (scrollWidth: ${scrollW}px, innerWidth: ${clientW}px)`);
      }
    }

    console.log('\n======================================================');
    console.log('PART 2: DEF-11 TABLET NAVIGATION VERIFICATION (768px - 1023px)');
    console.log('======================================================');

    const tabletViewports = [
      { name: '768x1024', width: 768, height: 1024 },
      { name: '800x1024', width: 800, height: 1024 },
      { name: '900x900', width: 900, height: 900 },
      { name: '1024x768', width: 1024, height: 768 }
    ];

    for (const tvp of tabletViewports) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: tvp.width,
        height: tvp.height,
        deviceScaleFactor: 1,
        mobile: false
      });

      await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/index.html` });
      await delay(800);

      const navMetrics = await send('Runtime.evaluate', {
        expression: `(() => {
          const nav = document.querySelector('#knDesktopNav');
          const capsule = document.querySelector('#knDesktopNav .kn-desktop-nav-capsule');
          const links = document.querySelectorAll('#knDesktopNav .kn-desktop-link');
          const brandText = document.querySelector('#knDesktopNav .kn-desktop-brand-name');
          const ccDropdown = document.querySelector('#knDesktopNav #knDesktopCcDropdownWrap');
          
          if (!nav) return { exists: false };
          const navRect = nav.getBoundingClientRect();
          const capRect = capsule ? capsule.getBoundingClientRect() : null;
          const brandVisible = brandText ? window.getComputedStyle(brandText).display !== 'none' : false;
          
          return {
            exists: true,
            navDisplay: window.getComputedStyle(nav).display,
            navWidth: navRect.width,
            capWidth: capRect ? capRect.width : 0,
            linkCount: links.length,
            brandVisible,
            ccDropdownExists: !!ccDropdown,
            windowWidth: window.innerWidth
          };
        })()`,
        returnByValue: true
      });

      const nm = navMetrics.result.value;
      assert(nm.exists, `[${tvp.name}] #knDesktopNav exists in DOM`);
      assert(nm.navDisplay !== 'none', `[${tvp.name}] #knDesktopNav is visible (display: ${nm.navDisplay})`);
      assert(nm.capWidth <= tvp.width, `[${tvp.name}] Capsule width (${nm.capWidth}px) <= viewport width (${tvp.width}px)`);
      assert(nm.linkCount >= 8, `[${tvp.name}] All navigation links preserved (found ${nm.linkCount})`);
      assert(nm.ccDropdownExists, `[${tvp.name}] Critical Care dropdown element preserved`);

      if (tvp.width <= 920) {
        assert(!nm.brandVisible, `[${tvp.name}] Brand text is hidden on compact tablet to prevent overflow`);
      } else {
        assert(nm.brandVisible, `[${tvp.name}] Brand text is visible on wider desktop/tablet`);
      }
    }

    console.log('\n======================================================');
    console.log('PART 3: DEF-12 NARROW MOBILE FLOATING BUBBLE BAR (320px - 360px)');
    console.log('======================================================');

    const mobileViewports = [
      { name: '320x568', width: 320, height: 568 },
      { name: '360x800', width: 360, height: 800 }
    ];

    for (const mvp of mobileViewports) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: mvp.width,
        height: mvp.height,
        deviceScaleFactor: 1,
        mobile: true
      });

      await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/index.html` });
      await delay(800);

      const bubbleMetrics = await send('Runtime.evaluate', {
        expression: `(() => {
          const bubbleBar = document.querySelector('#knBubbleNav');
          const capsule = document.querySelector('#knBubbleNav .bubble-bar-capsule');
          const fullLabels = document.querySelectorAll('#knBubbleNav .nav-label-full');
          const shortLabels = document.querySelectorAll('#knBubbleNav .nav-label-short');
          
          let fullVisibleCount = 0;
          fullLabels.forEach(l => {
            if (window.getComputedStyle(l).display !== 'none') fullVisibleCount++;
          });
          
          let shortVisibleCount = 0;
          shortLabels.forEach(l => {
            if (window.getComputedStyle(l).display !== 'none') shortVisibleCount++;
          });

          return {
            exists: !!bubbleBar,
            capsuleWidth: capsule ? capsule.getBoundingClientRect().width : 0,
            windowWidth: window.innerWidth,
            fullVisibleCount,
            shortVisibleCount
          };
        })()`,
        returnByValue: true
      });

      const bm = bubbleMetrics.result.value;
      assert(bm.exists, `[${mvp.name}] Mobile bubble bar exists`);
      assert(bm.capsuleWidth <= mvp.width, `[${mvp.name}] Bubble capsule width (${bm.capsuleWidth}px) <= viewport width (${mvp.width}px)`);
      assert(bm.fullVisibleCount === 0, `[${mvp.name}] Full labels hidden in compact view`);
      assert(bm.shortVisibleCount > 0, `[${mvp.name}] Short labels shown in compact view`);
    }

    console.log('\n======================================================');
    console.log('PART 4: DEF-13 RESUSCITATION CHAMBER BPM BUTTONS TOUCH TARGETS (>= 44x44px)');
    console.log('======================================================');

    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true
    });

    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/resuscitation-chamber.html` });
    await delay(1000);

    const bpmMetrics = await send('Runtime.evaluate', {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('.btn-bpm-pill'));
        return buttons.map(btn => {
          const rect = btn.getBoundingClientRect();
          return {
            text: btn.textContent.trim(),
            width: rect.width,
            height: rect.height,
            active: btn.classList.contains('active')
          };
        });
      })()`,
      returnByValue: true
    });

    const btns = bpmMetrics.result.value;
    assert(btns.length >= 3, `Found at least 3 BPM pill buttons (found ${btns.length})`);

    for (const b of btns) {
      console.log(`BPM Pill "${b.text}": ${b.width.toFixed(1)}px x ${b.height.toFixed(1)}px (Active: ${b.active})`);
      assert(b.width >= 44, `BPM button "${b.text}" width (${b.width.toFixed(1)}px) >= 44px`);
      assert(b.height >= 44, `BPM button "${b.text}" height (${b.height.toFixed(1)}px) >= 44px`);
    }

    // Test button click interaction and CPR timing state
    const clickResult = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn120 = Array.from(document.querySelectorAll('.btn-bpm-pill')).find(b => b.textContent.includes('120'));
        if (!btn120) return { success: false, reason: '120 BPM button not found' };
        btn120.click();
        const isActive = btn120.classList.contains('active');
        return { success: true, isActive, text: btn120.textContent.trim() };
      })()`,
      returnByValue: true
    });

    assert(clickResult.result.value.success, 'Clicked 120 BPM button successfully');
    assert(clickResult.result.value.isActive, '120 BPM button became active upon click');

    console.log('\n======================================================');
    console.log('🎉 ALL RESPONSIVE REMEDIATION CHECKS PASSED WITH 0 OVERFLOW!');
    console.log('======================================================\n');

  } catch (err) {
    console.error('Fatal test error:', err);
    process.exitCode = 1;
  } finally {
    ws.close();
    chromeProcess.kill();
    server.close();
  }
});
