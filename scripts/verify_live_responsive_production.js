/**
 * KnockoutNotes — Live Production Verification of Responsive Remediation
 * Targets https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ PASS: ${message}`);
}

const CDP_PORT = 9480;
const PROD_URL = 'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev';
const ROOT = path.resolve(__dirname, '..');

const VIEWPORTS = [
  { name: '320x568 (Narrow Mobile)', width: 320, height: 568, mobile: true },
  { name: '360x800 (Compact Mobile)', width: 360, height: 800, mobile: true },
  { name: '390x844 (Standard Mobile)', width: 390, height: 844, mobile: true },
  { name: '768x1024 (iPad Portrait)', width: 768, height: 1024, mobile: false },
  { name: '800x1024 (Tablet Portrait)', width: 800, height: 1024, mobile: false },
  { name: '900x900 (Square/Foldable)', width: 900, height: 900, mobile: false },
  { name: '1024x768 (iPad Landscape)', width: 1024, height: 768, mobile: false },
  { name: '1280x800 (Small Laptop)', width: 1280, height: 800, mobile: false },
  { name: '1440x900 (Desktop HD)', width: 1440, height: 900, mobile: false }
];

const PAGES = [
  { path: '/', name: 'Homepage' },
  { path: '/study.html?topic=propofol', name: 'Study Mode' },
  { path: '/calculators.html', name: 'Calculators' },
  { path: '/resuscitation-chamber.html', name: 'Resuscitation Chamber' },
  { path: '/study.html?domain=critical&cat=all', name: 'Critical Care' }
];

(async () => {
  console.log(`Verifying live production deployment: ${PROD_URL}`);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(ROOT, 'scratch/chrome-profile-live-' + Date.now());
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

  const delay = (ms) => new Promise(r => setTimeout(r, ms));
  await delay(1800);

  const tabsRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.type === 'page') || tabs[0];
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

  let msgId = 1;
  const cbs = new Map();
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && cbs.has(msg.id)) {
      const { resolve, reject } = cbs.get(msg.id);
      cbs.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await new Promise(r => {
    if (ws.readyState === WebSocket.OPEN) r();
    else ws.onopen = r;
  });

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = msgId++;
    cbs.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });

  try {
    await send('Page.enable');
    await send('Runtime.enable');

    console.log('\n======================================================');
    console.log('LIVE PRODUCTION: VERIFYING ZERO OVERFLOW ACROSS VIEWPORTS & PAGES');
    console.log('======================================================');

    for (const vp of VIEWPORTS) {
      console.log(`\n--- Live Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.mobile
      });

      for (const pg of PAGES) {
        await send('Page.navigate', { url: `${PROD_URL}${pg.path}` });
        await delay(1500);

        const evalRes = await send('Runtime.evaluate', {
          expression: `(() => {
            const docEl = document.documentElement;
            const body = document.body;
            const scrollW = Math.max(docEl ? docEl.scrollWidth : 0, body ? body.scrollWidth : 0);
            const clientW = window.innerWidth;
            const overflow = Math.max(0, scrollW - clientW);
            return { scrollW, clientW, overflow };
          })()`,
          returnByValue: true
        });

        const { scrollW, clientW, overflow } = evalRes.result.value;
        const pass = overflow <= 1;
        assert(pass, `[LIVE ${vp.name}] ${pg.name} overflow is ${overflow}px (scrollWidth: ${scrollW}px, innerWidth: ${clientW}px)`);
      }
    }

    console.log('\n======================================================');
    console.log('LIVE PRODUCTION: DEF-11 TABLET NAV & DEF-12 BUBBLE BAR METRICS');
    console.log('======================================================');

    // Test 768px tablet live
    await send('Emulation.setDeviceMetricsOverride', { width: 768, height: 1024, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: `${PROD_URL}/` });
    await delay(1500);

    const liveTabletRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const nav = document.querySelector('#knDesktopNav');
        const capsule = document.querySelector('#knDesktopNav .kn-desktop-nav-capsule');
        const links = document.querySelectorAll('#knDesktopNav .kn-desktop-link');
        const brandName = document.querySelector('#knDesktopNav .kn-desktop-brand-name');
        return {
          navVisible: nav ? window.getComputedStyle(nav).display !== 'none' : false,
          capsuleWidth: capsule ? capsule.getBoundingClientRect().width : 0,
          linkCount: links.length,
          brandVisible: brandName ? window.getComputedStyle(brandName).display !== 'none' : false
        };
      })()`,
      returnByValue: true
    });
    const lt = liveTabletRes.result.value;
    assert(lt.navVisible, 'Live 768px: #knDesktopNav is visible');
    assert(lt.capsuleWidth <= 768, `Live 768px: Capsule width (${lt.capsuleWidth}px) <= 768px`);
    assert(lt.linkCount >= 8, `Live 768px: All links present (count: ${lt.linkCount})`);
    assert(!lt.brandVisible, 'Live 768px: Brand text hidden to guarantee zero overflow');

    // Test 320px mobile live
    await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 568, deviceScaleFactor: 1, mobile: true });
    await send('Page.navigate', { url: `${PROD_URL}/` });
    await delay(1500);

    const liveMobileRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const capsule = document.querySelector('#knBubbleNav .bubble-bar-capsule');
        return {
          capsuleWidth: capsule ? capsule.getBoundingClientRect().width : 0
        };
      })()`,
      returnByValue: true
    });
    const lm = liveMobileRes.result.value;
    assert(lm.capsuleWidth > 0 && lm.capsuleWidth <= 320, `Live 320px: Bubble capsule width (${lm.capsuleWidth}px) <= 320px`);

    console.log('\n======================================================');
    console.log('LIVE PRODUCTION: DEF-13 BPM PILL TOUCH TARGETS (>= 44x44px)');
    console.log('======================================================');

    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await send('Page.navigate', { url: `${PROD_URL}/resuscitation-chamber.html` });
    await delay(1500);

    const liveBpmRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('.btn-bpm-pill'));
        return buttons.map(btn => {
          const rect = btn.getBoundingClientRect();
          return { text: btn.textContent.trim(), width: rect.width, height: rect.height };
        });
      })()`,
      returnByValue: true
    });

    const liveBtns = liveBpmRes.result.value;
    assert(liveBtns.length >= 3, `Live: Found ${liveBtns.length} BPM buttons`);
    for (const b of liveBtns) {
      console.log(`Live BPM Button "${b.text}": ${b.width.toFixed(1)}px x ${b.height.toFixed(1)}px`);
      assert(b.width >= 44 && b.height >= 44, `Live BPM Button "${b.text}" meets WCAG touch target >= 44x44px`);
    }

    console.log('\n======================================================');
    console.log('🎉 ALL LIVE PRODUCTION VERIFICATIONS PASSED 100%!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('Live production verification failed:', err);
    process.exitCode = 1;
  } finally {
    ws.close();
    chromeProcess.kill();
  }
})();
