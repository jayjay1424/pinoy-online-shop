import * as THREE from 'three';
import { MaterialsFactory } from '../Materials';

// ============================================================================
// 1. TERNO CAPELET (Iconic Architectural Butterfly Sleeves)
// ============================================================================
export function createTernoCapeletModel(fabricHex = '#F5F0E6', accentHex = '#C4975D') {
  const root = new THREE.Group();
  root.name = 'TernoCapelet';

  const fabricMat = MaterialsFactory.createPinaFabricMaterial(fabricHex);
  const inabelMat = MaterialsFactory.createInabelLiningMaterial();
  const brassMat = MaterialsFactory.createAntiqueBrassMaterial(accentHex);
  const mopMat = MaterialsFactory.createPalawanPearlMaterial('#FFFFFF');

  const capeGroup = new THREE.Group();
  const sleevesGroup = new THREE.Group();
  const chainGroup = new THREE.Group();

  root.add(capeGroup);
  root.add(sleevesGroup);
  root.add(chainGroup);

  // Capelet collar and curved yoke draped over shoulders
  const yokeGeo = new THREE.CylinderGeometry(0.38, 0.62, 0.45, 32, 8, true);
  yokeGeo.scale(1.15, 1.0, 0.85);
  const yoke = new THREE.Mesh(yokeGeo, fabricMat);
  yoke.position.y = 0.85;
  yoke.castShadow = true;
  capeGroup.add(yoke);

  // Iconic Architectural Butterfly Sleeves (Left & Right)
  function createButterflySleeve(side = 1) {
    const sGroup = new THREE.Group();
    // High arched butterfly sleeve shape: flared oval crest standing proud
    const sleeveGeo = new THREE.CylinderGeometry(0.32, 0.16, 0.65, 32, 16, true);
    sleeveGeo.scale(0.85, 1.25, 1.45);
    const sleeve = new THREE.Mesh(sleeveGeo, fabricMat);
    sleeve.position.set(side * 0.72, 1.15, 0);
    sleeve.rotation.z = side * -0.42;
    sleeve.rotation.y = side * 0.25;
    sleeve.castShadow = true;
    sGroup.add(sleeve);

    // Inner structured Inabel binakol stiffener
    const stiffener = new THREE.Mesh(sleeveGeo.clone(), inabelMat);
    stiffener.scale.set(0.96, 0.96, 0.96);
    stiffener.position.copy(sleeve.position);
    stiffener.rotation.copy(sleeve.rotation);
    sGroup.add(stiffener);

    // Pleated base tucks along the shoulder armhole
    for (let p = 0; p < 7; p++) {
      const pleat = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.18, 0.08), brassMat);
      pleat.position.set(side * 0.58 + side * p * 0.03, 0.92, (p - 3) * 0.04);
      pleat.rotation.z = side * -0.3;
      sGroup.add(pleat);
    }

    return sGroup;
  }

  sleevesGroup.add(createButterflySleeve(1));
  sleevesGroup.add(createButterflySleeve(-1));

  // Front Mother-of-Pearl Hook Chain & Filigree Clasp
  const chainCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.16, 1.02, 0.34),
    new THREE.Vector3(0, 0.96, 0.38),
    new THREE.Vector3(0.16, 1.02, 0.34),
  ]);
  const chain = new THREE.Mesh(new THREE.TubeGeometry(chainCurve, 16, 0.012, 8, false), brassMat);
  chain.castShadow = true;
  chainGroup.add(chain);

  // MOP Cabochons flanking front closure
  [-0.16, 0.16].forEach(x => {
    const gem = new THREE.Mesh(new THREE.SphereGeometry(0.038, 16, 16), mopMat);
    gem.position.set(x, 1.02, 0.35);
    chainGroup.add(gem);
  });

  function setExploded(t) {
    sleevesGroup.position.x = t * 0.35;
    chainGroup.position.z = t * 0.30;
  }

  function updateMaterials(newFabHex) {
    if (newFabHex) fabricMat.color.set(newFabHex);
  }

  root.setExploded = setExploded;
  root.updateMaterials = updateMaterials;
  return root;
}

