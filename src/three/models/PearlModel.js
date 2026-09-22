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

  // 1. Palawan Golden South Sea Pearl (14.5mm radius scaled to 0.45)
  const pearlGeo = new THREE.SphereGeometry(0.48, 64, 64);
  const pearlMesh = new THREE.Mesh(pearlGeo, pearlMat);
  pearlMesh.position.y = 0.5;
  pearlMesh.castShadow = true;
  pearlGroup.add(pearlMesh);

  // 2. Filigree Tamborin Granulation Basket (Bottom cup and cage ribs)
  const baseTorus = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.03, 16, 32), metalMat);
  baseTorus.rotation.x = Math.PI / 2;
  baseTorus.position.y = 0.22;
  baseTorus.castShadow = true;
  basketGroup.add(baseTorus);

  // Cage ribs wrapping around the lower half of the pearl
  const ribCount = 8;
  for (let i = 0; i < ribCount; i++) {
    const angle = (i / ribCount) * Math.PI * 2;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(angle) * 0.2, 0.05, Math.sin(angle) * 0.2),
      new THREE.Vector3(Math.cos(angle) * 0.44, 0.35, Math.sin(angle) * 0.44),
      new THREE.Vector3(Math.cos(angle) * 0.50, 0.55, Math.sin(angle) * 0.50),
      new THREE.Vector3(Math.cos(angle) * 0.42, 0.75, Math.sin(angle) * 0.42),
    ]);
    const ribMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.018, 8, false), metalMat);
    ribMesh.castShadow = true;
    basketGroup.add(ribMesh);

    // Micro-granulated gold bead at the tip of each rib
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 12), metalMat);
    bead.position.set(Math.cos(angle) * 0.42, 0.75, Math.sin(angle) * 0.42);
    basketGroup.add(bead);
  }

  // 3. Ornate Filigree Bail (Top suspension loop)
  const bailGeo = new THREE.TorusGeometry(0.12, 0.024, 16, 32);
  const bailMesh = new THREE.Mesh(bailGeo, metalMat);
  bailMesh.position.y = 1.08;
  bailMesh.castShadow = true;
  basketGroup.add(bailMesh);

  // 4. Delicate Cable Chain Segment
  const chainCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.9, 1.8, -0.3),
    new THREE.Vector3(-0.4, 1.35, -0.1),
    new THREE.Vector3(0, 1.18, 0),
    new THREE.Vector3(0.4, 1.35, -0.1),
    new THREE.Vector3(0.9, 1.8, -0.3),
  ]);
  const chainMesh = new THREE.Mesh(new THREE.TubeGeometry(chainCurve, 32, 0.012, 8, false), metalMat);
  chainMesh.castShadow = true;
  chainGroup.add(chainMesh);

  // Exploded View API
  function setExploded(t) {
    pearlGroup.position.y = t * 0.5;
    basketGroup.position.y = -t * 0.2;
    chainGroup.position.y = t * 0.4;
  }

  // Material updates
  function updateMaterials(newMetalHex, newPearlTint) {
    if (newMetalHex) metalMat.color.set(newMetalHex);
    if (newPearlTint) pearlMat.color.set(newPearlTint);
  }

  root.setExploded = setExploded;
  root.updateMaterials = updateMaterials;

  return root;
}

