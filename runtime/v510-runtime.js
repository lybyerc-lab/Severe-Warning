function productionMeasuredFps() {
  if (productionFrameSamples.length < 30) return null;
  const sorted = [...productionFrameSamples].sort((a, b) => a - b);
  return Number(sorted[Math.floor(sorted.length / 2)].toFixed(1));
}

function updateProductionTornado(dt, now) {
  if (!productionTornadoRoot) return;
  const time = now * 0.001;
  const intensity = THREE.MathUtils.clamp(0.82 + (efMultiplier - 1) * 0.16, 0.82, 1.34);
  productionTornadoRoot.scale.setScalar(intensity);
  productionTornadoRoot.rotation.y += dt * 0.34;

  productionVaporRibbons.forEach((ribbon, index) => {
    ribbon.rotation.y += dt * (0.28 + index * 0.08) * (index % 2 === 0 ? 1 : -1);
    ribbon.material.opacity = 0.13 + Math.sin(time * 2.1 + index) * 0.035 + Math.min(0.1, (efMultiplier - 1) * 0.04);
  });
  productionSuctionRings.forEach((ring, index) => {
    ring.rotation.z += dt * (0.7 + index * 0.34) * (index % 2 === 0 ? 1 : -1);
    const pulse = 1 + Math.sin(time * 4.5 + index) * 0.08;
    ring.scale.setScalar(pulse);
  });
  productionDustPuffs.forEach(puff => {
    puff.angle += dt * puff.speed * (1 + efMultiplier * 0.14);
    const breathe = 1 + Math.sin(time * 3.2 + puff.phase) * 0.15;
    puff.mesh.position.set(
      Math.cos(puff.angle) * puff.distance,
      0.7 + Math.sin(time * 4 + puff.phase) * 0.65,
      Math.sin(puff.angle) * puff.distance
    );
    puff.mesh.rotation.y += dt * 1.8;
    puff.mesh.scale.multiplyScalar(1 / Math.max(0.001, puff.mesh.userData.lastBreathe || 1));
    puff.mesh.scale.multiplyScalar(breathe);
    puff.mesh.userData.lastBreathe = breathe;
  });

  if (productionDebrisMesh) {
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    productionDebrisMeta.forEach((meta, index) => {
      meta.angle += dt * meta.speed * (1 + efMultiplier * 0.12);
      const bob = Math.sin(time * 2.7 + index * 0.63) * 1.25;
      quaternion.setFromEuler(new THREE.Euler(time * meta.spin, meta.angle * 1.4, time * meta.spin * 0.7));
      scale.setScalar(meta.scale);
      matrix.compose(
        new THREE.Vector3(Math.cos(meta.angle) * meta.radius, meta.height + bob, Math.sin(meta.angle) * meta.radius),
        quaternion,
        scale
      );
      productionDebrisMesh.setMatrixAt(index, matrix);
    });
    productionDebrisMesh.instanceMatrix.needsUpdate = true;
  }

  productionFlashTimer = Math.max(0, productionFlashTimer - dt);
  if (productionStormLight) {
    productionStormLight.intensity = productionFlashTimer > 0
      ? 2.8
      : 0.22 + currentStage * 0.07 + Math.sin(time * 1.8) * 0.04;
  }
}

function updateProductionAtmosphere(dt) {
  const stageFactor = THREE.MathUtils.clamp((currentStage - 1) / 2, 0, 1);
  const targetExposure = currentStage === 1 ? 0.94 : (currentStage === 2 ? 0.86 : 0.78);
  renderer.toneMappingExposure = THREE.MathUtils.lerp(renderer.toneMappingExposure, targetExposure, Math.min(1, dt * 0.7));

  if (scene.fog && typeof scene.fog.density === 'number') {
    let baseDensity = 0.0021;
    try {
      const blueprint = getCampaignWorldBlueprint();
      if (blueprint && Number.isFinite(blueprint.fogDensity)) baseDensity = blueprint.fogDensity;
    } catch (_) {}
    const targetDensity = baseDensity * (1 + stageFactor * 0.18);
    scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, targetDensity, Math.min(1, dt * 0.45));
    const targetFog = new THREE.Color(currentStage === 1 ? '#162437' : (currentStage === 2 ? '#101c2c' : '#09111e'));
    scene.fog.color.lerp(targetFog, Math.min(1, dt * 0.22));
    scene.background.lerp(targetFog, Math.min(1, dt * 0.16));
  }

  ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, 1.02 - stageFactor * 0.22, Math.min(1, dt * 0.6));
  skyLight.intensity = THREE.MathUtils.lerp(skyLight.intensity, 0.46 - stageFactor * 0.10, Math.min(1, dt * 0.6));
  dirLight.intensity = THREE.MathUtils.lerp(dirLight.intensity, 1.72 - stageFactor * 0.34, Math.min(1, dt * 0.5));
  dirLight.color.lerp(new THREE.Color(currentStage === 3 ? '#c4d2ea' : '#f1ddb0'), Math.min(1, dt * 0.18));
}

