// [SW:ASSET:SEE_THROUGH_CHECK]
// Catches models you can see through.
//
// The curved industrial warehouse shipped with one end of its barrel vault
// uncapped. Every material property was innocent -- opaque, opacity 1,
// FrontSide -- so nothing about the material explained it; the hole was in the
// geometry, and front-face culling meant you looked straight through the
// building. From one end it rendered as a solid dome, and rotated 180 degrees
// the shell all but vanished. It reached a player's screen because the asset
// validator parsed GLB headers and counted vertices, and nothing in the
// pipeline had ever looked at a model.
//
// Counting unshared edges was tried first and abandoned: measured across the
// library it gives no usable threshold. Judging holes by size relative to their
// model put the largest benign hole at 0.448 and the smallest real one at
// 0.464 -- a continuum, not a gap. Plenty of models have holes that are
// perfectly fine because nothing can ever see them: the open inner ends of
// lot-car's wheel cylinders, the ring joins inside district-barn, the missing
// floor every building has.
//
// So this measures the symptom instead of guessing at the cause. Each model is
// rendered from eight angles twice -- once with front faces only, once with
// back faces drawn too -- and compared. Any pixel that lights up ONLY when
// backfaces are drawn is a pixel where you were seeing through the shell. A
// solid model scores zero by construction, whatever holes it has where nobody
// can see them.
//
// The threshold sits in a gap the sweep actually shows, not one picked in
// advance: benign models top out around 9% (lot-car's wheel wells, seen through
// the arches) and broken ones start at 31%.
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const THRESHOLD = Number(process.env.SW_SEE_THROUGH_THRESHOLD || 20);
const PORT = Number(process.env.SW_SEE_THROUGH_PORT || 4321);
const root = path.resolve('.');
const wwwDir = path.join(root, 'www');

if (!fs.existsSync(path.join(wwwDir, 'index.html'))) {
  console.error('www/ is not built. Run `node scripts/build-web.mjs` first.');
  process.exit(1);
}

const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.glb': 'model/gltf-binary', '.wav': 'audio/wav', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  let file = path.join(wwwDir, path.normalize(decodeURIComponent(req.url.split('?')[0])));
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(PORT, '127.0.0.1', r));

const models = fs.readdirSync(path.join(wwwDir, 'assets', 'models')).filter(f => f.endsWith('.glb')).map(f => f.replace('.glb', '')).sort();
const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || undefined, headless: true, args: ['--use-angle=swiftshader'] });
const page = await (await browser.newContext({ viewport: { width: 300, height: 300 } })).newPage();
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('canvas', { timeout: 60000 });
await page.waitForTimeout(4000);

const scores = await page.evaluate(async (names) => {
  const S = 192;
  const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
  renderer.setSize(S, S); renderer.setClearColor(0x000000, 1);
  const results = {};
  for (const name of names) {
    const src = await new Promise(res => new THREE.GLTFLoader().load(`assets/models/${name}.glb`, g => res(g.scene), undefined, () => res(null)));
    if (!src) { results[name] = null; continue; }
    const box = new THREE.Box3().setFromObject(src);
    const centre = box.getCenter(new THREE.Vector3());
    const radius = box.getSize(new THREE.Vector3()).length() / 2 || 1;
    let worst = 0;
    for (const angle of [0, 45, 90, 135, 180, 225, 270, 315]) {
      const shots = [];
      for (const side of [THREE.FrontSide, THREE.DoubleSide]) {
        const scene = new THREE.Scene();
        const clone = src.clone(true);
        clone.traverse(o => { if (o.isMesh) o.material = new THREE.MeshBasicMaterial({ color: 0xffffff, side }); });
        scene.add(clone);
        const camera = new THREE.PerspectiveCamera(35, 1, 0.01, radius * 20);
        const a = angle * Math.PI / 180;
        camera.position.set(centre.x + Math.sin(a) * radius * 2.6, centre.y + radius * 0.35, centre.z + Math.cos(a) * radius * 2.6);
        camera.lookAt(centre);
        renderer.render(scene, camera);
        const gl = renderer.getContext();
        const px = new Uint8Array(S * S * 4);
        gl.readPixels(0, 0, S, S, gl.RGBA, gl.UNSIGNED_BYTE, px);
        shots.push(px);
      }
      let backOnly = 0, lit = 0;
      for (let i = 0; i < S * S; i++) {
        const front = shots[0][i * 4] > 8, both = shots[1][i * 4] > 8;
        if (both) lit++;
        if (both && !front) backOnly++;
      }
      const fraction = lit ? backOnly / lit : 0;
      if (fraction > worst) worst = fraction;
    }
    results[name] = Number((worst * 100).toFixed(1));
  }
  return results;
}, models);

await browser.close();
server.close();

const rows = Object.entries(scores).filter(([, v]) => v !== null).sort((a, b) => b[1] - a[1]);
// Wrecks are collapsed buildings: they are SUPPOSED to be torn open, and a torn
// edge legitimately shows its back. Flagging them as broken would be asserting
// something never established, and a check that cries wolf gets switched off.
// They are reported for a human to glance at, and do not fail the run.
const isWreck = (name) => name.endsWith('-wreck');
const failures = rows.filter(([name, v]) => v >= THRESHOLD && !isWreck(name));
const wreckNotes = rows.filter(([name, v]) => v >= THRESHOLD && isWreck(name));

console.log('='.repeat(68));
console.log('  SEE-THROUGH MODEL CHECK — backface-visible area, worst of 8 angles');
console.log('='.repeat(68));
for (const [name, value] of rows.slice(0, 12)) {
  console.log(`  ${String(value).padStart(6)}%  ${name}${value >= THRESHOLD ? '   <-- SEE-THROUGH' : ''}`);
}
const unloadable = Object.entries(scores).filter(([, v]) => v === null).map(([k]) => k);
if (unloadable.length) console.log(`\n  ${unloadable.length} model(s) failed to load: ${unloadable.join(', ')}`);

if (wreckNotes.length) {
  console.log(`\nNOTE — wrecks above the threshold (not failures; a wreck is meant to be torn open):`);
  for (const [name, value] of wreckNotes) console.log(`  ${name} — ${value}%`);
}

console.log(`\n${rows.length} models checked, threshold ${THRESHOLD}%.`);
if (failures.length) {
  console.log(`\nFAIL: ${failures.length} intact model(s) can be seen through:`);
  for (const [name, value] of failures) console.log(`  ${name} — ${value}% of its silhouette is backface`);
  console.log('\nTwo causes seen so far, and the remedy differs:');
  console.log('  - a hole in a closed shell (industrial-warehouse-curved: one end of');
  console.log('    the barrel vault is uncapped) -> cap the opening and re-export;');
  console.log('  - inside-out geometry (farm-windmill: a large sphere around the fan');
  console.log('    whose faces point inward, so it is invisible from most angles and');
  console.log('    a solid white ball from one) -> fix the winding and re-export.');
  process.exit(1);
}
console.log('PASS: no intact model shows backfaces from any tested angle.');