// ============================================================================
// 2. MANDIRIGMA DAMASCUS & KAMAGONG WATCH
// ============================================================================
export function createMandirigmaWatchModel(woodHex = '#24140E', steelHex = '#4A5568') {
  const root = new THREE.Group();
  root.name = 'MandirigmaWatch';

  const woodMat = MaterialsFactory.createKamagongWoodMaterial(woodHex);
  const leatherMat = MaterialsFactory.createVachettaLeatherMaterial('#3D2314');
  const brassMat = MaterialsFactory.createAntiqueBrassMaterial('#C4975D');
  const steelMat = new THREE.MeshStandardMaterial({
    color: steelHex,
    roughness: 0.28,
    metalness: 0.88,
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xFFFFFF,
    transmission: 0.95,
    roughness: 0.02,
    ior: 1.52,
    thickness: 0.2,
  });

  const caseGroup = new THREE.Group();
  const dialGroup = new THREE.Group();
  const strapGroup = new THREE.Group();

  root.add(caseGroup);
  root.add(dialGroup);
  root.add(strapGroup);

  // 1. Turned Kamagong Wood Beveled Watch Case (42mm luxury diameter)
  const caseGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.22, 48);
  const caseMesh = new THREE.Mesh(caseGeo, woodMat);
  caseMesh.rotation.x = Math.PI / 2;
  caseMesh.position.y = 0.65;
  caseMesh.castShadow = true;
  caseGroup.add(caseMesh);

  // Brass Inner Bezel Ring
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.035, 16, 48), brassMat);
  bezel.position.set(0, 0.65, 0.12);
  caseGroup.add(bezel);

  // Fluted Brass Crown at 3 o'clock
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.08, 20), brassMat);
  crown.rotation.z = Math.PI / 2;
  crown.position.set(0.64, 0.65, 0);
  caseGroup.add(crown);

  // Sapphire Crystal Glass
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.015, 36), glassMat);
  glass.rotation.x = Math.PI / 2;
  glass.position.set(0, 0.65, 0.13);
  caseGroup.add(glass);

  // 2. Damascus Folded Steel Dial Face
  const dialGeo = new THREE.CircleGeometry(0.45, 36);
  const dial = new THREE.Mesh(dialGeo, steelMat);
  dial.position.set(0, 0.65, 0.10);
  dialGroup.add(dial);

  // 12 Brass Kalis Sword Indices around the dial
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2;
    const isMain = i % 3 === 0;
    const index = new THREE.Mesh(
      new THREE.BoxGeometry(isMain ? 0.03 : 0.015, 0.08, 0.01),
      brassMat
    );
    index.position.set(Math.cos(ang) * 0.38, 0.65 + Math.sin(ang) * 0.38, 0.105);
    index.rotation.z = ang - Math.PI / 2;
    dialGroup.add(index);
  }

  // Kalis Sword Hour and Minute Hands
  const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.22, 0.01), brassMat);
  hourHand.position.set(0.06, 0.65 + 0.08, 0.11);
  hourHand.rotation.z = -0.6;
  dialGroup.add(hourHand);

  const minHand = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.32, 0.01), brassMat);
  minHand.position.set(-0.08, 0.65 + 0.12, 0.112);
  minHand.rotation.z = 0.8;
  dialGroup.add(minHand);

  // Center Hand Pin
  const centerPin = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16), brassMat);
  centerPin.rotation.x = Math.PI / 2;
  centerPin.position.set(0, 0.65, 0.115);
  dialGroup.add(centerPin);

  // 3. Stitched Natural Abaca-Leather Watch Strap (Top & Bottom)
  function createStrap(isTop = true) {
    const dir = isTop ? 1 : -1;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.65 + dir * 0.52, 0),
      new THREE.Vector3(0, 0.65 + dir * 0.95, -0.15),
      new THREE.Vector3(0, 0.65 + dir * 1.35, -0.42),
    ]);
    const sMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.18, 12, false), leatherMat);
    sMesh.scale.set(1.4, 1.0, 0.22);
    sMesh.castShadow = true;
    return sMesh;
  }

  strapGroup.add(createStrap(true));
  strapGroup.add(createStrap(false));

  function setExploded(t) {
    caseGroup.position.z = -t * 0.2;
    dialGroup.position.z = t * 0.25;
    strapGroup.position.y = -t * 0.15;
  }

  function updateMaterials(newWoodHex, newSteelHex) {
    if (newWoodHex) woodMat.color.set(newWoodHex);
    if (newSteelHex) steelMat.color.set(newSteelHex);
  }

  root.setExploded = setExploded;
  root.updateMaterials = updateMaterials;
  return root;
}

