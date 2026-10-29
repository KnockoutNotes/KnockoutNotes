const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8080;
const CDP_PORT = 9243;
const OUT_DIR = 'C:\\Users\\kmane\\.gemini\\antigravity\\brain\\cf1e10e5-fc32-4590-a15d-802b606be440\\screenshots';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(__dirname, '..', 'scratch/chrome-cdp-rm-baseline');
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

  try {
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setTouchEmulationEnabled', { enabled: true });

    // 1. Mobile Portrait (390x844) on airway-assessment
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    });

    console.log('Navigating to airway-assessment...');
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?topic=airway-assessment&mode=reading` });

    for (let i = 0; i < 40; i++) {
      try {
        const ready = await evalScript(`typeof window.StudyRonDesign !== "undefined" && !!document.getElementById('ronReadingModeOverlay')`);
        if (ready) break;
      } catch (_) {}
      await delay(200);
    }
    await delay(1200);

    // Dismiss subscription modal if open
    await evalScript(`(() => {
      const m = document.getElementById('knSharedSubModal');
      if (m) m.hidden = true;
    })()`);
    await delay(300);

    let ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'baseline_reading_mode_airway_390x844.png'), Buffer.from(ss.data, 'base64'));
    console.log('Saved: baseline_reading_mode_airway_390x844.png');

    const airwayMetrics = await evalScript(`(() => {
      const overlay = document.getElementById('ronReadingModeOverlay');
      const content = document.getElementById('ronRmContentWrapper');
      const topbar = document.getElementById('ronRmTopbar');
      const heading = overlay ? overlay.querySelector('.ron-rm-heading') : null;
      
      const pointRows = Array.from(overlay.querySelectorAll('.ron-point-row'));
      const pointBullets = Array.from(overlay.querySelectorAll('.ron-point-bullet'));
      const pointTexts = Array.from(overlay.querySelectorAll('.ron-point-text'));
      const lists = Array.from(overlay.querySelectorAll('ul, ol'));
      const listItems = Array.from(overlay.querySelectorAll('li'));
      const paragraphs = Array.from(overlay.querySelectorAll('p'));

      let samplePointDist = null;
      if (pointRows.length > 0) {
        const b = pointBullets[0].getBoundingClientRect();
        const t = pointTexts[0].getBoundingClientRect();
        const csB = window.getComputedStyle(pointBullets[0]);
        const csRow = window.getComputedStyle(pointRows[0]);
        samplePointDist = {
          bulletWidth: b.width,
          bulletHeight: b.height,
          bulletRight: b.right,
          textLeft: t.left,
          gapBetweenMarkerAndText: t.left - b.right,
          rowGap: csRow.gap,
          bulletMarginRight: csB.marginRight,
          rowMarginBottom: csRow.marginBottom
        };
      }

      let sampleLiDist = null;
      if (listItems.length > 0) {
        const li = listItems[0];
        const csLi = window.getComputedStyle(li);
        const parentUl = li.closest('ul, ol');
        const csParent = parentUl ? window.getComputedStyle(parentUl) : null;
        sampleLiDist = {
          liPaddingLeft: csLi.paddingLeft,
          liMarginBottom: csLi.marginBottom,
          parentPaddingLeft: csParent ? csParent.paddingLeft : null,
          parentMarginBottom: csParent ? csParent.marginBottom : null
        };
      }

      return {
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        contentWrapperPaddingLeft: content ? window.getComputedStyle(content).paddingLeft : null,
        contentWrapperPaddingRight: content ? window.getComputedStyle(content).paddingRight : null,
        contentClientWidth: content ? content.clientWidth : null,
        fontSize: content ? window.getComputedStyle(content).fontSize : null,
        lineHeight: content ? window.getComputedStyle(content).lineHeight : null,
        topbarHeight: topbar ? topbar.offsetHeight : null,
        headingTop: heading ? heading.getBoundingClientRect().top : null,
        samplePointDist,
        sampleLiDist,
        pointRowCount: pointRows.length,
        listItemCount: listItems.length,
        paragraphCount: paragraphs.length,
        docScrollWidth: document.documentElement.scrollWidth,
        hasOverflow: document.documentElement.scrollWidth > window.innerWidth
      };
    })()`);

    console.log('\n--- BASELINE AIRWAY ASSESSMENT (390x844) ---');
    console.log(JSON.stringify(airwayMetrics, null, 2));

    // 2. Propofol (Drug monograph with points & table)
    console.log('\nNavigating to Propofol...');
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?topic=propofol&mode=reading` });
    await delay(1500);
    await evalScript(`(() => {
      const m = document.getElementById('knSharedSubModal');
      if (m) m.hidden = true;
    })()`);
    await delay(300);

    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'baseline_reading_mode_propofol_390x844.png'), Buffer.from(ss.data, 'base64'));
    console.log('Saved: baseline_reading_mode_propofol_390x844.png');

    const propofolMetrics = await evalScript(`(() => {
      const overlay = document.getElementById('ronReadingModeOverlay');
      const pointRows = Array.from(overlay.querySelectorAll('.ron-point-row'));
      const pointBullets = Array.from(overlay.querySelectorAll('.ron-point-bullet'));
      const pointTexts = Array.from(overlay.querySelectorAll('.ron-point-text'));
      
      let samplePointDist = null;
      if (pointRows.length > 0) {
        const b = pointBullets[0].getBoundingClientRect();
        const t = pointTexts[0].getBoundingClientRect();
        const csB = window.getComputedStyle(pointBullets[0]);
        const csRow = window.getComputedStyle(pointRows[0]);
        samplePointDist = {
          bulletWidth: b.width,
          bulletHeight: b.height,
          gapBetweenMarkerAndText: t.left - b.right,
          rowGap: csRow.gap,
          bulletMarginRight: csB.marginRight,
          rowMarginBottom: csRow.marginBottom
        };
      }

      return {
        pointRowCount: pointRows.length,
        samplePointDist
      };
    })()`);

    console.log('\n--- BASELINE PROPOFOL (390x844) ---');
    console.log(JSON.stringify(propofolMetrics, null, 2));

    // 3. LEMON Score (exam-airway)
    console.log('\nNavigating to exam-airway (LEMON)...');
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?topic=exam-airway&mode=reading` });
    await delay(1500);
    await evalScript(`(() => {
      const m = document.getElementById('knSharedSubModal');
      if (m) m.hidden = true;
    })()`);
    await delay(300);

    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'baseline_reading_mode_lemon_390x844.png'), Buffer.from(ss.data, 'base64'));
    console.log('Saved: baseline_reading_mode_lemon_390x844.png');

    const lemonMetrics = await evalScript(`(() => {
      const overlay = document.getElementById('ronReadingModeOverlay');
      const pointRows = Array.from(overlay.querySelectorAll('.ron-point-row'));
      const pointBullets = Array.from(overlay.querySelectorAll('.ron-point-bullet'));
      const pointTexts = Array.from(overlay.querySelectorAll('.ron-point-text'));
      const listItems = Array.from(overlay.querySelectorAll('li'));
      
      let samplePointDist = null;
      if (pointRows.length > 0) {
        const b = pointBullets[0].getBoundingClientRect();
        const t = pointTexts[0].getBoundingClientRect();
        samplePointDist = {
          gapBetweenMarkerAndText: t.left - b.right
        };
      }

      return {
        pointRowCount: pointRows.length,
        listItemCount: listItems.length,
        samplePointDist
      };
    })()`);
    console.log('\n--- BASELINE LEMON (390x844) ---');
    console.log(JSON.stringify(lemonMetrics, null, 2));

  } finally {
    ws.close();
    chromeProcess.kill();
  }
}

main().catch(console.error);
