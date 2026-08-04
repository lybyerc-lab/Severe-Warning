function createProductionTornadoLayers() {
  const config = productionQualityConfig();
  productionTornadoRoot = new THREE.Group();
  productionTornadoRoot.name = 'V510ProductionTornadoLayers';
  tornadoGroup.add(productionTornadoRoot);

  const middleShell = addProductionPart(
    productionTornadoRoot,
    new THREE.CylinderGeometry(19.5, 1.7, 37, 32, 14, true),
    '#273244',
    0,
    18.5,
    0,
    { transparent: true, opacity: 0.28, depthWrite: false, roughness: 0.62, castShadow: false }
  );
  middleShell.material.side = THREE.DoubleSide;
  middleShell.name = 'ProductionMiddleVortex';

  const coreShell = addProductionPart(
    productionTornadoRoot,
    new THREE.CylinderGeometry(13.5, 0.9, 35, 24, 10, true),
    '#080b12',
    0,
    17.5,
    0,
    { transparent: true, opacity: 0.72, depthWrite: false, roughness: 0.8, castShadow: false }
  );
  coreShell.material.side = THREE.DoubleSide;
  coreShell.name = 'ProductionDarkCore';

  for (let ribbonIndex = 0; ribbonIndex < config.ribbons; ribbonIndex++) {
    const points = [];
    const turns = 4.2 + ribbonIndex * 0.45;
    for (let i = 0; i <= 72; i++) {
      const t = i / 72;
      const y = 1.4 + t * 36;
      const radius = 1.5 + t * (18 + ribbonIndex * 1.2);
      const angle = t * Math.PI * 2 * turns + ribbonIndex * (Math.PI * 2 / Math.max(1, config.ribbons));
      const wobble = Math.sin(t * Math.PI * 5 + ribbonIndex) * (0.4 + t * 1.6);
      points.push(new THREE.Vector3(
        Math.cos(angle) * (radius + wobble),
        y,
        Math.sin(angle) * (radius - wobble * 0.45)
      ));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const ribbon = addProductionPart(
      productionTornadoRoot,
      new THREE.TubeGeometry(curve, 72, 0.13 + ribbonIndex * 0.025, 5, false),
      ribbonIndex % 2 === 0 ? '#dbeafe' : '#94a3b8',
      0,
      0,
      0,
      { transparent: true, opacity: 0.18, depthWrite: false, roughness: 0.42, castShadow: false }
    );
    ribbon.name = 'ProductionVaporRibbon' + ribbonIndex;
    productionVaporRibbons.push(ribbon);
  }

  const ringColors = ['#d7c2a1', '#9b7a56', '#dbeafe'];
  [7.5, 11.5, 15.5].forEach((radius, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.16 + index * 0.04, 6, 48),
      new THREE.MeshBasicMaterial({
        color: ringColors[index],
        transparent: true,
        opacity: index === 2 ? 0.16 : 0.28,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.45 + index * 0.38;
    productionTornadoRoot.add(ring);
    productionSuctionRings.push(ring);
  });

  const dustGeometry = new THREE.DodecahedronGeometry(1.0, 0);
  const dustMaterial = productionMaterial('#8a6a49', { transparent: true, opacity: 0.34, depthWrite: false, roughness: 1, flatShading: true });
  for (let i = 0; i < config.dust; i++) {
    const mesh = new THREE.Mesh(dustGeometry.clone(), dustMaterial.clone());
    const angle = (i / config.dust) * Math.PI * 2;
    const distance = 6.5 + (i % 4) * 2.2;
    const scale = 1.6 + (i % 3) * 0.55;
    mesh.scale.set(scale * 1.25, scale * 0.62, scale);
    mesh.castShadow = false;
    productionTornadoRoot.add(mesh);
    productionDustPuffs.push({ mesh, angle, distance, speed: 0.46 + (i % 5) * 0.065, phase: i * 0.73 });
  }

  productionDebrisMeta = [];
  const debrisGeometry = new THREE.BoxGeometry(0.7, 0.28, 1.15);
  const debrisMaterial = productionMaterial('#594434', { roughness: 0.9 });
  productionDebrisMesh = new THREE.InstancedMesh(debrisGeometry, debrisMaterial, config.debris);
  productionDebrisMesh.castShadow = config.shadows;
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < config.debris; i++) {
    const meta = {
      angle: (i / config.debris) * Math.PI * 2,
      height: 1.2 + (i % 8) * 2.55,
      radius: 5.2 + (i % 7) * 1.85,
      speed: 0.62 + (i % 6) * 0.08,
      spin: 0.35 + (i % 5) * 0.21,
      scale: 0.55 + (i % 4) * 0.2
    };
    productionDebrisMeta.push(meta);
    matrix.makeTranslation(Math.cos(meta.angle) * meta.radius, meta.height, Math.sin(meta.angle) * meta.radius);
    productionDebrisMesh.setMatrixAt(i, matrix);
  }
  productionDebrisMesh.instanceMatrix.needsUpdate = true;
  productionTornadoRoot.add(productionDebrisMesh);

  const canopyMaterial = productionMaterial('#101827', { transparent: true, opacity: 0.48, depthWrite: false, roughness: 0.96, flatShading: true });
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(7.2 + (i % 3) * 1.6, 1), canopyMaterial.clone());
    canopy.position.set(Math.cos(angle) * 15, 37 + (i % 2) * 2.2, Math.sin(angle) * 15);
    canopy.scale.set(1.8, 0.52, 1.45);
    canopy.castShadow = false;
    productionTornadoRoot.add(canopy);
  }

  productionStormLight = new THREE.PointLight('#b9d7ff', 0.36, 92, 2);
  productionStormLight.position.set(0, 22, 0);
  tornadoGroup.add(productionStormLight);
}

// ============================================================================
// [SW:WORLD:PRODUCTION_DRESSING]
// Visual density is authored around the road grid with instanced props. These
// meshes do not participate in collision, score, or district progression.
// ============================================================================
