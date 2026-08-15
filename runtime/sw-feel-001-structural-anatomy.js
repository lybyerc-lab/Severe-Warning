// ============================================================================
// [SW:FEEL:001_STRUCTURAL_ANATOMY]
// Director correction for rejected generic-chunk destruction presentation.
// Adds readable roof/wall/facade failure panels to the existing authoritative
// lethal-destruction event. Presentation only; gameplay truth is untouched.
// ============================================================================
const SW_FEEL_001_STRUCTURAL_ANATOMY_MARKER = 'SW_FEEL_001_STRUCTURAL_ANATOMY_V1';

const swFeel001AnatomyState = {
  marker: SW_FEEL_001_STRUCTURAL_ANATOMY_MARKER,
  events: 0,
  panelsSpawned: 0,
  lastKind: null,
  lastFamily: null,
};

function swFeel001AnatomyClamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function swFeel001EnsureAnatomyGeometries() {
  swFeel001InitGeometriesAndMaterials();
  if (!swFeel001Geometries.roofPanel) {
    swFeel001Geometries.roofPanel = new THREE.BoxGeometry(4.8, 0.34, 4.8);
    swFeel001Geometries.roofPanel.userData.swWorld007Owned = false;
    swFeel001Geometries.roofPanel.userData.swFeel001Owned = true;
  }
  if (!swFeel001Geometries.wallPanel) {
    swFeel001Geometries.wallPanel = new THREE.BoxGeometry(0.34, 4.2, 4.8);
    swFeel001Geometries.wallPanel.userData.swWorld007Owned = false;
    swFeel001Geometries.wallPanel.userData.swFeel001Owned = true;
  }
  if (!swFeel001Geometries.facadePanel) {
    swFeel001Geometries.facadePanel = new THREE.BoxGeometry(4.8, 3.7, 0.34);
    swFeel001Geometries.facadePanel.userData.swWorld007Owned = false;
    swFeel001Geometries.facadePanel.userData.swFeel001Owned = true;
  }
}

function swFeel001AnatomyMaterials(family) {
  if (family === 'masonry' || family === 'concrete') {
    return {
      roof: swFeel001Materials.mortar,
      wall: swFeel001Materials.masonry,
      facade: swFeel001Materials.mortar,
    };
  }
  if (family === 'glass') {
    return {
      roof: swFeel001Materials.metal,
      wall: swFeel001Materials.mortar,
      facade: swFeel001Materials.glass,
    };
  }
  if (family === 'metal' || family === 'silo') {
    return {
      roof: swFeel001Materials.metal,
      wall: swFeel001Materials.metal,
      facade: swFeel001Materials.metal,
    };
  }
  return {
    roof: swFeel001Materials.shingle,
    wall: swFeel001Materials.wood,
    facade: swFeel001Materials.wood,
  };
}

const swFeel001AnatomyOriginalSpawn = swFeel001SpawnDebrisFragment;
swFeel001SpawnDebrisFragment = function swFeel001SpawnDebrisFragmentScaleSafe(...args) {
  const entry = swFeel001AnatomyOriginalSpawn(...args);
  if (entry?.mesh) entry.mesh.scale.set(1, 1, 1);
  return entry;
};

function swFeel001SpawnAnatomyPanel({
  x, y, z, vx, vy, vz, geometry, material, life, scaleX, scaleY, scaleZ,
  rotationX = 0, rotationY = 0, rotationZ = 0,
  rotX = 0, rotY = 0, rotZ = 0,
}) {
  const entry = swFeel001SpawnDebrisFragment(x, y, z, vx, vy, vz, geometry, material, life);
  if (!entry) return null;
  entry.mesh.scale.set(scaleX, scaleY, scaleZ);
  entry.mesh.rotation.set(rotationX, rotationY, rotationZ);
  entry.rotX = rotX;
  entry.rotY = rotY;
  entry.rotZ = rotZ;
  entry.bounced = false;
  swFeel001AnatomyState.panelsSpawned += 1;
  return entry;
}

