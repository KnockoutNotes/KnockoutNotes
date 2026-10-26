/**
 * KnockoutNotes — Test Suite for Mobile Landscape Reading Options & Study Screenshot Protection
 * 
 * Verifies:
 * 1. Mobile Landscape typography popover vertical fitting, overflow-y: auto, overscroll-behavior: contain, and Text Size reachability.
 * 2. Popover close button dismiss behavior.
 * 3. Bidirectional bookmark toggle switch (ON/OFF) in both Reading Mode overlay and compact toolbar.
 * 4. Study Mode Screenshot & Content Security:
 *    - Unauthenticated/non-admin: fail-closed protection enabled, body.kn-study-protected active, user-select: none on notes, contextmenu blocked, Ctrl+P blocked.
 *    - Server-verified admin (/api/auth/me): protection disabled, normal browser behavior permitted.
 * 5. Android Capacitor SecureScreenPlugin registration and bridge integration.
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
const PORT = 8138;
const CDP_PORT = 9268;

let serverAdmin = false;

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  if (urlPath === '/__set_admin_mode') {
    serverAdmin = true;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, admin: true }));
    return;
  }

  // Mock /api/auth/me
  if (urlPath === '/api/auth/me') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ authenticated: serverAdmin, user: serverAdmin ? { email: 'admin@knockoutnotes.com' } : null, isAdmin: serverAdmin }));
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
  console.log(`Test server running on port ${PORT}`);

  const chromePath = process.env.CHROME_PATH || (
    process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : 'google-chrome'
  );
  const userDataDir = path.join(ROOT, 'scratch/chrome-cdp-profile-landscape-test');
  fs.mkdirSync(userDataDir, { recursive: true });

  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--window-size=740,360',
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

    // Emulate Mobile Landscape Viewport (740x360, landscape: true)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 740,
      height: 360,
      deviceScaleFactor: 2,
      mobile: true,
      screenOrientation: { angle: 90, type: 'landscapePrimary' }
    });

    // Navigate to study page
    await send('Page.navigate', { url: `http://localhost:${PORT}/study.html?topic=propofol` });
    await delay(2000);

    const evaluate = async (expression) => {
      const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      return res.result ? res.result.value : null;
    };

    // Clean initial localStorage
    await evaluate(`localStorage.clear();`);

    // Wait for StudyRonDesign
    await evaluate(`
      new Promise((resolve) => {
        function check() {
          if (window.StudyRonDesign && window.StudyRonDesign.isDataReady()) {
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

    // =========================================================================
    // FIX 1: MOBILE LANDSCAPE READING OPTIONS
    // =========================================================================
    console.log('\n--- 1. ENTER FULL-SCREEN READING MODE IN MOBILE LANDSCAPE ---');
    await evaluate(`
      (() => {
        const btn = document.getElementById('ronEnterReadingModeTopBtn') || document.querySelector('.kn-reading-mode-trigger-btn');
        if (btn) btn.click();
      })()
    `);
    await delay(600);

    const isOverlayOpen = await evaluate(`
      (() => {
        const ov = document.getElementById('ronReadingModeOverlay');
        return ov && !ov.hidden && document.body.classList.contains('ron-reading-fullscreen-active');
      })()
    `);
    assert(isOverlayOpen === true, 'Reading Mode overlay is open and active in landscape');

    console.log('\n--- 2. OPEN TYPOGRAPHY & SPACING POPOVER IN LANDSCAPE ---');
    const openPopover = await evaluate(`
      (() => {
        const typeBtn = document.getElementById('ronRmTypeToggleBtn');
        if (typeBtn) typeBtn.click();
        const pop = document.getElementById('ronRmTypeDropdown');
        if (!pop) return null;
        const comp = window.getComputedStyle(pop);
        const rect = pop.getBoundingClientRect();
        return {
          hidden: pop.hidden,
          maxHeight: comp.maxHeight,
          overflowY: comp.overflowY,
          overscrollBehavior: comp.overscrollBehavior,
          rectBottom: rect.bottom,
          windowHeight: window.innerHeight,
          fitsViewport: rect.bottom <= window.innerHeight + 2
        };
      })()
    `);
    console.log('Popover landscape layout:', openPopover);
    assert(openPopover && openPopover.hidden === false, 'Typography popover is visible');
    assert(openPopover.overflowY === 'auto', 'Popover has overflow-y: auto for smooth scrolling');
    assert(openPopover.overscrollBehavior === 'contain', 'Popover has overscroll-behavior: contain to prevent background scroll chaining');
    assert(openPopover.fitsViewport === true, 'Popover fits within available viewport height in landscape');

    console.log('\n--- 3. VERIFY TEXT SIZE CONTROLS ACCESSIBLE & FUNCTIONAL IN LANDSCAPE ---');
    // Scroll popover to bottom to access Text Size
    const popScrollResult = await evaluate(`
      (() => {
        const pop = document.getElementById('ronRmTypeDropdown');
        pop.scrollTop = pop.scrollHeight;
        const stepper = pop.querySelector('.ron-rm-font-stepper');
        const decBtn = document.getElementById('ronRmStepperDec');
        const incBtn = document.getElementById('ronRmStepperInc');
        const valSpan = document.getElementById('ronRmStepperVal');
        
        const initialVal = valSpan ? valSpan.textContent.trim() : '';
        // Increase text size
        incBtn.click();
        const increasedVal = valSpan.textContent.trim();
        // Decrease text size
        decBtn.click();
        const restoredVal = valSpan.textContent.trim();

        return {
          hasStepper: !!stepper,
          initialVal,
          increasedVal,
          restoredVal,
          scrolledTop: pop.scrollTop
        };
      })()
    `);
    console.log('Text size stepper interaction:', popScrollResult);
    assert(popScrollResult.hasStepper === true, 'Text size stepper exists inside popover');
    assert(popScrollResult.initialVal === '17px', 'Initial text size is 17px');
    assert(popScrollResult.increasedVal === '18px', 'Incrementing text size works (18px)');
    assert(popScrollResult.restoredVal === '17px', 'Decrementing text size restores (17px)');

    console.log('\n--- 4. CLOSE BUTTON DISMISS BEHAVIOR ---');
    const closeBtnResult = await evaluate(`
      (() => {
        const closeBtn = document.getElementById('ronRmTypeCloseBtn');
        if (!closeBtn) return { hasBtn: false };
        closeBtn.click();
        const pop = document.getElementById('ronRmTypeDropdown');
        return {
          hasBtn: true,
          isClosed: pop.hidden === true
        };
      })()
    `);
    console.log('Close button result:', closeBtnResult);
    assert(closeBtnResult.hasBtn === true, 'Close button exists in popover header');
    assert(closeBtnResult.isClosed === true, 'Clicking close button dismisses popover');

    // =========================================================================
    // FIX 1 SUB-REQUIREMENT: BOOKMARK TOGGLE SWITCH ON/OFF
    // =========================================================================
    console.log('\n--- 5. BOOKMARK BIDIRECTIONAL TOGGLE SWITCH (ON / OFF) ---');
    // 5A: Toggle ON in Reading Mode
    const bmToggleOn = await evaluate(`
      (() => {
        const bmBtn = document.getElementById('ronRmBookmarkBtn');
        bmBtn.click();
        const raw = localStorage.getItem('kn_bookmarks');
        return {
          activeClass: bmBtn.classList.contains('active-bookmark'),
          ariaPressed: bmBtn.getAttribute('aria-pressed'),
          savedBookmarks: raw ? JSON.parse(raw) : []
        };
      })()
    `);
    console.log('Toggle ON result:', bmToggleOn);
    assert(bmToggleOn.activeClass === true, 'Bookmark toggle ON: gains active-bookmark class');
    assert(bmToggleOn.ariaPressed === 'true', 'Bookmark toggle ON: aria-pressed is true');
    assert(bmToggleOn.savedBookmarks.length > 0, 'Bookmark toggle ON: saved in kn_bookmarks');

    // 5B: Toggle OFF in Reading Mode
    const bmToggleOff = await evaluate(`
      (() => {
        const bmBtn = document.getElementById('ronRmBookmarkBtn');
        bmBtn.click();
        const raw = localStorage.getItem('kn_bookmarks');
        return {
          activeClass: bmBtn.classList.contains('active-bookmark'),
          ariaPressed: bmBtn.getAttribute('aria-pressed'),
          savedBookmarks: raw ? JSON.parse(raw) : []
        };
      })()
    `);
    console.log('Toggle OFF result:', bmToggleOff);
    assert(bmToggleOff.activeClass === false, 'Bookmark toggle OFF: active-bookmark class removed');
    assert(bmToggleOff.ariaPressed === 'false', 'Bookmark toggle OFF: aria-pressed is false');
    assert(bmToggleOff.savedBookmarks.length === 0, 'Bookmark toggle OFF: removed from kn_bookmarks');

    // Exit Reading Mode
    await evaluate(`document.getElementById('ronRmExitBtn').click();`);
    await delay(400);

    // 5C: Toggle in compact toolbar
    await evaluate(`window.scrollTo(0, 500);`);
    await delay(300);

    const tbBmOn = await evaluate(`
      (() => {
        const tbBmBtn = document.getElementById('ronTbBookmarkBtn');
        tbBmBtn.click();
        return {
          activeClass: tbBmBtn.classList.contains('active-bookmark'),
          ariaPressed: tbBmBtn.getAttribute('aria-pressed')
        };
      })()
    `);
    assert(tbBmOn.activeClass === true, 'Compact toolbar bookmark toggles ON');

    const tbBmOff = await evaluate(`
      (() => {
        const tbBmBtn = document.getElementById('ronTbBookmarkBtn');
        tbBmBtn.click();
        return {
          activeClass: tbBmBtn.classList.contains('active-bookmark'),
          ariaPressed: tbBmBtn.getAttribute('aria-pressed')
        };
      })()
    `);
    assert(tbBmOff.activeClass === false, 'Compact toolbar bookmark toggles OFF');

    // =========================================================================
    // FIX 2: STUDY MODE SCREENSHOT & CONTENT SECURITY
    // =========================================================================
    console.log('\n--- 6. STUDY MODE SCREENSHOT & CONTENT DETERRENCE (NON-ADMIN) ---');
    const nonAdminSecurity = await evaluate(`
      (() => {
        const isProtected = window.KnockoutSecurity ? window.KnockoutSecurity.isProtected() : false;
        const bodyHasClass = document.body.classList.contains('kn-study-protected');
        const stDetail = document.getElementById('stDetail');
        const detailComp = stDetail ? window.getComputedStyle(stDetail) : null;

        // Test context menu interception on study content
        const targetEl = document.querySelector('.st-content-area, #ronActiveDescriptionBox, #stDetail');
        let contextMenuPrevented = false;
        if (targetEl) {
          const evt = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
          contextMenuPrevented = !targetEl.dispatchEvent(evt);
        }

        // Test Ctrl+P shortcut interception
        let printPrevented = false;
        const pEvt = new KeyboardEvent('keydown', { key: 'p', ctrlKey: true, bubbles: true, cancelable: true });
        printPrevented = !document.dispatchEvent(pEvt);

        return {
          isProtected,
          bodyHasClass,
          userSelect: detailComp ? detailComp.userSelect : null,
          contextMenuPrevented,
          printPrevented
        };
      })()
    `);
    console.log('Non-admin security state:', nonAdminSecurity);
    assert(nonAdminSecurity.isProtected === true, 'Fail-closed: Study Mode protection is active for non-admin');
    assert(nonAdminSecurity.bodyHasClass === true, 'body contains class kn-study-protected');
    assert(nonAdminSecurity.userSelect === 'none', 'CSS user-select: none applied on study notes content');
    assert(nonAdminSecurity.contextMenuPrevented === true, 'Context menu right-click is intercepted on study notes');
    assert(nonAdminSecurity.printPrevented === true, 'Ctrl+P print shortcut is intercepted on non-admin');

    console.log('\n--- 7. ADMIN EXEMPTION (SERVER-VERIFIED) ---');
    // Enable admin in mock server
    serverAdmin = true;

    const adminSecurity = await evaluate(`
      (async () => {
        // Run authentic checkAdmin workflow against backend
        await window.KnockoutSecurity.checkAdmin();

        const isProtected = window.KnockoutSecurity.isProtected();
        const bodyHasClass = document.body.classList.contains('kn-study-protected');
        const stDetail = document.getElementById('stDetail');
        const detailComp = stDetail ? window.getComputedStyle(stDetail) : null;

        // Test context menu allows on admin
        const targetEl = document.querySelector('.st-content-area, #ronActiveDescriptionBox, #stDetail');
        let contextMenuPrevented = false;
        if (targetEl) {
          const evt = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
          contextMenuPrevented = !targetEl.dispatchEvent(evt);
        }

        // Test Ctrl+P allows on admin
        let printPrevented = false;
        const pEvt = new KeyboardEvent('keydown', { key: 'p', ctrlKey: true, bubbles: true, cancelable: true });
        printPrevented = !document.dispatchEvent(pEvt);

        return {
          isProtected,
          bodyHasClass,
          userSelect: detailComp ? detailComp.userSelect : null,
          contextMenuPrevented,
          printPrevented
        };
      })()
    `);
    console.log('Admin security state:', adminSecurity);
    assert(adminSecurity.isProtected === false, 'Protection is disabled for authenticated admin');
    assert(adminSecurity.bodyHasClass === false, 'body no longer has kn-study-protected class');
    assert(adminSecurity.userSelect !== 'none', 'CSS user-select is restored to normal for admin');
    assert(adminSecurity.contextMenuPrevented === false, 'Context menu is allowed for admin');
    assert(adminSecurity.printPrevented === false, 'Print shortcut is allowed for admin');

    console.log('\n--- 8. ANDROID CAPACITOR SECURE SCREEN PLUGIN CHECK ---');
    const pluginFileExists = fs.existsSync(path.join(__dirname, '..', 'android/app/src/main/java/com/knockoutnotes/app/SecureScreenPlugin.java'));
    const pluginCode = fs.readFileSync(path.join(__dirname, '..', 'android/app/src/main/java/com/knockoutnotes/app/SecureScreenPlugin.java'), 'utf8');
    const mainActivityCode = fs.readFileSync(path.join(__dirname, '..', 'android/app/src/main/java/com/knockoutnotes/app/MainActivity.java'), 'utf8');

    assert(pluginFileExists === true, 'SecureScreenPlugin.java exists in android package');
    assert(pluginCode.includes('FLAG_SECURE'), 'SecureScreenPlugin sets WindowManager.LayoutParams.FLAG_SECURE');
    assert(pluginCode.includes('@CapacitorPlugin(name = "SecureScreen")'), 'SecureScreenPlugin is annotated with name="SecureScreen"');
    assert(mainActivityCode.includes('registerPlugin(SecureScreenPlugin.class)'), 'MainActivity registers SecureScreenPlugin.class');

    console.log('\n======================================================');
    console.log('🎉 ALL LANDSCAPE & SECURITY TESTS PASSED PERFECTLY!');
    console.log('======================================================');

  } catch (err) {
    console.error('Test execution failed:', err);
    process.exitCode = 1;
  } finally {
    chromeProcess.kill();
    server.close();
  }
});
