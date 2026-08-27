import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 8097;
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
  const chromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Users\\clybyer\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
  ];
  let chromeExe = chromePaths.find(p => fs.existsSync(p));

  const chromeProc = spawn(chromeExe, [
    '--headless=new',
    '--remote-debugging-port=9230',
    '--disable-gpu-sandbox',
    '--enable-webgl',
    '--window-size=1280,720',
    '--autoplay-policy=no-user-gesture-required',
    'about:blank'
  ], { stdio: 'ignore' });

  await new Promise(r => setTimeout(r, 1200));

  const targets = await (await fetch('http://127.0.0.1:9230/json/list')).json();
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
    return res.result?.value;
  }

  console.log('Navigating to game...');
  await send('Page.navigate', { url: `http://localhost:${PORT}/MechanicsLab/SevereWeather_Warning.html` });
  await new Promise(r => setTimeout(r, 2500));

  // Start run to enter cutscene
  await evaluate(`
    if (typeof startRunFromMenu === 'function') startRunFromMenu();
  `);
  
  // Advance cutscene to Beat 1: Casual Coffee Morning (t = 1.5s)
  await evaluate(`
    if (typeof openingCinematicState !== 'undefined') {
      openingCinematicState.elapsed = 1.5;
      updateOpeningCinematic(0);
    }
  `);
  await new Promise(r => setTimeout(r, 500));
  await snap('cinematic_beat1_morning.png', 'Beat 1: Casual Morning Coffee');

  // Advance cutscene to Beat 2: Double Take at Horizon (t = 6.8s)
  await evaluate(`
    if (typeof openingCinematicState !== 'undefined') {
      openingCinematicState.elapsed = 6.8;
      updateOpeningCinematic(0);
    }
  `);
  await new Promise(r => setTimeout(r, 500));
  await snap('cinematic_beat2_doubletake.png', 'Beat 2: Double Take at Horizon');

  // Advance cutscene to Beat 3: Final Sip of Moo Brew (t = 9.2s)
  await evaluate(`
    if (typeof openingCinematicState !== 'undefined') {
      openingCinematicState.elapsed = 9.2;
      updateOpeningCinematic(0);
    }
  `);
  await new Promise(r => setTimeout(r, 500));
  await snap('cinematic_beat3_finalsip.png', 'Beat 3: Final Sip to Mouth');

  // Advance cutscene to Beat 4: Cow 17 Duck & Cover (t = 11.2s)
  await evaluate(`
    if (typeof openingCinematicState !== 'undefined') {
      openingCinematicState.elapsed = 11.2;
      updateOpeningCinematic(0);
    }
  `);
  await new Promise(r => setTimeout(r, 500));
  await snap('cinematic_beat4_duck.png', 'Beat 4: Cow 17 Ducking');

  chromeProc.kill();
  server.close();
  process.exit(0);
});
