import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
let html = await readFile(sourcePath, 'utf8');

function replaceExact(before, after, label) {
  const count = html.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one source match, found ${count}`);
  html = html.replace(before, after);
}

replaceExact(
  "  #gagToast.active { opacity: 1; transform: translateX(-50%) translateY(0); }",
  String.raw`  #gagToast.active { opacity: 1; transform: translateX(-50%) translateY(0); }

  /* v4.5.0 Rampage Feedback: screen-space callouts stay legible on mobile. */
  #rampageFeedbackLayer { position: fixed; inset: 0; z-index: 1500; pointer-events: none; overflow: hidden; contain: layout paint; }
  .rampage-popup { --rampage-color: #fbbf24; position: absolute; display: flex; align-items: center; gap: 7px; max-width: 82vw; white-space: nowrap; transform: translate(-50%, -50%); filter: drop-shadow(0 5px 8px rgba(0,0,0,0.72)); animation: rampagePopupFloat 0.95s cubic-bezier(0.18,0.82,0.22,1) forwards; }
  .rampage-word { color: var(--rampage-color); font: 1000 clamp(15px, 2.7vw, 28px)/0.95 Outfit, sans-serif; letter-spacing: 0.045em; -webkit-text-stroke: 1.5px rgba(0,0,0,0.9); text-shadow: 0 2px 0 #000, 0 0 12px color-mix(in srgb, var(--rampage-color) 60%, transparent); }
  .rampage-score { color: #fff7d6; font: 1000 clamp(13px, 2.2vw, 23px)/1 Outfit, sans-serif; -webkit-text-stroke: 1px rgba(0,0,0,0.88); text-shadow: 0 2px 0 #000; }
  .rampage-combo { padding: 3px 6px; border: 1px solid rgba(255,255,255,0.72); border-radius: 999px; background: rgba(3,7,18,0.78); color: #e0f2fe; font: 900 clamp(8px, 1.2vw, 12px)/1 monospace; }
  .rampage-banner { --rampage-color: #f97316; position: absolute; left: 50%; top: 33%; width: max-content; max-width: 88vw; transform: translate(-50%, -50%); color: var(--rampage-color); font: 1000 clamp(27px, 6.2vw, 64px)/0.9 Outfit, sans-serif; letter-spacing: 0.065em; text-align: center; -webkit-text-stroke: clamp(1px, 0.25vw, 3px) rgba(0,0,0,0.92); text-shadow: 0 4px 0 #000, 0 0 18px color-mix(in srgb, var(--rampage-color) 70%, transparent); filter: drop-shadow(0 8px 10px rgba(0,0,0,0.65)); animation: rampageBannerHit 1.18s cubic-bezier(0.16,0.84,0.24,1) forwards; }
  @keyframes rampagePopupFloat {
    0% { opacity: 0; transform: translate(-50%, -28%) scale(0.62) rotate(-3deg); }
    16% { opacity: 1; transform: translate(-50%, -50%) scale(1.08) rotate(1deg); }
    42% { opacity: 1; transform: translate(-50%, -72%) scale(1) rotate(0deg); }
    100% { opacity: 0; transform: translate(-50%, -155%) scale(1.08) rotate(2deg); }
  }
  @keyframes rampageBannerHit {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(1.65) rotate(-2deg); }
    14% { opacity: 1; transform: translate(-50%, -50%) scale(0.92) rotate(1deg); }
    32% { opacity: 1; transform: translate(-50%, -50%) scale(1.04) rotate(0deg); }
    76% { opacity: 1; transform: translate(-50%, -56%) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -76%) scale(1.08); }
  }`,
  'rampage feedback CSS'
);

replaceExact(
  '<div id="gagToast">THE TOWN WOULD LIKE A REFUND.</div>',
  '<div id="gagToast">THE TOWN WOULD LIKE A REFUND.</div>\n<div id="rampageFeedbackLayer" aria-hidden="true"></div>',
  'rampage feedback overlay'
);

replaceExact(
  String.raw`// --- FLOATING SCORE POP-UP SYSTEM ---
function spawnScorePopup(x, y, z, text, color = '#fbbf24') {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 48;
  const ctx = canvas.getContext('2d');
  ctx.font = 'bold 36px Outfit, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.strokeText(text, 64, 24);
  ctx.fillStyle = color;
  ctx.fillText(text, 64, 24);
  
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.position.set(x, y + 4, z);
  sprite.scale.set(8, 3, 1);
  scene.add(sprite);
  activeScorePopups.push({ sprite, life: 1.4, startY: y + 4 });
}`,
  String.raw`// --- v4.5.0 SCREEN-SPACE RAMPAGE FEEDBACK SYSTEM ---
let rampageFeedbackTier = 0;
const RAMPAGE_TIER_LABELS = [
  null,
  { text: 'WRECKING SPREE!', color: '#fbbf24' },
  { text: 'RAMPAGE!', color: '#f97316' },
  { text: 'MAXIMUM MAYHEM!', color: '#ef4444' }
];

function rampageTierFromCombo() {
  if (comboMultiplier >= 3.2) return 3;
  if (comboMultiplier >= 2.4) return 2;
  if (comboMultiplier >= 1.6) return 1;
  return 0;
}

function projectRampagePoint(x, y, z) {
  const width = Math.max(1, window.innerWidth);
  const height = Math.max(1, window.innerHeight);
  const point = new THREE.Vector3(x, y, z).project(camera);
  const onCamera = Number.isFinite(point.x) && Number.isFinite(point.y) && point.z >= -1 && point.z <= 1;
  const rawX = onCamera ? (point.x * 0.5 + 0.5) * width : width * 0.5;
  const rawY = onCamera ? (-point.y * 0.5 + 0.5) * height : height * 0.46;
  const marginX = Math.min(92, width * 0.16);
  const topMargin = Math.min(96, height * 0.22);
  const bottomMargin = Math.min(118, height * 0.28);
  return {
    x: THREE.MathUtils.clamp(rawX, marginX, width - marginX),
    y: THREE.MathUtils.clamp(rawY, topMargin, height - bottomMargin)
  };
}

function rampageLabelForScore(text, color) {
  const match = /^\+(\d+)/.exec(String(text));
  if (!match) return { label: String(text), score: '' };
  const amount = Number(match[1]);
  if (color === '#22c55e') return { label: 'TIMBER!', score: String(text) };
  if (color === '#3b82f6') return { label: 'TRAFFIC TOSS!', score: String(text) };
  if (color === '#f59e0b') return { label: 'LANDMARK DOWN!', score: String(text) };
  if (amount >= 450) return { label: 'TOTAL WRECK!', score: String(text) };
  if (amount >= 180) return { label: 'DEMOLISHED!', score: String(text) };
  if (amount >= 80) return { label: 'WRECKED!', score: String(text) };
  if (amount >= 35) return { label: 'SMASH!', score: String(text) };
  return { label: 'HIT!', score: String(text) };
}

function spawnRampageBanner(tier) {
  const layer = getCachedEl('rampageFeedbackLayer');
  const definition = RAMPAGE_TIER_LABELS[tier];
  if (!layer || !definition) return;
  layer.querySelectorAll('.rampage-banner').forEach(node => node.remove());
  const banner = document.createElement('div');
  banner.className = 'rampage-banner';
  banner.style.setProperty('--rampage-color', definition.color);
  banner.textContent = definition.text;
  layer.appendChild(banner);
  setTimeout(() => banner.remove(), 1250);
  if (typeof playStormClip === 'function') {
    playStormClip('music_rampage_stinger', { gain: 0.34, priority: 7, playbackRate: 1, bus: 'music' });
  }
}

function spawnRampageHudPopup(x, y, z, text, color) {
  const layer = getCachedEl('rampageFeedbackLayer');
  if (!layer) return;
  const existing = layer.querySelectorAll('.rampage-popup');
  if (existing.length >= 6) existing[0].remove();
  const position = projectRampagePoint(x, y, z);
  const message = rampageLabelForScore(text, color);
  const popup = document.createElement('div');
  popup.className = 'rampage-popup';
  popup.style.left = position.x + 'px';
  popup.style.top = position.y + 'px';
  popup.style.setProperty('--rampage-color', color);

  const word = document.createElement('span');
  word.className = 'rampage-word';
  word.textContent = message.label;
  popup.appendChild(word);

  if (message.score) {
    const score = document.createElement('span');
    score.className = 'rampage-score';
    score.textContent = message.score;
    popup.appendChild(score);
  }
  if (comboMultiplier > 1.05) {
    const combo = document.createElement('span');
    combo.className = 'rampage-combo';
    combo.textContent = comboMultiplier.toFixed(1) + 'x';
    popup.appendChild(combo);
  }

  layer.appendChild(popup);
  setTimeout(() => popup.remove(), 1020);
}

function spawnScorePopup(x, y, z, text, color = '#fbbf24') {
  spawnRampageHudPopup(x, y, z, text, color);
  const tier = rampageTierFromCombo();
  if (tier > rampageFeedbackTier) {
    rampageFeedbackTier = tier;
    spawnRampageBanner(tier);
  }
}

function updateRampageFeedbackTier() {
  const currentTier = rampageTierFromCombo();
  if (currentTier < rampageFeedbackTier) rampageFeedbackTier = currentTier;
}

function clearRampageFeedback() {
  const layer = getCachedEl('rampageFeedbackLayer');
  if (layer) layer.replaceChildren();
  rampageFeedbackTier = 0;
}`,
  'screen-space rampage popup system'
);

replaceExact(
  "let ambienceGain = null;\nlet effectsGain = null;\nlet newsDuckingGain = null;",
  "let ambienceGain = null;\nlet effectsGain = null;\nlet musicGain = null;\nlet newsDuckingGain = null;",
  'music bus declaration'
);

replaceExact(
  String.raw`  ambienceGain = audioCtx.createGain();
  effectsGain = audioCtx.createGain();
  newsDuckingGain = audioCtx.createGain();
  masterGain.gain.value = isAudioMuted ? 0 : 0.92;
  ambienceGain.gain.value = 0.72;
  effectsGain.gain.value = 0.92;
  newsDuckingGain.gain.value = 1;
  ambienceGain.connect(newsDuckingGain);
  effectsGain.connect(newsDuckingGain);`,
  String.raw`  ambienceGain = audioCtx.createGain();
  effectsGain = audioCtx.createGain();
  musicGain = audioCtx.createGain();
  newsDuckingGain = audioCtx.createGain();
  masterGain.gain.value = isAudioMuted ? 0 : 0.92;
  ambienceGain.gain.value = 0.72;
  effectsGain.gain.value = 0.92;
  musicGain.gain.value = 0.56;
  newsDuckingGain.gain.value = 1;
  ambienceGain.connect(newsDuckingGain);
  effectsGain.connect(newsDuckingGain);
  musicGain.connect(newsDuckingGain);`,
  'music bus graph'
);

replaceExact(
  String.raw`  if (panNode) {
    gainNode.connect(panNode);
    panNode.connect(options.bus === 'ambience' ? ambienceGain : effectsGain);
  } else {
    gainNode.connect(options.bus === 'ambience' ? ambienceGain : effectsGain);
  }`,
  String.raw`  const outputBus = options.bus === 'ambience' ? ambienceGain : (options.bus === 'music' ? musicGain : effectsGain);
  if (panNode) {
    gainNode.connect(panNode);
    panNode.connect(outputBus);
  } else {
    gainNode.connect(outputBus);
  }`,
  'one-shot music bus routing'
);

replaceExact(
  String.raw`function playStormLoop(name, initialGain = 0) {
  if (!audioCtx || !stormAudioReady || !stormAudioBuffer || ambientAudioLoops.has(name)) return ambientAudioLoops.get(name) || null;
  const clip = getClipDefinition(name);
  if (!clip) return null;
  const source = audioCtx.createBufferSource();
  const gainNode = audioCtx.createGain();
  source.buffer = stormAudioBuffer;
  source.loop = true;
  source.loopStart = clip.offset;
  source.loopEnd = clip.offset + clip.duration;
  gainNode.gain.value = initialGain;
  source.connect(gainNode);
  gainNode.connect(ambienceGain);
  source.start(audioCtx.currentTime, clip.offset);
  const voice = { source, gainNode, priority: 9, startedAt: audioCtx.currentTime, endTime: Infinity, loop: true, ended: false };
  ambientAudioLoops.set(name, voice);
  activeAudioVoices.push(voice);
  return voice;
}`,
  String.raw`function playStormLoop(name, initialGain = 0, bus = 'ambience') {
  if (!audioCtx || !stormAudioReady || !stormAudioBuffer || ambientAudioLoops.has(name)) return ambientAudioLoops.get(name) || null;
  const clip = getClipDefinition(name);
  if (!clip) return null;
  const source = audioCtx.createBufferSource();
  const gainNode = audioCtx.createGain();
  source.buffer = stormAudioBuffer;
  source.loop = true;
  source.loopStart = clip.offset;
  source.loopEnd = clip.offset + clip.duration;
  gainNode.gain.value = initialGain;
  source.connect(gainNode);
  gainNode.connect(bus === 'music' ? musicGain : ambienceGain);
  source.start(audioCtx.currentTime, clip.offset);
  const voice = { source, gainNode, priority: 9, startedAt: audioCtx.currentTime, endTime: Infinity, loop: true, ended: false };
  ambientAudioLoops.set(name, voice);
  activeAudioVoices.push(voice);
  return voice;
}`,
  'loop music bus routing'
);

replaceExact(
  "  ['loop_wind_low', 'loop_wind_close', 'loop_rumble', 'loop_grit', 'loop_pull_suction'].forEach(name => playStormLoop(name, 0));",
  "  ['loop_wind_low', 'loop_wind_close', 'loop_rumble', 'loop_grit', 'loop_pull_suction'].forEach(name => playStormLoop(name, 0));\n  ['music_drive_low', 'music_drive_high'].forEach(name => playStormLoop(name, 0, 'music'));",
  'dynamic music loops'
);

replaceExact(
  String.raw`  setAmbientLoopGain('loop_grit', moving ? 0.025 + speedFactor * 0.075 : 0);
  setAmbientLoopGain('loop_pull_suction', pullActive ? 0.19 + intensity * 0.08 : 0);
  setMasterAudioEnabled(audible || (!runActive && !isAudioMuted));`,
  String.raw`  setAmbientLoopGain('loop_grit', moving ? 0.025 + speedFactor * 0.075 : 0);
  setAmbientLoopGain('loop_pull_suction', pullActive ? 0.19 + intensity * 0.08 : 0);
  const comboHeat = audible ? THREE.MathUtils.clamp((comboMultiplier - 1) / 2.5, 0, 1) : 0;
  setAmbientLoopGain('music_drive_low', audible ? 0.075 + intensity * 0.025 : 0, 0.24);
  setAmbientLoopGain('music_drive_high', audible ? Math.max(0, comboHeat - 0.18) * 0.115 + intensity * 0.018 : 0, 0.20);
  setMasterAudioEnabled(audible || (!runActive && !isAudioMuted));`,
  'dynamic music intensity mix'
);

replaceExact(
  "  setUI('comboVal', `${comboMultiplier.toFixed(1)}x`);",
  "  setUI('comboVal', `${comboMultiplier.toFixed(1)}x`);\n  updateRampageFeedbackTier();",
  'rampage tier reset'
);

replaceExact(
  "  activeScorePopups.forEach(p => scene.remove(p.sprite));\n  activeScorePopups.length = 0;",
  "  activeScorePopups.forEach(p => scene.remove(p.sprite));\n  activeScorePopups.length = 0;\n  clearRampageFeedback();",
  'rampage feedback reset cleanup'
);

const requiredMarkers = [
  'rampageFeedbackLayer',
  'spawnRampageHudPopup',
  'MAXIMUM MAYHEM!',
  'music_drive_low',
  'music_drive_high',
  'music_rampage_stinger',
  "options.bus === 'music'"
];
for (const marker of requiredMarkers) {
  if (!html.includes(marker)) throw new Error(`Missing rampage/music marker: ${marker}`);
}

await writeFile(sourcePath, html, 'utf8');
console.log('Applied v4.5.0 Rampage Feedback and Dynamic Music patch.');
