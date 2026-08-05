// ============================================================================
// [SW:ARCH:PHASE6_PERFORMANCE_BRIDGE]
// Lexical bridge attaching Phase 6 bounded performance contracts (debris pooling,
// adaptive quality controller, touch lifecycle safety, and telemetry access).
// Does NOT alter any gameplay laws, damage calculations, physics, or scoring.
// ============================================================================
const PHASE6_PERFORMANCE_BRIDGE_VERSION = 'MODERNIZATION_PHASE6_PERFORMANCE_V1';

class Phase6DebrisPoolManagerInternal {
  constructor(capacity = 48) {
    this.capacity = capacity;
    this.pool = [];
    this.activeCount = 0;
    this.highWaterMark = 0;
    this.recycledCount = 0;

    for (let i = 0; i < capacity; i += 1) {
      this.pool.push({
        id: i,
        active: false,
        mesh: null,
        colorHex: '#64748b',
        vx: 0, vy: 0, vz: 0,
        rotX: 0, rotY: 0,
        life: 0, bounced: false
      });
    }
  }

  obtain(colorHex, size, x, y, z, vx, vy, vz, rotX, rotY, life) {
    let item = this.pool.find(p => !p.active);
    if (!item) {
      // Recycle item with lowest remaining life
      let lowestLife = Infinity;
      this.pool.forEach(p => {
        if (p.life < lowestLife) {
          lowestLife = p.life;
          item = p;
        }
      });
      if (item) this.recycledCount += 1;
    }
    if (!item) return null;

    if (!item.active) {
      this.activeCount += 1;
      if (this.activeCount > this.highWaterMark) this.highWaterMark = this.activeCount;
    }

    item.active = true;
    item.colorHex = colorHex;
    item.vx = vx; item.vy = vy; item.vz = vz;
    item.rotX = rotX; item.rotY = rotY;
    item.life = life; item.bounced = false;

    if (typeof THREE !== 'undefined' && THREE.BoxGeometry) {
      if (!item.mesh) {
        const geo = new THREE.BoxGeometry(size, size, size);
        const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.6, metalness: 0.1 });
        item.mesh = new THREE.Mesh(geo, mat);
      } else {
        item.mesh.scale.set(size, size, size);
        if (item.mesh.material && item.mesh.material.color) {
          item.mesh.material.color.set(colorHex);
        }
      }
      item.mesh.position.set(x, y, z);
      item.mesh.visible = true;
    }

    return item;
  }

  release(item) {
    if (!item || !item.active) return;
    item.active = false;
    item.life = 0;
    if (item.mesh) {
      item.mesh.visible = false;
      if (item.mesh.parent) item.mesh.parent.remove(item.mesh);
    }
    this.activeCount = Math.max(0, this.activeCount - 1);
  }

  reset() {
    this.pool.forEach(item => {
      if (item.mesh && item.mesh.parent) {
        item.mesh.parent.remove(item.mesh);
      }
      item.active = false;
      item.life = 0;
      item.bounced = false;
    });
    this.activeCount = 0;
    this.highWaterMark = 0;
    this.recycledCount = 0;
  }

  getSnapshot() {
    return {
      poolCapacity: this.capacity,
      activeCount: this.activeCount,
      highWaterMark: this.highWaterMark,
      recycledCount: this.recycledCount
    };
  }
}

class Phase6AdaptiveQualityControllerInternal {
  constructor() {
    this.tier = 'HIGH';
    this.presets = {
      ULTRA: { scale: 1.5, shadows: true, debrisCap: 48 },
      HIGH: { scale: 1.25, shadows: true, debrisCap: 36 },
      BALANCED: { scale: 1.0, shadows: true, debrisCap: 24 },
      PERFORMANCE: { scale: 0.9, shadows: false, debrisCap: 16 },
      ECO: { scale: 0.75, shadows: false, debrisCap: 10 }
    };
    this.lastChangeTime = Date.now();
    this.telemetry = [];
  }

  setTier(newTier, reason = 'manual') {
    if (this.tier === newTier) return;
    const oldTier = this.tier;
    this.tier = newTier;
    this.lastChangeTime = Date.now();
    this.telemetry.push({ timestamp: Date.now(), from: oldTier, to: newTier, reason });
    console.log(`[SW:QUALITY] Adapted tier to ${newTier} :: ${reason}`);

    if (typeof renderer !== 'undefined' && renderer) {
      const cfg = this.presets[newTier];
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, cfg.scale));
      if (renderer.shadowMap) renderer.shadowMap.enabled = cfg.shadows;
    }
  }

  getSnapshot() {
    return {
      tier: this.tier,
      settings: this.presets[this.tier],
      transitionCount: this.telemetry.length
    };
  }
}

globalThis.phase6DebrisPool = new Phase6DebrisPoolManagerInternal(48);
globalThis.phase6QualityController = new Phase6AdaptiveQualityControllerInternal();

globalThis.phase6SpawnDebris = function phase6SpawnDebris(colorHex, size, x, y, z, vx, vy, vz, rotX, rotY, life) {
  const item = globalThis.phase6DebrisPool.obtain(colorHex, size, x, y, z, vx, vy, vz, rotX, rotY, life);
  if (item && item.mesh && typeof scene !== 'undefined' && scene) {
    if (!item.mesh.parent) scene.add(item.mesh);
  }
  return item;
};

globalThis.getPhase6PerformanceSnapshot = function getPhase6PerformanceSnapshot() {
  return {
    version: PHASE6_PERFORMANCE_BRIDGE_VERSION,
    timestamp: Date.now(),
    debrisPool: globalThis.phase6DebrisPool.getSnapshot(),
    adaptiveQuality: globalThis.phase6QualityController.getSnapshot()
  };
};

window.addEventListener('blur', () => {
  if (typeof globalThis.moveX !== 'undefined') globalThis.moveX = 0;
  if (typeof globalThis.moveZ !== 'undefined') globalThis.moveZ = 0;
});