function updateProductionBarn(dt, isMoving) {
  if (!productionBarn) return;
  if (!productionBarn.destroyed) {
    productionBarn.beacon.rotation.z += dt * 0.52;
    productionBarn.beacon.material.opacity = 0.42 + Math.sin(performance.now() * 0.004) * 0.12;
    productionBarn.group.rotation.z = THREE.MathUtils.lerp(productionBarn.group.rotation.z, 0, Math.min(1, dt * 4));
    const distance = Math.hypot(productionBarn.x - storm.pos.x, productionBarn.z - storm.pos.z);
    if (runActive && isMoving && distance < storm.radius * 1.72) {
      damageProductionBarn(82 * dt * efMultiplier, 'contact');
    }
    if (runActive && activePullVortex && distance < storm.radius * 2.75) {
      damageProductionBarn(118 * dt * efMultiplier, 'pull');
      productionBarn.group.rotation.z = Math.sin(performance.now() * 0.026) * 0.035;
    }
  }

  for (let i = productionFragments.length - 1; i >= 0; i--) {
    const fragment = productionFragments[i];
    fragment.vy -= 20 * dt;
    fragment.mesh.position.x += fragment.vx * dt;
    fragment.mesh.position.y += fragment.vy * dt;
    fragment.mesh.position.z += fragment.vz * dt;
    fragment.mesh.rotation.x += fragment.rotX * dt;
    fragment.mesh.rotation.y += fragment.rotY * dt;
    fragment.mesh.rotation.z += fragment.rotZ * dt;
    const ground = terrainHeightAt(fragment.mesh.position.x, fragment.mesh.position.z) + 0.5;
    if (fragment.mesh.position.y <= ground && !fragment.bounced) {
      fragment.mesh.position.y = ground;
      fragment.vy = Math.abs(fragment.vy) * 0.24;
      fragment.vx *= 0.68;
      fragment.vz *= 0.68;
      fragment.bounced = true;
    }
    fragment.life -= dt;
    if (fragment.life <= 0) {
      disposeProductionObject(fragment.mesh);
      productionFragments.splice(i, 1);
    }
  }
}

function updateProductionPulseEffects(dt) {
  for (let i = productionPulseEffects.length - 1; i >= 0; i--) {
    const effect = productionPulseEffects[i];
    effect.life -= dt;
    if (effect.ring) {
      const progress = 1 - effect.life / effect.maxLife;
      effect.mesh.scale.setScalar(1 + progress * 5.5);
      effect.mesh.material.opacity = Math.max(0, 0.72 * (1 - progress));
    } else {
      effect.vy -= 6.5 * dt;
      effect.mesh.position.x += effect.vx * dt;
      effect.mesh.position.y += effect.vy * dt;
      effect.mesh.position.z += effect.vz * dt;
      effect.mesh.scale.multiplyScalar(1 + dt * 0.8);
      effect.mesh.material.opacity = Math.max(0, effect.life / effect.maxLife * 0.48);
    }
    if (effect.life <= 0) {
      disposeProductionObject(effect.mesh);
      productionPulseEffects.splice(i, 1);
    }
  }
}

function updateProductionCow17(dt) {
  const cow = animals.find(animal => animal.id === 17);
  if (!cow || !cow.mesh || cow.airborne) return;
  const distance = Math.hypot(cow.x - storm.pos.x, cow.z - storm.pos.z);
  if (distance < 62) {
    const awayYaw = Math.atan2(cow.x - storm.pos.x, cow.z - storm.pos.z);
    cow.mesh.rotation.y = THREE.MathUtils.lerp(cow.mesh.rotation.y, awayYaw, Math.min(1, dt * 3.2));
    const brace = distance < 32 ? 0.12 : 0.045;
    cow.mesh.rotation.z = THREE.MathUtils.lerp(cow.mesh.rotation.z, Math.sin(performance.now() * 0.012) * brace, Math.min(1, dt * 4));
  } else {
    cow.mesh.rotation.z = THREE.MathUtils.lerp(cow.mesh.rotation.z, 0, Math.min(1, dt * 3));
  }
}

function updateProductionSlice(dt, now, isMoving) {
  if (!productionSliceRoot || productionCurrentCampaignId !== (typeof getActiveCampaignLevel === 'function' ? getActiveCampaignLevel().id : 'lincoln-county')) {
    rebuildProductionSlice();
  }
  if (dt > 0 && dt < 0.2) {
    productionFrameSamples.push(1 / dt);
    if (productionFrameSamples.length > 180) productionFrameSamples.shift();
  }
  updateProductionTornado(dt, now);
  updateProductionAtmosphere(dt);
  updateProductionBarn(dt, isMoving);
  updateProductionPulseEffects(dt);
  updateProductionCow17(dt);
  document.body.classList.toggle('production-run', runActive);
}

