import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

function startServer(port, serveDir) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.woff2': 'font/woff2',
    '.glb': 'model/gltf-binary'
  };

  const server = http.createServer((req, res) => {
    const urlPath = req.url.split('?')[0];
    const safePath = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[\/\\])+/, '');
    let filePath = path.join(serveDir, safePath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'SevereWeather_Warning.html');
      if (!fs.existsSync(filePath)) {
        filePath = path.join(serveDir, 'MechanicsLab', 'SevereWeather_Warning.html');
      }
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise(resolve => {
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

class SimpleCDP {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data.toString());
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return res?.result?.value;
  }

  async close() {
    this.ws.close();
  }
}

async function runMasterAudit() {
  console.log('======================================================================');
  console.log('  SEVERE WEATHER WARNING — MASTER IN-BROWSER VERIFICATION AUDIT');
  console.log('======================================================================\n');

  const port = 4291;
  const projectRoot = path.resolve('.');
  const server = await startServer(port, projectRoot);

  // Honour CHROME_BIN / QA_PLAY_BROWSER before falling back to the Windows
  // install path. Hardcoding that path made this script unrunnable anywhere but
  // one machine: on Linux and in CI it died with ENOENT before checking
  // anything, which is indistinguishable from passing if nobody reads the exit
  // code closely.
  const chromePath = process.env.CHROME_BIN || process.env.QA_PLAY_BROWSER
    || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdpPort = 9491;

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    '--no-sandbox',
    '--window-size=915,412',
    'about:blank'
  ]);

  let list = null;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
      list = await res.json();
      if (Array.isArray(list) && list.length > 0) break;
    } catch {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  const pageTarget = list.find(t => t.type === 'page') || list[0];
  const cdp = new SimpleCDP(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  console.log('1. Loading game in headless Chrome instance...');
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${port}/MechanicsLab/SevereWeather_Warning.html` });
  await new Promise(r => setTimeout(r, 2500));

  const results = [];
  const assert = (title, passed, detail = '') => {
    results.push({ title, passed, detail });
    console.log(`${passed ? '✓' : '✗'} ${title}${detail ? ` (${detail})` : ''}`);
  };

  // AUDIT 1: Audio and Engine Init
  const audioState = await cdp.evaluate(`
    typeof initAudio === 'function' && typeof triggerHaptic === 'function'
  `);
  assert('Audio Engine & Haptic Subsystems Initialized', Boolean(audioState));

  // AUDIT 2: Opening Cutscene, Subtitles & Letterbox
  const cutsceneCheck = await cdp.evaluate(`
    (() => {
      startRunFromMenu();
      const lbActive = document.getElementById('cinematicLetterbox')?.classList.contains('active');
      const hasSubtitle = Boolean(document.getElementById('cinSubtitle')?.textContent);
      const hasSteam = Boolean(openingCinematicState.steamPuffs && openingCinematicState.steamPuffs.length === 4);
      return { lbActive, hasSubtitle, hasSteam, active: openingCinematicState.active };
    })()
  `);
  assert('Opening Cutscene Active with Letterbox & Steam', Boolean(cutsceneCheck.lbActive && cutsceneCheck.hasSteam), `active=${cutsceneCheck.active}`);

  // AUDIT 3: Skip Cutscene & Restore HUD
  const skipCheck = await cdp.evaluate(`
    (() => {
      skipOpeningCinematic();
      const lbInactive = !document.getElementById('cinematicLetterbox')?.classList.contains('active');
      const hudVisible = document.getElementById('hud')?.style.opacity === '1';
      return { lbInactive, hudVisible, completed: openingCinematicState.completed };
    })()
  `);
  assert('Cutscene Skip Restores Gameplay HUD', Boolean(skipCheck.lbInactive && skipCheck.hudVisible), `completed=${skipCheck.completed}`);

  // AUDIT 4: Region 1 (Heartland Tour) World & Landmarks
  const r1Check = await cdp.evaluate(`
    (() => {
      switchCampaignRegion(0);
      selectCampaignLevel(0);
      applyCampaignPresentation();
      const active = getActiveCampaignLevel();
      const state = getCampaignWorldQaState();
      return { id: active.id, name: active.name, sceneryCount: state.sceneryCount, landmarks: state.landmarks };
    })()
  `);
  assert('Region 1 (Heartland Tour - Lincoln County) Verified', r1Check.id === 'lincoln-county', `scenery=${r1Check.sceneryCount}, landmarks=${r1Check.landmarks.length}`);

  // AUDIT 5: Region 2 (Coastal Bayou) World & Scenery
  const r2Check = await cdp.evaluate(`
    (() => {
      try {
        switchCampaignRegion(1);
        selectCampaignLevel(0);
        applyCampaignPresentation();
        const active = getActiveCampaignLevel();
        const state = getCampaignWorldQaState();
        return { id: active?.id, name: active?.name, sceneryCount: state?.sceneryCount };
      } catch (err) {
        return { error: err.message, stack: err.stack };
      }
    })()
  `);
  if (r2Check?.error) console.error('R2 Error:', r2Check);
  assert('Region 2 (Coastal Bayou - Bayou Bend Marina) Verified', r2Check?.id === 'bayou-bend', `scenery=${r2Check?.sceneryCount}`);

  // AUDIT 6: Region 3 (Metro Row) World & Scenery
  const r3Check = await cdp.evaluate(`
    (() => {
      try {
        switchCampaignRegion(2);
        selectCampaignLevel(0);
        applyCampaignPresentation();
        const active = getActiveCampaignLevel();
        const state = getCampaignWorldQaState();
        return { id: active?.id, name: active?.name, sceneryCount: state?.sceneryCount };
      } catch (err) {
        return { error: err.message, stack: err.stack };
      }
    })()
  `);
  if (r3Check?.error) console.error('R3 Error:', r3Check);
  assert('Region 3 (Metro Row - Skyline Plaza) Verified', r3Check?.id === 'downtown-core', `scenery=${r3Check?.sceneryCount}`);

  // AUDIT 7: Storm Ability Execution & Haptics
  const abilityCheck = await cdp.evaluate(`
    (() => {
      let hapticCount = 0;
      const origVibrate = navigator.vibrate;
      navigator.vibrate = (pattern) => { hapticCount++; return true; };
      playAbilitySound('zap');
      playAbilitySound('gust');
      playAbilitySound('pull');
      triggerHaptic('collapse');
      triggerHaptic('ef_up');
      navigator.vibrate = origVibrate;
      return hapticCount;
    })()
  `);
  assert('Storm Abilities & Haptic Vibration Triggers Verified', abilityCheck === 5, `triggers=${abilityCheck}/5`);

  // AUDIT 8: Destruction Mechanics & Persistent Ruins
  const damageCheck = await cdp.evaluate(`
    (() => {
      const initRuins = ruinsGroup.children.length;
      explodeStructure(0, 0, '#b91c1c', false, false, 8, 'gas-station-wreck');
      const postRuins = ruinsGroup.children.length;
      return { initRuins, postRuins, spawned: postRuins > initRuins };
    })()
  `);
  assert('Building Destruction & Authored Wreck Spawn Verified', damageCheck.spawned, `ruins=${damageCheck.initRuins}->${damageCheck.postRuins}`);

  console.log('\n======================================================================');
  const allPassed = results.every(r => r.passed);
  if (allPassed) {
    console.log(`  ALL ${results.length}/${results.length} MASTER AUDIT CHECKS PASSED PERFECTLY!`);
  } else {
    console.error(`  AUDIT FAILED: ${results.filter(r => !r.passed).length} checks failed.`);
  }
  console.log('======================================================================\n');

  await cdp.close();
  chromeProc.kill();
  server.close();

  if (!allPassed) process.exit(1);
}

runMasterAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
