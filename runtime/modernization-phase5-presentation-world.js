// ============================================================================
// [SW:ARCH:PHASE5_PRESENTATION_WORLD_BRIDGE]
// Lexical bridge from the accepted live Three.js runtime to passive typed
// mirrors. It creates no renderer, scene, camera, world, effects, or gameplay.
// ============================================================================
const PHASE5_PRESENTATION_WORLD_BRIDGE_VERSION = 'MODERNIZATION_PHASE5_PRESENTATION_WORLD_V2';

let phase5RendererAuthority = null;
let phase5SceneAuthority = null;
let phase5CameraAuthority = null;
let phase5AtmosphereAuthority = null;
let phase5TornadoAuthority = null;
let phase5WorldAuthority = null;
let phase5HartFarmSetpiece = null;
let phase5SecondSetpiece = null;

function phase5ColorHex(color) {
  return color && typeof color.getHexString === 'function'
    ? `#${color.getHexString()}`
    : null;
}

function phase5CountSceneResources() {
  const materialIds = new Set();
  let meshCount = 0;
  scene.traverse((object) => {
    if (object && object.isMesh) meshCount += 1;
    if (!object || !object.material) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      if (material && material.uuid) materialIds.add(material.uuid);
    });
  });
  return { meshCount, uniqueMaterialCount: materialIds.size };
}

