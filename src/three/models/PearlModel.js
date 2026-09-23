import * as THREE from 'three';
import { MaterialsFactory } from '../Materials';

export function createPearlModel(metalHex = '#D4AF37', pearlTint = '#FDF7E7') {
  const root = new THREE.Group();
  root.name = 'PerlasNgSilangan';

  const metalMat = MaterialsFactory.createFiligreeGoldMaterial(metalHex);
  const pearlMat = MaterialsFactory.createPalawanPearlMaterial(pearlTint);

  const pearlGroup = new THREE.Group();
  const basketGroup = new THREE.Group();
  const chainGroup = new THREE.Group();

  root.add(pearlGroup);
  root.add(basketGroup);
  root.add(chainGroup);

  // 1. Palawan Golden South Sea Pearl (14.5mm AAA Luster, 128-segment ultra-smooth sphere)
  const pearlGeo = new THREE.SphereGeometry(0.48, 128, 128);
  const pearlMesh = new THREE.Mesh(pearlGeo, pearlMat);
  pearlMesh.position.y = 0.52;
  pearlMesh.castShadow = true;
  pearlMesh.receiveShadow = true;
  pearlGroup.add(pearlMesh);

  // 2. Authentic Meycauayan Filigree Tamborin Granulation Basket
  // Base granulated solid gold collar ring
  const baseTorus = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.032, 20, 48), metalMat);
  baseTorus.rotation.x = Math.PI / 2;
  baseTorus.position.y = 0.22;
  baseTorus.castShadow = true;
  basketGroup.add(baseTorus);

  // Secondary inner filigree rim
  const innerRim = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.018, 16, 36), metalMat);
  innerRim.rotation.x = Math.PI / 2;
  innerRim.position.y = 0.14;
  innerRim.castShadow = true;
  basketGroup.add(innerRim);

  // Base filigree granulation beads ring (24 micro-beads along the base perimeter)
  const baseBeadCount = 24;
  const beadGeo = new THREE.SphereGeometry(0.024, 12, 12);
  for (let b = 0; b < baseBeadCount; b++) {
    const ang = (b / baseBeadCount) * Math.PI * 2;
    const mb = new THREE.Mesh(beadGeo, metalMat);
    mb.position.set(Math.cos(ang) * 0.36, 0.22, Math.sin(ang) * 0.36);
    mb.castShadow = true;
    basketGroup.add(mb);
  }

  // 10 Filigree Cage Ribs with authentic Tamborin filigree scrollwork curls
  const ribCount = 10;
  for (let i = 0; i < ribCount; i++) {
    const angle = (i / ribCount) * Math.PI * 2;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    // Main structural filigree rib
    const ribCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(cosA * 0.24, 0.14, sinA * 0.24),
      new THREE.Vector3(cosA * 0.44, 0.36, sinA * 0.44),
      new THREE.Vector3(cosA * 0.51, 0.58, sinA * 0.51),
      new THREE.Vector3(cosA * 0.43, 0.78, sinA * 0.43),
    ]);
    const ribMesh = new THREE.Mesh(new THREE.TubeGeometry(ribCurve, 24, 0.016, 8, false), metalMat);
    ribMesh.castShadow = true;
    basketGroup.add(ribMesh);

    // Micro-granulated gold flower bead at tip of each rib
    const tipBead = new THREE.Mesh(new THREE.SphereGeometry(0.034, 14, 14), metalMat);
    tipBead.position.set(cosA * 0.43, 0.78, sinA * 0.43);
    tipBead.castShadow = true;
    basketGroup.add(tipBead);

    // Fine decorative filigree S-scroll wire nestled between ribs
    const midAngle = angle + (Math.PI / ribCount);
    const scrollCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(midAngle) * 0.38, 0.26, Math.sin(midAngle) * 0.38),
      new THREE.Vector3(Math.cos(midAngle) * 0.46, 0.42, Math.sin(midAngle) * 0.46),
      new THREE.Vector3(Math.cos(midAngle) * 0.42, 0.54, Math.sin(midAngle) * 0.42),
    ]);
    const scrollMesh = new THREE.Mesh(new THREE.TubeGeometry(scrollCurve, 16, 0.009, 6, false), metalMat);
    scrollMesh.castShadow = true;
    basketGroup.add(scrollMesh);
  }

  // 3. Ornate Filigree Bail (Top suspension loop with granulated bezel)
  const bailGeo = new THREE.TorusGeometry(0.12, 0.026, 16, 36);
  const bailMesh = new THREE.Mesh(bailGeo, metalMat);
  bailMesh.position.y = 1.12;
  bailMesh.castShadow = true;
  basketGroup.add(bailMesh);

  // Micro-collar at base of bail
  const bailCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.05, 20), metalMat);
  bailCollar.position.y = 0.99;
  bailCollar.castShadow = true;
  basketGroup.add(bailCollar);

  // 4. Delicate 18K Gold Cable Rope Chain Segment
  const chainCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.0, 1.85, -0.35),
    new THREE.Vector3(-0.45, 1.40, -0.12),
    new THREE.Vector3(0, 1.22, 0),
    new THREE.Vector3(0.45, 1.40, -0.12),
    new THREE.Vector3(1.0, 1.85, -0.35),
  ]);
  const chainMesh = new THREE.Mesh(new THREE.TubeGeometry(chainCurve, 40, 0.013, 8, false), metalMat);
  chainMesh.castShadow = true;
  chainGroup.add(chainMesh);

  // Exploded View API
  function setExploded(t) {
    pearlGroup.position.y = t * 0.55;
    basketGroup.position.y = -t * 0.22;
    chainGroup.position.y = t * 0.42;
  }

  // Material updates
  function updateMaterials(newMetalHex, newPearlTint) {
    if (newMetalHex) metalMat.color.set(newMetalHex);
    if (newPearlTint) {
      pearlMat.color.set(newPearlTint);
      pearlMat.sheenColor.set(newPearlTint);
    }
  }

  root.setExploded = setExploded;
  root.updateMaterials = updateMaterials;

  return root;
}
