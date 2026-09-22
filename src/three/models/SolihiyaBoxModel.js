import * as THREE from 'three';
import { MaterialsFactory } from '../Materials';

export function createSolihiyaBoxModel(woodHex = '#24140E', caneHex = '#D8B781', brassHex = '#C4975D') {
  const root = new THREE.Group();
  root.name = 'SolihiyaKamagongBox';

  const woodMat = MaterialsFactory.createKamagongWoodMaterial(woodHex);
  const caneMat = MaterialsFactory.createWovenLeafMaterial(caneHex);
  const brassMat = MaterialsFactory.createAntiqueBrassMaterial(brassHex);
  const velvetMat = new THREE.MeshStandardMaterial({
    color: 0x0F392B, // Deep emerald velvet
    roughness: 0.85,
    metalness: 0.05,
  });

  const baseGroup = new THREE.Group();
  const lidGroup = new THREE.Group();
  const interiorGroup = new THREE.Group();

  root.add(baseGroup);
  root.add(lidGroup);
  root.add(interiorGroup);

  const boxWidth = 1.4;
  const boxHeight = 0.55;
  const boxDepth = 0.95;

  // 1. Kamagong Wood Base Box
  const baseBoxGeo = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
  const baseBox = new THREE.Mesh(baseBoxGeo, woodMat);
  baseBox.position.y = boxHeight / 2;
  baseBox.castShadow = true;
  baseBox.receiveShadow = true;
  baseGroup.add(baseBox);

  // 2. Brass Feet (4 Corner Studs)
  const footGeo = new THREE.ConeGeometry(0.04, 0.05, 16);
  footGeo.rotateX(Math.PI);
  const feet = [
    [-boxWidth / 2 + 0.08, 0.02, -boxDepth / 2 + 0.08],
    [boxWidth / 2 - 0.08, 0.02, -boxDepth / 2 + 0.08],
    [-boxWidth / 2 + 0.08, 0.02, boxDepth / 2 - 0.08],
    [boxWidth / 2 - 0.08, 0.02, boxDepth / 2 - 0.08],
  ];
  feet.forEach(f => {
    const fm = new THREE.Mesh(footGeo, brassMat);
    fm.position.set(...f);
    fm.castShadow = true;
    baseGroup.add(fm);
  });

  // Brass Keyhole Escutcheon on front
  const keyholeGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.015, 16);
  keyholeGeo.rotateX(Math.PI / 2);
  const keyhole = new THREE.Mesh(keyholeGeo, brassMat);
  keyhole.position.set(0, boxHeight / 2, boxDepth / 2 + 0.01);
  baseGroup.add(keyhole);

  // 3. Interior Velvet Lining & Watch Cushions
  const velvetGeo = new THREE.BoxGeometry(boxWidth - 0.12, 0.08, boxDepth - 0.12);
  const velvetBase = new THREE.Mesh(velvetGeo, velvetMat);
  velvetBase.position.set(0, boxHeight - 0.04, 0);
  interiorGroup.add(velvetBase);

  // Twin Watch Pillows
  const pillowGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.28, 24);
  pillowGeo.rotateZ(Math.PI / 2);

  const leftPillow = new THREE.Mesh(pillowGeo, velvetMat);
  leftPillow.position.set(-0.32, boxHeight + 0.04, 0);
  interiorGroup.add(leftPillow);

  const rightPillow = new THREE.Mesh(pillowGeo, velvetMat);
  rightPillow.position.set(0.32, boxHeight + 0.04, 0);
  interiorGroup.add(rightPillow);

  // 4. Hinged Top Lid (Rotates at the back edge)
  const lidFrameGeo = new THREE.BoxGeometry(boxWidth + 0.02, 0.12, boxDepth + 0.02);
  const lidFrame = new THREE.Mesh(lidFrameGeo, woodMat);
  lidFrame.castShadow = true;

  // Recessed Solihiya Rattan Canework Panel insert on the lid
  const canePanelGeo = new THREE.BoxGeometry(boxWidth - 0.25, 0.02, boxDepth - 0.25);
  const canePanel = new THREE.Mesh(canePanelGeo, caneMat);
  canePanel.position.y = 0.065;
  lidFrame.add(canePanel);

  // Position lid so rotation pivot is at back hinge
  lidGroup.position.set(0, boxHeight, -boxDepth / 2);
  lidFrame.position.set(0, 0.06, boxDepth / 2);
  lidGroup.add(lidFrame);

  // Exploded View / Open Lid API
  function setExploded(t) {
    // Rotates lid open up to ~55 degrees
    lidGroup.rotation.x = -t * (Math.PI * 0.32);
    interiorGroup.position.y = t * 0.18;
  }

  function updateMaterials(newWoodHex, newCaneHex, newBrassHex) {
    if (newWoodHex) woodMat.color.set(newWoodHex);
    if (newCaneHex) caneMat.color.set(newCaneHex);
    if (newBrassHex) brassMat.color.set(newBrassHex);
  }

  root.setExploded = setExploded;
  root.updateMaterials = updateMaterials;

  return root;
}
