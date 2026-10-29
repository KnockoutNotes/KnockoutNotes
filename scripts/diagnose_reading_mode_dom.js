const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CDP_PORT = 9262;

async function diagnose() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(__dirname, '..', 'scratch/chrome-cdp-diag');
  fs.mkdirSync(userDataDir, { recursive: true });

  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + CDP_PORT,
    '--window-size=390,844',
    '--disable-extensions',
    '--no-sandbox',
    '--user-data-dir=' + userDataDir,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));
  const listRes = await fetch('http://127.0.0.1:' + CDP_PORT + '/json/list');
  const tabs = await listRes.json();
  const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let msgId = 0;
  const callbacks = new Map();
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && callbacks.has(m.id)) {
      callbacks.get(m.id)(m.result);
      callbacks.delete(m.id);
    }
  };
  const send = (method, params = {}) => new Promise(resolve => {
    const id = ++msgId;
    callbacks.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });

  const evalScript = async (expression) => {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      console.error('Eval error:', JSON.stringify(res.exceptionDetails));
    }
    return res && res.result ? res.result.value : undefined;
  };

  const waitForReady = async () => {
    for (let i = 0; i < 40; i++) {
      const ready = await evalScript(`!!document.getElementById("ronRmContentWrapper") && !document.getElementById("ronReadingModeOverlay").hidden`);
      if (ready) return true;
      await new Promise(r => setTimeout(r, 200));
    }
    return false;
  };

  // 1. Airway Assessment
  console.log('--- Inspecting airway-assessment on 390px Mobile ---');
  await send('Page.navigate', { url: 'http://127.0.0.1:8080/study.html?topic=airway-assessment&mode=reading' });
  await waitForReady();
  await new Promise(r => setTimeout(r, 500));

  const diagAirway = await evalScript(`(() => {
    const overlay = document.getElementById("ronReadingModeOverlay");
    const content = document.getElementById("ronRmContentWrapper");
    if (!overlay || !content) return { error: "No overlay or content" };
    const listEls = Array.from(overlay.querySelectorAll("ul, ol, .st-bullets, .st-num-list, .ron-point-row"));
    return {
      contentPadding: window.getComputedStyle(content).padding,
      contentWidth: content.clientWidth,
      listCount: listEls.length,
      sampleLists: listEls.slice(0, 10).map(el => {
        const cs = window.getComputedStyle(el);
        const firstChild = el.firstElementChild;
        const csChild = firstChild ? window.getComputedStyle(firstChild) : null;
        return {
          tag: el.tagName,
          className: el.className,
          padding: cs.padding,
          margin: cs.margin,
          display: cs.display,
          childTag: firstChild ? firstChild.tagName : null,
          childClass: firstChild ? firstChild.className : null,
          childPadding: csChild ? csChild.padding : null,
          childMargin: csChild ? csChild.margin : null,
          childText: firstChild ? firstChild.textContent.slice(0, 50) : null
        };
      })
    };
  })()`);
  console.log('Airway Diag:', JSON.stringify(diagAirway, null, 2));

  // 2. Propofol
  console.log('\n--- Inspecting propofol on 390px Mobile ---');
  await send('Page.navigate', { url: 'http://127.0.0.1:8080/study.html?topic=propofol&mode=reading' });
  await waitForReady();
  await new Promise(r => setTimeout(r, 500));

  const diagPropofol = await evalScript(`(() => {
    const overlay = document.getElementById("ronReadingModeOverlay");
    const content = document.getElementById("ronRmContentWrapper");
    if (!overlay || !content) return { error: "No overlay or content" };
    const pointRows = Array.from(overlay.querySelectorAll(".ron-point-row"));
    let samplePoint = null;
    if (pointRows.length > 0) {
      const row = pointRows[0];
      const b = row.querySelector(".ron-point-bullet");
      const t = row.querySelector(".ron-point-text");
      const bRect = b ? b.getBoundingClientRect() : null;
      const tRect = t ? t.getBoundingClientRect() : null;
      samplePoint = {
        bRight: bRect ? bRect.right : null,
        tLeft: tRect ? tRect.left : null,
        gap: (bRect && tRect) ? tRect.left - bRect.right : null,
        rowPadding: window.getComputedStyle(row).padding,
        rowMargin: window.getComputedStyle(row).margin,
        bMargin: b ? window.getComputedStyle(b).margin : null,
        tPadding: t ? window.getComputedStyle(t).padding : null
      };
    }
    return {
      contentPadding: window.getComputedStyle(content).padding,
      contentWidth: content.clientWidth,
      samplePoint
    };
  })()`);
  console.log('Propofol Diag:', JSON.stringify(diagPropofol, null, 2));

  ws.close();
  chromeProcess.kill();
}

diagnose().catch(console.error);
