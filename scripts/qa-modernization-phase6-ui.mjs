import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 1. Static Server
function startServer(port = 8125) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = decodeURI(req.url.split('?')[0]);
      if (reqPath === '/') reqPath = '/MechanicsLab/SevereWeather_Warning.html';
      if (reqPath.startsWith('/MechanicsLab/models/')) {
        reqPath = reqPath.replace('/MechanicsLab/models/', '/assets/models/');
      }
      const filePath = path.join(projectRoot, reqPath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentTypes = {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.mjs': 'text/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.glb': 'model/gltf-binary',
        };
        res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404);
        res.end('Not Found: ' + reqPath);
      }
    });
    server.listen(port, () => resolve(server));
  });
}

// 2. CDP Client
class SimpleCDP {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 0;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const WebSocket = globalThis.WebSocket;
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception?.description || res.exceptionDetails.text);
    }
    return res.result?.value;
  }

  async close() {
    if (this.ws) this.ws.close();
  }
}

async function runPhase6Qa() {
  const port = 8125;
  const server = await startServer(port);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdpPort = 9223;
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1280,720',
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

  if (!list || list.length === 0) throw new Error('Could not find page target in Chrome');
  const pageTarget = list.find(t => t.type === 'page') || list[0];

  const cdp = new SimpleCDP(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${port}/MechanicsLab/SevereWeather_Warning.html` });
  await new Promise(r => setTimeout(r, 3000));

  console.log('Testing Phase 6 UI Bridge via CDP...');

  const probe = await cdp.evaluate(`(function() {
    const bridge = globalThis.__SW_PHASE6_UI_BRIDGE__;
    if (!bridge) return { error: 'No __SW_PHASE6_UI_BRIDGE__ found' };

    // Test initial snapshot
    const initialSnapshot = bridge.getSnapshot();

    // Mock UI subsystem authority to test attach contract
    const mockUi = {
      hud: {
        updateTimer: function(t) { this.time = t; },
        updateScore: function(s, c, d, e) { this.score = s; this.combo = c; this.ef = e; },
        setPaused: function(p) { this.paused = p; },
        getSnapshot: function() {
          return {
            timer: { remainingSeconds: typeof remainingSeconds !== 'undefined' ? Number(remainingSeconds) : 180 },
            score: { score: typeof score !== 'undefined' ? Number(score) : 0 },
          };
        }
      },
      feedback: {
        getActivePopups: function() { return []; }
      },
      transitions: {
        getCurrentTransition: function() { return null; }
      },
      results: {
        getReport: function() { return null; }
      },
      reset: function() {}
    };

    const attached = bridge.attach(mockUi);
    const contractProbe = bridge.runContractProbe();

    return {
      version: bridge.version,
      initialAttached: initialSnapshot.attached,
      attached,
      contractProbe,
    };
  })()`);

  console.log('Phase 6 QA Probe Output:', JSON.stringify(probe, null, 2));

  if (!probe || probe.error || probe.version !== 'MODERNIZATION_PHASE6_UI_V1' || !probe.attached || !probe.contractProbe?.passed) {
    throw new Error(`Phase 6 QA Probe failed: ${probe?.error || 'Contract probe failed'}`);
  }

  console.log('PASS: Phase 6 UI bridge contract probe succeeded!');

  await cdp.close();
  chromeProc.kill();
  server.close();
}

runPhase6Qa().catch(err => {
  console.error('Phase 6 QA Failed:', err);
  process.exit(1);
});
