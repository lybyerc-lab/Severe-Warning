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
  '<title>Severe Weather 3D Lab v4.4.1 - Gust Feedback</title>',
  '<title>Severe Weather 3D Lab v4.4.2 - Pull Feedback</title>',
  'document title'
);
replaceExact(
  '3D LAB v4.4.1 GUST FEEDBACK',
  '3D LAB v4.4.2 PULL FEEDBACK',
  'NOAA build badge'
);
replaceExact(
  'ARCADE DISASTER SIMULATOR v4.4.1 GUST FEEDBACK',
  'ARCADE DISASTER SIMULATOR v4.4.2 PULL FEEDBACK',
  'main menu build label'
);
replaceExact(
  "const activeGustEffects = [];\nconst eastWestLaneDashes = [];",
  "const activeGustEffects = [];\nconst activePullEffects = [];\nconst eastWestLaneDashes = [];",
  'Pull effect registry'
);

replaceExact(
  '// LANDMARK DAMAGE WITH STAGE 2 UNLOCK LOCK',
  `function disposePullEffect(effect) {
  if (!effect) return;
  scene.remove(effect);
  if (effect.geometry) effect.geometry.dispose();
  if (effect.material) {
    if (Array.isArray(effect.material)) effect.material.forEach(material => material.dispose());
    else effect.material.dispose();
  }
}

function removePullEffect(effect) {
  const index = activePullEffects.indexOf(effect);
  if (index >= 0) activePullEffects.splice(index, 1);
  disposePullEffect(effect);
}

function registerPullEffect(effect) {
  scene.add(effect);
  activePullEffects.push(effect);
  return effect;
}

function clearPullEffects() {
  while (activePullEffects.length) disposePullEffect(activePullEffects.pop());
}

function cancelWindReactions() {
  targets.forEach(target => {
    if (!target.meshData || !target.meshData.group) return;
    const group = target.meshData.group;
    group.userData.gustToken = (group.userData.gustToken || 0) + 1;
    if (target.isTree && target.damageStage === 0 && !target.destroyed) {
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
}

function spawnPullLeafCue(target, originX, originZ, strength) {
  const startY = terrainHeightAt(target.x, target.z) + 4.2;
  const deltaX = originX - target.x;
  const deltaZ = originZ - target.z;
  const distance = Math.max(1, Math.hypot(deltaX, deltaZ));
  const directionX = deltaX / distance;
  const directionZ = deltaZ / distance;

  for (let i = 0; i < 2; i++) {
    const side = i === 0 ? -1 : 1;
    const leaf = registerPullEffect(new THREE.Mesh(
      new THREE.TetrahedronGeometry(0.30 + Math.random() * 0.18, 0),
      new THREE.MeshBasicMaterial({
        color: i === 0 ? '#bef264' : '#facc15',
        transparent: true,
        opacity: 0.95,
        depthWrite: false
      })
    ));
    const startX = target.x + (Math.random() - 0.5) * 1.5;
    const startZ = target.z + (Math.random() - 0.5) * 1.5;
    const travel = Math.min(distance * 0.62, 8 + strength * 8);
    const start = performance.now();
    const duration = 560 + Math.random() * 150;

    function step(now) {
      if (!leaf.parent) return;
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 2);
      const orbit = Math.sin(t * Math.PI) * side * 1.3;
      leaf.position.set(
        startX + directionX * travel * eased + directionZ * orbit,
        startY + Math.sin(t * Math.PI) * 1.8 + t * 1.0,
        startZ + directionZ * travel * eased - directionX * orbit
      );
      leaf.rotation.x += 0.22;
      leaf.rotation.y += 0.30;
      leaf.material.opacity = 0.95 * (1 - t);
      if (t < 1) requestAnimationFrame(step);
      else removePullEffect(leaf);
    }

    requestAnimationFrame(step);
  }
}

function animateTreePull(target, originX, originZ, strength) {
  if (!target || target.destroyed || target.damageStage !== 0 || !target.meshData || !target.meshData.group) return;
  const group = target.meshData.group;
  let deltaX = originX - target.x;
  let deltaZ = originZ - target.z;
  let distance = Math.hypot(deltaX, deltaZ);
  if (distance < 0.01) {
    const angle = Math.random() * Math.PI * 2;
    deltaX = Math.cos(angle);
    deltaZ = Math.sin(angle);
    distance = 1;
  }
  const directionX = deltaX / distance;
  const directionZ = deltaZ / distance;
  const token = (group.userData.gustToken || 0) + 1;
  group.userData.gustToken = token;
  const baseX = group.rotation.x;
  const baseZ = group.rotation.z;
  const tilt = 0.20 + strength * 0.26;
  const anticipateX = baseX - directionZ * tilt * 0.14;
  const anticipateZ = baseZ + directionX * tilt * 0.14;
  const bendX = baseX + directionZ * tilt;
  const bendZ = baseZ - directionX * tilt;
  const start = performance.now();
  const anticipateDuration = 110;
  const bendDuration = 260;
  const holdDuration = 240;
  const recoverDuration = 860;

  function step(now) {
    if (group.userData.gustToken !== token) return;
    const elapsed = now - start;
    if (elapsed <= anticipateDuration) {
      const t = elapsed / anticipateDuration;
      group.rotation.x = THREE.MathUtils.lerp(baseX, anticipateX, t);
      group.rotation.z = THREE.MathUtils.lerp(baseZ, anticipateZ, t);
      requestAnimationFrame(step);
      return;
    }

    if (elapsed <= anticipateDuration + bendDuration) {
      const t = (elapsed - anticipateDuration) / bendDuration;
      const eased = 1 - Math.pow(1 - t, 3);
      group.rotation.x = THREE.MathUtils.lerp(anticipateX, bendX, eased);
      group.rotation.z = THREE.MathUtils.lerp(anticipateZ, bendZ, eased);
      requestAnimationFrame(step);
      return;
    }

    if (elapsed <= anticipateDuration + bendDuration + holdDuration) {
      group.rotation.x = bendX;
      group.rotation.z = bendZ;
      requestAnimationFrame(step);
      return;
    }

    const recoverT = Math.min(1, (elapsed - anticipateDuration - bendDuration - holdDuration) / recoverDuration);
    const spring = Math.exp(-3.4 * recoverT) * Math.cos(recoverT * Math.PI * 3.8);
    group.rotation.x = baseX + (bendX - baseX) * spring;
    group.rotation.z = baseZ + (bendZ - baseZ) * spring;
    if (recoverT < 1) requestAnimationFrame(step);
    else {
      group.rotation.x = baseX;
      group.rotation.z = baseZ;
    }
  }

  spawnPullLeafCue(target, originX, originZ, strength);
  requestAnimationFrame(step);
}

function pullLightComedyProps(originX, originZ) {
  const range = storm.radius * 3.2;
  comedyProps.forEach(prop => {
    if (!prop || prop.destroyed || !lightGustKinds.has(prop.kind) || !prop.meshData || !prop.meshData.group) return;
    let deltaX = originX - prop.x;
    let deltaZ = originZ - prop.z;
    let distance = Math.hypot(deltaX, deltaZ);
    if (distance > range || distance < 0.01) return;

    const directionX = deltaX / distance;
    const directionZ = deltaZ / distance;
    const falloff = 1 - Math.min(1, distance / range);
    const availableDistance = Math.max(0, distance - storm.radius * 0.82);
    const pullDistance = Math.min(availableDistance, 2.2 + falloff * 5.8);
    if (pullDistance <= 0.1) return;

    const startX = prop.x;
    const startZ = prop.z;
    const endX = THREE.MathUtils.clamp(startX + directionX * pullDistance, -245, 245);
    const endZ = THREE.MathUtils.clamp(startZ + directionZ * pullDistance, -245, 245);
    const group = prop.meshData.group;
    const baseRotX = group.rotation.x;
    const baseRotZ = group.rotation.z;
    const token = (group.userData.gustToken || 0) + 1;
    group.userData.gustToken = token;
    const side = Math.random() < 0.5 ? -1 : 1;
    const start = performance.now();
    const duration = 680;

    function step(now) {
      if (group.userData.gustToken !== token) return;
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const orbit = Math.sin(t * Math.PI) * side * (0.6 + falloff * 1.1);
      const currentX = THREE.MathUtils.lerp(startX, endX, eased) + directionZ * orbit;
      const currentZ = THREE.MathUtils.lerp(startZ, endZ, eased) - directionX * orbit;
      group.position.set(currentX, terrainHeightAt(currentX, currentZ), currentZ);
      const wobble = Math.sin(t * Math.PI * 2.0) * 0.16 * (0.55 + falloff);
      group.rotation.x = baseRotX + directionZ * wobble;
      group.rotation.z = baseRotZ - directionX * wobble;
      if (t < 1) requestAnimationFrame(step);
      else {
        prop.x = endX;
        prop.z = endZ;
        group.position.set(endX, terrainHeightAt(endX, endZ), endZ);
        group.rotation.x = baseRotX;
        group.rotation.z = baseRotZ;
      }
    }

    requestAnimationFrame(step);
  });
}

function spawnPullSpiral(originX, originZ) {
  const groundY = terrainHeightAt(originX, originZ) + 0.30;
  const range = storm.radius * 3.15;

  for (let ringIndex = 0; ringIndex < 3; ringIndex++) {
    const ring = registerPullEffect(new THREE.Mesh(
      new THREE.RingGeometry(0.86, 1.04, 48),
      new THREE.MeshBasicMaterial({
        color: ringIndex === 1 ? '#bae6fd' : '#e0f2fe',
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    ));
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(originX, groundY + ringIndex * 0.05, originZ);
    const delay = ringIndex * 150;
    const start = performance.now();
    const duration = 900;

    function animateRing(now) {
      if (!ring.parent) return;
      const elapsed = now - start;
      if (elapsed < delay) {
        requestAnimationFrame(animateRing);
        return;
      }
      const t = Math.min(1, (elapsed - delay) / duration);
      const eased = t * t * (3 - 2 * t);
      const scale = THREE.MathUtils.lerp(range, 4.2, eased);
      ring.scale.setScalar(scale);
      ring.material.opacity = Math.sin(t * Math.PI) * 0.52;
      if (t < 1) requestAnimationFrame(animateRing);
      else removePullEffect(ring);
    }

    requestAnimationFrame(animateRing);
  }

  const particleCount = 26;
  for (let i = 0; i < particleCount; i++) {
    const baseAngle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.28;
    const startRadius = range * (0.52 + Math.random() * 0.46);
    const endRadius = 2.4 + Math.random() * 2.5;
    const turns = 1.15 + Math.random() * 0.85;
    const delay = Math.random() * 260;
    const startY = groundY + 0.2 + Math.random() * 1.1;
    const color = i % 4 === 0 ? '#bef264' : (i % 3 === 0 ? '#d6b981' : '#cbd5e1');
    const particle = registerPullEffect(new THREE.Mesh(
      new THREE.TetrahedronGeometry(0.22 + Math.random() * 0.28, 0),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false })
    ));
    const start = performance.now();
    const duration = 980 + Math.random() * 360;

    function animateParticle(now) {
      if (!particle.parent) return;
      const elapsed = now - start;
      if (elapsed < delay) {
        requestAnimationFrame(animateParticle);
        return;
      }
      const t = Math.min(1, (elapsed - delay) / duration);
      const eased = t * t * (3 - 2 * t);
      const radius = THREE.MathUtils.lerp(startRadius, endRadius, eased);
      const angle = baseAngle + eased * Math.PI * 2 * turns;
      particle.position.set(
        originX + Math.cos(angle) * radius,
        startY + Math.sin(t * Math.PI) * 1.8 + t * 2.4,
        originZ + Math.sin(angle) * radius
      );
      particle.rotation.x += 0.19;
      particle.rotation.y += 0.28;
      particle.material.opacity = Math.sin(t * Math.PI) * 0.92;
      if (t < 1) requestAnimationFrame(animateParticle);
      else removePullEffect(particle);
    }

    requestAnimationFrame(animateParticle);
  }
}

function triggerPullFeedback() {
  clearGustEffects();
  clearPullEffects();
  cancelWindReactions();
  const originX = storm.pos.x;
  const originZ = storm.pos.z;
  spawnPullSpiral(originX, originZ);
  const range = storm.radius * 3.2;
  const nearbyTrees = targets
    .filter(target => target.isTree && !target.destroyed && target.damageStage === 0)
    .map(target => ({
      target,
      distance: Math.hypot(target.x - originX, target.z - originZ)
    }))
    .filter(entry => entry.distance <= range)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 10);

  nearbyTrees.forEach(({ target, distance }) => {
    const falloff = 1 - Math.min(1, distance / range);
    animateTreePull(target, originX, originZ, 0.42 + falloff * 0.58);
  });
  pullLightComedyProps(originX, originZ);
}

// LANDMARK DAMAGE WITH STAGE 2 UNLOCK LOCK`,
  'Pull feedback helpers'
);

