// ============================================================================
// [SW:QUALITY:002_STORM_FRAME_BRIDGE]
// The accepted Hero Slice facade captured its storm updater before QUALITY-002
// was layered on. Drive the new presentation-only storm mass from the final
// renderer seam instead, so every visible frame gets the same visual update.
// ============================================================================
const SW_QUALITY_002_STORM_FRAME_BRIDGE_MARKER = 'SW_QUALITY_002_STORM_FRAME_BRIDGE_V1';

if (typeof renderer !== 'undefined' && renderer?.render && typeof swQuality002UpdateStormVolume === 'function') {
  const swQuality002PreviousRender = renderer.render.bind(renderer);
  renderer.render = function swQuality002StormFrameRender(sceneArg, cameraArg) {
    swQuality002UpdateStormVolume(performance.now());
    return swQuality002PreviousRender(sceneArg, cameraArg);
  };
}
// [SW:QUALITY:002_STORM_FRAME_BRIDGE:END]
