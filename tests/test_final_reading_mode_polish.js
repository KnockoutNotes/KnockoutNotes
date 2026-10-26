const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8118;
const CDP_PORT = 9258;
const ROOT = path.resolve(__dirname, '..');

const server = http.createServer((req, res) => {
  let u = req.url.split('?')[0];
  if (u === '/' || u === '' || u === '/study') u = '/study.html';
  const filePath = path.join(ROOT, u);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found: ' + u);
      return;
    }
    const ext = path.extname(filePath);
    const ct = ext === '.html' ? 'text/html' : ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : ext === '.json' ? 'application/json' : 'text/plain';
    res.writeHead(200, { 'Content-Type': ct });
    res.end(data);
  });
});

server.listen(PORT, async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(ROOT, 'scratch/chrome-cdp-profile-final-reading-polish');
  try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (_) {}
  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--window-size=390,844',
    '--disable-extensions',
    '--disable-gpu',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  let cdpWs = null;
  let msgId = 1;
  const pending = new Map();

  async function send(method, params = {}) {
    const id = msgId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      cdpWs.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }

  const delay = ms => new Promise(r => setTimeout(r, ms));

  let allPassed = true;
  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      allPassed = false;
    } else {
      console.log(`✅ PASS: ${message}`);
    }
  }

  try {
    await delay(1200);
    const versionRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`).then(r => r.json());
    const wsUrl = (versionRes.find(t => t.type === 'page') || versionRes[0]).webSocketDebuggerUrl;
    cdpWs = new WebSocket(wsUrl);
    await new Promise(r => cdpWs.onopen = r);

    cdpWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    });
    await send('Emulation.setTouchEmulationEnabled', {
      enabled: true,
      maxTouchPoints: 5
    });

    console.log('\n--- NAVIGATE TO PROPOFOL ---');
    await send('Page.navigate', { url: `http://localhost:${PORT}/study.html?domain=drugs&cat=induction` });
    await delay(2000);

    // Wait for data and open Propofol
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
    await delay(800);

    // 1. Verify Normal Mode Source Reference (Decorative Card)
    console.log('\n--- 1. NORMAL MODE PROPOFOL SOURCE REFERENCE ---');
    const normalMode = await evaluate(`
      (() => {
        const desc = document.getElementById('ronActiveDescriptionBox');
        const callout = desc ? desc.querySelector('.ron-source-callout') : null;
        if (!callout) return null;
        const comp = window.getComputedStyle(callout);
        return {
          display: comp.display,
          text: callout.textContent.trim().replace(/\\s+/g, ' ')
        };
      })()
    `);
    console.log('Normal mode source callout:', normalMode);
    assert(normalMode && normalMode.display !== 'none', 'Normal mode has visible decorative source callout (.ron-source-callout)');
    assert(normalMode && normalMode.text.includes('FDA-approved prescribing information'), 'Normal mode source contains full FDA citation');

    // 2. Open Full-Screen Reading Mode
    console.log('\n--- 2. ENTER FULL-SCREEN READING MODE ---');
    await evaluate(`
      (() => {
        const btn = document.getElementById('ronEnterReadingModeTopBtn') || document.querySelector('.kn-reading-mode-trigger-btn');
        if (btn) btn.click();
      })()
    `);
    await delay(600);

    // 3. Verify Reading Mode Source Duplication is ELIMINATED
    console.log('\n--- 3. READING MODE SOURCE DUPLICATION ELIMINATED ---');
    const rmSource = await evaluate(`
      (() => {
        const headerBox = document.getElementById('ronRmSourceBox');
        const headerComp = headerBox ? window.getComputedStyle(headerBox) : null;
        const headerText = document.getElementById('ronRmSourceText');

        const bodyTarget = document.getElementById('ronRmBodyTarget');
        const bodyCallout = bodyTarget ? bodyTarget.querySelector('.ron-source-callout') : null;
        const bodyCalloutComp = bodyCallout ? window.getComputedStyle(bodyCallout) : null;

        return {
          headerVisible: headerComp && headerComp.display !== 'none',
          headerText: headerText ? headerText.textContent.trim() : '',
          bodyCalloutExists: !!bodyCallout,
          bodyCalloutDisplay: bodyCalloutComp ? bodyCalloutComp.display : 'none'
        };
      })()
    `);
    console.log('Reading mode source status:', rmSource);
    assert(rmSource.headerVisible === true, 'Header plain source reference is visible (#ronRmSourceBox)');
    assert(rmSource.headerText.includes('FDA-approved prescribing information'), 'Header plain source contains full citation');
    assert(rmSource.bodyCalloutDisplay === 'none', 'Body duplicate decorative source card is display: none in Reading Mode');

    // 4. Test other monographs: Ketamine, Midazolam, Bupivacaine
    console.log('\n--- 4. OTHER MONOGRAPHS SOURCE DUPLICATION CHECK ---');
    for (const drugId of ['ketamine', 'midazolam', 'bupivacaine']) {
      const res = await evaluate(`
        (() => {
          if (window.StudyRonDesign && typeof window.StudyRonDesign.openTopic === 'function') {
            window.StudyRonDesign.openTopic('${drugId}');
          }
          const btn = document.querySelector('.kn-reading-mode-trigger-btn');
          if (btn) btn.click();

          const headerBox = document.getElementById('ronRmSourceBox');
          const headerComp = headerBox ? window.getComputedStyle(headerBox) : null;
          const bodyTarget = document.getElementById('ronRmBodyTarget');
          const bodyCallout = bodyTarget ? bodyTarget.querySelector('.ron-source-callout') : null;
          const bodyCalloutComp = bodyCallout ? window.getComputedStyle(bodyCallout) : null;

          return {
            id: '${drugId}',
            headerVisible: headerComp && headerComp.display !== 'none',
            bodyCalloutDisplay: bodyCalloutComp ? bodyCalloutComp.display : 'none'
          };
        })()
      `);
      console.log(`Monograph ${drugId}:`, res);
      assert(res.headerVisible === true, `${drugId}: Header plain source visible`);
      assert(res.bodyCalloutDisplay === 'none', `${drugId}: Body duplicate callout display is none`);
    }

    // 5. Typography and Spacing in Reading Mode
    console.log('\n--- 5. READING MODE TYPOGRAPHY AND SPACING ---');
    const typography = await evaluate(`
      (() => {
        const wrapper = document.getElementById('ronRmContentWrapper');
        const wrapComp = window.getComputedStyle(wrapper);
        const heading = document.querySelector('.ron-rm-body-target h3, .ron-rm-body-target .ron-card-title, .ron-rm-body-target h2');
        const headComp = heading ? window.getComputedStyle(heading) : null;
        const p = document.querySelector('.ron-rm-body-target p');
        const pComp = p ? window.getComputedStyle(p) : null;
        const card = document.querySelector('.ron-rm-body-target .ron-card, .ron-rm-body-target .st-subsection-card');
        const cardComp = card ? window.getComputedStyle(card) : null;

        return {
          paddingLeft: wrapComp.paddingLeft,
          paddingRight: wrapComp.paddingRight,
          headingFontSize: headComp ? headComp.fontSize : null,
          headingFontWeight: headComp ? headComp.fontWeight : null,
          pFontSize: pComp ? pComp.fontSize : null,
          pLineHeight: pComp ? pComp.lineHeight : null,
          pMarginBottom: pComp ? pComp.marginBottom : null,
          cardBg: cardComp ? cardComp.backgroundColor : null,
          cardBorderWidth: cardComp ? cardComp.borderWidth : null
        };
      })()
    `);
    console.log('Typography & spacing values:', typography);
    assert(typography.paddingLeft === '20px' && typography.paddingRight === '20px', 'Mobile side padding is exactly 20px (18-22px range)');
    assert(typography.headingFontSize === '22px', 'Headings are exactly 22px (21-23px range)');
    assert(typography.headingFontWeight === '700', 'Headings use restrained bold emphasis (700)');
    assert(typography.pFontSize === '17px', 'Default body font size is ~17px (17px)');
    assert(typography.pMarginBottom === '16px', 'Paragraph spacing is 16px (14-18px range)');
    assert(typography.cardBg === 'rgba(0, 0, 0, 0)' || typography.cardBg === 'transparent', 'Section cards have no decorative background');
    assert(typography.cardBorderWidth === '0px', 'Section cards have no decorative borders');

    // Exit Reading Mode
    await evaluate(`
      (() => {
        const exitBtn = document.getElementById('ronRmExitBtn');
        if (exitBtn) exitBtn.click();
      })()
    `);
    await delay(400);

    // 6. Test Compact Toolbar Buttons (#ronReadingToolbar)
    console.log('\n--- 6. COMPACT TOOLBAR BUTTONS (#ronReadingToolbar) ---');
    // Scroll down to activate compact toolbar
    await evaluate(`window.scrollTo(0, 500);`);
    await delay(300);

    const tbButtons = await evaluate(`
      (() => {
        const tb = document.getElementById('ronReadingToolbar');
        const rmBtn = tb ? tb.querySelector('#ronTbReadingModeBtn') : null;
        const bmBtn = tb ? tb.querySelector('#ronTbBookmarkBtn') : null;
        return {
          tbExists: !!tb,
          rmBtnExists: !!rmBtn,
          bmBtnExists: !!bmBtn,
          isBookmarkedInitially: bmBtn ? bmBtn.classList.contains('active-bookmark') : false,
          bmBtnTitle: bmBtn ? bmBtn.title : ''
        };
      })()
    `);
    console.log('Toolbar buttons:', tbButtons);
    assert(tbButtons.rmBtnExists === true, 'Compact toolbar contains #ronTbReadingModeBtn');
    assert(tbButtons.bmBtnExists === true, 'Compact toolbar contains #ronTbBookmarkBtn');

    // Test clicking Bookmark button in toolbar
    console.log('\n--- 7. TOOLBAR BOOKMARK TOGGLE & PERSISTENCE ---');
    const bmToggled = await evaluate(`
      (() => {
        localStorage.removeItem('kn_bookmarks');
        const bmBtn = document.getElementById('ronTbBookmarkBtn');
        if (!bmBtn) return { error: 'No button' };
        bmBtn.classList.remove('active-bookmark');
        bmBtn.setAttribute('aria-pressed', 'false');
        bmBtn.click();
        const raw = localStorage.getItem('kn_bookmarks');
        return {
          hasActiveClass: bmBtn.classList.contains('active-bookmark'),
          ariaPressed: bmBtn.getAttribute('aria-pressed'),
          savedBookmarks: raw ? JSON.parse(raw) : []
        };
      })()
    `);
    console.log('Bookmark toggle result:', bmToggled);
    assert(bmToggled.hasActiveClass === true, 'Toolbar bookmark button gains active-bookmark class');
    assert(bmToggled.ariaPressed === 'true', 'Toolbar bookmark button aria-pressed is true');
    assert(bmToggled.savedBookmarks.length > 0, 'Bookmark persisted into localStorage kn_bookmarks');

    // Test clicking Reading Mode button in toolbar
    console.log('\n--- 8. TOOLBAR READING MODE TRIGGER ---');
    await evaluate(`
      (() => {
        const rmBtn = document.getElementById('ronTbReadingModeBtn');
        if (rmBtn) rmBtn.click();
      })()
    `);
    await delay(500);

    const rmActive = await evaluate(`
      (() => {
        const overlay = document.getElementById('ronReadingModeOverlay');
        return overlay && !overlay.hidden && document.body.classList.contains('ron-reading-fullscreen-active');
      })()
    `);
    console.log('Reading Mode active from toolbar click:', rmActive);
    assert(rmActive === true, 'Toolbar Reading Mode button cleanly launches full-screen Reading Mode');

    // Exit Reading Mode
    await evaluate(`
      (() => {
        const exitBtn = document.getElementById('ronRmExitBtn');
        if (exitBtn) exitBtn.click();
      })()
    `);
    await delay(300);

    const exitClean = await evaluate(`
      (() => {
        const overlay = document.getElementById('ronReadingModeOverlay');
        return overlay && overlay.hidden && !document.body.classList.contains('ron-reading-fullscreen-active');
      })()
    `);
    assert(exitClean === true, 'Reading Mode cleanly exits back to normal Study view');

    if (allPassed) {
      console.log('\n🎉 ALL POLISH & MINIMAL TOOLBAR VERIFICATION CHECKS PASSED PERFECTLY!\n');
    } else {
      console.error('\n❌ SOME VERIFICATION CHECKS FAILED!\n');
    }

  } catch (err) {
    console.error('Fatal error during test:', err);
    allPassed = false;
  } finally {
    if (cdpWs) cdpWs.close();
    chrome.kill('SIGTERM');
    server.close();
    process.exit(allPassed ? 0 : 1);
  }
});
