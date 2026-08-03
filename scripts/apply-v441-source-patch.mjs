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
  if (count !== 1) {
    throw new Error(`${label}: expected exactly one source match, found ${count}`);
  }
  html = html.replace(before, after);
}

replaceExact(
  '<title>Severe Weather 3D Lab v4.4.0 - Illustrated Storm Feedback</title>',
  '<title>Severe Weather 3D Lab v4.4.1 - Gust Feedback</title>',
  'document title'
);
replaceExact(
  '3D LAB v4.4.0 ILLUSTRATED STORM',
  '3D LAB v4.4.1 GUST FEEDBACK',
  'NOAA build badge'
);
replaceExact(
  'ARCADE DISASTER SIMULATOR v4.4.0 ILLUSTRATED STORM',
  'ARCADE DISASTER SIMULATOR v4.4.1 GUST FEEDBACK',
  'main menu build label'
);
replaceExact(
  "const activeGridZapEffects = [];\nconst eastWestLaneDashes = [];",
  "const activeGridZapEffects = [];\nconst activeGustEffects = [];\nconst eastWestLaneDashes = [];",
  'Gust effect registry'
);

replaceExact(
  '// LANDMARK DAMAGE WITH STAGE 2 UNLOCK LOCK',
  `function disposeGustEffect(effect) {
  if (!effect) return;
  scene.remove(effect);
  if (effect.geometry) effect.geometry.dispose();
  if (effect.material) {
    if (Array.isArray(effect.material)) effect.material.forEach(material => material.dispose());
    else effect.material.dispose();
  }
}

function removeGustEffect(effect) {
  const index = activeGustEffects.indexOf(effect);
  if (index >= 0) activeGustEffects.splice(index, 1);
  disposeGustEffect(effect);
}

function registerGustEffect(effect) {
  scene.add(effect);
  activeGustEffects.push(effect);
  return effect;
}

function clearGustEffects() {
  while (activeGustEffects.length) disposeGustEffect(activeGustEffects.pop());
}

function spawnTreeLeafBurst(target, directionX, directionZ, strength) {
  const baseY = terrainHeightAt(target.x, target.z) + 4.4;
  for (let i = 0; i < 2; i++) {
    const leaf = registerGustEffect(new THREE.Mesh(
      new THREE.TetrahedronGeometry(0.34 + Math.random() * 0.18, 0),
      new THREE.MeshBasicMaterial({
        color: i === 0 ? '#a3e635' : '#fde047',
        transparent: true,
        opacity: 0.94,
        depthWrite: false
      })
    ));
    const startX = target.x + (Math.random() - 0.5) * 1.6;
    const startZ = target.z + (Math.random() - 0.5) * 1.6;
    const side = i === 0 ? -1 : 1;
    const duration = 430 + Math.random() * 110;
    const start = performance.now();

    function step(now) {
      if (!leaf.parent) return;
      const t = Math.min(1, (now - start) / duration);
      const distance = (4.5 + strength * 5.5) * t;
      leaf.position.set(
        startX + directionX * distance + directionZ * side * Math.sin(t * Math.PI) * 1.2,
        baseY + Math.sin(t * Math.PI) * 2.0,
        startZ + directionZ * distance - directionX * side * Math.sin(t * Math.PI) * 1.2
      );
      leaf.rotation.x += 0.24;
      leaf.rotation.y += 0.31;
      leaf.material.opacity = 0.94 * (1 - t);
      if (t < 1) requestAnimationFrame(step);
      else removeGustEffect(leaf);
    }

    requestAnimationFrame(step);
  }
}

function animateTreeGust(target, directionX, directionZ, strength) {
  if (!target || target.destroyed || target.damageStage !== 0 || !target.meshData || !target.meshData.group) return;
  const group = target.meshData.group;
  const token = (group.userData.gustToken || 0) + 1;
  group.userData.gustToken = token;
  const baseX = group.rotation.x;
  const baseZ = group.rotation.z;
  const tilt = 0.18 + strength * 0.22;
  const bendX = baseX + directionZ * tilt;
  const bendZ = baseZ - directionX * tilt;
  const start = performance.now();
  const bendDuration = 180;
  const holdDuration = 100;
  const recoverDuration = 680;

  function step(now) {
    if (group.userData.gustToken !== token) return;
    const elapsed = now - start;
    if (elapsed <= bendDuration) {
      const t = elapsed / bendDuration;
      const eased = 1 - Math.pow(1 - t, 3);
      group.rotation.x = THREE.MathUtils.lerp(baseX, bendX, eased);
      group.rotation.z = THREE.MathUtils.lerp(baseZ, bendZ, eased);
      requestAnimationFrame(step);
      return;
    }

    if (elapsed <= bendDuration + holdDuration) {
      group.rotation.x = bendX;
      group.rotation.z = bendZ;
      requestAnimationFrame(step);
      return;
    }

    const recoverT = Math.min(1, (elapsed - bendDuration - holdDuration) / recoverDuration);
    const spring = Math.exp(-3.6 * recoverT) * Math.cos(recoverT * Math.PI * 4.0);
    group.rotation.x = baseX + (bendX - baseX) * spring;
    group.rotation.z = baseZ + (bendZ - baseZ) * spring;
    if (recoverT < 1) requestAnimationFrame(step);
    else {
      group.rotation.x = baseX;
      group.rotation.z = baseZ;
    }
  }

  spawnTreeLeafBurst(target, directionX, directionZ, strength);
  requestAnimationFrame(step);
}

const lightGustKinds = new Set(['trampoline', 'flamingo', 'mailbox', 'grill', 'carts', 'foodcart', 'corndog']);

function pushLightComedyProps() {
  const range = storm.radius * 2.9;
  comedyProps.forEach(prop => {
    if (!prop || prop.destroyed || !lightGustKinds.has(prop.kind) || !prop.meshData || !prop.meshData.group) return;
    let deltaX = prop.x - storm.pos.x;
    let deltaZ = prop.z - storm.pos.z;
    let distance = Math.hypot(deltaX, deltaZ);
    if (distance > range) return;
    if (distance < 0.01) {
      const angle = Math.random() * Math.PI * 2;
      deltaX = Math.cos(angle);
      deltaZ = Math.sin(angle);
      distance = 1;
    }

    const directionX = deltaX / distance;
    const directionZ = deltaZ / distance;
    const falloff = 1 - Math.min(1, distance / range);
    const pushDistance = 1.5 + falloff * 4.5;
    const startX = prop.x;
    const startZ = prop.z;
    const endX = THREE.MathUtils.clamp(startX + directionX * pushDistance, -245, 245);
    const endZ = THREE.MathUtils.clamp(startZ + directionZ * pushDistance, -245, 245);
    const group = prop.meshData.group;
    const baseRotX = group.rotation.x;
    const baseRotZ = group.rotation.z;
    const token = (group.userData.gustToken || 0) + 1;
    group.userData.gustToken = token;
    const start = performance.now();
    const duration = 340;

    function step(now) {
      if (group.userData.gustToken !== token) return;
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const currentX = THREE.MathUtils.lerp(startX, endX, eased);
      const currentZ = THREE.MathUtils.lerp(startZ, endZ, eased);
      group.position.set(currentX, terrainHeightAt(currentX, currentZ), currentZ);
      const wobble = Math.sin(t * Math.PI) * 0.18 * (0.45 + falloff);
      group.rotation.x = baseRotX + directionZ * wobble;
      group.rotation.z = baseRotZ - directionX * wobble;
      if (t < 1) requestAnimationFrame(step);
      else {
        prop.x = endX;
        prop.z = endZ;
        group.rotation.x = baseRotX;
        group.rotation.z = baseRotZ;
      }
    }

    requestAnimationFrame(step);
  });
}

function spawnGustWave() {
  const originX = storm.pos.x;
  const originZ = storm.pos.z;
  const groundY = terrainHeightAt(originX, originZ) + 0.35;
  const ring = registerGustEffect(new THREE.Mesh(
    new THREE.RingGeometry(0.84, 1.0, 48),
    new THREE.MeshBasicMaterial({
      color: '#dbeafe', transparent: true, opacity: 0.48,
      side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending
    })
  ));
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(originX, groundY, originZ);
  const waveStart = performance.now();
  const waveDuration = 520;
  const maxScale = storm.radius * 3.0;

  function animateWave(now) {
    if (!ring.parent) return;
    const t = Math.min(1, (now - waveStart) / waveDuration);
    const eased = 1 - Math.pow(1 - t, 2);
    ring.scale.setScalar(4 + eased * (maxScale - 4));
    ring.material.opacity = 0.48 * (1 - t);
    if (t < 1) requestAnimationFrame(animateWave);
    else removeGustEffect(ring);
  }
  requestAnimationFrame(animateWave);

  const particleCount = 18;
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.24;
    const startRadius = 3 + Math.random() * 4;
    const speed = storm.radius * (1.35 + Math.random() * 0.9);
    const startY = groundY + 0.15 + Math.random() * 0.9;
    const lift = 0.8 + Math.random() * 0.5;
    const color = i % 3 === 0 ? '#84cc16' : (i % 2 === 0 ? '#d6b981' : '#cbd5e1');
    const particle = registerGustEffect(new THREE.Mesh(
      new THREE.TetrahedronGeometry(0.18 + Math.random() * 0.22, 0),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.82, depthWrite: false })
    ));
    const particleStart = performance.now();
    const particleDuration = 460 + Math.random() * 170;

    function animateParticle(now) {
      if (!particle.parent) return;
      const t = Math.min(1, (now - particleStart) / particleDuration);
      const distance = startRadius + speed * t;
      particle.position.set(
        originX + Math.cos(angle) * distance,
        startY + Math.sin(t * Math.PI) * lift,
        originZ + Math.sin(angle) * distance
      );
      particle.rotation.x += 0.16;
      particle.rotation.y += 0.22;
      particle.material.opacity = 0.82 * (1 - t);
      if (t < 1) requestAnimationFrame(animateParticle);
      else removeGustEffect(particle);
    }

    requestAnimationFrame(animateParticle);
  }
}

function triggerGustFeedback() {
  clearGustEffects();
  spawnGustWave();
  const range = storm.radius * 3.0;
  const nearbyTrees = targets
    .filter(target => target.isTree && !target.destroyed && target.damageStage === 0)
    .map(target => ({
      target,
      distance: Math.hypot(target.x - storm.pos.x, target.z - storm.pos.z)
    }))
    .filter(entry => entry.distance <= range)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 8);

  nearbyTrees.forEach(({ target, distance }) => {
    let deltaX = target.x - storm.pos.x;
    let deltaZ = target.z - storm.pos.z;
    if (distance < 0.01) {
      const angle = Math.random() * Math.PI * 2;
      deltaX = Math.cos(angle);
      deltaZ = Math.sin(angle);
      distance = 1;
    }
    const falloff = 1 - Math.min(1, distance / range);
    animateTreeGust(target, deltaX / distance, deltaZ / distance, 0.45 + falloff * 0.55);
  });
  pushLightComedyProps();
}

// LANDMARK DAMAGE WITH STAGE 2 UNLOCK LOCK`,
  'Gust feedback helpers'
);

