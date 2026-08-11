// ============================================================================
// [SW:GAME:RPG_002_SLINGSHOT]
// Pull + Gust physical synergy. This module observes the accepted abilities;
// it neither changes their cooldowns nor their normal damage/score rules.
// ============================================================================
const SW_RPG_002_MARKER = 'SW_RPG_002_SLINGSHOT_V1';
const SW_SLINGSHOT_HOLD_RADIUS = 7.5;
const SW_SLINGSHOT_MAX_BODIES = 3;
const swSlingshot = {
  candidate: null,
  held: null,
  bodies: [],
  lastStormPosition: null,
  lastAim: null,
  lastFrame: performance.now(),
  telemetry: { captures: 0, launches: 0, impacts: 0, totalDistance: 0, bestDistance: 0, lastLaunch: null, lastImpact: null }
};

function swSlingshotMass(target) {
  const footprint = Number(target?.meshData?.footprint) || (target?.isTree ? 5.5 : 8);
  return Number(Math.max(1, Math.min(7, footprint / 4)).toFixed(2));
}

function swSlingshotRadius(target) {
  return Math.max(1.1, Math.min(4.8, (Number(target?.meshData?.footprint) || 6) * 0.22));
}

function swSlingshotEligible(target) {
  return Boolean(target && !target.destroyed && !target.isCow && target.cowId !== 17 && target.meshData?.group);
}

function swSlingshotObservePull() {
  if (currentStorm !== 'tornado') return;
  const reach = storm.radius * 2.5;
  const candidate = targets
    .filter(swSlingshotEligible)
    .map(target => ({ target, distance: Math.hypot(target.x - storm.pos.x, target.z - storm.pos.z) }))
    .filter(entry => entry.distance <= reach)
    .sort((a, b) => a.distance - b.distance)[0]?.target || null;
  swSlingshot.candidate = candidate;
  swSlingshot.held = null;
}

function swSlingshotObserveCapture() {
  const target = swSlingshot.candidate;
  if (!activePullVortex || !swSlingshotEligible(target)) return;
  const distance = Math.hypot(target.x - storm.pos.x, target.z - storm.pos.z);
  if (distance > SW_SLINGSHOT_HOLD_RADIUS) return;
  swSlingshot.held = target;
  swSlingshot.telemetry.captures++;
  swSlingshot.telemetry.lastCapture = { mass: swSlingshotMass(target), distance: Number(distance.toFixed(2)) };
}

function swSlingshotAim() {
  let x = swSlingshot.lastAim?.x || 0;
  let z = swSlingshot.lastAim?.z || 0;
  if (Math.hypot(x, z) < 0.1 && camera?.getWorldDirection) {
    const forward = camera.getWorldDirection(new THREE.Vector3());
    x = forward.x; z = forward.z;
  }
  const length = Math.hypot(x, z) || 1;
  return { x: x / length, z: z / length };
}

function swSlingshotLaunch() {
  const target = swSlingshot.held;
  if (!swSlingshotEligible(target) || swSlingshot.bodies.length >= SW_SLINGSHOT_MAX_BODIES) return false;
  const distance = Math.hypot(target.x - storm.pos.x, target.z - storm.pos.z);
  if (distance > SW_SLINGSHOT_HOLD_RADIUS) return false;
  const mass = swSlingshotMass(target);
  const radius = swSlingshotRadius(target);
  const aim = swSlingshotAim();
  const sourceVelocity = swSlingshot.lastStormPosition
    ? Math.hypot(storm.pos.x - swSlingshot.lastStormPosition.x, storm.pos.z - swSlingshot.lastStormPosition.z) * 45
    : 0;
  // A fixed gust impulse means lighter debris exits faster while heavy material
  // carries a more forceful impact. No target position participates in this aim.
  const speed = Math.max(50, Math.min(145, 150 / Math.sqrt(mass) + sourceVelocity));
  const mesh = target.meshData.group.clone(true);
  mesh.name = 'SW_RPG_002_SLINGSHOT_DEBRIS';
  const startY = terrainHeightAt(target.x, target.z) + Math.max(2.5, radius);
  mesh.position.set(target.x, startY, target.z);
  scene.add(mesh);
  destroyTarget(target, 'slingshot-release');
  const body = { mesh, x: target.x, y: startY, z: target.z, vx: aim.x * speed, vy: 13 + 7 / mass, vz: aim.z * speed, mass, radius, speed, startX: target.x, startZ: target.z, age: 0 };
  swSlingshot.bodies.push(body);
  swSlingshot.candidate = null; swSlingshot.held = null;
  // Slingshot consumes the active hold; ordinary Pull retains its full timer
  // whenever Gust is not used during this release window.
  activePullVortex = false; pullVortexTimer = 0;
  swSlingshot.telemetry.launches++;
  swSlingshot.telemetry.lastLaunch = { mass, speed: Number(speed.toFixed(2)), aim: { x: Number(aim.x.toFixed(3)), z: Number(aim.z.toFixed(3)) }, source: 'player-storm-aim-and-state' };
  showGagToast('SLINGSHOT! DEBRIS IN FLIGHT');
  playSound('gust');
  return true;
}

