// ============================================================================
// [SW:ARCH:PHASE6_PERFORMANCE_BRIDGE]
// Runtime-integrated Android performance contracts. The accepted V5.1 runtime
// modules remain byte-for-byte bundled; this bridge wraps their live functions.
// ============================================================================
const PHASE6_PERFORMANCE_BRIDGE_VERSION = 'MODERNIZATION_PHASE6_PERFORMANCE_V2';

const PHASE6_QUALITY_ORDER = ['ECO', 'PERFORMANCE', 'BALANCED', 'HIGH', 'ULTRA'];
const PHASE6_QUALITY_PRESETS = Object.freeze({
  ULTRA: Object.freeze({ pixelRatioCap: 1.5, shadows: true, cosmeticDustCap: 48 }),
  HIGH: Object.freeze({ pixelRatioCap: 1.25, shadows: true, cosmeticDustCap: 40 }),
  BALANCED: Object.freeze({ pixelRatioCap: 1.0, shadows: true, cosmeticDustCap: 32 }),
  PERFORMANCE: Object.freeze({ pixelRatioCap: 0.85, shadows: false, cosmeticDustCap: 20 }),
  ECO: Object.freeze({ pixelRatioCap: 0.7, shadows: false, cosmeticDustCap: 12 }),
});

function phase6Percentile(values, percentile, fallback = 0) {
  if (!values.length) return fallback;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * percentile)));
  return Number(sorted[index]);
}

function phase6CountSceneObjects() {
  let count = 0;
  scene.traverse(() => { count += 1; });
  return count;
}

class Phase6DustPool {
  constructor(capacity = 48) {
    this.capacity = capacity;
    this.activeLimit = capacity;
    this.highWaterMark = 0;
    this.spawnedCount = 0;
    this.releasedCount = 0;
    this.droppedCount = 0;
    this.sharedGeometry = new THREE.DodecahedronGeometry(1, 0);
    this.items = Array.from({ length: capacity }, (_, id) => {
      const material = new THREE.MeshBasicMaterial({
        color: '#b99a72',
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(this.sharedGeometry, material);
      mesh.visible = false;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.name = `Phase6PooledDust-${id}`;
      mesh.userData.phase6PooledDust = true;
      mesh.userData.phase6PoolItemId = id;
      return { id, active: false, mesh, effect: null };
    });
  }

  setActiveLimit(limit) {
    this.activeLimit = Math.max(1, Math.min(this.capacity, Math.floor(Number(limit) || this.capacity)));
  }

  activeCount() {
    return this.items.reduce((count, item) => count + (item.active ? 1 : 0), 0);
  }

  acquire({ x, y, z, color, size, vx, vy, vz, life }) {
    if (this.activeCount() >= this.activeLimit) {
      this.droppedCount += 1;
      return null;
    }
    const item = this.items.find((candidate) => !candidate.active);
    if (!item) {
      this.droppedCount += 1;
      return null;
    }

    item.active = true;
    item.mesh.visible = true;
    item.mesh.position.set(x, y, z);
    item.mesh.rotation.set(0, 0, 0);
    item.mesh.scale.setScalar(size);
    item.mesh.material.color.set(color);
    item.mesh.material.opacity = 0.48;
    if (!item.mesh.parent) scene.add(item.mesh);

    const effect = {
      mesh: item.mesh,
      vx,
      vy,
      vz,
      life,
      maxLife: life,
      ring: false,
      phase6Pooled: true,
      phase6PoolItemId: item.id,
    };
    item.effect = effect;
    this.spawnedCount += 1;
    this.highWaterMark = Math.max(this.highWaterMark, this.activeCount());
    return effect;
  }

  releaseItem(item) {
    if (!item) return false;
    if (item.mesh.parent) item.mesh.parent.remove(item.mesh);
    item.mesh.visible = false;
    item.mesh.material.opacity = 0;
    item.mesh.scale.setScalar(1);
    const wasActive = item.active;
    item.active = false;
    item.effect = null;
    if (wasActive) this.releasedCount += 1;
    return true;
  }

  releaseEffect(effect) {
    if (!effect || effect.phase6Pooled !== true) return false;
    const item = this.items[Number(effect.phase6PoolItemId)];
    return this.releaseItem(item);
  }

  releaseMesh(mesh) {
    if (!mesh?.userData?.phase6PooledDust) return false;
    const item = this.items[Number(mesh.userData.phase6PoolItemId)];
    return this.releaseItem(item);
  }

  reset() {
    this.items.forEach((item) => this.releaseItem(item));
  }

  snapshot() {
    return Object.freeze({
      poolCapacity: this.capacity,
      activeLimit: this.activeLimit,
      activeCount: this.activeCount(),
      highWaterMark: this.highWaterMark,
      spawnedCount: this.spawnedCount,
      releasedCount: this.releasedCount,
      droppedCount: this.droppedCount,
      sharedGeometryCount: 1,
      boundedMaterialCount: this.capacity,
    });
  }
}

class Phase6AdaptiveQualityController {
  constructor(initialTier) {
    this.tier = initialTier;
    this.frameTimesMs = [];
    this.telemetry = [];
    this.lastTierChangeAt = performance.now();
    this.minimumHoldMs = 5000;
  }

  settings() {
    return PHASE6_QUALITY_PRESETS[this.tier];
  }

  transitionTo(nextTier, reason, nowMs) {
    if (!PHASE6_QUALITY_PRESETS[nextTier] || nextTier === this.tier) return false;
    const fromTier = this.tier;
    this.tier = nextTier;
    this.lastTierChangeAt = Number(nowMs);
    this.telemetry.push(Object.freeze({
      timestamp: Number(nowMs),
      fromTier,
      toTier: nextTier,
      reason: String(reason),
    }));
    this.apply();
    return true;
  }

  apply() {
    const settings = this.settings();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, settings.pixelRatioCap));
    if (renderer.shadowMap) renderer.shadowMap.enabled = settings.shadows;
    phase6DustPool.setActiveLimit(settings.cosmeticDustCap);
  }

