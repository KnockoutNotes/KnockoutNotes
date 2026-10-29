const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8080;
const CDP_PORT = 9285;
const OUT_DIR = 'C:\\Users\\kmane\\.gemini\\antigravity\\brain\\cf1e10e5-fc32-4590-a15d-802b606be440\\screenshots';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(__dirname, '..', 'scratch/chrome-cdp-overhaul-v2');
  fs.mkdirSync(userDataDir, { recursive: true });

  console.log('Launching Headless Chrome on port', CDP_PORT);
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--window-size=1920,1080',
    '--disable-extensions',
    '--no-sandbox',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  await delay(1800);

  const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const tabs = await listRes.json();
  const wsUrl = (tabs.find((t) => t.type === 'page') || tabs[0]).webSocketDebuggerUrl;
  console.log('Connected to CDP WebSocket:', wsUrl);

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
      returnByValue: true
    });
    if (res && res.exceptionDetails) {
      console.warn('Script exception:', res.exceptionDetails.text);
    }
    return res && res.result ? res.result.value : undefined;
  };

  const dismissModal = async () => {
    await evalScript(`(() => {
      const m = document.getElementById('knSharedSubModal');
      if (m) m.hidden = true;
    })()`);
    await delay(150);
  };

  const ensureReadingMode = async () => {
    for (let i = 0; i < 30; i++) {
      const state = await evalScript(`(() => {
        const overlay = document.getElementById('ronReadingModeOverlay');
        const content = document.getElementById('ronRmContentWrapper');
        if (overlay && content && !overlay.hidden) return 'ready';
        if (window.StudyRonDesign && window.StudyRonDesign.openFullScreenReadingMode) {
          window.StudyRonDesign.openFullScreenReadingMode();
        }
        return 'waiting';
      })()`);
      if (state === 'ready') break;
      await delay(250);
    }
    await dismissModal();
    await delay(300);
  };

  const measureState = async () => {
    return await evalScript(`(() => {
      const overlay = document.getElementById('ronReadingModeOverlay');
      const content = document.getElementById('ronRmContentWrapper');
      const topbar = document.getElementById('ronRmTopbar');
      const heading = overlay ? overlay.querySelector('.ron-rm-heading') : null;
      const pointRows = Array.from(overlay ? overlay.querySelectorAll('.ron-point-row') : []);
      const paragraphs = Array.from(overlay ? overlay.querySelectorAll('p') : []);
      const tables = Array.from(overlay ? overlay.querySelectorAll('table') : []);
      const tableWraps = Array.from(overlay ? overlay.querySelectorAll('.ron-table-wrap, .table-responsive') : []);

      const csContent = content ? window.getComputedStyle(content) : null;
      const contentRect = content ? content.getBoundingClientRect() : null;

      let samplePoint = null;
      if (pointRows.length > 0) {
        const row = pointRows[0];
        const b = row.querySelector('.ron-point-bullet');
        const t = row.querySelector('.ron-point-text');
        const bRect = b ? b.getBoundingClientRect() : null;
        const tRect = t ? t.getBoundingClientRect() : null;
        const csRow = window.getComputedStyle(row);
        const csT = t ? window.getComputedStyle(t) : null;
        samplePoint = {
          bulletWidth: bRect ? Math.round(bRect.width * 10) / 10 : null,
          gapBetweenMarkerAndText: (bRect && tRect) ? Math.round((tRect.left - bRect.right) * 10) / 10 : null,
          rowMarginBottom: csRow ? csRow.marginBottom : null,
          rowLineHeight: csRow ? csRow.lineHeight : null,
          textTextAlign: csT ? csT.textAlign : null,
          textMaxWidth: csT ? csT.maxWidth : null
        };
      }

      let sampleTable = null;
      if (tables.length > 0) {
        const tbl = tables[0];
        const wrap = tableWraps[0] || tbl.parentElement;
        sampleTable = {
          tableWidth: Math.round(tbl.getBoundingClientRect().width),
          wrapClientWidth: wrap.clientWidth,
          wrapScrollWidth: wrap.scrollWidth,
          wrapOverflowX: window.getComputedStyle(wrap).overflowX
        };
      }

      const viewportWidth = window.innerWidth;
      const contentWidth = contentRect ? Math.round(contentRect.width) : null;
      const leftMargin = contentRect ? Math.round(contentRect.left) : null;
      const rightMargin = contentRect ? Math.round(viewportWidth - contentRect.right) : null;

      return {
        viewportWidth,
        viewportHeight: window.innerHeight,
        widthMode: overlay ? overlay.getAttribute('data-reading-width') : null,
        readingContainerWidth: contentWidth,
        leftMargin,
        rightMargin,
        usablePercent: contentWidth ? Math.round((contentWidth / viewportWidth) * 100) : null,
        paddingLeft: csContent ? csContent.paddingLeft : null,
        paddingRight: csContent ? csContent.paddingRight : null,
        topbarHeight: topbar ? topbar.offsetHeight : null,
        headingMarginTop: heading ? window.getComputedStyle(heading).marginTop : null,
        headingMarginBottom: heading ? window.getComputedStyle(heading).marginBottom : null,
        fontSize: csContent ? csContent.fontSize : null,
        lineHeight: csContent ? csContent.lineHeight : null,
        docScrollWidth: document.documentElement.scrollWidth,
        hasPageHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        samplePoint,
        sampleTable
      };
    })()`);
  };

  const results = {};

  try {
    await send('Page.enable');
    await send('Runtime.enable');

    // =========================================================================
    // 1. Desktop 1920x1080 (Wide, Standard, Narrow comparison)
    // =========================================================================
    console.log('\n=== 1. Desktop 1920x1080 ===');
    await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?topic=propofol&mode=reading` });
    await ensureReadingMode();

    // 1A. Wide mode
    console.log('Measuring Desktop 1920 Wide...');
    await evalScript(`window.StudyRonDesign.setReadingWidth('wide')`);
    await delay(350);
    let ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'overhaul_desktop_1920x1080_wide.png'), Buffer.from(ss.data, 'base64'));
    results.desktop1920_wide = await measureState();
    console.log('Desktop 1920 Wide captured: container width =', results.desktop1920_wide.readingContainerWidth, 'px (', results.desktop1920_wide.usablePercent, '% of screen)');

    // 1B. Standard mode
    console.log('Measuring Desktop 1920 Standard...');
    await evalScript(`window.StudyRonDesign.setReadingWidth('standard')`);
    await delay(350);
    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'overhaul_desktop_1920x1080_standard.png'), Buffer.from(ss.data, 'base64'));
    results.desktop1920_standard = await measureState();
    console.log('Desktop 1920 Standard captured: container width =', results.desktop1920_standard.readingContainerWidth, 'px');

    // 1C. Narrow mode
    console.log('Measuring Desktop 1920 Narrow...');
    await evalScript(`window.StudyRonDesign.setReadingWidth('narrow')`);
    await delay(350);
    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'overhaul_desktop_1920x1080_narrow.png'), Buffer.from(ss.data, 'base64'));
    results.desktop1920_narrow = await measureState();
    console.log('Desktop 1920 Narrow captured: container width =', results.desktop1920_narrow.readingContainerWidth, 'px');

    // =========================================================================
    // 2. Desktop 1440x900 (Wide vs Standard)
    // =========================================================================
    console.log('\n=== 2. Desktop 1440x900 ===');
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await delay(200);

    // 2A. Wide mode
    await evalScript(`window.StudyRonDesign.setReadingWidth('wide')`);
    await delay(350);
    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'overhaul_desktop_1440x900_wide.png'), Buffer.from(ss.data, 'base64'));
    results.desktop1440_wide = await measureState();
    console.log('Desktop 1440 Wide captured: container width =', results.desktop1440_wide.readingContainerWidth, 'px (', results.desktop1440_wide.usablePercent, '% of screen)');

    // 2B. Standard mode
    await evalScript(`window.StudyRonDesign.setReadingWidth('standard')`);
    await delay(350);
    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'overhaul_desktop_1440x900_standard.png'), Buffer.from(ss.data, 'base64'));
    results.desktop1440_standard = await measureState();
    console.log('Desktop 1440 Standard captured: container width =', results.desktop1440_standard.readingContainerWidth, 'px');

    // =========================================================================
    // 3. Laptop 1280x800 (Wide mode)
    // =========================================================================
    console.log('\n=== 3. Laptop 1280x800 ===');
    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await evalScript(`window.StudyRonDesign.setReadingWidth('wide')`);
    await delay(350);
    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'overhaul_laptop_1280x800_wide.png'), Buffer.from(ss.data, 'base64'));
    results.laptop1280_wide = await measureState();
    console.log('Laptop 1280 Wide captured: container width =', results.laptop1280_wide.readingContainerWidth, 'px (', results.laptop1280_wide.usablePercent, '% of screen)');

    // =========================================================================
    // 4. Tablet Portrait 768x1024
    // =========================================================================
    console.log('\n=== 4. Tablet Portrait 768x1024 ===');
    await send('Emulation.setDeviceMetricsOverride', { width: 768, height: 1024, deviceScaleFactor: 2, mobile: true });
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?topic=preop-assessment&mode=reading` });
    await ensureReadingMode();
    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'overhaul_tablet_768x1024.png'), Buffer.from(ss.data, 'base64'));
    results.tablet768 = await measureState();
    console.log('Tablet 768 captured: container width =', results.tablet768.readingContainerWidth, 'px');

    // =========================================================================
    // 5. Mobile Portrait 390x844 (Propofol & Preop-assessment)
    // =========================================================================
    console.log('\n=== 5. Mobile Portrait 390x844 ===');
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });

    // 5A. Propofol (Drug monograph point rows & tables)
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?topic=propofol&mode=reading` });
    await ensureReadingMode();
    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'overhaul_mobile_390x844_propofol.png'), Buffer.from(ss.data, 'base64'));
    results.mobile390_propofol = await measureState();
    console.log('Mobile 390 Propofol captured: bullet width =', results.mobile390_propofol.samplePoint.bulletWidth, 'gap =', results.mobile390_propofol.samplePoint.gapBetweenMarkerAndText);

    // 5B. Preop-assessment (Core curriculum with bold lists, numbers, steps)
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?topic=preop-assessment&mode=reading` });
    await ensureReadingMode();
    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'overhaul_mobile_390x844_preop.png'), Buffer.from(ss.data, 'base64'));
    results.mobile390_preop = await measureState();
    console.log('Mobile 390 Preop captured: container padding =', results.mobile390_preop.paddingLeft);

    // =========================================================================
    // 6. Mobile Landscape 844x390
    // =========================================================================
    console.log('\n=== 6. Mobile Landscape 844x390 ===');
    await send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 3, mobile: true });
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?topic=propofol&mode=reading` });
    await ensureReadingMode();
    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'overhaul_mobile_844x390_landscape.png'), Buffer.from(ss.data, 'base64'));
    results.mobile844_landscape = await measureState();
    console.log('Mobile 844 Landscape captured: topbar height =', results.mobile844_landscape.topbarHeight, 'overflow =', results.mobile844_landscape.hasPageHorizontalOverflow);

    // Save final measurements JSON
    fs.writeFileSync(path.join(OUT_DIR, 'overhaul_measurements.json'), JSON.stringify(results, null, 2));
    console.log('\n🎉 ALL 8 OVERHAUL SCREENSHOTS AND MEASUREMENTS SAVED SUCCESSFULLY!');

  } finally {
    ws.close();
    chromeProcess.kill();
  }
}

main().catch(console.error);