function swSlingshotImpact(body, target) {
  const impactValue = Math.round(body.mass * Math.hypot(body.vx, body.vz));
  damageTarget(target, Math.max(55, impactValue * 1.2), 'slingshot-impact');
  const distance = Math.hypot(body.x - body.startX, body.z - body.startZ);
  swSlingshot.telemetry.impacts++;
  swSlingshot.telemetry.totalDistance += distance;
  swSlingshot.telemetry.bestDistance = Math.max(swSlingshot.telemetry.bestDistance, distance);
  swSlingshot.telemetry.lastImpact = { distance: Number(distance.toFixed(2)), mass: body.mass, impactValue, target: target.meshData?.label || 'TARGET' };
  spawnScorePopup(body.x, body.y, body.z, 'SLINGSHOT IMPACT', '#f97316');
  playSound('explode');
  return true;
}

function swSlingshotTick(now = performance.now()) {
  const dt = Math.max(0.005, Math.min(0.1, (now - swSlingshot.lastFrame) / 1000));
  swSlingshot.lastFrame = now;
  swSlingshotObserveCapture();
  swSlingshot.bodies = swSlingshot.bodies.filter(body => {
    body.age += dt; body.vy -= 26 * dt; body.x += body.vx * dt; body.y += body.vy * dt; body.z += body.vz * dt;
    body.vx *= 0.993; body.vz *= 0.993;
    body.mesh.position.set(body.x, body.y, body.z); body.mesh.rotation.x += dt * body.vz * 0.04; body.mesh.rotation.z -= dt * body.vx * 0.04;
    const hit = targets.find(target => swSlingshotEligible(target) && Math.hypot(target.x - body.x, target.z - body.z) <= body.radius + swSlingshotRadius(target));
    if (hit) { swSlingshotImpact(body, hit); scene.remove(body.mesh); return false; }
    const ground = terrainHeightAt(body.x, body.z) + Math.max(0.6, body.radius * 0.35);
    if (body.y <= ground || body.age > 3.5) { scene.remove(body.mesh); return false; }
    return true;
  });
  const previous = swSlingshot.lastStormPosition;
  if (previous) {
    const x = storm.pos.x - previous.x;
    const z = storm.pos.z - previous.z;
    const length = Math.hypot(x, z);
    if (length > 0.1) swSlingshot.lastAim = { x: x / length, z: z / length };
  }
  swSlingshot.lastStormPosition = { x: storm.pos.x, z: storm.pos.z };
}

const swSlingshotBaseTriggerAbility = triggerAbility;
triggerAbility = function swRpg002SlingshotAbility(slot, ...args) {
  if (slot === 'primary') swSlingshotObservePull();
  // Preserve ordinary Gust rejection/cooldown semantics: a held body is only
  // released on an ability activation the accepted executor would accept.
  const launches = slot === 'secondary' && currentStorm === 'tornado' && runActive && Number(cooldowns?.secondary?.current) <= 0 && swSlingshotLaunch();
  return swSlingshotBaseTriggerAbility.call(this, slot, ...args);
};

const swSlingshotBaseAnimate = animate;
animate = function swRpg002SlingshotExecutor(...args) {
  const result = swSlingshotBaseAnimate.apply(this, args);
  swSlingshotTick(Number(args[0]) || performance.now());
  return result;
};

const swSlingshotBaseMetadata = globalThis.getSwRpgBuildMetadata;
globalThis.getSwRpgBuildMetadata = function swRpg002BuildMetadata() {
  const base = swSlingshotBaseMetadata?.() || {};
  return Object.freeze({ ...base, slingshot: { version: 'slingshot-v1', launches: swSlingshot.telemetry.launches, impacts: swSlingshot.telemetry.impacts, bestDistance: Number(swSlingshot.telemetry.bestDistance.toFixed(2)) } });
};

globalThis.getSwSlingshotQaState = function getSwSlingshotQaState() {
  return Object.freeze({ marker: SW_RPG_002_MARKER, held: Boolean(swSlingshot.held), activeBodies: swSlingshot.bodies.length, bodies: swSlingshot.bodies.map(body => ({ distance: Number(Math.hypot(body.x - body.startX, body.z - body.startZ).toFixed(2)), x: Number(body.x.toFixed(2)), z: Number(body.z.toFixed(2)) })), telemetry: structuredClone(swSlingshot.telemetry), metadata: globalThis.getSwRpgBuildMetadata() });
};
globalThis.__SW_RPG_002_QA__ = {
  reset() {
    swSlingshot.bodies.forEach(body => scene.remove(body.mesh));
    swSlingshot.candidate = null; swSlingshot.held = null; swSlingshot.bodies = [];
    swSlingshot.telemetry = { captures: 0, launches: 0, impacts: 0, totalDistance: 0, bestDistance: 0, lastLaunch: null, lastImpact: null };
  }
};
// [SW:GAME:RPG_002:END]