  recordFrame(frameTimeMs, nowMs) {
    if (!Number.isFinite(frameTimeMs) || frameTimeMs <= 0 || frameTimeMs >= 250) return;
    this.frameTimesMs.push(frameTimeMs);
    if (this.frameTimesMs.length > 240) this.frameTimesMs.shift();
    if (this.frameTimesMs.length < 60) return;
    if (Number(nowMs) - this.lastTierChangeAt < this.minimumHoldMs) return;

    const median = phase6Percentile(this.frameTimesMs, 0.5, 16.6);
    const p95 = phase6Percentile(this.frameTimesMs, 0.95, 16.6);
    const longRatio = this.frameTimesMs.filter((value) => value > 33.3).length / this.frameTimesMs.length;
    const currentIndex = PHASE6_QUALITY_ORDER.indexOf(this.tier);

    if ((p95 > 35 || longRatio > 0.2) && currentIndex > 0) {
      this.transitionTo(
        PHASE6_QUALITY_ORDER[currentIndex - 1],
        `frame pressure p95=${p95.toFixed(1)}ms longRatio=${longRatio.toFixed(3)}`,
        nowMs,
      );
      return;
    }
    if (median < 18 && p95 < 20 && currentIndex < PHASE6_QUALITY_ORDER.length - 1) {
      this.transitionTo(
        PHASE6_QUALITY_ORDER[currentIndex + 1],
        `frame headroom median=${median.toFixed(1)}ms p95=${p95.toFixed(1)}ms`,
        nowMs,
      );
    }
  }

  resetSamples() {
    this.frameTimesMs = [];
  }

  snapshot() {
    const median = phase6Percentile(this.frameTimesMs, 0.5, 0);
    const p95 = phase6Percentile(this.frameTimesMs, 0.95, 0);
    return Object.freeze({
      tier: this.tier,
      settings: Object.freeze({ ...this.settings() }),
      transitionCount: this.telemetry.length,
      transitions: Object.freeze([...this.telemetry]),
      sampleCount: this.frameTimesMs.length,
      frameTimeMedianMs: Number(median.toFixed(3)),
      frameTimeP95Ms: Number(p95.toFixed(3)),
      longFrame33Count: this.frameTimesMs.filter((value) => value > 33.3).length,
      longFrame50Count: this.frameTimesMs.filter((value) => value > 50).length,
    });
  }
}

