import * as THREE from 'three';
import { MaterialsFactory } from '../Materials';

export function createClutchModel(weaveHex = '#2B211E', frameHex = '#C4975D') {
  const root = new THREE.Group();
  root.name = 'TnalakClutch';

  const weaveMat = MaterialsFactory.createWovenLeafMaterial(weaveHex);
  const frameMat = MaterialsFactory.createAntiqueBrassMaterial(frameHex);
  const pearlClaspMat = MaterialsFactory.createPalawanPearlMaterial('#FFFDF8');

  const bodyFrontGroup = new THREE.Group();
  const bodyBackGroup = new THREE.Group();
  const frameGroup = new THREE.Group();
  const claspGroup = new THREE.Group();

  root.add(bodyFrontGroup);
  root.add(bodyBackGroup);
  root.add(frameGroup);
  root.add(claspGroup);

  const width = 1.3;
  const height = 0.85;
  const halfDepth = 0.18;

  // Front Shell (T'nalak Weave)
  const frontGeo = new THREE.BoxGeometry(width, height, halfDepth);
  const frontMesh = new THREE.Mesh(frontGeo, weaveMat);
  frontMesh.position.set(0, height / 2 + 0.1, halfDepth / 2);
  frontMesh.castShadow = true;
  bodyFrontGroup.add(frontMesh);

  // Back Shell
  const backGeo = new THREE.BoxGeometry(width, height, halfDepth);
  const backMesh = new THREE.Mesh(backGeo, weaveMat);
  backMesh.position.set(0, height / 2 + 0.1, -halfDepth / 2);
  backMesh.castShadow = true;
  bodyBackGroup.add(backMesh);

  // Outer Architectural Brass Frame Bezel
  const frameGeo = new THREE.BoxGeometry(width + 0.04, height + 0.04, 0.03);
  const frameMesh = new THREE.Mesh(frameGeo, frameMat);
  frameMesh.position.set(0, height / 2 + 0.1, 0);
  frameMesh.castShadow = true;
  frameGroup.add(frameMesh);

  // Carved Iridescent Mother-of-Pearl Clasp on top
  const claspBase = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.12), frameMat);
  claspBase.position.set(0, height + 0.13, 0);
  claspBase.castShadow = true;
  claspGroup.add(claspBase);

  // Sculpted organic Capiz pearl oval cabochon
  const claspGemGeo = new THREE.SphereGeometry(0.09, 24, 24);
  claspGemGeo.scale(1.4, 0.7, 0.9);
  const claspGem = new THREE.Mesh(claspGemGeo, pearlClaspMat);
  claspGem.position.set(0, height + 0.18, 0);
  claspGem.castShadow = true;
  claspGroup.add(claspGem);

  // Exploded View API
  function setExploded(t) {
    bodyFrontGroup.position.z = t * 0.25;
    bodyBackGroup.position.z = -t * 0.25;
    claspGroup.position.y = t * 0.3;
    frameGroup.position.y = t * 0.05;
  }

  function updateMaterials(newWeaveHex, newFrameHex) {
    if (newWeaveHex) weaveMat.color.set(newWeaveHex);
    if (newFrameHex) frameMat.color.set(newFrameHex);
  }

  root.setExploded = setExploded;
  root.updateMaterials = updateMaterials;

  return root;
}

