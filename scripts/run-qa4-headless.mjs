import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const artifactsDir = process.env.QA4_ARTIFACTS_DIR
  ? path.resolve(process.env.QA4_ARTIFACTS_DIR)
  : path.join(projectRoot, 'qa-artifacts');
const cdpBase = process.env.QA4_CDP_URL || 'http://127.0.0.1:9222';
const timeoutMs = Number(process.env.QA4_TIMEOUT_MS || 50000);

await mkdir(artifactsDir, { recursive: true });

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function pollJson(url, deadline) {
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
      lastError = new Error(`HTTP ${response.status} from ${url}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(250);
  }
  throw lastError || new Error(`Timed out waiting for ${url}`);
}

const deadline = Date.now() + timeoutMs;
const targets = await pollJson(`${cdpBase}/json/list`, deadline);
const pageTarget = targets.find(target => target.type === 'page') || targets[0];
if (!pageTarget?.webSocketDebuggerUrl) throw new Error('No Chrome page target exposed by CDP.');

const socket = new WebSocket(pageTarget.webSocketDebuggerUrl);
const pending = new Map();
let nextId = 1;

socket.addEventListener('message', event => {
  const message = JSON.parse(String(event.data));
  if (!message.id) return;
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id);
  if (message.error) request.reject(new Error(message.error.message || JSON.stringify(message.error)));
  else request.resolve(message.result || {});
});

await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('Timed out opening Chrome DevTools WebSocket.')), 10000);
  socket.addEventListener('open', () => {
    clearTimeout(timer);
    resolve();
  }, { once: true });
  socket.addEventListener('error', () => {
    clearTimeout(timer);
    reject(new Error('Chrome DevTools WebSocket failed to open.'));
  }, { once: true });
});

function send(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Runtime evaluation failed.');
  return result.result?.value;
}

await send('Runtime.enable');
await send('Page.enable');

let report = null;
let pageUrl = '';
while (Date.now() < deadline) {
  pageUrl = await evaluate('location.href');
  report = await evaluate('window.__SEVERE_WEATHER_QA4_REPORT__ || null');
  if (report) break;
  await sleep(500);
}

const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
if (screenshot.data) {
  await writeFile(path.join(artifactsDir, 'qa4-screenshot.png'), Buffer.from(screenshot.data, 'base64'));
}

const diagnostic = {
  capturedAt: new Date().toISOString(),
  pageUrl,
  report
};
await writeFile(path.join(artifactsDir, 'qa4-report.json'), `${JSON.stringify(diagnostic, null, 2)}\n`, 'utf8');

socket.close();

if (!report) {
  console.error(`QA4 report did not appear within ${timeoutMs} ms.`);
  process.exit(1);
}

console.log(JSON.stringify(report, null, 2));
if (report.passed !== true) {
  console.error(`QA4 failed checks: ${(report.failedChecks || []).join(', ') || 'unknown'}`);
  process.exit(1);
}

console.log(`QA4 headless browser test passed in ${report.durationMs} ms.`);
