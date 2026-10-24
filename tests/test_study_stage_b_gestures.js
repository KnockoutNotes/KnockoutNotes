/**
 * KnockoutNotes Study Mode Gesture Verification Suite (Stage B)
 * Automated Headless Chrome CDP Test covering Mobile Single-Tap, Double-Tap,
 * Horizontal Swipe Suppression, Rapid Switching, Modal Shielding,
 * Desktop Pointer Interactions, and Overlapping Touch/Click Suppression.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8115;
const ROOT = path.resolve(__dirname, '..');

const server = http.createServer((req, res) => {
  let u = req.url.split('?')[0];
  if (u === '/' || u === '') u = '/study.html';
  const filePath = path.join(ROOT, u);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found: ' + u);
      return;
    }
    const ext = path.extname(filePath);
    const ct = ext === '.html' ? 'text/html' : ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : 'text/plain';
    res.writeHead(200, { 'Content-Type': ct });
    res.end(data);
  });
});

server.listen(PORT, async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(ROOT, 'scratch/chrome-cdp-profile-stage-b');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9255',
    '--window-size=390,844',
    '--disable-extensions',
    '--user-data-dir=' + userDataDir
  ]);
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9255/json');
  const targets = await res.json();
  const ws = new WebSocket((targets.find(t => t.type === 'page') || targets[0]).webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const send = (m, p={}) => new Promise(r => {
    const cur = id++;
    const h = (e) => {
      const d = JSON.parse(e.data);
      if (d.id === cur) { ws.removeEventListener('message', h); r(d.result); }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: cur, method: m, params: p }));
  });

  const consoleErrors = [];
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = msg.params.args.map(a => {
        if (a.value !== undefined) return typeof a.value === 'object' ? JSON.stringify(a.value) : a.value;
        if (a.preview && a.preview.properties) {
          return JSON.stringify(Object.fromEntries(a.preview.properties.map(p => [p.name, p.value])));
        }
        return a.description || '';
      }).join(' ');
      if (msg.params.type === 'error') consoleErrors.push(text);
      else console.log('  [BROWSER LOG]', text);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(msg.params.exceptionDetails.exception ? msg.params.exceptionDetails.exception.description : msg.params.exceptionDetails.text);
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });

  async function getElementPoint(selector) {
    const r = await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector('${selector}');
        if (!el) return null;
        const container = el.closest('#ronCategorySingleRow');
        if (container) {
          container.style.scrollBehavior = 'auto';
          const cRect = container.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          if (elRect.left < cRect.left || elRect.right > cRect.right) {
            container.scrollLeft += (elRect.left - cRect.left - 20);
          }
        }
        const b = el.getBoundingClientRect();
        const pt = { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) };
        const hit = document.elementFromPoint(pt.x, pt.y);
        console.log('Point for ${selector}:', pt.x, pt.y, 'hit cat:', hit ? (hit.getAttribute('data-ron-cat') || hit.getAttribute('data-ron-domain') || hit.getAttribute('data-chapters-domain') || hit.tagName) : 'NONE');
        return pt;
      })()`,
      returnByValue: true
    });
    return r.result.value;
  }

  async function tap(x, y) {
    await send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: Math.round(x), y: Math.round(y) }]
    });
    await new Promise(r => setTimeout(r, 40));
    await send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: []
    });
  }

  async function doubleTap(target) {
    let pt1 = typeof target === 'string' ? await getElementPoint(target) : target;
    await tap(pt1.x, pt1.y);
    let pt2 = typeof target === 'string' ? await getElementPoint(target) : pt1;
    await tap(pt2.x, pt2.y);
  }

  async function swipe(x1, y1, x2, y2, steps=6) {
    await send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: Math.round(x1), y: Math.round(y1) }]
    });
    for (let i = 1; i <= steps; i++) {
      await new Promise(r => setTimeout(r, 20));
      const cx = Math.round(x1 + (x2 - x1) * (i / steps));
      const cy = Math.round(y1 + (y2 - y1) * (i / steps));
      await send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: cx, y: cy }]
      });
    }
    await new Promise(r => setTimeout(r, 30));
    await send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: []
    });
  }

  async function getStudyState(waitForReady = false) {
    if (waitForReady) {
      for (let i = 0; i < 20; i++) {
        const r = await send('Runtime.evaluate', {
          expression: `!!(document.querySelector('.ron-domain-tab.active') && document.querySelectorAll('.ron-card').length > 0)`,
          returnByValue: true
        });
        if (r && r.result && r.result.value) break;
        await new Promise(res => setTimeout(res, 50));
      }
    }
    const r = await send('Runtime.evaluate', {
      expression: `(() => {
        const activeTab = document.querySelector('.ron-domain-tab.active');
        const activePill = document.querySelector('.ron-nav-pill.active');
        const modal = document.getElementById('ronChaptersModal');
        const isModalOpen = modal && !modal.hidden && modal.classList.contains('ron-modal-open');
        const cards = document.querySelectorAll('.ron-card');
        return {
          activeDomain: activeTab ? activeTab.getAttribute('data-ron-domain') : null,
          activeCat: activePill ? activePill.getAttribute('data-ron-cat') : null,
          cardCount: cards.length,
          isModalOpen: !!isModalOpen,
          url: window.location.search
        };
      })()`,
      returnByValue: true
    });
    return r.result.value;
  }

  console.log('--- Step 1: Navigate to study.html?domain=anaesthesia ---');
  await send('Page.navigate', { url: 'http://localhost:' + PORT + '/study.html?domain=anaesthesia' });
  await getStudyState(true);

  let initialState = await getStudyState();
  console.log('Initial State:', initialState);

  // TEST 1: Single tap on Drugs domain tab (Immediate selection, no delay, no modal)
  console.log('\n--- TEST 1: Single tap on Drugs domain tab ---');
  let drugsTabPt = await getElementPoint('[data-ron-domain="drugs"]:not([data-ron-cat])');
  await tap(drugsTabPt.x, drugsTabPt.y);
  const test1 = await getStudyState(true);
  console.log('Test 1 (Single tap Drugs):', test1);
  const pass1 = test1.activeDomain === 'drugs' && test1.activeCat === 'all' && test1.cardCount === 126 && test1.isModalOpen === false;
  console.log('Test 1 Result:', pass1 ? 'PASS' : 'FAIL');

  // TEST 2: Double tap / repeated taps on Drugs domain tab does NOT open modal
  console.log('\n--- TEST 2: Double tap on Drugs domain tab (modal must remain closed) ---');
  let drugsTabPt2 = await getElementPoint('[data-ron-domain="drugs"]:not([data-ron-cat])');
  await doubleTap(drugsTabPt2);
  await new Promise(r => setTimeout(r, 400));
  const test2 = await getStudyState();
  console.log('Test 2 (Double tap Drugs):', test2);
  const pass2 = test2.activeDomain === 'drugs' && test2.isModalOpen === false;
  console.log('Test 2 Result:', pass2 ? 'PASS' : 'FAIL');

  // TEST 2b: Dedicated Chapters button tap DOES open chapters modal
  console.log('\n--- TEST 2b: Tapping dedicated Chapters button opens modal ---');
  const chaptersBtnPt = await getElementPoint('#ronBrowseChaptersTrigger');
  await tap(chaptersBtnPt.x, chaptersBtnPt.y);
  await new Promise(r => setTimeout(r, 400));
  const test2b = await getStudyState();
  console.log('Test 2b (Chapters button tap):', test2b);
  const pass2b = test2b.isModalOpen === true;
  console.log('Test 2b Result:', pass2b ? 'PASS' : 'FAIL');

  // Close chapters modal
  await send('Runtime.evaluate', { expression: `window.StudyRonDesign.closeChaptersModal()` });
  await new Promise(r => setTimeout(r, 300));

  // TEST 3: Single tap on Induction category pill (Immediate select, no modal)
  console.log('\n--- TEST 3: Single tap on Induction category pill ---');
  const indPillPt = await getElementPoint('.ron-nav-pill[data-ron-cat="induction"]');
  await tap(indPillPt.x, indPillPt.y);
  const test3 = await getStudyState(true);
  console.log('Test 3 (Single tap Induction):', test3);
  const pass3 = test3.activeCat === 'induction' && test3.cardCount === 7 && test3.isModalOpen === false;
  console.log('Test 3 Result:', pass3 ? 'PASS' : 'FAIL');

  // TEST 4: Double tap on Opioids category pill (Selects opioids, modal must remain closed)
  console.log('\n--- TEST 4: Double tap on Opioids category pill (modal must remain closed) ---');
  await doubleTap('.ron-nav-pill[data-ron-cat="opioids"]');
  await new Promise(r => setTimeout(r, 400));
  const test4 = await getStudyState();
  console.log('Test 4 (Double tap Opioids):', test4);
  const pass4 = test4.activeCat === 'opioids' && test4.cardCount === 13 && test4.isModalOpen === false;
  console.log('Test 4 Result:', pass4 ? 'PASS' : 'FAIL');

  // TEST 5: Horizontal swipe across category strip (> 8px cancels tap recognition)
  console.log('\n--- TEST 5: Horizontal swipe across category strip ---');
  const trackPt = await getElementPoint('#ronCategorySingleRow');
  const beforeSwipeState = await getStudyState();
  await swipe(trackPt.x + 80, trackPt.y, trackPt.x - 80, trackPt.y, 8);
  await new Promise(r => setTimeout(r, 300));
  const test5 = await getStudyState();
  console.log('Test 5 (Swipe across track):', test5);
  const pass5 = test5.activeCat === beforeSwipeState.activeCat && test5.isModalOpen === false;
  console.log('Test 5 Result:', pass5 ? 'PASS' : 'FAIL');

  // TEST 6: Rapid switching between categories (< 320ms between different pills)
  console.log('\n--- TEST 6: Rapid switching between categories ---');
  const relaxantsPt = await getElementPoint('.ron-nav-pill[data-ron-cat="relaxants"]');
  await tap(relaxantsPt.x, relaxantsPt.y);
  await new Promise(r => setTimeout(r, 100));
  const localPt = await getElementPoint('.ron-nav-pill[data-ron-cat="local"]');
  await tap(localPt.x, localPt.y);
  const test6 = await getStudyState(true);
  console.log('Test 6 (Rapid switch to Local Anaesthetics):', test6);
  const pass6 = test6.activeCat === 'local' && test6.cardCount === 5 && test6.isModalOpen === false;
  console.log('Test 6 Result:', pass6 ? 'PASS' : 'FAIL');

  // TEST 7: Repeated taps while chapters modal is open (Shields background categories)
  console.log('\n--- TEST 7: Repeated taps while a menu is open ---');
  await send('Runtime.evaluate', { expression: `window.StudyRonDesign.openChaptersModal('drugs')` });
  await new Promise(r => setTimeout(r, 300));
  const titlePt = await getElementPoint('#ronChaptersHeadTitle');
  if (titlePt) {
    await tap(titlePt.x, titlePt.y);
    await new Promise(r => setTimeout(r, 100));
    await tap(titlePt.x, titlePt.y);
  }
  await new Promise(r => setTimeout(r, 300));
  const test7 = await getStudyState();
  console.log('Test 7 (Taps with modal open):', test7);
  const pass7 = test7.isModalOpen === true && test7.activeCat === 'local';
  console.log('Test 7 Result (activeCat preserved & modal stays open):', pass7 ? 'PASS' : 'FAIL');

  // Close modal before test 8
  await send('Runtime.evaluate', { expression: `window.StudyRonDesign.closeChaptersModal()` });
  await new Promise(r => setTimeout(r, 400));

  // TEST 8: Desktop mouse single-click interaction (Pointer event without touch)
  console.log('\n--- TEST 8: Desktop mouse single-click interaction ---');
  const cardiacPt = await getElementPoint('.ron-nav-pill[data-ron-cat="cardiac"]');
  if (cardiacPt) {
    await send('Input.dispatchMouseEvent', {
      type: 'mousePressed', button: 'left', x: cardiacPt.x, y: cardiacPt.y, clickCount: 1
    });
    await send('Input.dispatchMouseEvent', {
      type: 'mouseReleased', button: 'left', x: cardiacPt.x, y: cardiacPt.y, clickCount: 1
    });
  }
  const test8 = await getStudyState(true);
  console.log('Test 8 (Desktop click Cardiac):', test8);
  const pass8 = test8.activeCat === 'cardiac' && test8.cardCount === 8 && test8.isModalOpen === false;
  console.log('Test 8 Result:', pass8 ? 'PASS' : 'FAIL');

  // TEST 9: Category selection after opening a chapter
  console.log('\n--- TEST 9: Category selection after opening a chapter ---');
  await send('Runtime.evaluate', { expression: `window.StudyRonDesign.openTopic('propofol')` });
  await new Promise(r => setTimeout(r, 600));

  // Click back button to return to category board
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('ronBackToCatBtn');
      if (btn) btn.click();
      else window.StudyRonDesign.backToCategory();
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  // Select Induction category pill via mobile tap
  const indPillPt2 = await getElementPoint('.ron-nav-pill[data-ron-cat="induction"]');
  if (indPillPt2) {
    await tap(indPillPt2.x, indPillPt2.y);
  }
  const test9 = await getStudyState(true);
  console.log('Test 9 (Category selection after chapter):', test9);
  const pass9 = test9.activeCat === 'induction' && test9.cardCount === 7 && test9.isModalOpen === false;
  console.log('Test 9 Result:', pass9 ? 'PASS' : 'FAIL');

  // TEST 10: Overlapping touch + synthetic click/dblclick event suppression
  console.log('\n--- TEST 10: Overlapping touch + synthetic click/dblclick event suppression ---');
  // First, verify that dblclick on a category control while lastTouchHandledTime is recent is suppressed
  const vasoPt = await getElementPoint('.ron-nav-pill[data-ron-cat="vasopressors"]');
  if (vasoPt) {
    // Single tap to set lastTouchHandledTime
    await tap(vasoPt.x, vasoPt.y);
    // Immediately dispatch synthetic dblclick event at the same coordinate
    await send('Input.dispatchMouseEvent', {
      type: 'mousePressed', button: 'left', x: vasoPt.x, y: vasoPt.y, clickCount: 2
    });
    await send('Input.dispatchMouseEvent', {
      type: 'mouseReleased', button: 'left', x: vasoPt.x, y: vasoPt.y, clickCount: 2
    });
  }
  await new Promise(r => setTimeout(r, 400));
  const test10 = await getStudyState();
  console.log('Test 10 (Synthetic dblclick suppressed after touch):', test10);
  const pass10 = test10.activeCat === 'vasopressors' && test10.isModalOpen === false;
  console.log('Test 10 Result (Modal not hijacked by synthetic dblclick):', pass10 ? 'PASS' : 'FAIL');
  // Close modal
  await send('Runtime.evaluate', { expression: `window.StudyRonDesign.closeChaptersModal()` });
  await new Promise(r => setTimeout(r, 300));

  console.log('\nConsole Errors:', consoleErrors);

  const allPassed = pass1 && pass2 && pass3 && pass4 && pass5 && pass6 && pass7 && pass8 && pass9 && pass10 && consoleErrors.length === 0;

  console.log('\n===============================================================');
  console.log('     STAGE B GESTURES VERIFICATION: ' + (allPassed ? 'ALL 10 TESTS PASSED' : 'FAILED'));
  console.log('===============================================================');

  ws.close(); chrome.kill(); server.close();
  process.exit(allPassed ? 0 : 1);
});
