// ============================================================================
// [SW:WORLD:008_TORNADO_HERITAGE]
// Recover the strongest July Tornado motion while giving the player-facing
// storm an authored irregular condensation body instead of a visible cylinder.
// The accepted gameplay solver remains untouched. Presentation only.
// ============================================================================
const SW_WORLD_008_TORNADO_HERITAGE_MARKER = 'SW_WORLD_008_TORNADO_HERITAGE_V1';
const SW_WORLD_008_VISUAL_TARGET = 'tornado-visual-dev-reference-v1';

const swWorld008TornadoHeritageState = {
  marker: SW_WORLD_008_TORNADO_HERITAGE_MARKER,
  visualTarget: SW_WORLD_008_VISUAL_TARGET,
  frames: 0,
  tornadoFrames: 0,
  secondaryFrames: 0,
  condensationFrames: 0,
  restoredDebrisFrames: 0,
  atmosphereFrames: 0,
  ribbonFramesDemoted: 0,
  lastActiveStorm: null,
  lastError: null,
};

const SW_WORLD_008_RING_LEVELS = 35;
const SW_WORLD_008_RING_SEGMENTS = 56;

let swWorld008PresentationRoot = null;
let swWorld008CondensationMesh = null;
let swWorld008CondensationSheath = null;
let swWorld008CondensationMaterial = null;
let swWorld008SheathMaterial = null;
let swWorld008CondensationAlpha = null;
let swWorld008SheathAlpha = null;
let swWorld008MistFine = null;
let swWorld008MistBroad = null;
let swWorld008CanopyMist = null;
let swWorld008GroundDust = null;
let swWorld008StormMistTexture = null;
let swWorld008DustMistTexture = null;
const swWorld008PointSeeds = new Map();

function swWorld008ActiveStorm() {
  if (typeof currentStorm !== 'undefined' && currentStorm) return String(currentStorm);
  if (typeof globalThis.getSwWorld007State === 'function') return String(globalThis.getSwWorld007State()?.activeStorm || '');
  return '';
}