replaceExact(
  `function triggerGustFeedback() {
  clearGustEffects();`,
  `function triggerGustFeedback() {
  clearPullEffects();
  cancelWindReactions();
  clearGustEffects();`,
  'Gust and Pull reaction arbitration'
);

replaceExact(
  `    if (slot === 'primary') { // PULL VORTEX
      activePullVortex = true;
      pullVortexTimer = 2.5;
      playSound('gust');
      addCameraShake(1.4);`,
  `    if (slot === 'primary') { // PULL VORTEX
      activePullVortex = true;
      pullVortexTimer = 2.5;
      playSound('gust');
      addCameraShake(1.4);
      triggerPullFeedback();`,
  'Tornado Pull ability feedback hook'
);

replaceExact(
  "  clearGustEffects();\n  targets.forEach(target => {",
  "  clearGustEffects();\n  clearPullEffects();\n  targets.forEach(target => {",
  'Pull replay cleanup'
);

if (!html.includes('triggerPullFeedback') || !html.includes('activePullEffects') || !html.includes('animateTreePull') || !html.includes('pullLightComedyProps') || !html.includes('spawnPullSpiral')) {
  throw new Error('v4.4.2 Pull Feedback implementation is incomplete.');
}
if (!html.includes('v4.4.2') || html.includes('v4.4.1') || html.includes('v4.4.0') || html.includes('v4.3.1')) {
  throw new Error('Version identity did not fully advance to v4.4.2.');
}

await writeFile(sourcePath, html, 'utf8');
console.log('Applied v4.4.2 Pull Feedback source patch.');
