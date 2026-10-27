/**
 * KnockoutNotes — Test Suite for Chapter Sharing & Free Subscription Modal
 * 
 * Verifies:
 * 1. Canonical URL generation:
 *    - Absolute HTTPS production origin (knockoutnotes.knockoutnotes-anaesthesia.workers.dev)
 *    - Correct path (/study?topic=...&mode=...&ref=share)
 *    - Mode preservation for both Study Mode (mode=study) and Reading Mode (mode=reading)
 *    - Applicable to both drug and non-drug chapters
 * 2. DOM elements and attributes across views:
 *    - Study Mode action bar (#knStudyShareBtn, .kn-share-chapter-btn)
 *    - Compact reading toolbar (#ronTbShareBtn, .ron-reading-share-btn)
 *    - Reading Mode top bar direct button (#ronRmShareBtn, .ron-rm-share-btn)
 *    - Reading Mode mobile overflow dropdown (#ronRmOverflowShareBtn)
 * 3. Responsive top bar behavior:
 *    - Desktop / Tablet / Mobile Landscape: full button with label
 *    - Mobile Portrait: collapsed 34px icon button, label hidden via CSS
 * 4. Free subscription modal triggering:
 *    - Appears when visitor opens shared link (ref=share)
 *    - Suppressed on direct visits without ref=share
 *    - Suppressed on repeat visits within same session (sessionStorage flag)
 * 5. Mode preservation on link open:
 *    - mode=study&ref=share opens Study Mode with modal
 *    - mode=reading&ref=share opens Reading Mode with modal above overlay (z-index 100005 > 100000)
 * 6. Modal user interactions:
 *    - Client-side email validation rejects invalid format
 *    - Valid submission dispatches POST /api/subscribe with correct payload
 *    - Cancel & Continue Reading dismisses modal without subscribing
 *    - Escape key closes modal first before touching Reading Mode
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
const PORT = 8150;
const CDP_PORT = 9275;

let recordedSubscriptions = [];

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  // Mock /api/subscribe backend
  if (urlPath === '/api/subscribe' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        recordedSubscriptions.push(payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Subscription confirmed.' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid payload.' }));
      }
    });
    return;
  }

  // Mock /api/auth/me
  if (urlPath === '/api/auth/me') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ authenticated: false, user: null, isAdmin: false }));
    return;
  }

  if (urlPath === '/' || urlPath === '' || urlPath === '/study') urlPath = '/study.html';

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

server.listen(PORT, '127.0.0.1', async () => {
  console.log(`Chapter Sharing test server running on port ${PORT}`);

  const chromePath = process.env.CHROME_PATH || (
    process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : 'google-chrome'
  );
  const userDataDir = path.join(ROOT, 'scratch/chrome-cdp-profile-share-test');
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
    await send('DOM.enable');

    const evalScript = async (expression) => {
      const res = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      if (res.exceptionDetails) {
        throw new Error(JSON.stringify(res.exceptionDetails));
      }
      return res.result.value;
    };

    const waitForAppReady = async (maxMs = 5000) => {
      const start = Date.now();
      while (Date.now() - start < maxMs) {
        try {
          const ready = await evalScript(`typeof window.StudyRonDesign !== "undefined" && typeof window.StudyRonDesign.isFullScreenReadingModeActive === "function"`);
          if (ready) return true;
        } catch (_) {}
        await delay(150);
      }
      return false;
    };

    console.log('\n--- 1. CANONICAL URL GENERATION & ORIGIN VERIFICATION ---');
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?topic=propofol` });
    await waitForAppReady();

    const shareUrls = await evalScript(`(() => {
      const dStudy = window.StudyRonDesign.generateShareUrl('propofol', 'study');
      const dReading = window.StudyRonDesign.generateShareUrl('propofol', 'reading');
      const nonDrugStudy = window.StudyRonDesign.generateShareUrl('preop-assessment', 'study');
      const nonDrugReading = window.StudyRonDesign.generateShareUrl('preop-assessment', 'reading');
      return { dStudy, dReading, nonDrugStudy, nonDrugReading };
    })()`);

    console.log('Generated URLs:', shareUrls);

    assert(
      shareUrls.dStudy === 'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/study?topic=propofol&mode=study&ref=share',
      'Propofol Study Mode URL matches canonical production structure with mode=study&ref=share'
    );
    assert(
      shareUrls.dReading === 'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/study?topic=propofol&mode=reading&ref=share',
      'Propofol Reading Mode URL matches canonical production structure with mode=reading&ref=share'
    );
    assert(
      shareUrls.nonDrugStudy === 'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/study?topic=preop-assessment&mode=study&ref=share',
      'Preop Assessment Study Mode URL matches canonical production structure'
    );
    assert(
      shareUrls.nonDrugReading === 'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/study?topic=preop-assessment&mode=reading&ref=share',
      'Preop Assessment Reading Mode URL matches canonical production structure'
    );

    console.log('\n--- 2. STUDY MODE BUTTONS PRESENCE & ATTRIBUTES ---');
    const studyButtons = await evalScript(`(() => {
      const actionBarBtn = document.getElementById('knStudyShareBtn');
      const toolbarBtn = document.getElementById('ronTbShareBtn');
      return {
        actionBar: {
          exists: !!actionBarBtn,
          chapterId: actionBarBtn ? actionBarBtn.getAttribute('data-chapter-id') : null,
          shareMode: actionBarBtn ? actionBarBtn.getAttribute('data-share-mode') : null,
          hasShareClass: actionBarBtn ? actionBarBtn.classList.contains('kn-share-chapter-btn') : false,
          label: actionBarBtn ? actionBarBtn.getAttribute('aria-label') : null
        },
        toolbar: {
          exists: !!toolbarBtn,
          chapterId: toolbarBtn ? toolbarBtn.getAttribute('data-chapter-id') : null,
          shareMode: toolbarBtn ? toolbarBtn.getAttribute('data-share-mode') : null,
          hasShareClass: toolbarBtn ? toolbarBtn.classList.contains('kn-share-chapter-btn') : false,
          hasTbClass: toolbarBtn ? toolbarBtn.classList.contains('ron-reading-share-btn') : false
        }
      };
    })()`);

    console.log('Study Mode Buttons:', studyButtons);
    assert(studyButtons.actionBar.exists, '#knStudyShareBtn exists in monograph action bar');
    assert(studyButtons.actionBar.chapterId === 'propofol', '#knStudyShareBtn has data-chapter-id="propofol"');
    assert(studyButtons.actionBar.shareMode === 'study', '#knStudyShareBtn has data-share-mode="study"');
    assert(studyButtons.actionBar.hasShareClass, '#knStudyShareBtn has .kn-share-chapter-btn class');
    assert(studyButtons.toolbar.exists, '#ronTbShareBtn exists in sticky reading toolbar');
    assert(studyButtons.toolbar.shareMode === 'study', '#ronTbShareBtn has data-share-mode="study"');
    assert(studyButtons.toolbar.hasShareClass && studyButtons.toolbar.hasTbClass, '#ronTbShareBtn has both required CSS classes');

    console.log('\n--- 3. READING MODE TOP BAR SHARE BUTTON & OVERFLOW MENU ---');
    // Open Reading Mode
    await evalScript(`window.StudyRonDesign.openFullScreenReadingMode()`);
    await delay(300);

    const rmButtons = await evalScript(`(() => {
      const rmTopBtn = document.getElementById('ronRmShareBtn');
      const rmOverflowBtn = document.getElementById('ronRmOverflowShareBtn');
      const label = rmTopBtn ? rmTopBtn.querySelector('.ron-rm-btn-label') : null;
      return {
        topBtn: {
          exists: !!rmTopBtn,
          hasRmClass: rmTopBtn ? rmTopBtn.classList.contains('ron-rm-share-btn') : false,
          ariaLabel: rmTopBtn ? rmTopBtn.getAttribute('aria-label') : null,
          labelVisible: label ? window.getComputedStyle(label).display !== 'none' : false
        },
        overflowBtn: {
          exists: !!rmOverflowBtn,
          shareMode: rmOverflowBtn ? rmOverflowBtn.getAttribute('data-share-mode') : null
        }
      };
    })()`);

    console.log('Reading Mode Buttons (Desktop):', rmButtons);
    assert(rmButtons.topBtn.exists, '#ronRmShareBtn exists in Reading Mode top bar');
    assert(rmButtons.topBtn.hasRmClass, '#ronRmShareBtn has .ron-rm-share-btn');
    assert(rmButtons.topBtn.labelVisible, 'Label is visible on desktop (>640px)');
    assert(rmButtons.overflowBtn.exists, '#ronRmOverflowShareBtn exists in overflow dropdown');
    assert(rmButtons.overflowBtn.shareMode === 'reading', '#ronRmOverflowShareBtn has data-share-mode="reading"');

    console.log('\n--- 4. MOBILE PORTRAIT RESPONSIVENESS OF SHARE BUTTON ---');
    // Emulate Mobile Portrait (390 x 844)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
      screenOrientation: { angle: 0, type: 'portraitPrimary' }
    });
    await delay(200);

    const mobileRmBtn = await evalScript(`(() => {
      const btn = document.getElementById('ronRmShareBtn');
      const label = btn ? btn.querySelector('.ron-rm-btn-label') : null;
      const rect = btn ? btn.getBoundingClientRect() : null;
      const comp = btn ? window.getComputedStyle(btn) : null;
      return {
        exists: !!btn,
        width: rect ? rect.width : 0,
        height: rect ? rect.height : 0,
        display: comp ? comp.display : null,
        labelDisplay: label ? window.getComputedStyle(label).display : null
      };
    })()`);

    console.log('Mobile Portrait Share Button:', mobileRmBtn);
    assert(mobileRmBtn.display !== 'none', '#ronRmShareBtn is visible in mobile portrait top bar');
    assert(mobileRmBtn.width >= 30, `#ronRmShareBtn width (${mobileRmBtn.width}px) is touch-friendly`);
    assert(mobileRmBtn.labelDisplay === 'none', 'Button text label is cleanly hidden on mobile portrait (icon only)');

    // Reset back to desktop viewport and exit reading mode
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false
    });
    await evalScript(`window.StudyRonDesign.exitFullScreenReadingMode()`);
    await delay(300);

    console.log('\n--- 5. DIRECT VISIT (NO ref=share): MODAL SUPPRESSION ---');
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?topic=fentanyl` });
    await waitForAppReady();
    await delay(500);

    const directVisitModal = await evalScript(`(() => {
      const modal = document.getElementById('knSharedSubModal');
      return {
        exists: !!modal,
        hidden: modal ? modal.hidden : true
      };
    })()`);
    console.log('Direct Visit Modal State:', directVisitModal);
    assert(!directVisitModal.exists || directVisitModal.hidden, 'Subscription modal is suppressed on direct visit without ref=share');

    console.log('\n--- 6. SHARED VISIT (ref=share) IN STUDY MODE ---');
    await evalScript(`sessionStorage.clear()`);
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?topic=fentanyl&mode=study&ref=share` });
    await waitForAppReady();
    await delay(700);

    const studyModalState = await evalScript(`(() => {
      const modal = document.getElementById('knSharedSubModal');
      const title = modal ? modal.querySelector('#knSubModalChapterTitle') : null;
      const sessionSeen = sessionStorage.getItem('kn_share_sub_modal_seen');
      const isRmOpen = window.StudyRonDesign ? window.StudyRonDesign.isFullScreenReadingModeActive() : false;
      return {
        modalExists: !!modal,
        modalHidden: modal ? modal.hidden : true,
        chapterTitle: title ? title.textContent : null,
        sessionSeen: sessionSeen,
        isRmOpen: isRmOpen
      };
    })()`);

    console.log('Shared Visit Study Mode State:', studyModalState);
    assert(studyModalState.modalExists && !studyModalState.modalHidden, 'Subscription modal opens automatically on shared link visit');
    assert(studyModalState.chapterTitle === 'Fentanyl', 'Modal header highlights shared chapter name "Fentanyl"');
    assert(studyModalState.sessionSeen === '1', 'sessionStorage flag kn_share_sub_modal_seen is recorded');
    assert(!studyModalState.isRmOpen, 'Study mode remains active (not forced into Reading Mode)');

    console.log('\n--- 7. CANCEL & CONTINUE READING DISMISSAL ---');
    await evalScript(`(() => {
      document.getElementById('knSubCancelBtn').click();
    })()`);
    await delay(200);

    const afterCancel = await evalScript(`(() => {
      const modal = document.getElementById('knSharedSubModal');
      return {
        hidden: modal ? modal.hidden : true,
        bodyHasClass: document.body.classList.contains('kn-sub-modal-open')
      };
    })()`);

    console.log('After Cancel:', afterCancel);
    assert(afterCancel.hidden, 'Modal hidden immediately upon Cancel click');
    assert(!afterCancel.bodyHasClass, 'kn-sub-modal-open class removed from body');

    console.log('\n--- 8. SESSION PERSISTENCE (NO RE-PROMPTING ON REFRESH) ---');
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?topic=fentanyl&mode=study&ref=share` });
    await waitForAppReady();
    await delay(700);

    const reloadedModal = await evalScript(`(() => {
      const modal = document.getElementById('knSharedSubModal');
      return {
        hidden: modal ? modal.hidden : true
      };
    })()`);
    console.log('Reloaded Modal State:', reloadedModal);
    assert(reloadedModal.hidden, 'Modal does not re-open after user already viewed it in the session');

    console.log('\n--- 9. SHARED VISIT IN READING MODE (mode=reading&ref=share) ---');
    await evalScript(`sessionStorage.clear()`);
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?topic=rocuronium&mode=reading&ref=share` });
    await waitForAppReady();
    await delay(800);

    const rmSharedState = await evalScript(`(() => {
      const modal = document.getElementById('knSharedSubModal');
      const isRmOpen = window.StudyRonDesign.isFullScreenReadingModeActive();
      const modalZ = modal ? window.getComputedStyle(modal).zIndex : '0';
      const rmOverlay = document.getElementById('ronReadingModeOverlay');
      const rmZ = rmOverlay ? window.getComputedStyle(rmOverlay).zIndex : '0';
      return {
        isRmOpen: isRmOpen,
        modalVisible: modal ? !modal.hidden : false,
        modalZ: parseInt(modalZ, 10),
        rmZ: parseInt(rmZ, 10)
      };
    })()`);

    console.log('Reading Mode Shared State:', rmSharedState);
    assert(rmSharedState.isRmOpen, 'Reading Mode opens automatically because mode=reading was requested');
    assert(rmSharedState.modalVisible, 'Subscription modal opens above Reading Mode');
    assert(rmSharedState.modalZ > rmSharedState.rmZ, `Subscription modal z-index (${rmSharedState.modalZ}) > Reading Mode (${rmSharedState.rmZ})`);

    console.log('\n--- 10. ESCAPE KEY BEHAVIOR WITH OPEN MODAL & READING MODE ---');
    // Trigger Escape key event
    await evalScript(`(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    })()`);
    await delay(200);

    const escapeStep1 = await evalScript(`(() => {
      const modal = document.getElementById('knSharedSubModal');
      const isRmOpen = window.StudyRonDesign.isFullScreenReadingModeActive();
      return {
        modalHidden: modal ? modal.hidden : true,
        isRmOpen: isRmOpen
      };
    })()`);

    console.log('After 1st Escape:', escapeStep1);
    assert(escapeStep1.modalHidden, 'First Escape key closes subscription modal');
    assert(escapeStep1.isRmOpen, 'First Escape key preserves Reading Mode without exiting');

    // Trigger Escape key again
    await evalScript(`(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    })()`);
    await delay(200);

    const escapeStep2 = await evalScript(`(() => {
      return {
        isRmOpen: window.StudyRonDesign.isFullScreenReadingModeActive()
      };
    })()`);

    console.log('After 2nd Escape:', escapeStep2);
    assert(!escapeStep2.isRmOpen, 'Second Escape key exits Reading Mode back to Study Mode');

    console.log('\n--- 11. SUBSCRIPTION FORM VALIDATION & SUBMISSION ---');
    // Open modal directly via API
    await evalScript(`window.StudyRonDesign.openSubscriptionModal(window.__ACTIVE_STUDY_ITEM, 'study')`);
    await delay(200);

    // Test invalid email
    const invalidAttempt = await evalScript(`(async () => {
      const input = document.getElementById('knSubEmailInput');
      const form = document.getElementById('knSharedSubForm');
      input.value = 'invalid-email-address';
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      const errorEl = document.getElementById('knSubEmailError');
      return {
        inputHasInvalidClass: input.classList.contains('invalid'),
        errorText: errorEl ? errorEl.textContent : '',
        errorVisible: errorEl ? errorEl.classList.contains('visible') : false
      };
    })()`);

    console.log('Invalid email validation:', invalidAttempt);
    assert(invalidAttempt.inputHasInvalidClass, 'Input flagged with .invalid class');
    assert(invalidAttempt.errorVisible, 'Error message is displayed');
    assert(invalidAttempt.errorText.includes('valid email'), 'Error specifies valid email required');
    assert(recordedSubscriptions.length === 0, 'No request dispatched to backend for invalid email');

    // Test valid email submission
    const validAttempt = await evalScript(`(async () => {
      const input = document.getElementById('knSubEmailInput');
      const form = document.getElementById('knSharedSubForm');
      input.value = 'resident.anaesthesia@aiims.edu';
      await window.StudyRonDesign.handleSubscriptionSubmit();
      const successView = document.getElementById('knSubSuccessView');
      return {
        formHidden: form.hidden,
        successVisible: successView ? !successView.hidden : false
      };
    })()`);

    console.log('Valid email result:', validAttempt);
    assert(validAttempt.formHidden, 'Form hides upon successful subscription');
    assert(validAttempt.successVisible, 'Success view appears with confirmation');
    assert(recordedSubscriptions.length === 1, 'Subscription request reached /api/subscribe backend');
    assert(
      recordedSubscriptions[0].email === 'resident.anaesthesia@aiims.edu',
      'Backend received sanitized subscriber email'
    );
    assert(
      recordedSubscriptions[0].sourcePage.includes('rocuronium'),
      'Backend received correct shared chapter sourcePage context'
    );

    console.log('\n======================================================');
    console.log('🎉 ALL CHAPTER SHARING & SUBSCRIPTION TESTS PASSED!');
    console.log('======================================================\n');

  } catch (err) {
    console.error('Test run failed with error:', err);
    process.exitCode = 1;
  } finally {
    try {
      chromeProcess.kill();
    } catch (_) {}
    server.close();
  }
});