function swWorld008Clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function swWorld008Hash(index, salt = 0) {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function swWorld008SetMaterialOpacity(material, opacity) {
  if (!material) return;
  material.transparent = true;
  material.opacity = opacity;
  material.depthWrite = false;
  material.needsUpdate = true;
}

function swWorld008Gaussian(value, center, width) {
  const x = (value - center) / width;
  return Math.exp(-(x * x));
}

function swWorld008Centerline(y, now) {
  const factor = swWorld008Clamp(y / 34, 0, 1);
  const middle = Math.sin(Math.PI * factor);
  const t = now * 0.001;
  return {
    x: Math.sin(t * 0.82 + y * 0.122) * (0.65 + factor * 3.45)
      + Math.sin(t * 0.47 - y * 0.255) * middle * 2.15,
    z: Math.cos(t * 0.69 + y * 0.106) * (0.55 + factor * 2.95)
      + Math.sin(t * 0.41 + y * 0.218) * middle * 1.85,
  };
}

function swWorld008ProfileRadius(factor, now) {
  const t = now * 0.001;
  const base = 1.75 + Math.pow(factor, 1.12) * 7.55;
  const lowerBulge = swWorld008Gaussian(factor, 0.20, 0.12) * 1.65;
  const midPinch = swWorld008Gaussian(factor, 0.47, 0.10) * 2.05;
  const upperShoulder = swWorld008Gaussian(factor, 0.74, 0.18) * 1.70;
  const upperTuck = swWorld008Gaussian(factor, 1.0, 0.105) * 2.35;
  const verticalBreath = Math.sin(factor * 15.0 - t * 0.92) * (0.22 + factor * 0.58)
    + Math.sin(factor * 29.0 + t * 0.57) * 0.24;
  return Math.max(1.05, base + lowerBulge - midPinch + upperShoulder - upperTuck + verticalBreath);
}

function swWorld008RingBreakup(level, factor, now) {
  const t = now * 0.001;
  const coherentBreakup = Math.sin(level * 0.72 + 0.4) * 0.105
    + Math.sin(level * 1.67 - 1.1) * 0.045;
  const lowerPocket = swWorld008Gaussian(factor, 0.16, 0.075) * -0.12;
  const midPocket = swWorld008Gaussian(factor, 0.48, 0.085) * -0.16;
  const upperBurst = swWorld008Gaussian(factor, 0.73, 0.11) * 0.13;
  const breathing = Math.sin(level * 0.43 - t * 0.46) * 0.045;
  return 1 + coherentBreakup + lowerPocket + midPocket + upperBurst + breathing;
}

function swWorld008CreateCondensationAlphaTexture(seedSalt = 0) {
  if (typeof document === 'undefined' || typeof THREE === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = 'rgb(196,196,196)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 54; i += 1) {
    const x = swWorld008Hash(i, seedSalt + 1) * canvas.width;
    const y = swWorld008Hash(i, seedSalt + 2) * canvas.height;
    const radius = 13 + swWorld008Hash(i, seedSalt + 3) * 39;
    const dark = 4 + Math.floor(swWorld008Hash(i, seedSalt + 4) * 34);
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgb(${dark},${dark},${dark})`);
    gradient.addColorStop(0.55, `rgba(${dark},${dark},${dark},0.88)`);
    gradient.addColorStop(1, `rgba(${dark},${dark},${dark},0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  for (let i = 0; i < 42; i += 1) {
    const x = swWorld008Hash(i, seedSalt + 21) * canvas.width;
    const y = swWorld008Hash(i, seedSalt + 22) * canvas.height;
    const radius = 8 + swWorld008Hash(i, seedSalt + 23) * 25;
    const light = 205 + Math.floor(swWorld008Hash(i, seedSalt + 24) * 50);
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(${light},${light},${light},0.82)`);
    gradient.addColorStop(0.5, `rgba(${light},${light},${light},0.44)`);
    gradient.addColorStop(1, `rgba(${light},${light},${light},0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.7, 1.25);
  texture.needsUpdate = true;
  return texture;
}

function swWorld008CreateMistTexture(kind = 'storm') {
  if (typeof document === 'undefined' || typeof THREE === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.clearRect(0, 0, 64, 64);
  const lobes = kind === 'dust'
    ? [[31, 37, 24, 0.68], [18, 38, 19, 0.48], [47, 35, 18, 0.42], [38, 29, 12, 0.28]]
    : [[31, 32, 25, 0.76], [21, 31, 17, 0.50], [43, 29, 18, 0.46], [36, 42, 15, 0.38], [29, 21, 13, 0.32]];
  for (const [x, y, radius, alpha] of lobes) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
    gradient.addColorStop(0.42, `rgba(255,255,255,${alpha * 0.62})`);
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function swWorld008CreateRingGeometry() {
  const vertexCount = SW_WORLD_008_RING_LEVELS * SW_WORLD_008_RING_SEGMENTS;
  const positions = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const colors = new Float32Array(vertexCount * 3);
  const indices = [];

  for (let level = 0; level < SW_WORLD_008_RING_LEVELS; level += 1) {
    const v = level / (SW_WORLD_008_RING_LEVELS - 1);
    for (let segment = 0; segment < SW_WORLD_008_RING_SEGMENTS; segment += 1) {
      const index = level * SW_WORLD_008_RING_SEGMENTS + segment;
      uvs[index * 2] = segment / SW_WORLD_008_RING_SEGMENTS;
      uvs[index * 2 + 1] = v;
      colors[index * 3] = 0.7;
      colors[index * 3 + 1] = 0.74;
      colors[index * 3 + 2] = 0.75;
    }
  }

  for (let level = 0; level < SW_WORLD_008_RING_LEVELS - 1; level += 1) {
    for (let segment = 0; segment < SW_WORLD_008_RING_SEGMENTS; segment += 1) {
      const nextSegment = (segment + 1) % SW_WORLD_008_RING_SEGMENTS;
      const a = level * SW_WORLD_008_RING_SEGMENTS + segment;
      const b = level * SW_WORLD_008_RING_SEGMENTS + nextSegment;
      const c = (level + 1) * SW_WORLD_008_RING_SEGMENTS + segment;
      const d = (level + 1) * SW_WORLD_008_RING_SEGMENTS + nextSegment;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function swWorld008CreatePointField(name, count, size, opacity, color, texture, seedSalt) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  const material = new THREE.PointsMaterial({
    color,
    size,
    map: texture,
    transparent: true,
    opacity,
    alphaTest: 0.02,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geometry, material);
  points.name = name;
  points.frustumCulled = false;
  const seeds = [];
  for (let i = 0; i < count; i += 1) {
    seeds.push({
      a: swWorld008Hash(i, seedSalt + 1),
      b: swWorld008Hash(i, seedSalt + 2),
      c: swWorld008Hash(i, seedSalt + 3),
      d: swWorld008Hash(i, seedSalt + 4),
    });
  }
  swWorld008PointSeeds.set(points, seeds);
  return points;
}

function swWorld008EnsurePresentation() {
  if (swWorld008PresentationRoot || typeof THREE === 'undefined' || typeof tornadoGroup === 'undefined' || !tornadoGroup) return;

  swWorld008StormMistTexture = swWorld008CreateMistTexture('storm');
  swWorld008DustMistTexture = swWorld008CreateMistTexture('dust');
  swWorld008CondensationAlpha = swWorld008CreateCondensationAlphaTexture(71);
  swWorld008SheathAlpha = swWorld008CreateCondensationAlphaTexture(97);

  swWorld008PresentationRoot = new THREE.Group();
  swWorld008PresentationRoot.name = 'SWWorld008PresentationRoot';

  const condensationGeometry = swWorld008CreateRingGeometry();
  swWorld008CondensationMaterial = new THREE.MeshStandardMaterial({
    color: '#626d70',
    roughness: 1.0,
    metalness: 0.0,
    transparent: false,
    opacity: 1.0,
    alphaMap: swWorld008CondensationAlpha,
    alphaTest: 0.055,
    bumpMap: swWorld008CondensationAlpha,
    bumpScale: 1.25,
    vertexColors: true,
    depthWrite: true,
    side: THREE.FrontSide,
  });
  swWorld008CondensationMesh = new THREE.Mesh(condensationGeometry, swWorld008CondensationMaterial);
  swWorld008CondensationMesh.name = 'SWWorld008IrregularCondensationCore';
  swWorld008CondensationMesh.frustumCulled = false;

  swWorld008SheathMaterial = new THREE.MeshStandardMaterial({
    color: '#86969a',
    roughness: 1.0,
    metalness: 0.0,
    transparent: true,
    opacity: 0.07,
    alphaMap: swWorld008SheathAlpha,
    alphaTest: 0.025,
    depthWrite: false,
    side: THREE.FrontSide,
  });
  swWorld008CondensationSheath = new THREE.Mesh(condensationGeometry, swWorld008SheathMaterial);
  swWorld008CondensationSheath.name = 'SWWorld008IrregularCondensationSheath';
  swWorld008CondensationSheath.scale.set(1.10, 1.015, 1.10);
  swWorld008CondensationSheath.frustumCulled = false;

  const mobile = typeof isMobileDevice !== 'undefined' && isMobileDevice;
  swWorld008MistFine = swWorld008CreatePointField(
    'SWWorld008MistFine', mobile ? 90 : 130, mobile ? 3.8 : 4.6, 0.10, '#657277', swWorld008StormMistTexture, 11,
  );
  swWorld008MistBroad = swWorld008CreatePointField(
    'SWWorld008MistBroad', mobile ? 42 : 62, mobile ? 5.8 : 6.8, 0.045, '#778286', swWorld008StormMistTexture, 23,
  );
  swWorld008CanopyMist = swWorld008CreatePointField(
    'SWWorld008CanopyMist', mobile ? 54 : 76, mobile ? 3.6 : 4.4, 0.075, '#374247', swWorld008StormMistTexture, 37,
  );
  swWorld008GroundDust = swWorld008CreatePointField(
    'SWWorld008GroundDust', mobile ? 132 : 168, mobile ? 1.75 : 2.15, 0.14, '#654b34', swWorld008DustMistTexture, 51,
  );

  swWorld008PresentationRoot.add(
    swWorld008CondensationSheath,
    swWorld008CondensationMesh,
    swWorld008MistFine,
    swWorld008MistBroad,
    swWorld008CanopyMist,
    swWorld008GroundDust,
  );
  tornadoGroup.add(swWorld008PresentationRoot);
}

function swWorld008UpdateCondensation(now) {
  if (!swWorld008CondensationMesh) return;
  const positions = swWorld008CondensationMesh.geometry?.attributes?.position;
  const colors = swWorld008CondensationMesh.geometry?.attributes?.color;
  if (!positions) return;
  const t = now * 0.001;

  for (let level = 0; level < SW_WORLD_008_RING_LEVELS; level += 1) {
    const factor = level / (SW_WORLD_008_RING_LEVELS - 1);
    const yBase = factor * 34.0;
    const center = swWorld008Centerline(yBase, now);
    const profile = swWorld008ProfileRadius(factor, now) * swWorld008RingBreakup(level, factor, now);
    const middle = Math.sin(Math.PI * factor);
    const ringTwist = t * (0.32 + factor * 0.42) + factor * 1.55;

    for (let segment = 0; segment < SW_WORLD_008_RING_SEGMENTS; segment += 1) {
      const index = level * SW_WORLD_008_RING_SEGMENTS + segment;
      const angleBase = (segment / SW_WORLD_008_RING_SEGMENTS) * Math.PI * 2;
      const angle = angleBase + ringTwist;
      const asymmetry = 1
        + Math.sin(angle * 3.0 + factor * 7.0 + t * 0.88) * 0.18
        + Math.sin(angle * 5.0 - factor * 11.0 - t * 0.57) * 0.10
        + Math.sin(angle * 2.0 + factor * 18.0 + t * 0.36) * 0.065;
      const localLobe = Math.sin(angle - factor * 5.2 + t * 0.29) * middle * 1.10;
      const radius = Math.max(0.95, profile * asymmetry + localLobe);
      const yRipple = Math.sin(angle * 2.0 + factor * 21.0 - t * 1.15) * middle * 0.27;
      positions.setXYZ(
        index,
        center.x + Math.cos(angle) * radius,
        yBase + yRipple,
        center.z + Math.sin(angle) * radius,
      );
      if (colors) {
        const pocket = Math.sin(angle * 2.0 - factor * 17.0 + t * 0.35) * 0.24
          + Math.sin(angle * 5.0 + factor * 9.0 - t * 0.51) * 0.15
          + (swWorld008Hash(level * SW_WORLD_008_RING_SEGMENTS + segment, 201) - 0.5) * 0.18;
        const shade = swWorld008Clamp(0.58 + pocket - swWorld008Gaussian(factor, 0.49, 0.09) * 0.14, 0.18, 0.94);
        colors.setXYZ(index, shade * 0.84, shade * 0.91, shade * 0.93);
      }
    }
  }

  positions.needsUpdate = true;
  if (colors) colors.needsUpdate = true;
  swWorld008CondensationMesh.geometry.computeVertexNormals();
  swWorld008CondensationMesh.geometry.computeBoundingSphere();

  if (swWorld008CondensationAlpha) {
    swWorld008CondensationAlpha.offset.x = (t * 0.015) % 1;
    swWorld008CondensationAlpha.offset.y = (t * -0.022) % 1;
  }
  if (swWorld008SheathAlpha) {
    swWorld008SheathAlpha.offset.x = (0.37 + t * -0.011) % 1;
    swWorld008SheathAlpha.offset.y = (0.19 + t * 0.017) % 1;
  }

  swWorld008TornadoHeritageState.condensationFrames += 1;
}

function swWorld008UpdateFunnelMist(points, now, broad = false) {
  if (!points) return;
  const positions = points.geometry?.attributes?.position;
  const seeds = swWorld008PointSeeds.get(points) || [];
  if (!positions) return;
  const t = now * 0.001;
  for (let i = 0; i < positions.count; i += 1) {
    const seed = seeds[i];
    const y = 1.8 + seed.a * 32.2;
    const factor = y / 34.0;
    const center = swWorld008Centerline(y, now);
    const coreRadius = swWorld008ProfileRadius(factor, now);
    const jitter = (seed.b - 0.5) * (broad ? 5.8 : 3.0);
    const radius = Math.max(1.15, coreRadius + jitter + Math.sin(t * (0.6 + seed.c) + seed.d * 9) * 0.9);
    const angle = seed.b * Math.PI * 2 + t * (0.18 + seed.c * 0.29) + y * (broad ? 0.105 : 0.138);
    positions.setXYZ(
      i,
      center.x + Math.cos(angle) * radius,
      y + (seed.d - 0.5) * (broad ? 2.4 : 1.4),
      center.z + Math.sin(angle) * radius,
    );
  }
  positions.needsUpdate = true;
}

function swWorld008UpdateCanopy(now) {
  if (!swWorld008CanopyMist) return;
  const positions = swWorld008CanopyMist.geometry?.attributes?.position;
  const seeds = swWorld008PointSeeds.get(swWorld008CanopyMist) || [];
  if (!positions) return;
  const t = now * 0.001;
  const center = swWorld008Centerline(33.0, now);
  for (let i = 0; i < positions.count; i += 1) {
    const seed = seeds[i];
    const radius = 2.4 + seed.a * 7.6;
    const angle = seed.b * Math.PI * 2 + t * (0.05 + seed.c * 0.07);
    const lobe = Math.sin(angle * 3.0 + seed.d * 5.0) * 1.7;
    const y = 30.5 + seed.c * 5.8 + lobe - radius * 0.06;
    positions.setXYZ(
      i,
      center.x + Math.cos(angle) * radius * (0.82 + seed.d * 0.31),
      y,
      center.z + Math.sin(angle) * radius * (0.62 + seed.a * 0.28),
    );
  }
  positions.needsUpdate = true;
}

function swWorld008UpdateGroundDust(now) {
  if (!swWorld008GroundDust) return;
  const positions = swWorld008GroundDust.geometry?.attributes?.position;
  const seeds = swWorld008PointSeeds.get(swWorld008GroundDust) || [];
  if (!positions) return;
  const t = now * 0.001;
  const center = swWorld008Centerline(1.2, now);
  for (let i = 0; i < positions.count; i += 1) {
    const seed = seeds[i];
    const lane = i % 3;
    const radius = 1.6 + seed.a * (lane === 0 ? 5.2 : lane === 1 ? 7.4 : 9.1)
      + Math.sin(t * 0.88 + seed.c * 9) * 0.55;
    const direction = lane === 1 ? -1 : 1;
    const angle = seed.b * Math.PI * 2 + t * direction * (0.48 + seed.c * 0.44);
    positions.setXYZ(
      i,
      center.x + Math.cos(angle) * radius * (1.0 + seed.c * 0.24),
      0.25 + seed.d * (lane === 2 ? 1.8 : 1.25) + Math.sin(t * 1.4 + seed.a * 8) * 0.20,
      center.z + Math.sin(angle) * radius * (0.62 + seed.a * 0.18),
    );
  }
  positions.needsUpdate = true;
}

function swWorld008StyleLegacySurfaces() {
  if (typeof funnelMesh !== 'undefined' && funnelMesh) funnelMesh.visible = false;
  if (typeof outerFunnelMesh !== 'undefined' && outerFunnelMesh) outerFunnelMesh.visible = false;
  if (typeof mesoCloudGroup !== 'undefined' && mesoCloudGroup) mesoCloudGroup.visible = false;
  if (typeof dustBowlGroup !== 'undefined' && dustBowlGroup) dustBowlGroup.visible = false;

  if (typeof particleSystem !== 'undefined' && particleSystem) {
    particleSystem.visible = false;
    particleSystem.scale.set(0.72, 1.0, 0.72);
    if (typeof particleMat !== 'undefined' && particleMat) {
      particleMat.vertexColors = true;
      particleMat.map = swWorld008DustMistTexture || particleMat.map;
      particleMat.alphaTest = 0.035;
      particleMat.sizeAttenuation = true;
      particleMat.size = (typeof isMobileDevice !== 'undefined' && isMobileDevice) ? 0.28 : 0.36;
      swWorld008SetMaterialOpacity(particleMat, 0.10);
      particleMat.needsUpdate = true;
    }
    swWorld008TornadoHeritageState.restoredDebrisFrames += 1;
  }
}

function swWorld008UpdatePresentation(now) {
  swWorld008EnsurePresentation();
  if (!swWorld008PresentationRoot) return;
  swWorld008PresentationRoot.visible = true;
  swWorld008StyleLegacySurfaces();
  swWorld008UpdateCondensation(now);
  swWorld008UpdateFunnelMist(swWorld008MistFine, now, false);
  swWorld008UpdateFunnelMist(swWorld008MistBroad, now, true);
  swWorld008UpdateCanopy(now);
  swWorld008UpdateGroundDust(now);

  const neon = typeof neonFunnelUnlocked !== 'undefined' && Boolean(neonFunnelUnlocked);
  if (swWorld008CondensationMaterial) {
    swWorld008CondensationMaterial.color.set(neon ? '#256a75' : '#626d70');
    swWorld008CondensationMaterial.emissive?.set?.(neon ? '#0c3540' : '#000000');
    if ('emissiveIntensity' in swWorld008CondensationMaterial) swWorld008CondensationMaterial.emissiveIntensity = neon ? 0.34 : 0.0;
  }
  if (swWorld008SheathMaterial) swWorld008SheathMaterial.color.set(neon ? '#7ce2ee' : '#86969a');
  if (swWorld008MistFine?.material) swWorld008MistFine.material.color.set(neon ? '#69dbea' : '#96a5a9');
  if (swWorld008MistBroad?.material) swWorld008MistBroad.material.color.set(neon ? '#a5eef4' : '#b4bec0');
  swWorld008TornadoHeritageState.atmosphereFrames += 1;
}

function swWorld008DemoteRibbonReplacement() {
  if (typeof swVisualHeroSlice6StormRoot === 'undefined' || !swVisualHeroSlice6StormRoot) return;
  swVisualHeroSlice6StormRoot.visible = true;
  let demoted = false;
  swVisualHeroSlice6StormRoot.children.forEach((object) => {
    if (!object?.material) return;
    if (
      object.name?.startsWith('SWVisualSlice6StormShell')
      || object.name?.startsWith('SWVisualSlice6CondensationStreak')
      || object.name?.startsWith('SWVisualSlice6EdgeWisp')
      || object.name?.startsWith('SWVisualSlice6GroundPull')
    ) {
      object.visible = false;
      if (object.material) swWorld008SetMaterialOpacity(object.material, 0.01);
      demoted = true;
    }
  });
  if (demoted) swWorld008TornadoHeritageState.ribbonFramesDemoted += 1;
}

function swWorld008SuppressForSecondary() {
  if (typeof tornadoGroup !== 'undefined' && tornadoGroup) tornadoGroup.visible = false;
  if (typeof funnelMesh !== 'undefined' && funnelMesh) funnelMesh.visible = false;
  if (typeof outerFunnelMesh !== 'undefined' && outerFunnelMesh) outerFunnelMesh.visible = false;
  if (typeof particleSystem !== 'undefined' && particleSystem) particleSystem.visible = false;
  if (typeof dustBowlGroup !== 'undefined' && dustBowlGroup) dustBowlGroup.visible = false;
  if (swWorld008PresentationRoot) swWorld008PresentationRoot.visible = false;
  if (typeof swVisualHeroSlice6StormRoot !== 'undefined' && swVisualHeroSlice6StormRoot) swVisualHeroSlice6StormRoot.visible = false;
}

function swWorld008SyncTornadoHeritage(now = (typeof performance !== 'undefined' ? performance.now() : Date.now())) {
  try {
    const activeStorm = swWorld008ActiveStorm();
    swWorld008TornadoHeritageState.frames += 1;
    swWorld008TornadoHeritageState.lastActiveStorm = activeStorm;
    const tornadoActive = activeStorm === 'tornado' || activeStorm === '';
    if (!tornadoActive) {
      swWorld008TornadoHeritageState.secondaryFrames += 1;
      swWorld008SuppressForSecondary();
      return true;
    }

    swWorld008TornadoHeritageState.tornadoFrames += 1;
    if (typeof tornadoGroup !== 'undefined' && tornadoGroup) tornadoGroup.visible = true;
    swWorld008UpdatePresentation(now);
    swWorld008DemoteRibbonReplacement();
    return true;
  } catch (error) {
    swWorld008TornadoHeritageState.lastError = String(error?.message || error);
    return false;
  }
}

const swWorld008VisualBridgeBase = globalThis.__SW_THREEJS_VISUAL_FOUNDATION__;
const swWorld008VisualUpdateBase = swWorld008VisualBridgeBase?.update;
const swWorld008PrepareQaBase = swWorld008VisualBridgeBase?.prepareQaView;

function swWorld008VisualUpdate(dt, now) {
  const result = typeof swWorld008VisualUpdateBase === 'function'
    ? swWorld008VisualUpdateBase(dt, now)
    : true;
  swWorld008SyncTornadoHeritage(now);
  return result;
}

function swWorld008PrepareQaView(mode) {
  const result = typeof swWorld008PrepareQaBase === 'function'
    ? swWorld008PrepareQaBase(mode)
    : false;
  swWorld008SyncTornadoHeritage();
  if (typeof renderer !== 'undefined' && typeof scene !== 'undefined' && typeof camera !== 'undefined') renderer.render(scene, camera);
  return result;
}

if (swWorld008VisualBridgeBase) {
  globalThis.__SW_THREEJS_VISUAL_FOUNDATION__ = Object.freeze({
    ...swWorld008VisualBridgeBase,
    update: swWorld008VisualUpdate,
    prepareQaView: swWorld008PrepareQaView,
    tornadoHeritageVersion: SW_WORLD_008_TORNADO_HERITAGE_MARKER,
  });
}

globalThis.getSwWorld008TornadoHeritageState = function getSwWorld008TornadoHeritageState() {
  const ribbon = { streaks: 0, visibleStreaks: 0, wisps: 0, visibleWisps: 0, groundPulls: 0, visibleGroundPulls: 0 };
  if (typeof swVisualHeroSlice6StormRoot !== 'undefined' && swVisualHeroSlice6StormRoot) {
    swVisualHeroSlice6StormRoot.children.forEach((object) => {
      if (object.name?.startsWith('SWVisualSlice6CondensationStreak')) {
        ribbon.streaks += 1;
        if (object.visible) ribbon.visibleStreaks += 1;
      }
      if (object.name?.startsWith('SWVisualSlice6EdgeWisp')) {
        ribbon.wisps += 1;
        if (object.visible) ribbon.visibleWisps += 1;
      }
      if (object.name?.startsWith('SWVisualSlice6GroundPull')) {
        ribbon.groundPulls += 1;
        if (object.visible) ribbon.visibleGroundPulls += 1;
      }
    });
  }
  const condensationGeometry = swWorld008CondensationMesh?.geometry;
  return Object.freeze({
    ...swWorld008TornadoHeritageState,
    legacy: Object.freeze({
      tornadoGroupVisible: typeof tornadoGroup !== 'undefined' && Boolean(tornadoGroup?.visible),
      funnelVisible: typeof funnelMesh !== 'undefined' && Boolean(funnelMesh?.visible),
      outerVisible: typeof outerFunnelMesh !== 'undefined' && Boolean(outerFunnelMesh?.visible),
      debrisVisible: typeof particleSystem !== 'undefined' && Boolean(particleSystem?.visible),
      debrisOpacity: typeof particleMat !== 'undefined' ? Number(particleMat?.opacity || 0) : null,
      dustVisible: typeof dustBowlGroup !== 'undefined' && Boolean(dustBowlGroup?.visible),
      canopyVisible: typeof mesoCloudGroup !== 'undefined' && Boolean(mesoCloudGroup?.visible),
    }),
    condensation: Object.freeze({
      rootVisible: Boolean(swWorld008PresentationRoot?.visible),
      coreVisible: Boolean(swWorld008CondensationMesh?.visible),
      sheathVisible: Boolean(swWorld008CondensationSheath?.visible),
      vertexCount: Number(condensationGeometry?.attributes?.position?.count || 0),
      triangleCount: Number((condensationGeometry?.index?.count || 0) / 3),
      coreOpacity: Number(swWorld008CondensationMaterial?.opacity || 0),
      sheathOpacity: Number(swWorld008SheathMaterial?.opacity || 0),
      alphaTest: Number(swWorld008CondensationMaterial?.alphaTest || 0),
      ringBreakupRange: Object.freeze([0.70, 1.30]),
      centerlineOffsetScale: 2.15,
    }),
    atmosphere: Object.freeze({
      finePoints: Number(swWorld008MistFine?.geometry?.attributes?.position?.count || 0),
      broadPoints: Number(swWorld008MistBroad?.geometry?.attributes?.position?.count || 0),
      canopyPoints: Number(swWorld008CanopyMist?.geometry?.attributes?.position?.count || 0),
      dustPoints: Number(swWorld008GroundDust?.geometry?.attributes?.position?.count || 0),
      dustMotionLanes: 3,
      canopyRadiusMax: 10.0,
      drawFields: [swWorld008MistFine, swWorld008MistBroad, swWorld008CanopyMist, swWorld008GroundDust].filter(Boolean).length,
    }),
    ribbon: Object.freeze(ribbon),
    presentationOnly: true,
  });
};

swWorld008SyncTornadoHeritage();
// [SW:WORLD:008_TORNADO_HERITAGE:END]