const phase6DustPool = new Phase6DustPool(48);
const phase6QualityController = new Phase6AdaptiveQualityController(isMobileDevice ? 'BALANCED' : 'HIGH');
const phase6Integration = {
  productionUpdateSamples: 0,
  productionDustBurstCalls: 0,
  pooledDustSpawned: 0,
  inputInterruptions: 0,
  resetCount: 0,
  lastResetReason: 'boot',
  lastInputInterruptionReason: null,
  listenerCount: 0,
  wrappersInstalled: false,
};

function phase6ResetLiveInput(reason) {
  if (globalThis.__SW_PHASE3_INPUT_ABILITY_BRIDGE__?.reset) {
    globalThis.__SW_PHASE3_INPUT_ABILITY_BRIDGE__.reset();
  }
  Object.keys(keys).forEach((key) => { keys[key] = false; });
  joystickDir.x = 0;
  joystickDir.z = 0;
  joystickActive = false;
  phase6Integration.inputInterruptions += 1;
  phase6Integration.lastInputInterruptionReason = reason;
}

const phase6BlurHandler = () => phase6ResetLiveInput('window-blur');
const phase6VisibilityHandler = () => {
  if (document.hidden) phase6ResetLiveInput('visibility-hidden');
};
window.addEventListener('blur', phase6BlurHandler);
document.addEventListener('visibilitychange', phase6VisibilityHandler);
phase6Integration.listenerCount = 2;

