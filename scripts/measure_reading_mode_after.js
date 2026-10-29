const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8080;
const CDP_PORT = 9245; // unique CDP port
const OUT_DIR = 'C:\\Users\\kmane\\.gemini\\antigravity\\brain\\cf1e10e5-fc32-4590-a15d-802b606be440\\screenshots';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(__dirname, '..', 'scratch/chrome-cdp-rm-after');
  fs.mkdirSync(userDataDir, { recursive: true });

  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--window-size=1280,800',
    '--disable-extensions',
    '--no-sandbox',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  await delay(1500);

  const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const tabs = await listRes.json();
  const wsUrl = (tabs.find((t) => t.type === 'page') || tabs[0]).webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);
  await new Promise((r) => (ws.onopen = r));

  let msgId = 0;
  const callbacks = new Map();
  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve, reject } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    } catch (e) {}
  };

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++msgId;
      callbacks.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

  const evalScript = async (expression) => {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res && res.result ? res.result.value : undefined;
  };

  const results = {};

  try {
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setTouchEmulationEnabled', { enabled: true });

    // Helper to dismiss modal
    const dismissModal = async () => {
      await evalScript(`(() => {
        const m = document.getElementById('knSharedSubModal');
        if (m) m.hidden = true;
      })()`);
      await delay(200);
    };

    // Helper to measure standard Reading Mode metrics
    const measureCurrent = async () => {
      return await evalScript(`(() => {
        const overlay = document.getElementById('ronReadingModeOverlay');
        const content = document.getElementById('ronRmContentWrapper');
        const topbar = document.getElementById('ronRmTopbar');
        const heading = overlay ? overlay.querySelector('.ron-rm-heading') : null;
        
        const pointRows = Array.from(overlay ? overlay.querySelectorAll('.ron-point-row') : []);
        const pointBullets = Array.from(overlay ? overlay.querySelectorAll('.ron-point-bullet') : []);
        const pointTexts = Array.from(overlay ? overlay.querySelectorAll('.ron-point-text') : []);
        const lists = Array.from(overlay ? overlay.querySelectorAll('ul, ol') : []);
        const listItems = Array.from(overlay ? overlay.querySelectorAll('li') : []);
        const paragraphs = Array.from(overlay ? overlay.querySelectorAll('p') : []);
        const numLists = Array.from(overlay ? overlay.querySelectorAll('.st-num-list') : []);
        const bulletLists = Array.from(overlay ? overlay.querySelectorAll('.st-bullets') : []);

        let samplePoint = null;
        if (pointRows.length > 0 && pointBullets.length > 0 && pointTexts.length > 0) {
          const b = pointBullets[0].getBoundingClientRect();
          const t = pointTexts[0].getBoundingClientRect();
          const csB = window.getComputedStyle(pointBullets[0]);
          const csRow = window.getComputedStyle(pointRows[0]);
          const csT = window.getComputedStyle(pointTexts[0]);
          samplePoint = {
            bulletWidth: Math.round(b.width * 10) / 10,
            bulletHeight: Math.round(b.height * 10) / 10,
            gapBetweenMarkerAndText: Math.round((t.left - b.right) * 10) / 10,
            rowGap: csRow.gap,
            bulletMarginRight: csB.marginRight,
            rowMarginBottom: csRow.marginBottom,
            lineHeight: csRow.lineHeight,
            textPaddingLeft: csT.paddingLeft
          };
        }

        let sampleLi = null;
        if (listItems.length > 0) {
          const li = listItems[0];
          const csLi = window.getComputedStyle(li);
          const parent = li.closest('ul, ol');
          const csP = parent ? window.getComputedStyle(parent) : null;
          sampleLi = {
            liPaddingLeft: csLi.paddingLeft,
            liMarginBottom: csLi.marginBottom,
            parentPaddingLeft: csP ? csP.paddingLeft : null,
            parentPaddingInlineStart: csP ? csP.paddingInlineStart : null,
            parentMarginBottom: csP ? csP.marginBottom : null
          };
        }

        let sampleNumList = null;
        if (numLists.length > 0) {
          const nl = numLists[0];
          const csNl = window.getComputedStyle(nl);
          const firstLi = nl.querySelector('li');
          const csLi = firstLi ? window.getComputedStyle(firstLi) : null;
          sampleNumList = {
            paddingLeft: csNl.paddingLeft,
            gap: csNl.gap,
            liPaddingLeft: csLi ? csLi.paddingLeft : null,
            liMarginBottom: csLi ? csLi.marginBottom : null
          };
        }

        const csContent = content ? window.getComputedStyle(content) : null;

        return {
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          contentPaddingLeft: csContent ? csContent.paddingLeft : null,
          contentPaddingRight: csContent ? csContent.paddingRight : null,
          contentClientWidth: content ? content.clientWidth : null,
          contentMaxWidth: csContent ? csContent.maxWidth : null,
          fontSize: csContent ? csContent.fontSize : null,
          lineHeight: csContent ? csContent.lineHeight : null,
          topbarHeight: topbar ? topbar.offsetHeight : null,
          headingFontSize: heading ? window.getComputedStyle(heading).fontSize : null,
          samplePoint,
          sampleLi,
          sampleNumList,
          pointRowCount: pointRows.length,
          listItemCount: listItems.length,
          paragraphCount: paragraphs.length,
          docScrollWidth: document.documentElement.scrollWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth
        };
      })()`);
    };

    // 1. Mobile Portrait (390x844) - Airway Assessment
    console.log('=== TEST 1: Mobile Portrait (390x844) - Airway Assessment ===');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    });
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?topic=airway-assessment&mode=reading` });
    for (let i = 0; i < 40; i++) {
      try {
        const ready = await evalScript(`typeof window.StudyRonDesign !== "undefined" && !!document.getElementById('ronReadingModeOverlay')`);
        if (ready) break;
      } catch (_) {}
      await delay(200);
    }
    await delay(1200);
    await dismissModal();

    let ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'optimized_reading_mode_airway_390x844.png'), Buffer.from(ss.data, 'base64'));
    console.log('Saved: optimized_reading_mode_airway_390x844.png');
    results.airwayMobilePortrait = await measureCurrent();

    // 2. Mobile Portrait (390x844) - Propofol (Monograph Points)
    console.log('\n=== TEST 2: Mobile Portrait (390x844) - Propofol Monograph ===');
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?topic=propofol&mode=reading` });
    await delay(1500);
    await dismissModal();

    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'optimized_reading_mode_propofol_390x844.png'), Buffer.from(ss.data, 'base64'));
    console.log('Saved: optimized_reading_mode_propofol_390x844.png');
    results.propofolMobilePortrait = await measureCurrent();

    // 3. Mobile Portrait (390x844) - exam-airway (LEMON Score)
    console.log('\n=== TEST 3: Mobile Portrait (390x844) - exam-airway (LEMON Score) ===');
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?topic=exam-airway&mode=reading` });
    await delay(1500);
    await dismissModal();

    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'optimized_reading_mode_lemon_390x844.png'), Buffer.from(ss.data, 'base64'));
    console.log('Saved: optimized_reading_mode_lemon_390x844.png');
    results.lemonMobilePortrait = await measureCurrent();

    // 4. Mobile Landscape (844x390) - Propofol
    console.log('\n=== TEST 4: Mobile Landscape (844x390) - Propofol ===');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 844,
      height: 390,
      deviceScaleFactor: 3,
      mobile: true
    });
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?topic=propofol&mode=reading` });
    await delay(1500);
    await dismissModal();

    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'optimized_reading_mode_propofol_landscape_844x390.png'), Buffer.from(ss.data, 'base64'));
    console.log('Saved: optimized_reading_mode_propofol_landscape_844x390.png');
    results.propofolMobileLandscape = await measureCurrent();

    // 5. Tablet Portrait (768x1024) - airway-assessment
    console.log('\n=== TEST 5: Tablet Portrait (768x1024) - airway-assessment ===');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 768,
      height: 1024,
      deviceScaleFactor: 2,
      mobile: true
    });
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?topic=airway-assessment&mode=reading` });
    await delay(1500);
    await dismissModal();

    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'optimized_reading_mode_airway_tablet_768x1024.png'), Buffer.from(ss.data, 'base64'));
    console.log('Saved: optimized_reading_mode_airway_tablet_768x1024.png');
    results.airwayTabletPortrait = await measureCurrent();

    // 6. Desktop (1280x800) - Propofol
    console.log('\n=== TEST 6: Desktop (1280x800) - Propofol ===');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false
    });
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?topic=propofol&mode=reading` });
    await delay(1500);
    await dismissModal();

    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'optimized_reading_mode_propofol_desktop_1280x800.png'), Buffer.from(ss.data, 'base64'));
    console.log('Saved: optimized_reading_mode_propofol_desktop_1280x800.png');
    results.propofolDesktop = await measureCurrent();

    // 7. Interactive Controls: Font Stepper & Themes
    console.log('\n=== TEST 7: Interactive Controls - Font Zoom & Sepia Theme ===');
    // Change theme to Sepia and font size up
    const controlTest = await evalScript(`(() => {
      if (typeof window.StudyRonDesign !== "undefined" && window.StudyRonDesign.setReadingTheme) {
        window.StudyRonDesign.setReadingTheme('sepia');
      }
      if (typeof window.StudyRonDesign !== "undefined" && window.StudyRonDesign.stepFontSize) {
        window.StudyRonDesign.stepFontSize(1); // zoom in
      }
      const overlay = document.getElementById('ronReadingModeOverlay');
      const content = document.getElementById('ronRmContentWrapper');
      return {
        themeAttr: overlay ? overlay.getAttribute('data-reading-theme') : null,
        bodyBg: overlay ? window.getComputedStyle(overlay).backgroundColor : null,
        textColor: content ? window.getComputedStyle(content).color : null,
        fontSize: content ? window.getComputedStyle(content).fontSize : null
      };
    })()`);
    results.controlTest = controlTest;
    await delay(300);
    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'optimized_reading_mode_sepia_desktop_1280x800.png'), Buffer.from(ss.data, 'base64'));
    console.log('Saved: optimized_reading_mode_sepia_desktop_1280x800.png');

    console.log('\n================ FINAL RESULTS ================');
    console.log(JSON.stringify(results, null, 2));

  } finally {
    ws.close();
    chromeProcess.kill();
  }
}

main().catch(console.error);
