import * as THREE from 'three';
import { MaterialsFactory } from '../Materials';

export function createSolihiyaBoxModel(
  woodHex = '#24140E',
  caneHex = '#D8B781',
  brassHex = '#C4975D'
) {
  const root = new THREE.Group();
  root.name = 'SolihiyaKamagongBox';

  const woodMat = MaterialsFactory.createKamagongWoodMaterial(woodHex);
  const caneMat = MaterialsFactory.createSolihiyaCaneMaterial(caneHex);
  const brassMat = MaterialsFactory.createAntiqueBrassMaterial(brassHex);
  const velvetMat = MaterialsFactory.createVelvetMaterial('#0F392B'); // Deep emerald velvet

  const baseGroup = new THREE.Group();
  const lidGroup = new THREE.Group();
  const interiorGroup = new THREE.Group();

  root.add(baseGroup);
  root.add(lidGroup);
  root.add(interiorGroup);

  const boxWidth = 1.44;
  const boxHeight = 0.58;
  const boxDepth = 1.00;

  // ==========================================================================
  // 1. KAMAGONG PHILIPPINE EBONY SOLID WOOD BASE BOX
  // ==========================================================================
  // Main chamber box with beveled base plinth
  const baseBoxGeo = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
  const baseBox = new THREE.Mesh(baseBoxGeo, woodMat);
  baseBox.position.y = boxHeight / 2;
  baseBox.castShadow = true;
  baseBox.receiveShadow = true;
  baseGroup.add(baseBox);

  // Molded bottom plinth base
  const plinthGeo = new THREE.BoxGeometry(boxWidth + 0.04, 0.05, boxDepth + 0.04);
  const plinth = new THREE.Mesh(plinthGeo, woodMat);
  plinth.position.y = 0.025;
  plinth.castShadow = true;
  baseGroup.add(plinth);

  // ==========================================================================
  // 2. ANTIQUE PHILIPPINE BRASS HARDWARE
  // ==========================================================================
  // 4 Turned Conical Brass Feet
  const footGeo = new THREE.ConeGeometry(0.042, 0.06, 20);
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

  // Antique Brass Escutcheon Plate on Front
  const escutcheonGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.018, 24);
  escutcheonGeo.rotateX(Math.PI / 2);
  const escutcheon = new THREE.Mesh(escutcheonGeo, brassMat);
  escutcheon.position.set(0, boxHeight * 0.56, boxDepth / 2 + 0.01);
  escutcheon.castShadow = true;
  baseGroup.add(escutcheon);

  // Keyhole slot
  const keyholeSlit = new THREE.Mesh(
    new THREE.BoxGeometry(0.012, 0.034, 0.02),
    new THREE.MeshBasicMaterial({ color: 0x0A0502 })
  );
  keyholeSlit.position.set(0, boxHeight * 0.56, boxDepth / 2 + 0.016);
  baseGroup.add(keyholeSlit);

  // Dual Rear Brass Quadrant Hinges
  [-boxWidth * 0.32, boxWidth * 0.32].forEach(hx => {
    const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.022), brassMat);
    hinge.position.set(hx, boxHeight, -boxDepth / 2 - 0.005);
    baseGroup.add(hinge);
  });

  // ==========================================================================
  // 3. LUXURY EMERALD VELVET COMPARTMENTALIZED INTERIOR
  // ==========================================================================
  const velvetGeo = new THREE.BoxGeometry(boxWidth - 0.14, 0.10, boxDepth - 0.14);
  const velvetBase = new THREE.Mesh(velvetGeo, velvetMat);
  velvetBase.position.set(0, boxHeight - 0.03, 0);
  interiorGroup.add(velvetBase);

  // Twin Watch Roll Cushions with Brass Accents
  const pillowGeo = new THREE.CylinderGeometry(0.155, 0.155, 0.32, 32);
  pillowGeo.rotateZ(Math.PI / 2);

  const leftPillow = new THREE.Mesh(pillowGeo, velvetMat);
  leftPillow.position.set(-0.35, boxHeight + 0.05, 0);
  leftPillow.castShadow = true;
  interiorGroup.add(leftPillow);

  const rightPillow = new THREE.Mesh(pillowGeo, velvetMat);
  rightPillow.position.set(0.35, boxHeight + 0.05, 0);
  rightPillow.castShadow = true;
  interiorGroup.add(rightPillow);

  // Center Wood Compartment Divider
  const divider = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.18, boxDepth - 0.18), woodMat);
  divider.position.set(0, boxHeight + 0.04, 0);
  divider.castShadow = true;
  interiorGroup.add(divider);

  // Velvet Ring Rolls (Grooved ring display rows in the center compartment)
  for (let r = 0; r < 4; r++) {
    const ringRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.18, 16), velvetMat);
    ringRoll.rotation.x = Math.PI / 2;
    ringRoll.position.set(0, boxHeight + 0.03, -0.22 + r * 0.14);
    interiorGroup.add(ringRoll);
  }

  // ==========================================================================
  // 4. HINGED TOP LID WITH RECESSED 6-WAY SOLIHIYA CANE INSERT
  // ==========================================================================
  const lidFrameGeo = new THREE.BoxGeometry(boxWidth + 0.028, 0.13, boxDepth + 0.028);
  const lidFrame = new THREE.Mesh(lidFrameGeo, woodMat);
  lidFrame.castShadow = true;
  lidFrame.receiveShadow = true;

  // Recessed Authentic Solihiya 6-Way Rattan Cane Webbing Panel
  const canePanelGeo = new THREE.BoxGeometry(boxWidth - 0.24, 0.025, boxDepth - 0.24);
  const canePanel = new THREE.Mesh(canePanelGeo, caneMat);
  canePanel.position.y = 0.068;
  canePanel.castShadow = true;
  canePanel.receiveShadow = true;
  lidFrame.add(canePanel);

  // Decorative Antiqued Brass L-Shaped Corner Angle Brackets on the Lid
  const bracketSize = 0.13;
  const bracketCoords = [
    [-boxWidth / 2 + 0.03, 0.071, -boxDepth / 2 + 0.03],
    [boxWidth / 2 - 0.03, 0.071, -boxDepth / 2 + 0.03],
    [-boxWidth / 2 + 0.03, 0.071, boxDepth / 2 - 0.03],
    [boxWidth / 2 - 0.03, 0.071, boxDepth / 2 - 0.03],
  ];
  bracketCoords.forEach(([bx, by, bz]) => {
    const bracket = new THREE.Mesh(new THREE.BoxGeometry(bracketSize, 0.016, bracketSize), brassMat);
    bracket.position.set(bx, by, bz);
    bracket.castShadow = true;
    lidFrame.add(bracket);

    // Miniature brass screw rivet on each corner bracket
    const screw = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), brassMat);
    screw.position.set(bx, by + 0.01, bz);
    lidFrame.add(screw);
  });

  // Pivot at exact back hinge edge
  lidGroup.position.set(0, boxHeight, -boxDepth / 2);
  lidFrame.position.set(0, 0.065, boxDepth / 2);
  lidGroup.add(lidFrame);

  // Exploded View / Open Lid API
  function setExploded(t) {
    lidGroup.rotation.x = -t * (Math.PI * 0.32);
    interiorGroup.position.y = t * 0.22;
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