// ============================================================================
// 3. GINTO NG BUTUAN 24K GRANULATED SIGNET RING
// ============================================================================
export function createButuanRingModel(goldHex = '#E5C158') {
  const root = new THREE.Group();
  root.name = 'ButuanRing';

  const goldMat = MaterialsFactory.createFiligreeGoldMaterial(goldHex);
  const ringGroup = new THREE.Group();
  const crownGroup = new THREE.Group();

  root.add(ringGroup);
  root.add(crownGroup);

  // 1. Heavy Solid Gold Tapered Shank (Curved finger band)
  const shankGeo = new THREE.TorusGeometry(0.55, 0.14, 24, 48);
  const shank = new THREE.Mesh(shankGeo, goldMat);
  shank.position.y = 0.65;
  shank.castShadow = true;
  ringGroup.add(shank);

  // Stepped filigree shoulders
  [-0.48, 0.48].forEach(x => {
    const shoulder = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.26, 0.22), goldMat);
    shoulder.position.set(x * 0.8, 1.02, 0);
    shoulder.rotation.z = x > 0 ? -0.4 : 0.4;
    ringGroup.add(shoulder);
  });

  // 2. Pre-Colonial Butuan Octagonal Signet Table with Sacred Sun Granulation
  const tableGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.14, 8);
  const table = new THREE.Mesh(tableGeo, goldMat);
  table.position.set(0, 1.22, 0);
  table.castShadow = true;
  crownGroup.add(table);

  // Micro-Granulation Wire Beads (Pre-colonial gold granulation)
  const beadGeo = new THREE.SphereGeometry(0.024, 10, 10);
  for (let b = 0; b < 24; b++) {
    const ang = (b / 24) * Math.PI * 2;
    const bead = new THREE.Mesh(beadGeo, goldMat);
    bead.position.set(Math.cos(ang) * 0.35, 1.28, Math.sin(ang) * 0.35);
    crownGroup.add(bead);
  }

  // Central Sacred Solar Boss
  const sunBoss = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 20), goldMat);
  sunBoss.scale.set(1.0, 0.5, 1.0);
  sunBoss.position.set(0, 1.29, 0);
  crownGroup.add(sunBoss);

  function setExploded(t) {
    crownGroup.position.y = t * 0.35;
    ringGroup.position.y = -t * 0.15;
  }

  function updateMaterials(newGoldHex) {
    if (newGoldHex) goldMat.color.set(newGoldHex);
  }

  root.setExploded = setExploded;
  root.updateMaterials = updateMaterials;
  return root;
}

// ============================================================================
// 4. SALAKOT NG DATU ARCHITECTURAL HEADPIECE
// ============================================================================
export function createSalakotModel(bambooHex = '#D8B781', silverHex = '#E2E8F0') {
  const root = new THREE.Group();
  root.name = 'SalakotDatu';

  const bambooMat = MaterialsFactory.createWovenLeafMaterial(bambooHex);
  const silverMat = new THREE.MeshStandardMaterial({
    color: silverHex,
    roughness: 0.22,
    metalness: 0.92,
  });
  const mopMat = MaterialsFactory.createPalawanPearlMaterial('#FFFFFF');

  const domeGroup = new THREE.Group();
  const finialGroup = new THREE.Group();

  root.add(domeGroup);
  root.add(finialGroup);

  // 1. Elegant Conical Sun Dome (Shaved bamboo ribs)
  const domeGeo = new THREE.ConeGeometry(1.28, 0.65, 48, 16, true);
  const dome = new THREE.Mesh(domeGeo, bambooMat);
  dome.position.y = 0.55;
  dome.castShadow = true;
  dome.receiveShadow = true;
  domeGroup.add(dome);

  // Outer Bamboo Rim Binding
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.035, 16, 48), bambooMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.22;
  rim.castShadow = true;
  domeGroup.add(rim);

  // 2. Silver Filigree Spire Finial at Apex
  const spireGeo = new THREE.ConeGeometry(0.12, 0.52, 20);
  const spire = new THREE.Mesh(spireGeo, silverMat);
  spire.position.y = 1.12;
  spire.castShadow = true;
  finialGroup.add(spire);

  // Silver base collar
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.03, 12, 24), silverMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.88;
  finialGroup.add(collar);

  // Dangling Mother-of-Pearl Seed Beads around the rim
  const numBeads = 16;
  for (let i = 0; i < numBeads; i++) {
    const ang = (i / numBeads) * Math.PI * 2;
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 12), mopMat);
    bead.position.set(Math.cos(ang) * 1.25, 0.16, Math.sin(ang) * 1.25);
    domeGroup.add(bead);
  }

  function setExploded(t) {
    finialGroup.position.y = t * 0.45;
  }

  function updateMaterials(newBamHex, newSilvHex) {
    if (newBamHex) bambooMat.color.set(newBamHex);
    if (newSilvHex) silverMat.color.set(newSilvHex);
  }

  root.setExploded = setExploded;
  root.updateMaterials = updateMaterials;
  return root;
}