function phase5ReadLegacySnapshot() {
  const size = renderer.getSize(new THREE.Vector2());
  const contextAttributes = renderer.getContext().getContextAttributes();
  const forward = camera.getWorldDirection(new THREE.Vector3());
  const sceneResources = phase5CountSceneResources();
  const qaState = typeof globalThis.getProductionSliceQaState === 'function'
    ? globalThis.getProductionSliceQaState()
    : null;
  const cow17 = animals.find((animal) => animal.id === 17) || null;
  const primaryLandmark = landmarks[0] || null;
  const barnStageIds = ['intact', 'damaged', 'roof-peel', 'exposed', 'wreckage'];
  const barnStageScores = [0, 140, 210, 280, 720];
  const barnAwardedStages = productionBarn && productionBarn.awardedStages instanceof Set
    ? Array.from(productionBarn.awardedStages)
    : [];
  const barnScoreAwarded = barnAwardedStages.reduce(
    (total, stage) => total + (barnStageScores[Number(stage)] || 0),
    0,
  );
  const barnHealth = productionBarn ? Number(productionBarn.health) : 0;
  const barnMaxHealth = productionBarn ? Number(productionBarn.maxHealth) : 0;
  const barnLegacyStage = productionBarn ? Number(productionBarn.stage) : 0;
  const landmarkHealth = primaryLandmark ? Number(primaryLandmark.health) : 0;
  const landmarkMaxHealth = primaryLandmark ? Number(primaryLandmark.maxHealth) : 0;

  return Object.freeze({
    renderer: Object.freeze({
      rendererName: 'Three.js WebGLRenderer',
      version: 'r128',
      antialias: contextAttributes ? Boolean(contextAttributes.antialias) : null,
      shadowMapEnabled: Boolean(renderer.shadowMap.enabled),
      shadowMapType: renderer.shadowMap.type === THREE.PCFSoftShadowMap ? 'PCFSoftShadowMap' : 'unknown',
      toneMapping: renderer.toneMapping === THREE.ACESFilmicToneMapping ? 'ACESFilmicToneMapping' : 'unknown',
      exposure: Number(renderer.toneMappingExposure),
      outputEncoding: renderer.outputEncoding === THREE.sRGBEncoding ? 'sRGBEncoding' : 'unknown',
      pixelRatio: Number(renderer.getPixelRatio()),
      viewportWidth: Number(size.x),
      viewportHeight: Number(size.y),
      memory: Object.freeze({
        geometries: Number(renderer.info.memory.geometries || 0),
        textures: Number(renderer.info.memory.textures || 0),
      }),
      frame: Object.freeze({
        calls: Number(renderer.info.render.calls || 0),
        triangles: Number(renderer.info.render.triangles || 0),
        points: Number(renderer.info.render.points || 0),
        lines: Number(renderer.info.render.lines || 0),
      }),
    }),
    scene: Object.freeze({
      sceneId: String(scene.uuid || 'production-scene-r128'),
      childCount: Number(scene.children.length),
      meshCount: sceneResources.meshCount,
      uniqueMaterialCount: sceneResources.uniqueMaterialCount,
      fog: Object.freeze({
        type: scene.fog && scene.fog.isFogExp2 ? 'FogExp2' : (scene.fog ? 'unknown' : 'none'),
        color: scene.fog ? phase5ColorHex(scene.fog.color) : null,
        density: scene.fog && typeof scene.fog.density === 'number' ? Number(scene.fog.density) : null,
      }),
      lights: Object.freeze([
        Object.freeze({
          type: 'AmbientLight',
          color: phase5ColorHex(ambientLight.color) || '#000000',
          intensity: Number(ambientLight.intensity),
        }),
        Object.freeze({
          type: 'HemisphereLight',
          color: phase5ColorHex(skyLight.color) || '#000000',
          groundColor: phase5ColorHex(skyLight.groundColor) || '#000000',
          intensity: Number(skyLight.intensity),
        }),
        Object.freeze({
          type: 'DirectionalLight',
          color: phase5ColorHex(dirLight.color) || '#000000',
          intensity: Number(dirLight.intensity),
        }),
      ]),
      backgroundColor: phase5ColorHex(scene.background),
    }),
    camera: Object.freeze({
      fov: Number(camera.fov),
      near: Number(camera.near),
      far: Number(camera.far),
      aspect: Number(camera.aspect),
      position: Object.freeze({
        x: Number(camera.position.x),
        y: Number(camera.position.y),
        z: Number(camera.position.z),
      }),
      forward: Object.freeze({
        x: Number(forward.x),
        y: Number(forward.y),
        z: Number(forward.z),
      }),
      shakeAmount: Number(cameraShakeIntensity || 0),
    }),
    atmosphere: Object.freeze({
      fogColorHex: scene.fog ? phase5ColorHex(scene.fog.color) : null,
      fogDensity: scene.fog && typeof scene.fog.density === 'number' ? Number(scene.fog.density) : null,
      exposure: Number(renderer.toneMappingExposure),
      ambientIntensity: Number(ambientLight.intensity),
      hemisphereIntensity: Number(skyLight.intensity),
      directionalIntensity: Number(dirLight.intensity),
      stormLightPresent: Boolean(productionStormLight && productionStormLight.parent),
      stormLightIntensity: productionStormLight ? Number(productionStormLight.intensity) : 0,
      flashTimer: Number(productionFlashTimer || 0),
    }),
    tornado: Object.freeze({
      quality: String(productionQuality),
      rootPresent: Boolean(productionTornadoRoot && productionTornadoRoot.parent),
      funnelLayerCount: Number(2 + productionVaporRibbons.length),
      vaporRibbonCount: Number(productionVaporRibbons.length),
      suctionRingCount: Number(productionSuctionRings.length),
      activeDebrisCount: Number(productionDebrisMeta.length),
      dustPuffCount: Number(productionDustPuffs.length),
      detachedFragmentCount: Number(productionFragments.length),
      stormLightPresent: Boolean(productionStormLight && productionStormLight.parent),
      isMultiVolumeHero: (2 + productionVaporRibbons.length) >= 3 && productionSuctionRings.length === 3,
    }),
    world: Object.freeze({
      campaignId: String(productionCurrentCampaignId || ''),
      quality: String(productionQuality),
      cropRowsCount: Number(productionDressingStats.cropRows || 0),
      treesCount: Number(productionDressingStats.trees || 0),
      fencesCount: Number(productionDressingStats.fences || 0),
      streetPropsCount: Number(productionDressingStats.streetProps || 0),
      targetsCount: Number(targets.length),
      landmarksCount: Number(landmarks.length),
      substationsCount: Number(substations.length),
      mediaCrewsCount: Number(chaserVans.length),
      animalsCount: Number(animals.length),
      cow17: Object.freeze({
        present: Boolean(cow17),
        decorated: Boolean(cow17 && cow17.mesh && cow17.mesh.userData.v510Decorated === true),
        airborne: Boolean(cow17 && cow17.airborne),
        scale: cow17 && cow17.mesh ? Number(cow17.mesh.scale.x) : null,
        earTag: '#17',
      }),
    }),
    setpieces: Object.freeze({
      hartFarm: Object.freeze({
        setpieceId: 'hart-farm-barn',
        displayName: 'Hart Farm Signature Barn',
        currentStageId: barnStageIds[barnLegacyStage] || 'intact',
        legacyStage: barnLegacyStage,
        health: barnHealth,
        maxHealth: barnMaxHealth,
        remainingHealthRatio: barnMaxHealth > 0 ? barnHealth / barnMaxHealth : 0,
        isFullyDestroyed: Boolean(productionBarn && productionBarn.destroyed),
        scoreAwardedTotal: barnScoreAwarded,
        detachedPieceCount: Number(productionFragments.length),
      }),
      secondStructure: Object.freeze({
        setpieceId: 'primary-campaign-landmark',
        displayName: primaryLandmark ? String(primaryLandmark.name || 'Primary Campaign Landmark') : 'Primary Campaign Landmark',
        currentStageId: primaryLandmark && primaryLandmark.destroyed ? 'destroyed' : 'intact',
        legacyStage: primaryLandmark && primaryLandmark.destroyed ? 1 : 0,
        health: landmarkHealth,
        maxHealth: landmarkMaxHealth,
        remainingHealthRatio: landmarkMaxHealth > 0 ? landmarkHealth / landmarkMaxHealth : 0,
        isFullyDestroyed: Boolean(primaryLandmark && primaryLandmark.destroyed),
        scoreAwardedTotal: primaryLandmark && primaryLandmark.destroyed ? 500 : 0,
        detachedPieceCount: 0,
      }),
    }),
    productionQa: qaState,
  });
}