replaceExact(
  `    } else if (slot === 'secondary') { // GUST SHOCKWAVE
      playSound('explode');
      addCameraShake(1.8);
      landmarks.forEach(lm => {
        const dist = Math.hypot(lm.x - storm.pos.x, lm.z - storm.pos.z);
        if (dist < storm.radius * 3.2) damageLandmark(lm, 120);
      });
      targets.forEach(t => {
        const dist = Math.hypot(t.x - storm.pos.x, t.z - storm.pos.z);
        if (dist < storm.radius * 2.4) damageTarget(t, 90, 'gust');
      });`,
  `    } else if (slot === 'secondary') { // GUST SHOCKWAVE
      playSound('explode');
      addCameraShake(1.8);
      triggerGustFeedback();
      landmarks.forEach(lm => {
        const dist = Math.hypot(lm.x - storm.pos.x, lm.z - storm.pos.z);
        if (dist < storm.radius * 3.2) damageLandmark(lm, 120);
      });
      targets.forEach(t => {
        const dist = Math.hypot(t.x - storm.pos.x, t.z - storm.pos.z);
        if (dist < storm.radius * 2.4) damageTarget(t, 90, 'gust');
      });`,
  'Tornado Gust ability feedback hook'
);

replaceExact(
  "  clearGridZapEffects();\n  powerPoles.forEach(pole => { pole.sparked = false; pole.group.scale.set(1, 1, 1); });",
  `  clearGridZapEffects();
  clearGustEffects();
  targets.forEach(target => {
    if (!target.isTree || !target.meshData || !target.meshData.group) return;
    const group = target.meshData.group;
    group.userData.gustToken = (group.userData.gustToken || 0) + 1;
    if (target.damageStage === 0 && !target.destroyed) {
      group.rotation.x = 0;
      group.rotation.z = 0;
    }
  });
  comedyProps.forEach(prop => {
    if (!prop.meshData || !prop.meshData.group) return;
    const group = prop.meshData.group;
    group.userData.gustToken = (group.userData.gustToken || 0) + 1;
    group.rotation.x = 0;
    group.rotation.z = 0;
    group.position.set(prop.x, terrainHeightAt(prop.x, prop.z), prop.z);
  });
  powerPoles.forEach(pole => { pole.sparked = false; pole.group.scale.set(1, 1, 1); });`,
  'Gust replay cleanup'
);

if (!html.includes('triggerGustFeedback') || !html.includes('activeGustEffects') || !html.includes('lightGustKinds') || !html.includes('spawnTreeLeafBurst')) {
  throw new Error('v4.4.1 Gust Feedback implementation is incomplete.');
}
if (!html.includes('v4.4.1') || html.includes('v4.4.0') || html.includes('v4.3.1')) {
  throw new Error('Version identity did not fully advance to v4.4.1.');
}

await writeFile(sourcePath, html, 'utf8');
console.log('Applied v4.4.1 Gust Feedback source patch.');