// ============================================================================
// 5. VIGAN DRAGON-KILN BURNAY DECANTER
// ============================================================================
export function createBurnayDecanterModel(clayHex = '#4A3528', brassHex = '#C4975D') {
  const root = new THREE.Group();
  root.name = 'BurnayDecanter';

  const clayMat = new THREE.MeshStandardMaterial({
    color: clayHex,
    roughness: 0.85,
    metalness: 0.05,
  });
  const brassMat = MaterialsFactory.createAntiqueBrassMaterial(brassHex);
  const ropeMat = MaterialsFactory.createWovenLeafMaterial('#A67C52');

  const jarGroup = new THREE.Group();
  const spoutGroup = new THREE.Group();

  root.add(jarGroup);
  root.add(spoutGroup);

  // 1. Turned Unglazed Wood-Fired Stoneware Burnay Jar
  const jarPoints = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.42, 0.04),
    new THREE.Vector2(0.68, 0.38),
    new THREE.Vector2(0.74, 0.72),
    new THREE.Vector2(0.55, 1.05),
    new THREE.Vector2(0.28, 1.22),
    new THREE.Vector2(0.24, 1.38),
    new THREE.Vector2(0.28, 1.44),
  ];
  const jarGeo = new THREE.LatheGeometry(jarPoints, 40);
  const jar = new THREE.Mesh(jarGeo, clayMat);
  jar.castShadow = true;
  jar.receiveShadow = true;
  jarGroup.add(jar);

  // Woven Abaca Rope Neck Binding
  for (let r = 0; r < 4; r++) {
    const rope = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.02, 10, 36), ropeMat);
    rope.rotation.x = Math.PI / 2;
    rope.position.y = 1.24 + r * 0.045;
    jarGroup.add(rope);
  }

  // 2. Hand-Forged Antique Brass Pouring Spout & Stopper
  const spoutGeo = new THREE.CylinderGeometry(0.08, 0.18, 0.28, 24);
  const spout = new THREE.Mesh(spoutGeo, brassMat);
  spout.position.y = 1.56;
  spout.castShadow = true;
  spoutGroup.add(spout);

  // Brass Ring Stopper Handle
  const stopperRing = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.018, 12, 24), brassMat);
  stopperRing.position.y = 1.76;
  spoutGroup.add(stopperRing);

  function setExploded(t) {
    spoutGroup.position.y = t * 0.45;
  }

  function updateMaterials(newClayHex, newBrassHex) {
    if (newClayHex) clayMat.color.set(newClayHex);
    if (newBrassHex) brassMat.color.set(newBrassHex);
  }

  root.setExploded = setExploded;
  root.updateMaterials = updateMaterials;
  return root;
}

// ============================================================================
// 6. FILIPINO CREOLLA "PALAMUTI" EARRINGS (PAIR)
// ============================================================================
export function createCreollaEarringsModel(goldHex = '#D4AF37') {
  const root = new THREE.Group();
  root.name = 'CreollaEarrings';

  const goldMat = MaterialsFactory.createFiligreeGoldMaterial(goldHex);
  const mopMat = MaterialsFactory.createPalawanPearlMaterial('#FFFDF8');

  function createSingleCreolla(xOffset = 0) {
    const g = new THREE.Group();
    g.position.x = xOffset;

    // 19th-Century Vigan Filigree Crescent Hoop
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.04, 16, 48), goldMat);
    hoop.position.y = 0.65;
    hoop.castShadow = true;
    g.add(hoop);

    // Fine wire filigree scallops along inner rim
    for (let i = 0; i < 9; i++) {
      const ang = (i / 9) * Math.PI + Math.PI;
      const scallop = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.01, 8, 16), goldMat);
      scallop.position.set(Math.cos(ang) * 0.36, 0.65 + Math.sin(ang) * 0.36, 0);
      g.add(scallop);
    }

    // Dangling Palawan Seed Pearl
    const drop = new THREE.Mesh(new THREE.SphereGeometry(0.08, 20, 20), mopMat);
    drop.scale.set(1.0, 1.35, 1.0);
    drop.position.set(0, 0.14, 0);
    drop.castShadow = true;
    g.add(drop);

    // Ear wire hook at top
    const hookCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.07, 0),
      new THREE.Vector3(0, 1.25, -0.05),
      new THREE.Vector3(0, 1.30, -0.15),
      new THREE.Vector3(0, 1.22, -0.22),
    ]);
    const hook = new THREE.Mesh(new THREE.TubeGeometry(hookCurve, 16, 0.012, 8, false), goldMat);
    g.add(hook);

    return g;
  }

  root.add(createSingleCreolla(-0.55));
  root.add(createSingleCreolla(0.55));

  function setExploded(t) {
    root.children[0].position.x = -0.55 - t * 0.3;
    root.children[1].position.x = 0.55 + t * 0.3;
  }

  function updateMaterials(newGoldHex) {
    if (newGoldHex) goldMat.color.set(newGoldHex);
  }

  root.setExploded = setExploded;
  root.updateMaterials = updateMaterials;
  return root;
}