function phase5SynchronizeAuthorities(live) {
  phase5RendererAuthority.synchronize(live.renderer);
  phase5SceneAuthority.synchronize(live.scene);
  phase5CameraAuthority.synchronize(live.camera);
  phase5AtmosphereAuthority.synchronize(live.atmosphere);
  phase5TornadoAuthority.synchronize(live.tornado);
  phase5WorldAuthority.synchronize(live.world);
  phase5HartFarmSetpiece.synchronize(live.setpieces.hartFarm);
  phase5SecondSetpiece.synchronize(live.setpieces.secondStructure);
}

function phase5AuthoritiesAttached() {
  return Boolean(
    phase5RendererAuthority &&
    phase5SceneAuthority &&
    phase5CameraAuthority &&
    phase5AtmosphereAuthority &&
    phase5TornadoAuthority &&
    phase5WorldAuthority &&
    phase5HartFarmSetpiece &&
    phase5SecondSetpiece
  );
}

const phase5PresentationWorldBridge = {
  version: PHASE5_PRESENTATION_WORLD_BRIDGE_VERSION,

  attach(rendererAuthority, sceneAuthority, cameraAuthority, atmosphereAuthority, tornadoAuthority, worldAuthority, hartFarmAuthority, secondSetpieceAuthority) {
    const authorities = [
      rendererAuthority,
      sceneAuthority,
      cameraAuthority,
      atmosphereAuthority,
      tornadoAuthority,
      worldAuthority,
      hartFarmAuthority,
      secondSetpieceAuthority,
    ];
    if (authorities.some((authority) => !authority || typeof authority.synchronize !== 'function' || typeof authority.getSnapshot !== 'function')) {
      throw new Error('Phase 5 passive mirrors are missing synchronize/getSnapshot methods.');
    }
    phase5RendererAuthority = rendererAuthority;
    phase5SceneAuthority = sceneAuthority;
    phase5CameraAuthority = cameraAuthority;
    phase5AtmosphereAuthority = atmosphereAuthority;
    phase5TornadoAuthority = tornadoAuthority;
    phase5WorldAuthority = worldAuthority;
    phase5HartFarmSetpiece = hartFarmAuthority;
    phase5SecondSetpiece = secondSetpieceAuthority;
    this.syncFromLegacy();
    return true;
  },

  syncFromLegacy() {
    if (!phase5AuthoritiesAttached()) return null;
    const live = phase5ReadLegacySnapshot();
    phase5SynchronizeAuthorities(live);
    return live;
  },

  reset() {
    if (!phase5AuthoritiesAttached()) return;
    this.syncFromLegacy();
  },

  runContractProbe() {
    const snapshot = this.getSnapshot();
    const checks = Object.freeze({
      rendererAgrees: JSON.stringify(snapshot.renderer) === JSON.stringify(snapshot.live.renderer),
      sceneAgrees: JSON.stringify(snapshot.scene) === JSON.stringify(snapshot.live.scene),
      cameraAgrees: JSON.stringify(snapshot.camera) === JSON.stringify(snapshot.live.camera),
      atmosphereAgrees: JSON.stringify(snapshot.atmosphere) === JSON.stringify(snapshot.live.atmosphere),
      tornadoAgrees: JSON.stringify(snapshot.tornado) === JSON.stringify(snapshot.live.tornado),
      worldAgrees: JSON.stringify(snapshot.world) === JSON.stringify(snapshot.live.world),
      hartFarmAgrees: JSON.stringify(snapshot.setpieces.hartFarm) === JSON.stringify(snapshot.live.setpieces.hartFarm),
      secondStructureAgrees: JSON.stringify(snapshot.setpieces.secondStructure) === JSON.stringify(snapshot.live.setpieces.secondStructure),
      oneProductionRenderer: snapshot.live.renderer.rendererName === 'Three.js WebGLRenderer',
      acceptedThreeRevision: snapshot.live.renderer.version === 'r128',
      acceptedHartFarmStages: snapshot.live.setpieces.hartFarm.legacyStage >= 0 && snapshot.live.setpieces.hartFarm.legacyStage <= 4,
      secondStructureUsesExistingLifecycle: ['intact', 'destroyed'].includes(snapshot.live.setpieces.secondStructure.currentStageId),
    });
    return Object.freeze({
      version: PHASE5_PRESENTATION_WORLD_BRIDGE_VERSION,
      checks,
      passed: Object.values(checks).every(Boolean),
    });
  },

  getSnapshot() {
    const live = this.syncFromLegacy();
    return Object.freeze({
      version: PHASE5_PRESENTATION_WORLD_BRIDGE_VERSION,
      attached: phase5AuthoritiesAttached(),
      renderer: phase5RendererAuthority ? phase5RendererAuthority.getSnapshot() : null,
      scene: phase5SceneAuthority ? phase5SceneAuthority.getSnapshot() : null,
      camera: phase5CameraAuthority ? phase5CameraAuthority.getSnapshot() : null,
      atmosphere: phase5AtmosphereAuthority ? phase5AtmosphereAuthority.getSnapshot() : null,
      tornado: phase5TornadoAuthority ? phase5TornadoAuthority.getSnapshot() : null,
      world: phase5WorldAuthority ? phase5WorldAuthority.getSnapshot() : null,
      setpieces: Object.freeze({
        hartFarm: phase5HartFarmSetpiece ? phase5HartFarmSetpiece.getSnapshot() : null,
        secondStructure: phase5SecondSetpiece ? phase5SecondSetpiece.getSnapshot() : null,
      }),
      live,
    });
  },
};

globalThis.__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__ = phase5PresentationWorldBridge;
// [SW:ARCH:PHASE5_PRESENTATION_WORLD_BRIDGE:END]