const productionBaseTriggerAbility = triggerAbility;
triggerAbility = function productionTriggerAbility(slot) {
  const wasReady = Boolean(runActive && cooldowns[slot] && cooldowns[slot].current <= 0);
  productionBaseTriggerAbility(slot);
  if (!wasReady) return;
  const barnDistance = productionBarn ? Math.hypot(productionBarn.x - storm.pos.x, productionBarn.z - storm.pos.z) : Infinity;
  if (slot === 'primary') {
    productionFlashTimer = Math.max(productionFlashTimer, 0.08);
    if (barnDistance < storm.radius * 2.8) damageProductionBarn(95 * efMultiplier, 'pull');
  } else if (slot === 'secondary') {
    productionFlashTimer = Math.max(productionFlashTimer, 0.13);
    spawnProductionGustRing();
    if (barnDistance < storm.radius * 3.3) damageProductionBarn(175 * efMultiplier, 'gust');
  } else if (slot === 'tertiary') {
    productionFlashTimer = 0.22;
  }
};

globalThis.getProductionSliceQaState = function getProductionSliceQaState() {
  const cow17 = animals.find(animal => animal.id === 17);
  return {
    marker: 'V510_THREEJS_PRODUCTION_SLICE_V1',
    renderer: 'Three.js r128',
    quality: productionQuality,
    funnelLayers: 2 + productionVaporRibbons.length,
    suctionRings: productionSuctionRings.length,
    debrisInstances: productionDebrisMeta.length,
    dressing: { ...productionDressingStats },
    barn: productionBarn ? {
      health: Number(productionBarn.health.toFixed(1)),
      maxHealth: productionBarn.maxHealth,
      stage: productionBarn.stage,
      destroyed: productionBarn.destroyed,
      roofLeftDetached: !productionBarn.roofLeft.parent
    } : null,
    cow17: cow17 ? {
      scale: Number(cow17.mesh.scale.x.toFixed(2)),
      decorated: cow17.mesh.userData.v510Decorated === true,
      airborne: cow17.airborne
    } : null,
    camera: { fov: camera.fov, y: Number(camera.position.y.toFixed(2)), z: Number(camera.position.z.toFixed(2)) },
    productionMeasuredFps: productionMeasuredFps(),
    frameSampleCount: productionFrameSamples.length,
    fragments: productionFragments.length,
    campaignId: productionCurrentCampaignId
  };
};

// ============================================================================
// [SW:QA:PRODUCTION_SLICE]
// Deterministic hero setup for paired desktop and mobile evidence. It does not
// report a pass/fail judgment on aesthetics, and it never invents FPS samples.
// ============================================================================
globalThis.triggerProductionSliceQa = function triggerProductionSliceQa(mode = 'hero') {
  if (!productionBarn) return false;
  getCachedEl('mainMenu')?.classList.add('hidden');
  currentStorm = 'tornado';
  selectStormClass('tornado');
  runActive = false;
  productionQaPrepared = true;
  storm.pos.set(productionBarn.x + 24, terrainHeightAt(productionBarn.x + 24, productionBarn.z - 15), productionBarn.z - 15);
  tornadoGroup.position.copy(storm.pos);
  if (mode === 'hero') {
    const previousRunState = runActive;
    runActive = true;
    damageProductionBarn(productionBarn.maxHealth * 0.53, 'qa');
    runActive = previousRunState;
  }
  const cow17 = animals.find(animal => animal.id === 17);
  if (cow17 && !cow17.airborne) {
    cow17.x = productionBarn.x + 14;
    cow17.z = productionBarn.z + 10;
    cow17.groundY = terrainHeightAt(cow17.x, cow17.z);
    cow17.mesh.position.set(cow17.x, cow17.groundY + cow17.altitude, cow17.z);
  }
  camera.position.set(storm.pos.x + 52, storm.pos.y + 50, storm.pos.z + 68);
  camera.lookAt(productionBarn.x, terrainHeightAt(productionBarn.x, productionBarn.z) + 8, productionBarn.z);
  return true;
};

globalThis.__SW_V510_UPDATE__ = updateProductionSlice;
globalThis.__SW_V510_REBUILD__ = rebuildProductionSlice;
updateProductionQualityUi();
rebuildProductionSlice();

if (urlParams.get('sliceqa') === '1') {
  setTimeout(() => globalThis.triggerProductionSliceQa('hero'), 550);
}
// [SW:VISUAL:PRODUCTION_SLICE:END]
