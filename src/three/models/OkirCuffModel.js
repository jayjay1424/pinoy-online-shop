import * as THREE from 'three';
import { MaterialsFactory } from '../Materials';

export function createOkirCuffModel(brassHex = '#C4975D', jadeHex = '#2D6A4F') {
  const root = new THREE.Group();
  root.name = 'MaranaoOkirCuff';

  const brassMat = MaterialsFactory.createAntiqueBrassMaterial(brassHex);
  const jadeMat = MaterialsFactory.createJadeMaterial(jadeHex);

  const cuffGroup = new THREE.Group();
  const gemGroup = new THREE.Group();
  const reliefGroup = new THREE.Group();

  root.add(cuffGroup);
  root.add(gemGroup);
  root.add(reliefGroup);

  // 1. Contoured C-Shape Torque Bangle (Torus segment with opening)
  const cuffGeo = new THREE.TorusGeometry(0.72, 0.12, 24, 48, Math.PI * 1.55);
  cuffGeo.rotateZ(-Math.PI * 0.77);
  const cuffMesh = new THREE.Mesh(cuffGeo, brassMat);
  cuffMesh.position.y = 0.55;
  cuffMesh.castShadow = true;
  cuffGroup.add(cuffMesh);

  // Terminal End Knobs (Bulbous finials at the opening)
  const knobGeo = new THREE.SphereGeometry(0.14, 20, 20);
  const leftKnob = new THREE.Mesh(knobGeo, brassMat);
  leftKnob.position.set(-0.48, 0.05, 0);
  leftKnob.castShadow = true;
  cuffGroup.add(leftKnob);

  const rightKnob = new THREE.Mesh(knobGeo, brassMat);
  rightKnob.position.set(0.48, 0.05, 0);
  rightKnob.castShadow = true;
  cuffGroup.add(rightKnob);

  // 2. Chiseled Okir Plant Tendril Relief Beads along exterior
  const reliefCount = 12;
  for (let i = 0; i < reliefCount; i++) {
    const angle = (i / reliefCount) * (Math.PI * 1.4) - (Math.PI * 0.7);
    const x = Math.cos(angle) * 0.82;
    const y = Math.sin(angle) * 0.82 + 0.55;

    const rib = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.016, 8, 16), brassMat);
    rib.position.set(x, y, 0);
    rib.rotation.y = Math.PI / 2;
    rib.castShadow = true;
    reliefGroup.add(rib);
  }

  // 3. Central Bezel-Set Mindoro Nephrite Jade Cabochon
  const bezelGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.12, 32);
  bezelGeo.rotateX(Math.PI / 2);
  const bezel = new THREE.Mesh(bezelGeo, brassMat);
  bezel.position.set(0, 1.25, 0.05);
  bezel.castShadow = true;
  gemGroup.add(bezel);

  // Smooth oval jade gem
  const jadeGeo = new THREE.SphereGeometry(0.20, 32, 32);
  jadeGeo.scale(1.2, 0.85, 0.65);
  const jadeMesh = new THREE.Mesh(jadeGeo, jadeMat);
  jadeMesh.position.set(0, 1.25, 0.12);
  jadeMesh.castShadow = true;
  gemGroup.add(jadeMesh);

  // Exploded View API
  function setExploded(t) {
    gemGroup.position.z = t * 0.35;
    reliefGroup.position.y = t * 0.15;
  }

  function updateMaterials(newBrassHex, newJadeHex) {
    if (newBrassHex) brassMat.color.set(newBrassHex);
    if (newJadeHex) jadeMat.color.set(newJadeHex);
  }

  root.setExploded = setExploded;
  root.updateMaterials = updateMaterials;

  return root;
}