// ============================================================================
// 7. KAMAGONG & CARABAO HORN CHRONO VAULT
// ============================================================================
export function createChronoVaultModel(woodHex = '#24140E', hornHex = '#120D0A') {
  const root = new THREE.Group();
  root.name = 'ChronoVault';

  const woodMat = MaterialsFactory.createKamagongWoodMaterial(woodHex);
  const hornMat = new THREE.MeshStandardMaterial({
    color: hornHex,
    roughness: 0.18,
    metalness: 0.05,
  });
  const brassMat = MaterialsFactory.createAntiqueBrassMaterial('#C4975D');
  const velvetMat = MaterialsFactory.createVelvetMaterial('#0F392B');

  const trunkBaseGroup = new THREE.Group();
  const trunkLidGroup = new THREE.Group();
  const interiorGroup = new THREE.Group();

  root.add(trunkBaseGroup);
  root.add(trunkLidGroup);
  root.add(interiorGroup);

  const tW = 1.52;
  const tH = 0.52;
  const tD = 1.04;

  // 1. Solid Kamagong Wood Trunk Base
  const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(tW, tH, tD), woodMat);
  baseMesh.position.y = tH / 2;
  baseMesh.castShadow = true;
  trunkBaseGroup.add(baseMesh);

  // Polished Black Carabao Horn Inlay Corner Brackets (8 Corners)
  const hornSize = 0.14;
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    const hMesh = new THREE.Mesh(new THREE.BoxGeometry(hornSize, 0.18, hornSize), hornMat);
    hMesh.position.set(sx * (tW / 2 - 0.05), 0.10, sz * (tD / 2 - 0.05));
    trunkBaseGroup.add(hMesh);
  });

  // Solid Brass Dual Trunk Latches on Front
  [-0.38, 0.38].forEach(lx => {
    const latch = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.024), brassMat);
    latch.position.set(lx, tH * 0.55, tD / 2 + 0.015);
    trunkBaseGroup.add(latch);
  });

  // 2. Interior 4-Piece Watch Cushions with Velvet Lining
  const velvetBase = new THREE.Mesh(new THREE.BoxGeometry(tW - 0.12, 0.08, tD - 0.12), velvetMat);
  velvetBase.position.y = tH - 0.02;
  interiorGroup.add(velvetBase);

  // 4 Velvet Watch Pillows in 2x2 Grid
  [[-0.38, -0.24], [0.38, -0.24], [-0.38, 0.24], [0.38, 0.24]].forEach(([px, pz]) => {
    const pillow = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.26, 24), velvetMat);
    pillow.rotation.z = Math.PI / 2;
    pillow.position.set(px, tH + 0.06, pz);
    interiorGroup.add(pillow);
  });

  // 3. Hinged Kamagong Lid
  const lidFrame = new THREE.Mesh(new THREE.BoxGeometry(tW + 0.02, 0.14, tD + 0.02), woodMat);
  lidFrame.castShadow = true;

  trunkLidGroup.position.set(0, tH, -tD / 2);
  lidFrame.position.set(0, 0.07, tD / 2);
  trunkLidGroup.add(lidFrame);

  function setExploded(t) {
    trunkLidGroup.rotation.x = -t * (Math.PI * 0.35);
    interiorGroup.position.y = t * 0.22;
  }

  function updateMaterials(newWoodHex, newHornHex) {
    if (newWoodHex) woodMat.color.set(newWoodHex);
    if (newHornHex) hornMat.color.set(newHornHex);
  }

  root.setExploded = setExploded;
  root.updateMaterials = updateMaterials;
  return root;
}