function swFeel001PresentStructuralAnatomy(target) {
  if (!target || target.isTree || target.isCow) return;
  swFeel001EnsureAnatomyGeometries();

  const family = swFeel001GetMaterialFamily(target);
  const mats = swFeel001AnatomyMaterials(family);
  const x = Number(target.x || 0);
  const z = Number(target.z || 0);
  const groundY = typeof terrainHeightAt === 'function' ? terrainHeightAt(x, z) : 0;
  const footprint = swFeel001AnatomyClamp(Number(target.meshData?.footprint || 6), 4.5, 14);
  const kind = String(target.kind || '').toLowerCase();
  const tall = kind.includes('apartment') || kind.includes('office') || kind.includes('warehouse') || footprint > 9;
  const height = tall ? 7.5 : 5.2;
  const panelScale = swFeel001AnatomyClamp(footprint / 6.2, 0.75, 1.8);

  const stormX = (typeof storm !== 'undefined' && storm?.pos) ? storm.pos.x : x - 1;
  const stormZ = (typeof storm !== 'undefined' && storm?.pos) ? storm.pos.z : z - 1;
  const dx = x - stormX;
  const dz = z - stormZ;
  const dist = Math.hypot(dx, dz) || 1;
  const radX = dx / dist;
  const radZ = dz / dist;
  const tanX = -radZ;
  const tanZ = radX;

  // Roof peels upward and downwind first, preserving a recognizable roof slab.
  swFeel001SpawnAnatomyPanel({
    x: x + tanX * 0.8,
    y: groundY + height,
    z: z + tanZ * 0.8,
    vx: radX * 11 + tanX * 5,
    vy: 10.5,
    vz: radZ * 11 + tanZ * 5,
    geometry: swFeel001Geometries.roofPanel,
    material: mats.roof,
    life: 2.35,
    scaleX: panelScale,
    scaleY: 1,
    scaleZ: panelScale,
    rotationX: -0.12,
    rotationY: Math.atan2(radX, radZ),
    rotationZ: 0.08,
    rotX: -1.8,
    rotY: 0.8,
    rotZ: 1.2,
  });

  // Two wall sections fail in different directions so the structure reads as
  // opening up rather than instantly becoming loose confetti.
  swFeel001SpawnAnatomyPanel({
    x: x - footprint * 0.18,
    y: groundY + height * 0.46,
    z,
    vx: radX * 7 - tanX * 5,
    vy: 5.5,
    vz: radZ * 7 - tanZ * 5,
    geometry: swFeel001Geometries.wallPanel,
    material: mats.wall,
    life: 2.55,
    scaleX: panelScale,
    scaleY: tall ? 1.35 : 1,
    scaleZ: panelScale,
    rotationY: 0,
    rotX: 1.9,
    rotY: 0.4,
    rotZ: -1.2,
  });

  swFeel001SpawnAnatomyPanel({
    x: x + footprint * 0.18,
    y: groundY + height * 0.46,
    z,
    vx: radX * 7 + tanX * 5,
    vy: 5.2,
    vz: radZ * 7 + tanZ * 5,
    geometry: swFeel001Geometries.wallPanel,
    material: mats.wall,
    life: 2.45,
    scaleX: panelScale,
    scaleY: tall ? 1.35 : 1,
    scaleZ: panelScale,
    rotationY: Math.PI,
    rotX: -1.7,
    rotY: -0.5,
    rotZ: 1.1,
  });

  // Front/facade panel kicks forward and rotates down, carrying material identity.
  swFeel001SpawnAnatomyPanel({
    x,
    y: groundY + height * 0.43,
    z: z + footprint * 0.17,
    vx: radX * 8 + tanX * 2,
    vy: 6.2,
    vz: radZ * 8 + tanZ * 2,
    geometry: swFeel001Geometries.facadePanel,
    material: mats.facade,
    life: 2.4,
    scaleX: panelScale,
    scaleY: tall ? 1.3 : 1,
    scaleZ: 1,
    rotationY: Math.atan2(radX, radZ),
    rotX: 2.1,
    rotY: 0.5,
    rotZ: 0.7,
  });

  // Extra low dust follows the larger anatomy failure without adding gameplay force.
  for (let i = 0; i < 4; i++) {
    const a = i * (Math.PI * 0.5) + 0.35;
    swFeel001SpawnDustPuff(
      x + Math.cos(a) * footprint * 0.18,
      groundY + 0.7,
      z + Math.sin(a) * footprint * 0.18,
      Math.cos(a) * 4 + tanX * 2.5,
      1.4 + i * 0.25,
      Math.sin(a) * 4 + tanZ * 2.5,
      0.95
    );
  }

  swFeel001AnatomyState.events += 1;
  swFeel001AnatomyState.lastKind = kind || 'unknown';
  swFeel001AnatomyState.lastFamily = family;
}

const swFeel001AnatomyOriginalPresentation = swFeel001PresentDestruction;
swFeel001PresentDestruction = function swFeel001PresentDestructionWithAnatomy(target, source = 'storm') {
  swFeel001AnatomyOriginalPresentation(target, source);
  try {
    swFeel001PresentStructuralAnatomy(target);
  } catch (error) {
    console.warn('SW-FEEL-001 structural anatomy presentation error:', error);
  }
};

const swFeel001AnatomyOriginalState = globalThis.getSwFeel001State;
globalThis.getSwFeel001State = function getSwFeel001StateWithAnatomy() {
  const base = swFeel001AnatomyOriginalState();
  return {
    ...base,
    structuralAnatomy: { ...swFeel001AnatomyState },
  };
};

globalThis.getSwFeel001StructuralAnatomyState = function getSwFeel001StructuralAnatomyState() {
  return Object.freeze({ ...swFeel001AnatomyState });
};
// [SW:FEEL:001_STRUCTURAL_ANATOMY:END]
