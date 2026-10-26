const https = require('https');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

function fetchFollow(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = res.headers.location.startsWith('http') 
          ? res.headers.location 
          : 'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev' + res.headers.location;
        return resolve(fetchFollow(nextUrl));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data, finalUrl: url }));
    }).on('error', reject);
  });
}

async function verifyLive() {
  console.log('=== VERIFYING LIVE PRODUCTION DEPLOYMENT WITH CLEAN REDIRECTS ===\n');
  const BASE = 'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev';

  const paths = [
    { p: '/', expect: '.view-layer-lite' },
    { p: '/', expect: 'APP v3.0.0 • 8 OFFLINE SECTIONS READY' },
    { p: '/', expect: 'Sync: <strong class="kn-sync-time-val" style="color:#e2e8f0;">Ready</strong>' },
    { p: '/study', expect: 'Study' },
    { p: '/calculators', expect: 'Calculators' },
    { p: '/page-common.css', expect: '#0369a1' },
    { p: '/script.js', expect: '_knCoreInitialized' },
    { p: '/sw.js', expect: 'knockoutnotes-cache-v114' },
    { p: '/calculators.js', expect: 'calculateDeltaGap' },
    { p: '/kn-site-search.js', expect: '_normCombined' },
    { p: '/sync-engine.js', expect: 'results.updated > 0' }
  ];

  for (const item of paths) {
    const res = await fetchFollow(BASE + item.p);
    if (res.status !== 200) {
      throw new Error(`Failed ${item.p}: status ${res.status}`);
    }
    if (!res.body.includes(item.expect)) {
      throw new Error(`Missing expect on ${item.p}: ${item.expect}`);
    }
    console.log(`✅ PASS ${item.p} -> 200 OK (verified "${item.expect}")`);
  }

  console.log('\n--- LIVE PRODUCTION HEADLESS CHROME SMOKE TEST ---');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(__dirname, '../scratch/chrome-cdp-profile-live-smoke');
  try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (_) {}

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9288',
    '--window-size=1280,900',
    '--disable-extensions',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  try {
    await new Promise(r => setTimeout(r, 1600));
    const targetList = await fetch('http://127.0.0.1:9288/json').then(r => r.json());
    const wsUrl = (targetList.find(t => t.type === 'page') || targetList[0]).webSocketDebuggerUrl;
    const ws = new WebSocket(wsUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    const send = (m, p = {}) => new Promise((resolve, reject) => {
      const cur = id++;
      const h = (e) => {
        const d = JSON.parse(e.data);
        if (d.id === cur) {
          ws.removeEventListener('message', h);
          if (d.error) reject(d.error);
          else resolve(d.result);
        }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id: cur, method: m, params: p }));
    });

    await send('Page.enable');
    await send('Runtime.enable');

    console.log(`Navigating to live production URL: ${BASE}...`);
    await send('Page.navigate', { url: BASE });
    await new Promise(r => setTimeout(r, 3500));

    const checkDom = await send('Runtime.evaluate', {
      expression: `(() => {
        const allHuds = Array.from(document.querySelectorAll('.site-hud'));
        const visibleHuds = allHuds.filter(el => {
          const comp = window.getComputedStyle(el);
          return comp.display !== 'none' && comp.visibility !== 'hidden';
        });
        const radarCards = document.querySelectorAll('#homeUpdatesList .kn-radar-card, .kn-radar-card');
        const bodyClass = document.body.className;
        const calcLink = !!document.querySelector('a[href*="calculators"]');
        return {
          totalHuds: allHuds.length,
          visibleHudsCount: visibleHuds.length,
          radarCardCount: radarCards.length,
          bodyClass,
          calcLink
        };
      })()`,
      returnByValue: true
    });

    const domInfo = checkDom.result.value;
    console.log('Live DOM inspection:', domInfo);

    if (domInfo.visibleHudsCount > 1) {
      throw new Error(`Duplicate visible HUD elements detected: ${domInfo.visibleHudsCount}`);
    }
    console.log('✅ PASS: Exactly <= 1 visible HUD rendered (duplicate visual headers prevented)');

    if (!domInfo.calcLink) {
      throw new Error('Calculators link missing on live homepage');
    }
    console.log('✅ PASS: Navigation link to Calculators verified');

    // Test live Calculator functionality
    console.log('Navigating to live Calculators...');
    await send('Page.navigate', { url: `${BASE}/calculators` });
    await new Promise(r => setTimeout(r, 3000));

    const checkCalc = await send('Runtime.evaluate', {
      expression: `(() => {
        if (!window.KnockoutCalculators) return { error: 'No KnockoutCalculators' };
        const delta = window.KnockoutCalculators.calculateDeltaGap({ na: 140, cl: 95, hco3: 32 });
        return {
          hasEngine: true,
          deltaInterpretation: delta.interpretation,
          riskClass: delta.riskClass
        };
      })()`,
      returnByValue: true
    });

    const calcInfo = checkCalc.result.value;
    console.log('Live Calculators evaluation:', calcInfo);

    if (!calcInfo.deltaInterpretation || !calcInfo.deltaInterpretation.includes('METABOLIC ALKALOSIS')) {
      throw new Error('Live calculator delta gap interpretation failed');
    }
    console.log('✅ PASS: Live clinical calculators verified on production site');

    ws.close();
  } finally {
    try { chrome.kill(); } catch (_) {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (_) {}
  }

  console.log('\n🎉 ALL LIVE ENDPOINTS & HEADLESS CHROME SMOKE TESTS PASSED 100%!');
}

verifyLive().catch(err => {
  console.error('FAIL:', err);
  process.exit(1);
});
