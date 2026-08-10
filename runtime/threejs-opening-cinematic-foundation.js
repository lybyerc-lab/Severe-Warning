// ============================================================================
// [SW:CINEMATIC:MOO_BREW_FOUNDATION]
// Presentation-only actor, prop, composition, and timeline foundation.
// Mount into an existing Three.js scene during a later cinematic integration.
// It deliberately creates neither a renderer nor a scene and owns no gameplay state.
// ============================================================================
(function installMooBrewOpeningFoundation(globalScope) {
  'use strict';

  const VERSION = 'SW_CIN_002_ACTING_POLISH_V1';
  const SHOTS = Object.freeze({
    'fence-conversation': Object.freeze({
      beat: 'fence-conversation',
      time: 0.8,
      camera: Object.freeze({ position: [12.4, 8.1, 17.6], target: [0.2, 3.3, 0.2], fov: 37 }),
    }),
    'double-take': Object.freeze({
      beat: 'double-take',
      time: 6.35,
      camera: Object.freeze({ position: [10.8, 7.3, 15.2], target: [0.15, 4.1, 0.45], fov: 33 }),
    }),
    'last-sip-setup': Object.freeze({
      beat: 'last-sip-setup',
      time: 8.65,
      camera: Object.freeze({ position: [7.1, 6.0, 11.5], target: [0.85, 4.45, 0.92], fov: 30 }),
    }),
  });

  const TIMELINE = Object.freeze([
    Object.freeze({ id: 'fence-conversation', start: 0.0, end: 2.55, description: 'Relaxed Cow 17 and chicken conversation.' }),
    Object.freeze({ id: 'first-chicken-noticing', start: 2.55, end: 4.25, description: 'One chicken recognizes the weather shift first.' }),
    Object.freeze({ id: 'cow-delayed-turn', start: 4.25, end: 6.15, description: 'Cow 17 keeps sipping, then begins to turn.' }),
    Object.freeze({ id: 'double-take', start: 6.15, end: 8.0, description: 'Slow double take lands through head, ears, and weight shift.' }),
    Object.freeze({ id: 'last-sip-setup', start: 8.0, end: 10.0, description: 'One last ill-advised sip; cup logo is camera-ready.' }),
    Object.freeze({ id: 'escape-transition', start: 10.0, end: 12.0, description: 'Reserved pose transition toward later cup drop and escape.' }),
  ]);

  function requireThree() {
    if (!globalScope.THREE) throw new Error('SW-CIN-001 requires the existing global Three.js runtime.');
    return globalScope.THREE;
  }

  function clamp(value, low, high) {
    return Math.max(low, Math.min(high, value));
  }

  function ease(value) {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  }

  function createLabelMaterial(THREE, title, subtitle) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    context.fillStyle = '#fff7e6';
    context.fillRect(0, 0, 512, 512);
    context.fillStyle = '#7c2d12';
    context.fillRect(0, 0, 512, 92);
    context.fillStyle = '#f59e0b';
    context.fillRect(0, 92, 512, 26);
    context.fillStyle = '#7c2d12';
    context.textAlign = 'center';
    context.font = '900 96px Arial, sans-serif';
    context.fillText(title, 256, 265);
    context.font = '800 31px Arial, sans-serif';
    context.fillText(subtitle, 256, 335);
    context.fillStyle = '#b45309';
    context.font = '800 20px Arial, sans-serif';
    context.fillText('FARM FRESH. STORM TESTED.', 256, 408);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    material.userData.swCinematicOwnMaterial = true;
    return material;
  }

  function createPalette(THREE) {
    const make = (color, roughness = 0.78, metalness = 0.02) => {
      const material = new THREE.MeshStandardMaterial({ color, roughness, metalness });
      material.userData.swCinematicOwnMaterial = true;
      return material;
    };
    return Object.freeze({
      cream: make('#f5eedc', 0.88),
      charcoal: make('#202329', 0.78),
      brown: make('#6b4226', 0.92),
      woodLight: make('#b77945', 0.9),
      woodDark: make('#603d26', 0.92),
      pink: make('#e9a1a8', 0.82),
      horn: make('#e6cf99', 0.86),
      hoof: make('#28201c', 0.92),
      orange: make('#f28c28', 0.72),
      red: make('#a7332f', 0.82),
      yellow: make('#f6c445', 0.75),
      white: make('#fff7e6', 0.84),
      black: make('#1d2028', 0.82),
      grass: make('#527441', 0.96),
    });
  }

  function createGeometry(THREE) {
    return Object.freeze({
      box: new THREE.BoxGeometry(1, 1, 1),
      sphere: new THREE.SphereGeometry(0.5, 12, 8),
      cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 12),
      cone: new THREE.ConeGeometry(0.5, 1, 10),
      plane: new THREE.PlaneGeometry(1, 1),
    });
  }

  function part(THREE, parent, geometry, material, name, position, scale, rotation) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(position[0], position[1], position[2]);
    mesh.scale.set(scale[0], scale[1], scale[2]);
    if (rotation) mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.swCinematicPart = true;
    parent.add(mesh);
    return mesh;
  }

  function pivot(THREE, parent, name, position) {
    const group = new THREE.Group();
    group.name = name;
    group.position.set(position[0], position[1], position[2]);
    group.userData.swCinematicPivot = true;
    parent.add(group);
    return group;
  }

  function createCup(THREE, geometry, palette) {
    const root = new THREE.Group();
    root.name = 'MooBrewCup';
    part(THREE, root, geometry.cylinder, palette.white, 'moo-brew-cup-body', [0, 0, 0], [0.58, 1.52, 0.58]);
    part(THREE, root, geometry.cylinder, palette.brown, 'moo-brew-cup-lid', [0, 0.8, 0], [0.62, 0.13, 0.62]);
    part(THREE, root, geometry.cylinder, palette.charcoal, 'moo-brew-coffee', [0, 0.9, 0], [0.49, 0.05, 0.49]);
    const label = part(THREE, root, geometry.plane, createLabelMaterial(THREE, 'MOO', 'BREW'), 'moo-brew-logo', [0, 0.05, 0.59], [0.9, 0.9, 1]);
    root.userData.cinematicRole = 'moo-brew-cup';
    root.userData.logo = label;
    root.userData.presentForCamera = function presentForCamera(camera) {
      if (!camera) return;
      label.lookAt(camera.position);
    };
    return root;
  }

  function createCow17Rig(THREE, geometry, palette) {
    const root = new THREE.Group();
    root.name = 'Cow17CinematicRig';
    root.userData.cinematicRole = 'cow17-presentation-rig';
    const hips = pivot(THREE, root, 'cow17-hips', [0, 2.6, 0]);
    part(THREE, hips, geometry.box, palette.cream, 'cow17-hips-mass', [0, 0, 0], [1.7, 1.05, 0.86]);
    part(THREE, hips, geometry.sphere, palette.charcoal, 'cow17-hips-front-patch', [0.34, 0.02, 0.47], [0.56, 0.42, 0.07]);
    const torso = pivot(THREE, hips, 'cow17-torso', [0, 0.45, 0]);
    part(THREE, torso, geometry.box, palette.cream, 'cow17-torso-mass', [0, 1.0, 0], [2.05, 2.15, 1.1]);
    part(THREE, torso, geometry.box, palette.charcoal, 'cow17-torso-spot-left', [-1.04, 1.15, 0.15], [0.09, 0.72, 0.54]);
    part(THREE, torso, geometry.box, palette.charcoal, 'cow17-torso-spot-right', [1.04, 0.62, -0.08], [0.09, 0.62, 0.48]);
    part(THREE, torso, geometry.sphere, palette.charcoal, 'cow17-torso-front-patch-large', [-0.46, 1.42, 0.59], [0.63, 0.78, 0.08]);
    part(THREE, torso, geometry.sphere, palette.charcoal, 'cow17-torso-front-patch-small', [0.62, 0.42, 0.59], [0.42, 0.5, 0.08]);
    const neck = pivot(THREE, torso, 'cow17-neck', [0, 2.05, 0.05]);
    part(THREE, neck, geometry.cylinder, palette.cream, 'cow17-neck-mass', [0, 0.38, 0], [0.66, 0.9, 0.66]);
    part(THREE, neck, geometry.sphere, palette.charcoal, 'cow17-neck-front-patch', [-0.2, 0.48, 0.67], [0.26, 0.38, 0.06]);
    const head = pivot(THREE, neck, 'cow17-head', [0, 1.05, 0.12]);
    part(THREE, head, geometry.box, palette.cream, 'cow17-head-mass', [0, 0, 0.12], [1.34, 1.08, 1.12]);
    part(THREE, head, geometry.sphere, palette.charcoal, 'cow17-face-patch', [-0.38, 0.23, 0.7], [0.34, 0.36, 0.065]);
    part(THREE, head, geometry.box, palette.pink, 'cow17-muzzle', [0, -0.3, 0.75], [0.94, 0.48, 0.52]);
    part(THREE, head, geometry.sphere, palette.black, 'cow17-eye-left', [-0.37, 0.21, 0.62], [0.12, 0.12, 0.08]);
    part(THREE, head, geometry.sphere, palette.black, 'cow17-eye-right', [0.37, 0.21, 0.62], [0.12, 0.12, 0.08]);
    const leftEar = pivot(THREE, head, 'cow17-ear-left', [-0.88, 0.35, 0]);
    const rightEar = pivot(THREE, head, 'cow17-ear-right', [0.88, 0.35, 0]);
    part(THREE, leftEar, geometry.box, palette.charcoal, 'cow17-ear-left-mass', [-0.22, 0, 0], [0.56, 0.18, 0.42], [0, 0, -0.24]);
    part(THREE, rightEar, geometry.box, palette.charcoal, 'cow17-ear-right-mass', [0.22, 0, 0], [0.56, 0.18, 0.42], [0, 0, 0.24]);
    part(THREE, head, geometry.cone, palette.horn, 'cow17-horn-left', [-0.46, 0.76, 0], [0.17, 0.52, 0.17], [0, 0, -0.2]);
    part(THREE, head, geometry.cone, palette.horn, 'cow17-horn-right', [0.46, 0.76, 0], [0.17, 0.52, 0.17], [0, 0, 0.2]);
    const tag = part(THREE, rightEar, geometry.plane, createLabelMaterial(THREE, '17', 'COW'), 'cow17-ear-tag', [0.34, -0.17, 0.24], [0.3, 0.22, 1], [0, 0.32, 0]);

    const leftArm = pivot(THREE, torso, 'cow17-left-shoulder', [-1.26, 1.52, 0]);
    const leftForeleg = pivot(THREE, leftArm, 'cow17-left-foreleg', [0, -0.64, 0.2]);
    part(THREE, leftArm, geometry.box, palette.cream, 'cow17-left-upper-foreleg', [0, -0.5, 0], [0.52, 1.34, 0.52]);
    part(THREE, leftForeleg, geometry.box, palette.cream, 'cow17-left-lower-foreleg', [0, -0.55, 0.22], [0.48, 1.2, 0.48]);
    const leftHoof = part(THREE, leftForeleg, geometry.box, palette.hoof, 'cow17-left-resting-hoof', [0, -1.1, 0.42], [0.64, 0.34, 0.72]);
    // The flattened contact pad deliberately overhangs the top rail: a clear planted point, not a floating arm.
    part(THREE, leftForeleg, geometry.sphere, palette.hoof, 'cow17-left-fence-contact-pad', [0, -1.28, 0.42], [0.43, 0.08, 0.5]);
    // Lowered articulation keeps the casual lean in physical contact with the top rail.
    leftArm.position.y = 1.2;
    leftForeleg.position.y = -0.95;
    const rightArm = pivot(THREE, torso, 'cow17-right-shoulder', [1.26, 1.45, 0]);
    const rightForeleg = pivot(THREE, rightArm, 'cow17-right-foreleg', [0, -0.68, 0.16]);
    part(THREE, rightArm, geometry.box, palette.cream, 'cow17-right-upper-foreleg', [0, -0.5, 0], [0.52, 1.34, 0.52]);
    part(THREE, rightForeleg, geometry.box, palette.cream, 'cow17-right-lower-foreleg', [0, -0.52, 0.2], [0.48, 1.06, 0.48]);
    const rightHoof = part(THREE, rightForeleg, geometry.box, palette.hoof, 'cow17-right-cup-hoof', [0, -1.02, 0.38], [0.64, 0.34, 0.72]);
    const cup = createCup(THREE, geometry, palette);
    cup.position.set(0, -1.37, 0.76);
    cup.rotation.x = -0.18;
    rightForeleg.add(cup);
    // A small visible thumb overlaps the disposable cup, making the grip read from the QA camera.
    part(THREE, rightForeleg, geometry.box, palette.cream, 'cow17-right-cup-thumb', [-0.22, -1.15, 0.78], [0.22, 0.34, 0.24], [0, 0, -0.28]);

    const leftLeg = pivot(THREE, hips, 'cow17-left-leg', [-0.6, -0.52, 0]);
    const rightLeg = pivot(THREE, hips, 'cow17-right-leg', [0.6, -0.52, 0]);
    [leftLeg, rightLeg].forEach((leg, index) => {
      part(THREE, leg, geometry.box, palette.cream, `cow17-${index ? 'right' : 'left'}-leg`, [0, -0.78, 0], [0.58, 1.56, 0.64]);
      part(THREE, leg, geometry.box, palette.hoof, `cow17-${index ? 'right' : 'left'}-boot-hoof`, [0, -1.68, 0.22], [0.76, 0.34, 0.9]);
    });
    const tail = pivot(THREE, hips, 'cow17-tail', [0, 0.05, -0.58]);
    part(THREE, tail, geometry.cylinder, palette.cream, 'cow17-tail-mass', [0, -0.55, -0.1], [0.11, 1.15, 0.11], [0.42, 0, 0]);
    part(THREE, tail, geometry.sphere, palette.charcoal, 'cow17-tail-tuft', [0, -1.13, -0.35], [0.26, 0.32, 0.26]);

    return { root, hips, torso, head, leftEar, rightEar, leftArm, leftForeleg, leftHoof, rightArm, rightForeleg, rightHoof, leftLeg, rightLeg, tail, cup, tag };
  }

  function createChickenRig(THREE, geometry, palette, id, side) {
    const root = new THREE.Group();
    root.name = `ChickenCinematicRig-${id}`;
    root.userData.cinematicRole = 'chicken-presentation-rig';
    const body = pivot(THREE, root, `chicken-${id}-body`, [0, 0.85, 0]);
    part(THREE, body, geometry.sphere, palette.white, `chicken-${id}-body-mass`, [0, 0, 0], [0.9, 0.82, 1.08]);
    const head = pivot(THREE, body, `chicken-${id}-head`, [0, 0.72, 0.45]);
    part(THREE, head, geometry.sphere, palette.white, `chicken-${id}-head-mass`, [0, 0, 0], [0.52, 0.54, 0.5]);
    part(THREE, head, geometry.cone, palette.orange, `chicken-${id}-beak`, [0, -0.07, 0.55], [0.2, 0.36, 0.2], [Math.PI / 2, 0, 0]);
    part(THREE, head, geometry.cone, palette.red, `chicken-${id}-comb`, [0, 0.55, 0], [0.16, 0.4, 0.16]);
    const leftWing = pivot(THREE, body, `chicken-${id}-left-wing`, [-0.72, 0.0, 0]);
    const rightWing = pivot(THREE, body, `chicken-${id}-right-wing`, [0.72, 0.0, 0]);
    part(THREE, leftWing, geometry.sphere, palette.cream, `chicken-${id}-left-wing-mass`, [-0.16, -0.18, 0], [0.5, 0.68, 0.88], [0, 0, 0.35]);
    part(THREE, rightWing, geometry.sphere, palette.cream, `chicken-${id}-right-wing-mass`, [0.16, -0.18, 0], [0.5, 0.68, 0.88], [0, 0, -0.35]);
    [-0.26, 0.26].forEach((x, legIndex) => {
      part(THREE, root, geometry.cylinder, palette.yellow, `chicken-${id}-leg-${legIndex}`, [x, 0.34, 0], [0.07, 0.55, 0.07]);
    });
    part(THREE, body, geometry.cone, palette.charcoal, `chicken-${id}-tail`, [0, -0.08, -0.8], [0.42, 0.76, 0.42], [-Math.PI / 2, 0, 0]);
    root.position.set(side * 2.65, 0, 1.15 + id * 0.75);
    return { root, body, head, leftWing, rightWing, id };
  }

  function createFenceComposition(THREE, geometry, palette) {
    const root = new THREE.Group();
    root.name = 'MooBrewFenceConversationComposition';
    root.userData.cinematicRole = 'fence-composition';
    [-4.1, 0, 4.1].forEach((x, index) => {
      part(THREE, root, geometry.box, palette.woodDark, `cinematic-fence-post-${index}`, [x, 2.05, 0], [0.42, 4.1, 0.42]);
      part(THREE, root, geometry.cone, palette.woodLight, `cinematic-fence-cap-${index}`, [x, 4.18, 0], [0.3, 0.4, 0.3]);
    });
    [1.25, 2.28, 3.3].forEach((y, index) => part(THREE, root, geometry.box, palette.woodLight, `cinematic-fence-rail-${index}`, [0, y, 0], [8.7, 0.27, 0.3]));
    return root;
  }

  function countPresentation(root) {
    const objects = [];
    const materials = new Set();
    let meshes = 0;
    root.traverse((node) => {
      objects.push(node);
      if (!node.isMesh) return;
      meshes += 1;
      const candidates = Array.isArray(node.material) ? node.material : [node.material];
      candidates.filter(Boolean).forEach((material) => materials.add(material));
    });
    return { objects: objects.length, meshes, materials: materials.size };
  }

  function createFoundation(options) {
    const THREE = requireThree();
    const scene = options && options.scene;
    if (!scene || typeof scene.add !== 'function') throw new Error('SW-CIN-001 mount requires an existing Three.js scene.');
    const geometry = createGeometry(THREE);
    const palette = createPalette(THREE);
    const root = new THREE.Group();
    root.name = 'MooBrewOpeningFoundationRoot';
    root.userData.cinematicRole = 'moo-brew-opening-foundation';
    root.position.set(...(options.position || [0, 0, 0]));
    const fence = createFenceComposition(THREE, geometry, palette);
    const cow = createCow17Rig(THREE, geometry, palette);
    cow.root.position.set(0, 0, -0.48);
    const chickenA = createChickenRig(THREE, geometry, palette, 1, -1);
    const chickenB = createChickenRig(THREE, geometry, palette, 2, 1);
    root.add(fence, cow.root, chickenA.root, chickenB.root);
    scene.add(root);

    let currentTime = 0;
    let currentBeat = 'fence-conversation';
    let disposed = false;
    function poseAt(time) {
      const t = clamp(Number(time) || 0, 0, 12);
      const notice = ease((t - 2.55) / 1.7);
      const turn = ease((t - 4.25) / 1.9);
      const doubleTake = ease((t - 6.15) / 1.85);
      const lastSip = ease((t - 8.0) / 1.7);
      const escape = ease((t - 10.0) / 2.0);
      // The relaxed pose favors a settled hip and planted hoof; the later beats deliberately break that silhouette.
      cow.hips.position.x = -0.16 * notice + 0.24 * doubleTake + 0.55 * escape;
      cow.hips.position.y = 2.53 + 0.1 * doubleTake;
      cow.hips.rotation.z = -0.16 + 0.3 * doubleTake - 0.18 * escape;
      cow.torso.rotation.z = -0.24 + 0.32 * doubleTake;
      cow.torso.rotation.y = 0.16 * notice - 0.28 * doubleTake;
      // Cow 17 listens to the chickens first, then snaps past center into an unmistakable delayed reaction.
      cow.head.rotation.y = -0.34 + 0.2 * notice + 1.18 * doubleTake;
      cow.head.rotation.z = -0.04 - 0.22 * doubleTake + 0.14 * escape;
      cow.head.rotation.x = -0.04 - 0.13 * lastSip + 0.2 * escape;
      cow.leftEar.rotation.z = -0.12 - 0.42 * doubleTake;
      cow.rightEar.rotation.z = 0.16 + 0.52 * doubleTake;
      cow.leftArm.rotation.z = -0.8 + 0.14 * escape;
      cow.leftForeleg.rotation.x = 0.48;
      cow.rightArm.rotation.z = 0.36 - 0.74 * lastSip + 0.35 * escape;
      cow.rightForeleg.rotation.x = -0.34 - 0.98 * lastSip;
      cow.rightForeleg.position.y = -0.68 + 0.18 * lastSip;
      cow.rightHoof.position.set(0, -1.02 + 1.02 * lastSip, 0.38 + 0.14 * lastSip);
      cow.rightHoof.rotation.z = -0.28 * lastSip;
      cow.cup.position.set(0, -1.37 + 1.72 * lastSip, 0.76 + 0.16 * lastSip);
      cow.cup.rotation.x = -0.18 - 0.58 * lastSip;
      const cupThumb = cow.rightForeleg.getObjectByName('cow17-right-cup-thumb');
      if (cupThumb) cupThumb.position.set(-0.22, -1.15 + 1.08 * lastSip, 0.78 + 0.16 * lastSip);
      cow.leftLeg.rotation.z = 0.13 - 0.32 * doubleTake - 0.22 * escape;
      cow.rightLeg.rotation.z = -0.12 + 0.36 * doubleTake + 0.27 * escape;
      cow.tail.rotation.z = 0.12 + 0.48 * doubleTake;
      chickenA.body.position.y = 0.85 + Math.sin(t * 7.2) * 0.04;
      chickenA.root.rotation.y = -0.42 + 0.5 * notice;
      chickenA.head.rotation.y = 0.32 + 0.92 * notice;
      chickenA.head.rotation.x = -0.28 - 0.3 * notice + Math.sin(t * 9.5) * 0.12;
      chickenA.leftWing.rotation.z = -0.12 - 0.72 * doubleTake;
      chickenA.rightWing.rotation.z = 0.12 + 0.72 * doubleTake;
      chickenB.body.position.y = 0.85 + Math.sin(t * 6.3 + 1.5) * 0.05;
      chickenB.root.rotation.y = 0.3 - 0.3 * notice;
      chickenB.head.rotation.y = -0.28 + 0.42 * notice;
      chickenB.head.rotation.x = -0.22 - 0.18 * notice + Math.sin(t * 8.2 + 1.2) * 0.13;
      chickenB.leftWing.rotation.z = -0.08 - 0.48 * doubleTake;
      chickenB.rightWing.rotation.z = 0.08 + 0.48 * doubleTake;
      chickenA.root.position.x = -2.65 - 0.9 * escape;
      chickenB.root.position.x = 2.65 + 1.2 * escape;
      return { notice, turn, doubleTake, lastSip, escape };
    }

    function resolveBeat(time) {
      return TIMELINE.find((entry) => time >= entry.start && time < entry.end)?.id || 'escape-transition';
    }

    function setTime(time) {
      currentTime = clamp(Number(time) || 0, 0, 12);
      currentBeat = resolveBeat(currentTime);
      poseAt(currentTime);
      return getSnapshot();
    }

    function setBeat(id) {
      const shot = SHOTS[id];
      const beat = TIMELINE.find((entry) => entry.id === id);
      if (!shot && !beat) throw new Error(`Unknown SW-CIN-001 beat: ${id}`);
      return setTime(shot ? shot.time : beat.start + 0.02);
    }

    function applyShot(camera, id) {
      const shot = SHOTS[id || currentBeat];
      if (!shot || !camera) return false;
      camera.position.set(...shot.camera.position);
      camera.fov = shot.camera.fov;
      camera.lookAt(...shot.camera.target);
      camera.updateProjectionMatrix?.();
      cow.cup.userData.presentForCamera(camera);
      return true;
    }

    function getSnapshot() {
      const counts = countPresentation(root);
      return {
        version: VERSION,
        mounted: !disposed,
        time: currentTime,
        beat: currentBeat,
        timeline: TIMELINE.map((entry) => ({ id: entry.id, start: entry.start, end: entry.end })),
        actors: { cow17: Boolean(cow.root.parent), chickens: [chickenA, chickenB].filter((entry) => Boolean(entry.root.parent)).length, cup: Boolean(cow.cup.parent), fence: Boolean(fence.parent) },
        budget: counts,
        capabilities: {
          cow: ['upright-stance', 'fence-lean', 'cup-hold', 'sip', 'head-ear-reaction', 'weight-shift', 'double-take', 'escape-transition'],
          chickens: ['idle-peck', 'head-bob', 'look-target', 'startled-anticipation', 'scatter-transition'],
          cup: ['hold', 'sip', 'logo-camera-ready', 'future-drop-orientation'],
        },
      };
    }

    function dispose() {
      if (disposed) return;
      disposed = true;
      if (root.parent) root.parent.remove(root);
      root.traverse((node) => {
        if (node.geometry && node.geometry.dispose) node.geometry.dispose();
        const candidates = Array.isArray(node.material) ? node.material : [node.material];
        candidates.filter((material) => material?.userData?.swCinematicOwnMaterial).forEach((material) => {
          if (material.map) material.map.dispose();
          material.dispose();
        });
      });
    }

    setTime(0.8);
    return Object.freeze({ root, setTime, setBeat, applyShot, getSnapshot, dispose, shots: SHOTS, timeline: TIMELINE });
  }

  globalScope.__SW_OPENING_CINEMATIC_FOUNDATION__ = Object.freeze({ version: VERSION, createFoundation, shots: SHOTS, timeline: TIMELINE });
}(globalThis));
