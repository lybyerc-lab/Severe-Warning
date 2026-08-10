// ============================================================================
// [SW:CINEMATIC:PLAYABLE_OPENING]
// SW_CIN_003_PLAYABLE_OPENING_V1
//
// Bounded production integration for the retained Cow 17 / Moo Brew acting kit.
// This code mounts into the existing Three.js scene and temporarily owns only
// opening-cinematic camera/presentation state. Gameplay activation is delayed
// until the handoff so the warning clock, movement and abilities do not run
// during the cold open. No renderer or scene is created here.
// ============================================================================
(function installPlayableOpeningCinematic(globalScope) {
  'use strict';

  const VERSION = 'SW_CIN_003_PLAYABLE_OPENING_V1';
  const DURATION = 12.4;
  const SEEN_KEY = 'severe_weather_opening_seen_v1';
  const hudIds = ['hud', 'easBanner', 'joystickZone'];
  const state = {
    active: false,
    elapsed: 0,
    reason: 'idle',
    session: null,
    stage: null,
    customRoot: null,
    newspaper: null,
    barnBody: null,
    roofPeel: null,
    stormReveal: null,
    savedHud: new Map(),
    savedLights: null,
    savedStormVisibility: null,
    savedWorldStormVisibility: null,
    worldStorm: null,
    canSkip: false,
    sirenPlayed: false,
    mooPlayed: false,
    plinkPlayed: false,
    touchdownPlayed: false,
    handoffCount: 0,
    startCount: 0,
    lastError: null,
  };

  function clamp01(value) {
    return Math.max(0, Math.min(1, Number(value) || 0));
  }

  function smooth(value) {
    const t = clamp01(value);
    return t * t * (3 - 2 * t);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function makeCanvasMaterial(draw) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 640;
    const context = canvas.getContext('2d');
    draw(context, canvas.width, canvas.height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide, depthWrite: false });
    material.userData.swCinematicOwnMaterial = true;
    return material;
  }

  function createNewspaper(root) {
    const material = makeCanvasMaterial((context, width, height) => {
      context.fillStyle = '#eee5cf';
      context.fillRect(0, 0, width, height);
      context.strokeStyle = '#403a31';
      context.lineWidth = 18;
      context.strokeRect(20, 20, width - 40, height - 40);
      context.fillStyle = '#27231e';
      context.textAlign = 'center';
      context.font = '900 50px Georgia, serif';
      context.fillText('LINCOLN COUNTY GAZETTE', width / 2, 82);
      context.fillRect(62, 108, width - 124, 5);
      context.font = '900 77px Georgia, serif';
      context.fillText('SKIES TURNING MEAN', width / 2, 205);
      context.font = '700 32px Georgia, serif';
      context.fillText('Storm crews watch the western horizon', width / 2, 258);
      context.fillStyle = '#6f2c1f';
      context.fillRect(88, 308, 360, 220);
      context.fillStyle = '#f6ead0';
      context.font = '900 58px system-ui, sans-serif';
      context.fillText('MOO BREW', 268, 398);
      context.font = '800 25px system-ui, sans-serif';
      context.fillText('ONE LAST SIP.', 268, 452);
      context.fillStyle = '#2b2722';
      context.textAlign = 'left';
      context.font = '700 25px Georgia, serif';
      context.fillText('• Pressure falling fast', 500, 350);
      context.fillText('• Chickens reportedly uneasy', 500, 405);
      context.fillText('• Cow 17 remains unconcerned', 500, 460);
      context.font = '600 21px Georgia, serif';
      context.fillText('Weather desk: “Keep an eye west.”', 500, 515);
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(9.8, 6.1), material);
    mesh.name = 'SWCinematicNewspaper';
    mesh.position.set(0, 4.7, 2.8);
    mesh.rotation.x = -0.04;
    mesh.userData.swPresentationOnly = true;
    root.add(mesh);
    return mesh;
  }

  function createFarmBackdrop(root) {
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: '#74443a', roughness: 0.92, metalness: 0.01 });
    const trimMaterial = new THREE.MeshStandardMaterial({ color: '#d7c7a4', roughness: 0.88, metalness: 0.01 });
    const roofMaterial = new THREE.MeshStandardMaterial({ color: '#3e3532', roughness: 0.84, metalness: 0.05 });
    [bodyMaterial, trimMaterial, roofMaterial].forEach((material) => { material.userData.swCinematicOwnMaterial = true; });

    const body = new THREE.Mesh(new THREE.BoxGeometry(10.5, 5.4, 7.4), bodyMaterial);
    body.name = 'SWCinematicFarmBarnBody';
    body.position.set(-10.8, 2.7, -8.8);
    body.castShadow = true;
    body.receiveShadow = true;
    body.userData.swPresentationOnly = true;
    root.add(body);

    const door = new THREE.Mesh(new THREE.BoxGeometry(3.1, 3.9, 0.18), trimMaterial);
    door.name = 'SWCinematicFarmBarnDoor';
    door.position.set(-10.8, 2.0, -5.02);
    door.userData.swPresentationOnly = true;
    root.add(door);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(11.7, 0.72, 8.5), roofMaterial);
    roof.name = 'SWCinematicBarnRoofPeel';
    roof.position.set(-10.8, 5.8, -8.8);
    roof.rotation.z = 0.08;
    roof.castShadow = true;
    roof.userData.swPresentationOnly = true;
    root.add(roof);
    return { body, roof };
  }

  function resolveProductionStorm() {
    const rootName = 'SWVisualHeroSlice6StormSilhouette';
    const findStorm = () => scene?.getObjectByName?.(rootName)
      || (typeof swVisualHeroSlice6StormRoot !== 'undefined' ? swVisualHeroSlice6StormRoot : null);
    let productionStorm = findStorm();
    if (productionStorm) return productionStorm;

    // The opening takes ownership before the first normal visual frame. Ask the
    // WORLD-002 presentation bridge to initialize its existing silhouette, then
    // use its synchronous builder when its texture cache is already available.
    globalScope.__SW_THREEJS_VISUAL_FOUNDATION__?.refreshHeroSlice6?.();
    productionStorm = findStorm();
    if (!productionStorm && typeof swVisualHeroSlice6BuildStormSilhouette === 'function') {
      swVisualHeroSlice6BuildStormSilhouette();
      productionStorm = findStorm();
    }
    return productionStorm;
  }

  function createStormReveal(stage) {
    const productionStorm = resolveProductionStorm();
    if (!productionStorm) {
      state.lastError = 'WORLD-002 production storm silhouette is unavailable for cinematic touchdown.';
      return null;
    }
    // Reuse WORLD-002's production silhouette instead of constructing a second,
    // simplified touchdown storm. The clone shares the accepted warped-shell,
    // debris, and material language while remaining temporary cinematic framing.
    const group = productionStorm.clone(true);
    group.name = 'SWCinematicTouchdownProductionStorm';
    group.userData.swPresentationOnly = true;
    const towardGameplay = new THREE.Vector2(-stage.x, -stage.z);
    if (towardGameplay.lengthSq() < 1) towardGameplay.set(-1, -1);
    towardGameplay.normalize();
    const x = stage.x + towardGameplay.x * 48;
    const z = stage.z + towardGameplay.y * 48;
    const y = typeof terrainHeightAt === 'function' ? terrainHeightAt(x, z) : 0;
    group.position.set(x, y, z);

    scene.add(group);
    return {
      group,
      source: productionStorm.name,
      profile: 'world-slice6-asymmetric-storm-v2',
      baseScale: group.scale.clone(),
      baseRotationY: group.rotation.y,
    };
  }

  function removePresentationRoot(root) {
    if (root?.parent) root.parent.remove(root);
  }

  function disposeCustomRoot(root) {
    if (!root) return;
    root.traverse((node) => {
      if (node.geometry?.dispose) node.geometry.dispose();
      const materials = node.material ? (Array.isArray(node.material) ? node.material : [node.material]) : [];
      materials.filter(Boolean).forEach((material) => {
        if (material.userData?.swCinematicOwnMaterial) {
          material.map?.dispose?.();
          material.dispose?.();
        }
      });
    });
    if (root.parent) root.parent.remove(root);
  }

  function setHudVisible(visible) {
    hudIds.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;
      if (!state.savedHud.has(id)) {
        state.savedHud.set(id, {
          visibility: element.style.visibility,
          opacity: element.style.opacity,
          pointerEvents: element.style.pointerEvents,
        });
      }
      if (visible) {
        const saved = state.savedHud.get(id) || {};
        element.style.visibility = saved.visibility || '';
        element.style.opacity = saved.opacity || '';
        element.style.pointerEvents = saved.pointerEvents || '';
      } else {
        element.style.visibility = 'hidden';
        element.style.opacity = '0';
        element.style.pointerEvents = 'none';
      }
    });
    if (visible) state.savedHud.clear();
  }

  function savePresentationState() {
    state.savedLights = {
      ambientIntensity: Number(ambientLight?.intensity || 0),
      ambientColor: ambientLight?.color?.clone?.() || null,
      directionalIntensity: Number(dirLight?.intensity || 0),
      directionalColor: dirLight?.color?.clone?.() || null,
      fogColor: scene?.fog?.color?.clone?.() || null,
      fogDensity: Number(scene?.fog?.density || 0),
    };
    state.savedStormVisibility = [tornadoGroup, supercellGroup, derechoGroup].map((group) => Boolean(group?.visible));
  }

  function restorePresentationState() {
    if (state.savedLights) {
      ambientLight.intensity = state.savedLights.ambientIntensity;
      if (state.savedLights.ambientColor) ambientLight.color.copy(state.savedLights.ambientColor);
      dirLight.intensity = state.savedLights.directionalIntensity;
      if (state.savedLights.directionalColor) dirLight.color.copy(state.savedLights.directionalColor);
      if (scene?.fog && state.savedLights.fogColor) scene.fog.color.copy(state.savedLights.fogColor);
      if (scene?.fog && Number.isFinite(state.savedLights.fogDensity)) scene.fog.density = state.savedLights.fogDensity;
    }
    if (state.savedStormVisibility) {
      [tornadoGroup, supercellGroup, derechoGroup].forEach((group, index) => {
        if (group) group.visible = state.savedStormVisibility[index];
      });
    }
    if (state.savedWorldStormVisibility !== null && state.worldStorm) {
      state.worldStorm.visible = state.savedWorldStormVisibility;
    }
    state.savedLights = null;
    state.savedStormVisibility = null;
    state.savedWorldStormVisibility = null;
    state.worldStorm = null;
  }

  function cameraPose(position, target, fov, mix = 1) {
    const t = clamp01(mix);
    camera.position.x = lerp(camera.position.x, position.x, t);
    camera.position.y = lerp(camera.position.y, position.y, t);
    camera.position.z = lerp(camera.position.z, position.z, t);
    camera.fov = lerp(camera.fov, fov, t);
    camera.lookAt(target.x, target.y, target.z);
    camera.updateProjectionMatrix?.();
  }

  function shotWorldPose(id) {
    const shot = state.session?.shots?.[id];
    if (!shot || !state.stage) return null;
    const p = shot.camera.position;
    const target = shot.camera.target;
    return {
      position: new THREE.Vector3(state.stage.x + p[0], state.stage.y + p[1], state.stage.z + p[2]),
      target: new THREE.Vector3(state.stage.x + target[0], state.stage.y + target[1], state.stage.z + target[2]),
      fov: shot.camera.fov,
    };
  }

  function makeStage() {
    const farm = typeof swVisualGetHartFarmPresentationAnchor === 'function'
      ? swVisualGetHartFarmPresentationAnchor()
      : null;
    // The authored anchor is the signature barn's center. Stage the actors on
    // the adjoining farm apron so close shots do not begin inside barn geometry.
    const farmX = Number(farm?.x ?? -118);
    const farmZ = Number(farm?.z ?? 126);
    const x = farmX + 30;
    const z = farmZ + 25;
    const y = typeof terrainHeightAt === 'function' ? terrainHeightAt(x, z) : 0;
    return Object.freeze({ x, y, z, farmX, farmZ, farmFound: Boolean(farm) });
  }

  function markSeen() {
    try { localStorage.setItem(SEEN_KEY, '1'); } catch (_) {}
  }

  function hasSeen() {
    try { return localStorage.getItem(SEEN_KEY) === '1'; } catch (_) { return false; }
  }

  function cleanupPresentation() {
    try { state.session?.dispose?.(); } catch (_) {}
    state.session = null;
    disposeCustomRoot(state.customRoot);
    state.customRoot = null;
    if (state.stormReveal?.group) removePresentationRoot(state.stormReveal.group);
    state.stormReveal = null;
    state.newspaper = null;
    state.barnBody = null;
    state.roofPeel = null;
  }

  function finish(reason = 'natural') {
    if (!state.active) return false;
    state.active = false;
    state.reason = reason;
    cleanupPresentation();
    restorePresentationState();
    setHudVisible(true);
    const districtOverlay = document.getElementById('districtOverlay');
    if (districtOverlay) districtOverlay.classList.remove('active');
    camera.fov = 45;
    camera.updateProjectionMatrix?.();
    runActive = true;
    try { lastFrameTime = performance.now(); } catch (_) {}
    if (reason === 'natural') markSeen();
    state.handoffCount += 1;
    if (typeof showDistrictTransition === 'function') showDistrictTransition(1);
    return true;
  }

  function begin() {
    if (state.active) finish('restart');
    const bridge = globalScope.__SW_OPENING_CINEMATIC_FOUNDATION__;
    if (!bridge?.createFoundation || typeof scene === 'undefined' || typeof camera === 'undefined') {
      state.lastError = 'Opening cinematic foundation or production scene is unavailable.';
      return false;
    }

    state.elapsed = 0;
    state.reason = 'playing';
    state.canSkip = hasSeen();
    state.sirenPlayed = false;
    state.mooPlayed = false;
    state.plinkPlayed = false;
    state.touchdownPlayed = false;
    state.lastError = null;
    state.startCount += 1;
    state.stage = makeStage();
    savePresentationState();
    [tornadoGroup, supercellGroup, derechoGroup].forEach((group) => { if (group) group.visible = false; });
    const productionStorm = resolveProductionStorm();
    state.worldStorm = productionStorm;
    state.savedWorldStormVisibility = productionStorm ? Boolean(productionStorm.visible) : null;
    if (productionStorm) productionStorm.visible = false;

    state.session = bridge.createFoundation({ scene, position: [state.stage.x, state.stage.y, state.stage.z] });
    state.customRoot = new THREE.Group();
    state.customRoot.name = 'SWCinematicPlayableOpeningPresentation';
    state.customRoot.position.set(state.stage.x, state.stage.y, state.stage.z);
    state.customRoot.userData.swPresentationOnly = true;
    scene.add(state.customRoot);
    state.newspaper = createNewspaper(state.customRoot);
    const barn = createFarmBackdrop(state.customRoot);
    state.barnBody = barn.body;
    state.roofPeel = barn.roof;
    state.stormReveal = createStormReveal(state.stage);

    runActive = false;
    setHudVisible(false);
    const districtOverlay = document.getElementById('districtOverlay');
    if (districtOverlay) districtOverlay.classList.remove('active');
    state.active = true;
    return true;
  }

  function updatePresentation(time) {
    if (!state.active || !state.session || !state.stage) return false;
    const t = Math.max(0, Math.min(DURATION, time));
    state.session.setTime(Math.min(12, t));

    // `frame()` and deterministic QA seek both revisit this function. Reset the
    // presentation-only offsets before applying the current timestamp so a cup,
    // chicken, roof, or funnel can never drift farther on every render.
    const cup = state.session.root?.getObjectByName?.('MooBrewCup') || null;
    const chickenA = state.session.root?.getObjectByName?.('ChickenCinematicRig-1') || null;
    const chickenB = state.session.root?.getObjectByName?.('ChickenCinematicRig-2') || null;
    if (cup) {
      cup.rotation.y = 0;
      cup.rotation.z = 0;
    }
    if (chickenA) chickenA.position.z = 1.9;
    if (chickenB) chickenB.position.z = 2.65;
    if (state.roofPeel) {
      state.roofPeel.position.set(-10.8, 5.8, -8.8);
      state.roofPeel.rotation.set(0, 0, 0.08);
    }

    const weather = smooth((t - 2.45) / 3.5);
    if (state.savedLights) {
      ambientLight.intensity = lerp(state.savedLights.ambientIntensity, Math.max(0.45, state.savedLights.ambientIntensity * 0.62), weather);
      dirLight.intensity = lerp(state.savedLights.directionalIntensity, Math.max(0.55, state.savedLights.directionalIntensity * 0.48), weather);
      if (state.savedLights.ambientColor) ambientLight.color.copy(state.savedLights.ambientColor).lerp(new THREE.Color('#536b77'), weather * 0.55);
      if (state.savedLights.directionalColor) dirLight.color.copy(state.savedLights.directionalColor).lerp(new THREE.Color('#a9bfd0'), weather * 0.62);
      if (scene?.fog && state.savedLights.fogColor) scene.fog.color.copy(state.savedLights.fogColor).lerp(new THREE.Color('#33444d'), weather * 0.42);
    }

    if (!state.sirenPlayed && t >= 3.05) {
      state.sirenPlayed = true;
      try { playSound('siren'); } catch (_) {}
    }
    if (!state.mooPlayed && t >= 8.1) {
      state.mooPlayed = true;
      try { playSound('moo'); } catch (_) {}
    }
    if (!state.plinkPlayed && t >= 10.35) {
      state.plinkPlayed = true;
      try { playSound('click'); } catch (_) {}
    }
    if (!state.touchdownPlayed && t >= 10.85) {
      state.touchdownPlayed = true;
      try { playSound('gust'); } catch (_) {}
    }

    if (state.newspaper?.material) {
      const fade = 1 - smooth((t - 0.9) / 0.65);
      state.newspaper.material.opacity = fade;
      state.newspaper.visible = fade > 0.01;
      state.newspaper.rotation.z = Math.sin(t * 1.7) * 0.018;
    }

    if (cup && t >= 10.0) {
      const drop = smooth((t - 10.0) / 0.72);
      cup.position.y -= drop * 2.75;
      cup.position.x += drop * 0.75;
      cup.rotation.z += drop * 1.55;
      cup.rotation.x += drop * 0.65;
    }

    if (t >= 10.0) {
      const panic = smooth((t - 10.0) / 1.45);
      if (chickenA) { chickenA.position.x -= panic * 3.8; chickenA.position.z += panic * 1.8; chickenA.rotation.y -= panic * 0.8; }
      if (chickenB) { chickenB.position.x += panic * 4.4; chickenB.position.z += panic * 2.2; chickenB.rotation.y += panic * 0.9; }
    }

    if (state.roofPeel && t >= 10.35) {
      const peel = smooth((t - 10.35) / 1.65);
      state.roofPeel.position.x -= peel * 4.8;
      state.roofPeel.position.y = 5.8 + peel * 7.5;
      state.roofPeel.position.z += peel * 3.8;
      state.roofPeel.rotation.z = 0.08 - peel * 0.95;
      state.roofPeel.rotation.x = peel * 0.52;
    }

    if (state.stormReveal) {
      const reveal = smooth((t - 9.4) / 2.1);
      state.stormReveal.group.visible = reveal > 0.005;
      state.stormReveal.group.scale.copy(state.stormReveal.baseScale).multiplyScalar(lerp(0.58, 1, reveal));
      state.stormReveal.group.rotation.y = state.stormReveal.baseRotationY + t * (0.06 + reveal * 0.14);
    }

    const fence = shotWorldPose('fence-conversation');
    const doubleTake = shotWorldPose('double-take');
    const sip = shotWorldPose('last-sip-setup');
    if (!fence || !doubleTake || !sip) return false;

    if (t < 1.35) {
      const p = new THREE.Vector3(state.stage.x, state.stage.y + 5.0, state.stage.z + 10.5);
      const target = new THREE.Vector3(state.stage.x, state.stage.y + 4.4, state.stage.z + 2.7);
      cameraPose(p, target, 31, 1);
    } else if (t < 5.9) {
      const blend = smooth((t - 3.7) / 2.2);
      const p = fence.position.clone().lerp(doubleTake.position, blend);
      const target = fence.target.clone().lerp(doubleTake.target, blend);
      cameraPose(p, target, lerp(fence.fov, doubleTake.fov, blend), 1);
    } else if (t < 8.15) {
      cameraPose(doubleTake.position, doubleTake.target, doubleTake.fov, 1);
    } else if (t < 10.15) {
      const blend = smooth((t - 8.15) / 0.7);
      const p = doubleTake.position.clone().lerp(sip.position, blend);
      const target = doubleTake.target.clone().lerp(sip.target, blend);
      cameraPose(p, target, lerp(doubleTake.fov, sip.fov, blend), 1);
      state.session.root?.getObjectByName?.('MooBrewCup')?.userData?.presentForCamera?.(camera);
    } else {
      const reveal = smooth((t - 10.15) / 2.05);
      const stormPos = state.stormReveal?.group?.position || new THREE.Vector3(0, 0, 0);
      // Pull back on the actor side of the touchdown vector so the panic is
      // foreground comedy and the funnel remains the escalating background.
      const touchdownDirection = stormPos.clone().sub(new THREE.Vector3(state.stage.x, state.stage.y, state.stage.z));
      touchdownDirection.y = 0;
      if (touchdownDirection.lengthSq() < 0.01) touchdownDirection.set(1, 0, -1);
      touchdownDirection.normalize();
      const pullback = new THREE.Vector3(
        state.stage.x - touchdownDirection.x * 28,
        state.stage.y + 12.5,
        state.stage.z - touchdownDirection.z * 28,
      );
      const p = sip.position.clone().lerp(pullback, reveal);
      const target = sip.target.clone().lerp(new THREE.Vector3(stormPos.x, stormPos.y + 13, stormPos.z), reveal);
      cameraPose(p, target, lerp(sip.fov, 55, reveal), 1);
    }

    return true;
  }

  function frame(_now, dt) {
    if (!state.active) return false;
    state.elapsed = Math.min(DURATION, state.elapsed + Math.max(0, Math.min(0.1, Number(dt) || 0)));
    const ownsCamera = updatePresentation(state.elapsed);
    if (state.elapsed >= DURATION) {
      finish('natural');
      return false;
    }
    return ownsCamera;
  }

  function debugSeek(seconds) {
    if (!state.active) return false;
    state.elapsed = Math.max(0, Math.min(DURATION - 0.01, Number(seconds) || 0));
    return updatePresentation(state.elapsed);
  }

  function snapshot() {
    return Object.freeze({
      version: VERSION,
      active: state.active,
      elapsed: Number(state.elapsed.toFixed(3)),
      duration: DURATION,
      reason: state.reason,
      canSkip: state.canSkip,
      gameStarted: Boolean(gameStarted),
      runActive: Boolean(runActive),
      runTimeRemaining: Number(runTimeRemaining),
      timerFrozenDuringCinematic: state.active ? (runActive === false && Math.abs(runTimeRemaining - 180) < 0.001) : null,
      stage: state.stage ? { x: state.stage.x, y: state.stage.y, z: state.stage.z, farmX: state.stage.farmX, farmZ: state.stage.farmZ, farmFound: state.stage.farmFound } : null,
      actors: state.session?.getSnapshot?.()?.actors || null,
      budget: state.session?.getSnapshot?.()?.budget || null,
      stormRevealPresent: Boolean(state.stormReveal?.group?.parent),
      stormRevealProfile: state.stormReveal?.profile || null,
      stormRevealUsesProductionStorm: state.stormReveal?.source === 'SWVisualHeroSlice6StormSilhouette',
      newspaperPresent: Boolean(state.newspaper?.parent),
      roofPeelPresent: Boolean(state.roofPeel?.parent),
      handoffCount: state.handoffCount,
      startCount: state.startCount,
      lastError: state.lastError,
    });
  }

  const baseStartRunFromMenu = globalScope.startRunFromMenu;
  if (typeof baseStartRunFromMenu !== 'function') throw new Error('SW-CIN-003 could not locate startRunFromMenu.');
  globalScope.startRunFromMenu = function startRunFromMenuWithPlayableOpening() {
    baseStartRunFromMenu();
    if (typeof isBotMode !== 'undefined' && isBotMode) return;
    if (!begin()) {
      runActive = true;
    }
  };

  window.addEventListener('keydown', (event) => {
    if (!state.active || !state.canSkip) return;
    if (event.code === 'Escape') {
      event.preventDefault();
      finish('skip');
    }
  }, true);

  globalScope.__SW_OPENING_CINEMATIC_PLAYABLE__ = Object.freeze({
    version: VERSION,
    duration: DURATION,
    begin,
    finish,
    frame,
    debugSeek,
    getSnapshot: snapshot,
  });
}(globalThis));
// [SW:CINEMATIC:PLAYABLE_OPENING:END]
