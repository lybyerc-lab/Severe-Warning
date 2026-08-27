import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 8094;
const ROOT = path.resolve('.');

const server = http.createServer((req, res) => {
  let file = req.url.split('?')[0];
  if (file === '/') file = '/MechanicsLab/SevereWeather_Warning.html';
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.glb': 'model/gltf-binary',
    '.png': 'image/png',
    '.wav': 'audio/wav'
  };
  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, async () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  
  const chromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Users\\clybyer\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
  ];
  let chromeExe = chromePaths.find(p => fs.existsSync(p));

  const chromeProc = spawn(chromeExe, [
    '--headless=new',
    '--remote-debugging-port=9227',
    '--disable-gpu-sandbox',
    '--enable-webgl',
    '--window-size=1280,720',
    '--autoplay-policy=no-user-gesture-required',
    'about:blank'
  ], { stdio: 'ignore' });

  await new Promise(r => setTimeout(r, 1200));

  const targets = await (await fetch('http://127.0.0.1:9227/json/list')).json();
  const pageTarget = targets.find(t => t.type === 'page');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let msgId = 1;
  const pending = new Map();
  ws.onmessage = evt => {
    const data = JSON.parse(evt.data);
    if (data.id && pending.has(data.id)) {
      pending.get(data.id)(data);
      pending.delete(data.id);
    }
  };

  function send(method, params = {}) {
    return new Promise(resolve => {
      const id = msgId++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Runtime.enable');

  const artifactDir = 'C:\\Users\\clybyer\\.gemini\\antigravity\\brain\\ed1b9c56-f0ac-444d-b2d7-4b09bf2e1ca2';

  async function snap(filename, desc) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(res.result.data, 'base64');
    fs.writeFileSync(path.join(artifactDir, filename), buf);
    console.log(`📸 Saved screenshot: ${filename} (${desc})`);
  }

  async function evaluate(expr) {
    const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (res.result?.exceptionDetails) {
      console.error('EVAL EXCEPTION:', res.result.exceptionDetails);
    }
    return res.result?.result?.value ?? res.result?.value;
  }

  console.log('Navigating to game...');
  await send('Page.navigate', { url: `http://localhost:${PORT}/MechanicsLab/SevereWeather_Warning.html` });
  await new Promise(r => setTimeout(r, 2500));

  // Directly start gameplay and skip cutscene
  console.log('Starting gameplay & skipping cutscene...');
  await evaluate(`
    if (typeof startRunFromMenu === 'function') startRunFromMenu();
    if (typeof skipOpeningCinematic === 'function') skipOpeningCinematic();
  `);
  await new Promise(r => setTimeout(r, 2500));

  // 1. Snapshot: Lincoln County Farm Area
  await snap('gameplay_01_farm.png', 'Tornado in Farmstead with Silos & Barn');

  // Move storm to town center
  await evaluate(`
    if (typeof storm !== 'undefined' && storm.pos) {
      storm.pos.x = 60;
      storm.pos.z = 20;
    }
    if (typeof camera !== 'undefined' && camera.position) {
      camera.position.set(60, 48, 85);
      camera.lookAt(60, 4, 20);
    }
  `);
  await new Promise(r => setTimeout(r, 2000));

  // 2. Snapshot: Lincoln County Town Center with Commercial Buildings
  await snap('gameplay_02_town.png', 'Tornado in Lincoln County Town Center');

  // Trigger Pull ability
  await evaluate(`
    if (typeof activateStormAbility === 'function') activateStormAbility('pull');
  `);
  await new Promise(r => setTimeout(r, 1200));
  await snap('gameplay_03_ability_pull.png', 'Pull Ability Active');

  // 3. Switch to Supercell
  await evaluate(`
    if (typeof selectStormClass === 'function') selectStormClass('supercell');
    if (typeof activateStormAbility === 'function') activateStormAbility('zap');
  `);
  await new Promise(r => setTimeout(r, 1200));
  await snap('gameplay_04_supercell_zap.png', 'Supercell Lightning Strike');

  // 4. Switch to Action Chopper 8 View
  await evaluate(`
    if (typeof triggerNewsChopperLiveFeed === 'function') {
      triggerNewsChopperLiveFeed('Lincoln County Water Tower', 54);
    }
  `);
  await new Promise(r => setTimeout(r, 1200));
  await snap('gameplay_05_chopper_feed.png', 'Action Chopper 8 Live Feed');

  // 5. Switch to Coastal Bayou (Pelican Key Boardwalk)
  await evaluate(`
    if (typeof switchCampaignRegion === 'function') switchCampaignRegion(1);
    if (typeof selectCampaignLevel === 'function') selectCampaignLevel(1);
    if (typeof resetWarningRun === 'function') resetWarningRun();
    if (typeof skipOpeningCinematic === 'function') skipOpeningCinematic();
  `);
  await new Promise(r => setTimeout(r, 2500));
  await snap('gameplay_06_coastal_boardwalk.png', 'Pelican Key Boardwalk View');

  // 6. Switch to Metro Row (Skyline Plaza)
  await evaluate(`
    if (typeof switchCampaignRegion === 'function') switchCampaignRegion(2);
    if (typeof selectCampaignLevel === 'function') selectCampaignLevel(0);
    if (typeof resetWarningRun === 'function') resetWarningRun();
    if (typeof skipOpeningCinematic === 'function') skipOpeningCinematic();
  `);
  await new Promise(r => setTimeout(r, 2500));
  await snap('gameplay_07_metro_skyline.png', 'Metro Row Skyline Plaza View');

  // 7. Complete Warning Run & Inspect Aftermath Newspaper Broadsheet
  const evalResult = await evaluate(`
    (() => {
      try {
        destructionScore = 150548;
        maxComboReached = 3.5;
        clearedBlocksCount = 35;
        chainReactionsCount = 4;
        mediaMoments = 20;
        footageBonus = 6277;
        destroyedLandmarksCount = 2;
        destroyedSubstationsCount = 3;
        stage1Score = 44703;
        stage2Score = 91013;
        stage3Score = 150548;
        missionObjectives[currentStorm].forEach(o => o.done = true);
        bovineRound.cowsRelocated = 18;
        bovineRound.combinedAirtime = 2139.4;
        bovineRound.longestFlight = 17516;
        bovineRound.hayLandings = 0;
        completeWarningRun('S+');
        return {
          success: true,
          overlayClass: document.getElementById('resultsOverlay').className,
          resultsCardHtml: document.querySelector('.results-card').innerHTML.slice(0, 200)
        };
      } catch (err) {
        return { success: false, error: err.message, stack: err.stack };
      }
    })()
  `);
  console.log('CompleteWarningRun evaluation:', evalResult);
  await new Promise(r => setTimeout(r, 1500));
  await snap('aftermath_newspaper_results.png', 'Evening Edition Aftermath Newspaper Results Screen');

  const cardMetrics = await evaluate(`
    (() => {
      const card = document.querySelector('.results-card');
      const overlay = document.getElementById('resultsOverlay');
      return {
        cardScrollHeight: card?.scrollHeight,
        cardClientHeight: card?.clientHeight,
        isOverflowing: card ? card.scrollHeight > card.clientHeight : null,
        overlayHeight: overlay?.clientHeight,
        cardWidth: card?.clientWidth
      };
    })()
  `);
  console.log('Results card metrics:', cardMetrics);

  console.log('\nAll gameplay views and Aftermath Newspaper captured successfully!');
  
  chromeProc.kill();
  server.close();
  process.exit(0);
});
