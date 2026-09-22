import * as THREE from 'three';
import { MaterialsFactory } from '../Materials';

export function createBarongBomberModel(fabricHex = '#FBF8F0', embroideryHex = '#E5C158', trimHex = '#5C3A21') {
  const root = new THREE.Group();
  root.name = 'IlustradoBarongBomber';

  // Materials
  const pinaMat = MaterialsFactory.createPinaFabricMaterial(fabricHex);
  const embroideryMat = MaterialsFactory.createCaladoEmbroideryMaterial(embroideryHex);
  const trimMat = MaterialsFactory.createVachettaLeatherMaterial(trimHex);
  const brassMat = MaterialsFactory.createAntiqueBrassMaterial('#C4975D');
  const mopMat = MaterialsFactory.createPalawanPearlMaterial('#FFFFFF');

  // Groups
  const torsoGroup = new THREE.Group();
  const sleevesGroup = new THREE.Group();
  const pecheraGroup = new THREE.Group();
  const trimGroup = new THREE.Group();

  root.add(torsoGroup);
  root.add(sleevesGroup);
  root.add(pecheraGroup);
  root.add(trimGroup);

  // 1. Sculpted Bomber Torso (Translucent Sheer Piña-Seda)
  const torsoGeo = new THREE.CylinderGeometry(0.55, 0.48, 1.15, 32, 16);
  torsoGeo.scale(1.15, 1.0, 0.68); // Flatten slightly for human torso chest
  const torsoMesh = new THREE.Mesh(torsoGeo, pinaMat);
  torsoMesh.position.y = 0.65;
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  torsoGroup.add(torsoMesh);

  // 2. Raglan Sleeves (Left & Right)
  function createSleeve(side = 1) {
    const sleeveCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.52, 1.15, 0),
      new THREE.Vector3(side * 0.78, 0.75, 0.05),
      new THREE.Vector3(side * 0.85, 0.32, 0.08),
    ]);
    const sleeveGeo = new THREE.TubeGeometry(sleeveCurve, 24, 0.16, 16, false);
    const sleeveMesh = new THREE.Mesh(sleeveGeo, pinaMat);
    sleeveMesh.castShadow = true;
    return sleeveMesh;
  }

  sleevesGroup.add(createSleeve(1));
  sleevesGroup.add(createSleeve(-1));

  // 3. Ribbed Silk Cuffs & Waistband
  const cuffGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.10, 16);
  const leftCuff = new THREE.Mesh(cuffGeo, trimMat);
  leftCuff.position.set(0.85, 0.28, 0.08);
  leftCuff.rotation.z = -0.3;
  trimGroup.add(leftCuff);

  const rightCuff = new THREE.Mesh(cuffGeo, trimMat);
  rightCuff.position.set(-0.85, 0.28, 0.08);
  rightCuff.rotation.z = 0.3;
  trimGroup.add(rightCuff);

  // Ribbed Waistband at bottom
  const waistGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.12, 32);
  waistGeo.scale(1.15, 1.0, 0.68);
  const waistband = new THREE.Mesh(waistGeo, trimMat);
  waistband.position.y = 0.06;
  waistband.castShadow = true;
  trimGroup.add(waistband);

  // Ribbed Mandarin Collar at top
  const collarGeo = new THREE.CylinderGeometry(0.32, 0.35, 0.10, 32);
  collarGeo.scale(1.0, 1.0, 0.85);
  const collar = new THREE.Mesh(collarGeo, trimMat);
  collar.position.y = 1.25;
  collar.castShadow = true;
  trimGroup.add(collar);

  // 4. Calado Embroidered Chest Pechera Placket
  const pecheraGeo = new THREE.BoxGeometry(0.38, 0.75, 0.02);
  const pecheraMesh = new THREE.Mesh(pecheraGeo, embroideryMat);
  pecheraMesh.position.set(0, 0.82, 0.34);
  pecheraMesh.castShadow = true;
  pecheraGroup.add(pecheraMesh);

  // Antique Brass Zipper Rail down the center
  const zipGeo = new THREE.BoxGeometry(0.025, 0.95, 0.025);
  const zipMesh = new THREE.Mesh(zipGeo, brassMat);
  zipMesh.position.set(0, 0.72, 0.35);
  pecheraGroup.add(zipMesh);

  // Mother-of-Pearl Buttons (4 along placket)
  const buttonGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.01, 16);
  buttonGeo.rotateX(Math.PI / 2);
  for (let i = 0; i < 4; i++) {
    const btn = new THREE.Mesh(buttonGeo, mopMat);
    btn.position.set(0.06, 0.65 + i * 0.16, 0.36);
    btn.castShadow = true;
    pecheraGroup.add(btn);
  }

  // Exploded View API
  function setExploded(t) {
    pecheraGroup.position.z = t * 0.35;
    trimGroup.position.y = t * 0.15;
    sleevesGroup.position.x = t * 0.25;
  }

  function updateMaterials(newFabricHex, newEmbroideryHex, newTrimHex) {
    if (newFabricHex) pinaMat.color.set(newFabricHex);
    if (newEmbroideryHex) embroideryMat.color.set(newEmbroideryHex);
    if (newTrimHex) trimMat.color.set(newTrimHex);
  }

  root.setExploded = setExploded;
  root.updateMaterials = updateMaterials;

  return root;
}
