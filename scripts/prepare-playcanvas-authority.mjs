import { access, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const authorityRoot = path.resolve('playcanvas-slice/public/authority');
const htmlPath = path.join(authorityRoot, 'index.html');
const bridgePath = path.join(authorityRoot, 'runtime', 'playcanvas-authority-bridge.js');
const bridgeTag = '<script src="./runtime/playcanvas-authority-bridge.js"></script>';
const modernTag = '<script type="module" src="./modern/modern-shell.js"></script>';

await access(bridgePath);
let html = await readFile(htmlPath, 'utf8');
if (html.includes(bridgeTag)) {
  console.log('PlayCanvas authority bridge already injected.');
  process.exit(0);
}
if (!html.includes(modernTag)) {
  throw new Error('Generated authority bundle is missing the modern-shell script tag.');
}
html = html.replace(modernTag, `${bridgeTag}\n${modernTag}`);
if (!html.includes('PLAYCANVAS_AUTHORITY_V1') && !html.includes('playcanvas-authority-bridge.js')) {
  throw new Error('PlayCanvas authority bridge injection failed.');
}
await writeFile(htmlPath, html, 'utf8');
console.log('Prepared same-origin PlayCanvas gameplay authority bundle.');
