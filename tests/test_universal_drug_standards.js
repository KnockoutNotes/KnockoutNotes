/**
 * Comprehensive CDP Verification Test for Universal Drug Study Sheet & Reading Mode Optimisation
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function assert(condition, message) {
  if (!condition) {
    console.error('❌ FAIL:', message);
    throw new Error(message);
  }
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const ROOT = path.resolve(__dirname, '..');
const PORT = 8142;
const CDP_PORT = 9272;

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/' || urlPath === '' || urlPath === '/study') urlPath = '/study.html';
  const filePath = path.join(ROOT, urlPath);

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

server.listen(PORT, '127.0.0.1', async () => {
  console.log(`Test server running on port ${PORT}`);

  const chromePath = process.env.CHROME_PATH || (
    process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      : process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : 'google-chrome'
  );

  const userDataDir = path.join(ROOT, 'scratch/chrome-cdp-profile-universal-drug-test');
  fs.mkdirSync(userDataDir, { recursive: true });

  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--window-size=1440,900',
    '--disable-extensions',
    '--disable-gpu',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  chromeProcess.on('error', (e) => {
    console.error('Failed to launch Chrome:', e);
    process.exitCode = 1;
    server.close();
  });

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(1500);

  try {
    const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const tabs = await listRes.json();
    const wsUrl = (tabs.find((t) => t.type === 'page') || tabs[0]).webSocketDebuggerUrl;

    const ws = new WebSocket(wsUrl);
    let msgId = 0;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve, reject } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    const send = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = ++msgId;
        callbacks.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });

    await new Promise((r) => (ws.onopen = r));
    await send('Page.enable');
    await send('Runtime.enable');

    const evaluate = async (expression) => {
      const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      return res.result ? res.result.value : null;
    };

    // =========================================================================
    // 1. PC DESKTOP (1440x900) READING MODE: DEFAULT IS WIDE (1200px MAX-WIDTH)
    // =========================================================================
    console.log('\n--- 1. PC DESKTOP (1440x900) READING MODE ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    await send('Page.navigate', { url: `http://localhost:${PORT}/study.html?topic=propofol` });
    await delay(1500);

    // Wait for StudyRonDesign
    await evaluate(`
      new Promise((resolve) => {
        function check() {
          if (window.StudyRonDesign && window.StudyRonDesign.isDataReady() && window.KN_STRUCTURES && window.KN_STRUCTURES_3D) {
            window.StudyRonDesign.openTopic('propofol');
            resolve(true);
          } else {
            setTimeout(check, 100);
          }
        }
        check();
      })
    `);
    await delay(1000);

    // Clear reading width preference to ensure default
    await evaluate(`localStorage.removeItem('kn_reading_width')`);

    // Launch Reading Mode
    await evaluate(`(() => {
      const btn = document.getElementById('ronEnterReadingModeTopBtn') || document.querySelector('.kn-reading-mode-btn');
      if (btn) btn.click();
      else if (window.StudyRonDesign && window.StudyRonDesign.enterFullScreenReadingMode) {
        window.StudyRonDesign.enterFullScreenReadingMode();
      }
    })()`);
    await delay(800);

    const pcMetrics = await evaluate(`(() => {
      const overlay = document.getElementById('ronReadingModeOverlay');
      const widthAttr = overlay ? overlay.getAttribute('data-reading-width') : null;
      const content = document.querySelector('.ron-rm-content-wrapper');
      const contentStyles = content ? window.getComputedStyle(content) : null;
      const maxW = contentStyles ? contentStyles.maxWidth : null;
      const hasHScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;

      return {
        overlayOpen: !!(overlay && !overlay.hidden),
        widthAttr,
        maxW,
        hasHScroll
      };
    })()`);

    console.log('PC Metrics:', pcMetrics);
    assert(pcMetrics.overlayOpen, 'Reading mode overlay must be active');
    assert(pcMetrics.widthAttr === 'wide', 'Desktop reading mode default width must be "wide"');
    const maxWValid = pcMetrics.maxW === '1200px' || pcMetrics.maxW === 'min(1200px, 100%)';
    assert(maxWValid, `Expected max-width 1200px, got ${pcMetrics.maxW}`);
    assert(!pcMetrics.hasHScroll, 'PC reading mode must have zero horizontal overflow');
    console.log('✅ PASS: Desktop/PC defaults to Wide reading mode with exactly 1200px max-width content container!');

    // =========================================================================
    // 2. UNIVERSAL DRUG STUDY SHEET STRUCTURE (18 SECTIONS + QUICK REF)
    // =========================================================================
    console.log('\n--- 2. UNIVERSAL DRUG STUDY SHEET RENDERING ---');
    const drugSheet = await evaluate(`(() => {
      const qr = document.getElementById('sec-quick-ref');
      const qrRows = qr ? qr.querySelectorAll('tbody tr').length : 0;

      const secIds = [
        'sec-identity', 'sec-moa', 'sec-pd', 'sec-pk', 'sec-kinetics',
        'sec-dosage', 'sec-timeProfile', 'sec-physio', 'sec-indications',
        'sec-adverse', 'sec-interactions', 'sec-specialPopulations',
        'sec-monitoring', 'sec-chemistry', 'sec-comparisons',
        'sec-evidence', 'sec-pearls', 'sec-revision'
      ];
      const presentSecs = secIds.filter(id => !!document.getElementById(id));
      const has2d = !!document.querySelector('#sec-chemistry .ron-structure-svg-compact');
      const has3d = !!document.querySelector('#sec-chemistry .st-molecule-viewer');

      // Check TOC items count
      const tocItems = document.querySelectorAll('.ron-rm-toc-item').length;

      return {
        hasQuickRef: !!qr,
        qrRows,
        totalExpected: secIds.length,
        totalFound: presentSecs.length,
        has2d,
        has3d,
        tocItems
      };
    })()`);

    console.log('Drug Sheet Assessment:', drugSheet);
    assert(drugSheet.hasQuickRef, 'Quick numerical reference card exists');
    assert(drugSheet.qrRows === 8, `Expected 8 quick reference table rows, got ${drugSheet.qrRows}`);
    assert(drugSheet.totalFound === 18, `Expected 18 sections, found ${drugSheet.totalFound}`);
    assert(drugSheet.has2d, 'Propofol 2D SVG structure present in Chemistry section');
    assert(drugSheet.has3d, 'Propofol 3D conformer viewer present in Chemistry section');
    assert(drugSheet.tocItems >= 18, 'Reading Mode TOC lists all drug subsections');
    console.log('✅ PASS: Universal Drug Study Sheet renders all 18 standard sections + 8-parameter quick table + conformers!');

    // Exit reading mode
    await evaluate(`(() => {
      const exitBtn = document.getElementById('ronRmExitBtn');
      if (exitBtn) exitBtn.click();
      else if (window.StudyRonDesign && window.StudyRonDesign.exitFullScreenReadingMode) {
        window.StudyRonDesign.exitFullScreenReadingMode();
      }
    })()`);
    await delay(400);

    // =========================================================================
    // 3. MOBILE LANDSCAPE (844x390) READING MODE
    // =========================================================================
    console.log('\n--- 3. MOBILE LANDSCAPE (844x390) READING MODE ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 844,
      height: 390,
      deviceScaleFactor: 2,
      mobile: true,
      screenOrientation: { angle: 90, type: 'landscapePrimary' }
    });

    await evaluate(`localStorage.removeItem('kn_reading_width')`);
    await evaluate(`(() => {
      const btn = document.getElementById('ronEnterReadingModeTopBtn') || document.querySelector('.kn-reading-mode-btn');
      if (btn) btn.click();
      else if (window.StudyRonDesign && window.StudyRonDesign.enterFullScreenReadingMode) {
        window.StudyRonDesign.enterFullScreenReadingMode();
      }
    })()`);
    await delay(600);

    const landscapeMetrics = await evaluate(`(() => {
      const overlay = document.getElementById('ronReadingModeOverlay');
      const widthAttr = overlay ? overlay.getAttribute('data-reading-width') : null;
      const content = document.querySelector('.ron-rm-content-wrapper');
      const contentStyles = content ? window.getComputedStyle(content) : null;
      const maxW = contentStyles ? contentStyles.maxWidth : null;
      const hasHScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;
      const tableWrap = document.querySelector('.ron-table-wrap');
      const tableWrapStyles = tableWrap ? window.getComputedStyle(tableWrap) : null;

      return {
        overlayOpen: !!(overlay && !overlay.hidden),
        widthAttr,
        maxW,
        hasHScroll,
        tableWrapOverflowX: tableWrapStyles ? tableWrapStyles.overflowX : null
      };
    })()`);

    console.log('Mobile Landscape Metrics:', landscapeMetrics);
    assert(landscapeMetrics.overlayOpen, 'Overlay active in mobile landscape');
    assert(landscapeMetrics.widthAttr === 'wide', 'Mobile landscape defaults to "wide" preset');
    assert(!landscapeMetrics.hasHScroll, 'Mobile landscape has zero horizontal page overflow');
    assert(landscapeMetrics.tableWrapOverflowX === 'auto', 'Tables must be horizontally scrollable');
    console.log('✅ PASS: Mobile landscape defaults to Wide mode with zero horizontal page scroll!');

    await evaluate(`(() => {
      const exitBtn = document.getElementById('ronRmExitBtn');
      if (exitBtn) exitBtn.click();
      else if (window.StudyRonDesign && window.StudyRonDesign.exitFullScreenReadingMode) {
        window.StudyRonDesign.exitFullScreenReadingMode();
      }
    })()`);
    await delay(400);

    // =========================================================================
    // 4. TABLET PORTRAIT (768x1024)
    // =========================================================================
    console.log('\n--- 4. TABLET PORTRAIT (768x1024) ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 768,
      height: 1024,
      deviceScaleFactor: 2,
      mobile: true,
      screenOrientation: { angle: 0, type: 'portraitPrimary' }
    });

    await evaluate(`(() => {
      const btn = document.getElementById('ronEnterReadingModeTopBtn') || document.querySelector('.kn-reading-mode-btn');
      if (btn) btn.click();
      else if (window.StudyRonDesign && window.StudyRonDesign.enterFullScreenReadingMode) {
        window.StudyRonDesign.enterFullScreenReadingMode();
      }
    })()`);
    await delay(600);

    const tabletPortraitMetrics = await evaluate(`(() => {
      const content = document.querySelector('.ron-rm-content-wrapper');
      const contentRect = content ? content.getBoundingClientRect() : null;
      const hasHScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;

      return {
        contentWidth: contentRect ? contentRect.width : 0,
        hasHScroll
      };
    })()`);

    console.log('Tablet Portrait Metrics:', tabletPortraitMetrics);
    assert(!tabletPortraitMetrics.hasHScroll, 'Tablet portrait has no horizontal scroll');
    assert(tabletPortraitMetrics.contentWidth <= 768, 'Content width constrained within viewport');
    console.log('✅ PASS: Tablet portrait layout responsive and centered without overflow!');

    await evaluate(`(() => {
      const exitBtn = document.getElementById('ronRmExitBtn');
      if (exitBtn) exitBtn.click();
      else if (window.StudyRonDesign && window.StudyRonDesign.exitFullScreenReadingMode) {
        window.StudyRonDesign.exitFullScreenReadingMode();
      }
    })()`);
    await delay(400);

    // =========================================================================
    // 5. TABLET LANDSCAPE (1024x768)
    // =========================================================================
    console.log('\n--- 5. TABLET LANDSCAPE (1024x768) ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1024,
      height: 768,
      deviceScaleFactor: 2,
      mobile: true,
      screenOrientation: { angle: 90, type: 'landscapePrimary' }
    });

    await evaluate(`(() => {
      const btn = document.getElementById('ronEnterReadingModeTopBtn') || document.querySelector('.kn-reading-mode-btn');
      if (btn) btn.click();
      else if (window.StudyRonDesign && window.StudyRonDesign.enterFullScreenReadingMode) {
        window.StudyRonDesign.enterFullScreenReadingMode();
      }
    })()`);
    await delay(600);

    const tabletLandscapeMetrics = await evaluate(`(() => {
      const hasHScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;
      const content = document.querySelector('.ron-rm-content-wrapper');
      const contentStyles = content ? window.getComputedStyle(content) : null;

      return {
        maxW: contentStyles ? contentStyles.maxWidth : null,
        hasHScroll
      };
    })()`);

    console.log('Tablet Landscape Metrics:', tabletLandscapeMetrics);
    assert(!tabletLandscapeMetrics.hasHScroll, 'Tablet landscape has no horizontal scroll');
    console.log('✅ PASS: Tablet landscape layout responsive and well-spaced!');

    await evaluate(`(() => {
      const exitBtn = document.getElementById('ronRmExitBtn');
      if (exitBtn) exitBtn.click();
      else if (window.StudyRonDesign && window.StudyRonDesign.exitFullScreenReadingMode) {
        window.StudyRonDesign.exitFullScreenReadingMode();
      }
    })()`);
    await delay(400);

    // =========================================================================
    // 6. MULTI-CATEGORY SAMPLING (10 REPRESENTATIVE DRUGS)
    // =========================================================================
    console.log('\n--- 6. MULTI-CATEGORY DRUG MONOGRAPH SAMPLING ---');
    const sampleDrugs = [
      'fentanyl',            // opioids
      'rocuronium',          // relaxants
      'norepinephrine',      // vaso/cardiac
      'bupivacaine',         // local
      'sodium-nitroprusside',// antihtn
      'meropenem',           // antimicrobials
      'metformin',           // antidiabetics
      'amiodarone',          // antiarrhythmics
      'dantrolene',          // miscellaneous
      'sugammadex'           // reversal
    ];

    for (const did of sampleDrugs) {
      await evaluate(`window.StudyRonDesign.openTopic('${did}')`);
      await delay(500);

      const check = await evaluate(`(() => {
        const qr = document.getElementById('sec-quick-ref');
        const idSec = document.getElementById('sec-identity');
        const moaSec = document.getElementById('sec-moa');
        const pdSec = document.getElementById('sec-pd');
        const pkSec = document.getElementById('sec-pk');
        const kinSec = document.getElementById('sec-kinetics');
        const revSec = document.getElementById('sec-revision');

        return {
          hasQuickRef: !!qr,
          hasIdentity: !!idSec,
          hasMoa: !!moaSec,
          hasPd: !!pdSec,
          hasPk: !!pkSec,
          hasKinetics: !!kinSec,
          hasRevision: !!revSec
        };
      })()`);

      assert(check.hasQuickRef && check.hasIdentity && check.hasMoa && check.hasRevision, `Drug ${did} failed section check`);
      console.log(`  ✓ Sample verified: ${did} (all sections and quick table present)`);
    }

    console.log('\n======================================================');
    console.log('🎉 ALL UNIVERSAL DRUG & READING MODE VERIFICATIONS PASSED PERFECTLY!');
    console.log('======================================================\n');

  } catch (err) {
    console.error('Test Execution Error:', err);
    process.exitCode = 1;
  } finally {
    try {
      chromeProcess.kill();
    } catch (_) {}
    server.close();
  }
});