const phase6PerformanceBridge = {
  version: PHASE6_PERFORMANCE_BRIDGE_VERSION,

  spawnDustBurst(x, y, z, color = '#b99a72', count = 7) {
    phase6Integration.productionDustBurstCalls += 1;
    const boundedCount = Math.max(0, Math.min(Number(count) || 0, phase6QualityController.settings().cosmeticDustCap));
    let spawned = 0;
    for (let index = 0; index < boundedCount; index += 1) {
      const effect = phase6DustPool.acquire({
        x,
        y,
        z,
        color,
        size: 0.55 + (index % 3) * 0.22,
        vx: (Math.random() - 0.5) * 8,
        vy: 2.5 + Math.random() * 5,
        vz: (Math.random() - 0.5) * 8,
        life: 0.65 + Math.random() * 0.45,
      });
      if (!effect) continue;
      productionPulseEffects.push(effect);
      spawned += 1;
    }
    phase6Integration.pooledDustSpawned += spawned;
    return spawned;
  },

  releaseDustEffect(effect) {
    return phase6DustPool.releaseEffect(effect);
  },

  releaseDustMesh(mesh) {
    return phase6DustPool.releaseMesh(mesh);
  },

  recordFrame(effectiveDt, effectiveNow) {
    const frameTimeMs = Number(effectiveDt) * 1000;
    if (!Number.isFinite(frameTimeMs) || frameTimeMs <= 0 || frameTimeMs >= 250) return;
    phase6Integration.productionUpdateSamples += 1;
    phase6QualityController.recordFrame(frameTimeMs, Number(effectiveNow));
  },

  resetTransientState(reason = 'unknown') {
    productionPulseEffects = productionPulseEffects.filter((effect) => {
      if (effect?.phase6Pooled !== true) return true;
      phase6DustPool.releaseEffect(effect);
      return false;
    });
    phase6DustPool.reset();
    phase6QualityController.resetSamples();
    phase6Integration.resetCount += 1;
    phase6Integration.lastResetReason = String(reason);
  },

  resetLiveInput(reason = 'manual') {
    phase6ResetLiveInput(String(reason));
  },

  runDeterministicQualityProbe() {
    const originalTier = phase6QualityController.tier;
    const originalLastChange = phase6QualityController.lastTierChangeAt;
    const probeStart = Math.max(performance.now(), originalLastChange) + 6000;
    phase6QualityController.resetSamples();
    for (let index = 0; index < 90; index += 1) {
      phase6QualityController.recordFrame(45, probeStart + index * 45);
    }
    const pressureTier = phase6QualityController.tier;
    const downshifted = PHASE6_QUALITY_ORDER.indexOf(pressureTier) < PHASE6_QUALITY_ORDER.indexOf(originalTier);
    phase6QualityController.transitionTo(originalTier, 'qa-probe-restore', probeStart + 12000);
    phase6QualityController.resetSamples();
    return Object.freeze({
      originalTier,
      pressureTier,
      downshifted,
      restoredTier: phase6QualityController.tier,
      restored: phase6QualityController.tier === originalTier,
    });
  },

  getSnapshot() {
    const phase5 = globalThis.__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__?.getSnapshot?.() || null;
    const heapUsageMbProxy = performance.memory && Number.isFinite(performance.memory.usedJSHeapSize)
      ? Number((performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(3))
      : null;
    return Object.freeze({
      version: PHASE6_PERFORMANCE_BRIDGE_VERSION,
      debrisPool: phase6DustPool.snapshot(),
      adaptiveQuality: phase6QualityController.snapshot(),
      renderer: Object.freeze({
        pixelRatio: Number(renderer.getPixelRatio()),
        drawCalls: Number(renderer.info.render.calls || 0),
        triangles: Number(renderer.info.render.triangles || 0),
        points: Number(renderer.info.render.points || 0),
        lines: Number(renderer.info.render.lines || 0),
        geometries: Number(renderer.info.memory.geometries || 0),
        textures: Number(renderer.info.memory.textures || 0),
      }),
      runtime: Object.freeze({
        sceneObjectCount: phase6CountSceneObjects(),
        productionPulseEffects: productionPulseEffects.length,
        productionFragments: productionFragments.length,
        heapUsageMbProxy,
      }),
      input: Object.freeze({
        listenerCount: phase6Integration.listenerCount,
        interruptions: phase6Integration.inputInterruptions,
        lastInterruptionReason: phase6Integration.lastInputInterruptionReason,
        phase3: globalThis.__SW_PHASE3_INPUT_ABILITY_BRIDGE__?.getSnapshot?.() || null,
      }),
      integration: Object.freeze({ ...phase6Integration }),
      phase5,
    });
  },
};

const phase6OriginalSpawnProductionDustBurst = spawnProductionDustBurst;
const phase6OriginalUpdateProductionSlice = updateProductionSlice;
const phase6OriginalClearProductionSlice = clearProductionSlice;
const phase6OriginalDisposeProductionObject = disposeProductionObject;

disposeProductionObject = function phase6AwareDisposeProductionObject(root) {
  if (root?.userData?.phase6PooledDust) {
    phase6PerformanceBridge.releaseDustMesh(root);
    return;
  }
  return phase6OriginalDisposeProductionObject(root);
};

spawnProductionDustBurst = function phase6PooledProductionDustBurst(x, y, z, color = '#b99a72', count = 7) {
  return phase6PerformanceBridge.spawnDustBurst(x, y, z, color, count);
};

updateProductionSlice = function phase6MeasuredProductionUpdate(dt, now, isMoving) {
  phase6PerformanceBridge.recordFrame(dt, now);
  return phase6OriginalUpdateProductionSlice(dt, now, isMoving);
};

clearProductionSlice = function phase6BoundedProductionClear() {
  phase6PerformanceBridge.resetTransientState('clear-production-slice');
  return phase6OriginalClearProductionSlice();
};

phase6Integration.wrappersInstalled = true;
phase6QualityController.apply();
globalThis.__SW_PHASE6_PERFORMANCE_BRIDGE__ = phase6PerformanceBridge;
globalThis.getPhase6PerformanceSnapshot = () => phase6PerformanceBridge.getSnapshot();
// [SW:ARCH:PHASE6_PERFORMANCE_BRIDGE:END]
