// ============================================================================
// [SW:ARCH:PHASE5_PRESENTATION_WORLD_BRIDGE]
// Lexical bridge attaching legacy presentation, world, and destruction state
// to typed observation authorities.
// ============================================================================
const PHASE5_PRESENTATION_WORLD_BRIDGE_VERSION = 'MODERNIZATION_PHASE5_PRESENTATION_WORLD_V1';

let phase5RendererAuthority = null;
let phase5SceneAuthority = null;
let phase5CameraAuthority = null;
let phase5AtmosphereAuthority = null;
let phase5TornadoAuthority = null;
let phase5WorldAuthority = null;
let phase5HartFarmSetpiece = null;
let phase5SiloSetpiece = null;

const phase5PresentationWorldBridge = {
  version: PHASE5_PRESENTATION_WORLD_BRIDGE_VERSION,

  attach(renderer, scene, camera, atmosphere, tornado, world, hartFarm, silo) {
    if (!renderer || typeof renderer.getSnapshot !== 'function') {
      throw new Error('Phase 5 renderer authority is missing required methods.');
    }
    if (!scene || typeof scene.getSnapshot !== 'function') {
      throw new Error('Phase 5 scene authority is missing required methods.');
    }
    if (!camera || typeof camera.getSnapshot !== 'function') {
      throw new Error('Phase 5 camera authority is missing required methods.');
    }
    if (!atmosphere || typeof atmosphere.getSnapshot !== 'function') {
      throw new Error('Phase 5 atmosphere authority is missing required methods.');
    }
    if (!tornado || typeof tornado.getSnapshot !== 'function') {
      throw new Error('Phase 5 tornado authority is missing required methods.');
    }
    if (!world || typeof world.getSnapshot !== 'function') {
      throw new Error('Phase 5 world authority is missing required methods.');
    }
    if (!hartFarm || typeof hartFarm.getSnapshot !== 'function') {
      throw new Error('Phase 5 Hart Farm setpiece authority is missing required methods.');
    }
    if (!silo || typeof silo.getSnapshot !== 'function') {
      throw new Error('Phase 5 Silo setpiece authority is missing required methods.');
    }

    phase5RendererAuthority = renderer;
    phase5SceneAuthority = scene;
    phase5CameraAuthority = camera;
    phase5AtmosphereAuthority = atmosphere;
    phase5TornadoAuthority = tornado;
    phase5WorldAuthority = world;
    phase5HartFarmSetpiece = hartFarm;
    phase5SiloSetpiece = silo;
    return true;
  },

  reset() {
    if (phase5RendererAuthority) phase5RendererAuthority.reset();
    if (phase5SceneAuthority) phase5SceneAuthority.reset();
    if (phase5CameraAuthority) phase5CameraAuthority.reset();
    if (phase5AtmosphereAuthority) phase5AtmosphereAuthority.reset();
    if (phase5TornadoAuthority) phase5TornadoAuthority.reset();
    if (phase5WorldAuthority) phase5WorldAuthority.reset();
    if (phase5HartFarmSetpiece) phase5HartFarmSetpiece.reset();
    if (phase5SiloSetpiece) phase5SiloSetpiece.reset();
  },

  getSnapshot() {
    return Object.freeze({
      version: PHASE5_PRESENTATION_WORLD_BRIDGE_VERSION,
      attached: Boolean(
        phase5RendererAuthority &&
        phase5SceneAuthority &&
        phase5CameraAuthority &&
        phase5AtmosphereAuthority &&
        phase5TornadoAuthority &&
        phase5WorldAuthority &&
        phase5HartFarmSetpiece &&
        phase5SiloSetpiece
      ),
      renderer: phase5RendererAuthority ? phase5RendererAuthority.getSnapshot() : null,
      scene: phase5SceneAuthority ? phase5SceneAuthority.getSnapshot() : null,
      camera: phase5CameraAuthority ? phase5CameraAuthority.getSnapshot() : null,
      atmosphere: phase5AtmosphereAuthority ? phase5AtmosphereAuthority.getSnapshot() : null,
      tornado: phase5TornadoAuthority ? phase5TornadoAuthority.getSnapshot() : null,
      world: phase5WorldAuthority ? phase5WorldAuthority.getSnapshot() : null,
      setpieces: {
        hartFarm: phase5HartFarmSetpiece ? phase5HartFarmSetpiece.getSnapshot() : null,
        secondStructure: phase5SiloSetpiece ? phase5SiloSetpiece.getSnapshot() : null
      }
    });
  }
};

globalThis.__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__ = phase5PresentationWorldBridge;
// [SW:ARCH:PHASE5_PRESENTATION_WORLD_BRIDGE:END]
