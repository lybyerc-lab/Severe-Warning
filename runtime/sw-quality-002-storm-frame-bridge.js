// ============================================================================
// [SW:QUALITY:002_STORM_FRAME_BRIDGE]
// The accepted Hero Slice facade captured its storm updater before QUALITY-002
// was layered on. Drive the new presentation-only storm mass from the final
// renderer seam instead, so every visible frame gets the same visual update.
// ============================================================================
const SW_QUALITY_002_STORM_FRAME_BRIDGE_MARKER = 'SW_QUALITY_002_STORM_FRAME_BRIDGE_V1';

// Three.js r128 does not guarantee Texture.userData is initialized in this
// player build. Keep ownership metadata local to the generated smoke texture so
// QUALITY-002 can dispose only what it creates.
if (typeof swQuality002MakeSmokeTexture === 'function') {
  swQuality002MakeSmokeTexture = function swQuality002MakeSmokeTextureR128Compat() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(64, 64, 6, 64, 64, 62);
    gradient.addColorStop(0, 'rgba(255,255,255,0.98)');
    gradient.addColorStop(0.35, 'rgba(255,255,255,0.86)');
    gradient.addColorStop(0.72, 'rgba(255,255,255,0.34)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    texture.userData = texture.userData || {};
    texture.userData.swQuality002Owned = true;
    return texture;
  };
}

if (typeof renderer !== 'undefined' && renderer?.render && typeof swQuality002UpdateStormVolume === 'function') {
  const swQuality002PreviousRender = renderer.render.bind(renderer);
  renderer.render = function swQuality002StormFrameRender(sceneArg, cameraArg) {
    swQuality002UpdateStormVolume(performance.now());
    return swQuality002PreviousRender(sceneArg, cameraArg);
  };
}
// [SW:QUALITY:002_STORM_FRAME_BRIDGE:END]
