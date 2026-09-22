import * as THREE from 'three';
import { MaterialsFactory, createMonogramCanvasTexture } from '../Materials';

export function createBayongModel(leafHex = '#D8B781', leatherHex = '#8C5A3C', brassHex = '#C4975D', monogramText = 'JR') {
  const root = new THREE.Group();
  root.name = 'BayongRoyale';

  // Materials
  const leafMat = MaterialsFactory.createWovenLeafMaterial(leafHex);
  const leatherMat = MaterialsFactory.createVachettaLeatherMaterial(leatherHex);
  const brassMat = MaterialsFactory.createAntiqueBrassMaterial(brassHex);

  // Dynamic Monogram Material mapped to leather tag
  let monogramTex = createMonogramCanvasTexture(monogramText);
  const monogramMat = new THREE.MeshStandardMaterial({
    map: monogramTex,
    roughness: 0.45,
    metalness: 0.1,
  });

  // Groups for exploded view
  const bodyGroup = new THREE.Group();
  const handleFrontGroup = new THREE.Group();
  const handleBackGroup = new THREE.Group();
  const studsGroup = new THREE.Group();

  root.add(bodyGroup);
  root.add(handleFrontGroup);
  root.add(handleBackGroup);
  root.add(studsGroup);

  // 1. Woven Basket Body (32-segment curved flared geometry)
  const bodyWidthTop = 1.35;
  const bodyWidthBottom = 1.05;
  const bodyHeight = 1.02;
  const bodyDepthTop = 0.58;
  const bodyDepthBottom = 0.45;

  const shape = new THREE.BoxGeometry(bodyWidthTop, bodyHeight, bodyDepthTop, 24, 24, 24);
  const pos = shape.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const factor = (y + bodyHeight / 2) / bodyHeight; // 0 at bottom, 1 at top
    const scale = THREE.MathUtils.lerp(bodyWidthBottom / bodyWidthTop, 1.0, factor);
    pos.setX(i, pos.getX(i) * scale);
    pos.setZ(i, pos.getZ(i) * scale);

    // Subtle gentle organic bulge
    const bulge = Math.sin(factor * Math.PI) * 0.045;
    pos.setZ(i, pos.getZ(i) + (pos.getZ(i) > 0 ? bulge : -bulge));
  }
  shape.computeVertexNormals();

  const basketMesh = new THREE.Mesh(shape, leafMat);
  basketMesh.position.y = bodyHeight / 2;
  basketMesh.castShadow = true;
  basketMesh.receiveShadow = true;
  bodyGroup.add(basketMesh);

  // 2. Leather Top Rim Binding
  const rimGeo = new THREE.BoxGeometry(bodyWidthTop + 0.03, 0.05, bodyDepthTop + 0.03);
  const rimMesh = new THREE.Mesh(rimGeo, leatherMat);
  rimMesh.position.y = bodyHeight + 0.02;
  rimMesh.castShadow = true;
  bodyGroup.add(rimMesh);

  // 3. Leather Corner Reinforcements
  const cornerGeo = new THREE.BoxGeometry(0.12, 0.16, 0.12);
  const corners = [
    [-bodyWidthBottom / 2 + 0.02, 0.08, -bodyDepthBottom / 2 + 0.02],
    [bodyWidthBottom / 2 - 0.02, 0.08, -bodyDepthBottom / 2 + 0.02],
    [-bodyWidthBottom / 2 + 0.02, 0.08, bodyDepthBottom / 2 - 0.02],
    [bodyWidthBottom / 2 - 0.02, 0.08, bodyDepthBottom / 2 - 0.02],
  ];
  corners.forEach(c => {
    const cm = new THREE.Mesh(cornerGeo, leatherMat);
    cm.position.set(...c);
    cm.castShadow = true;
    bodyGroup.add(cm);
  });

  // 4. Curved Vachetta Leather Handles
  function createHandleMesh() {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.35, 0.8, 0),
      new THREE.Vector3(-0.33, 1.45, 0.05),
      new THREE.Vector3(0, 1.62, 0.08),
      new THREE.Vector3(0.33, 1.45, 0.05),
      new THREE.Vector3(0.35, 0.8, 0),
    ]);
    const handleGeo = new THREE.TubeGeometry(curve, 32, 0.025, 12, false);
    const hm = new THREE.Mesh(handleGeo, leatherMat);
    hm.castShadow = true;
    return hm;
  }

  const handleFront = createHandleMesh();
  handleFront.position.z = bodyDepthTop / 2 + 0.01;
  handleFrontGroup.add(handleFront);

  const handleBack = createHandleMesh();
  handleBack.position.z = -bodyDepthTop / 2 - 0.01;
  handleBack.rotation.y = Math.PI;
  handleBackGroup.add(handleBack);

  // 5. Brass Rings & Rivets
  const ringGeo = new THREE.TorusGeometry(0.045, 0.009, 12, 24);
  const rivetGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.02, 16);
  rivetGeo.rotateX(Math.PI / 2);

  const attachPoints = [
    [-0.35, 0.82, bodyDepthTop / 2 + 0.02, handleFrontGroup],
    [0.35, 0.82, bodyDepthTop / 2 + 0.02, handleFrontGroup],
    [-0.35, 0.82, -bodyDepthTop / 2 - 0.02, handleBackGroup],
    [0.35, 0.82, -bodyDepthTop / 2 - 0.02, handleBackGroup],
  ];

  attachPoints.forEach(([x, y, z, parentGroup]) => {
    const rm = new THREE.Mesh(ringGeo, brassMat);
    rm.position.set(x, y, z);
    rm.castShadow = true;
    parentGroup.add(rm);

    const rvm = new THREE.Mesh(rivetGeo, brassMat);
    rvm.position.set(x, y - 0.06, z);
    rvm.castShadow = true;
    parentGroup.add(rvm);
  });

  // 6. Base Feet Studs (Four protective brass conical feet)
  const footGeo = new THREE.ConeGeometry(0.025, 0.03, 16);
  footGeo.rotateX(Math.PI);
  const feetCoords = [
    [-0.4, 0.01, -0.15],
    [0.4, 0.01, -0.15],
    [-0.4, 0.01, 0.15],
    [0.4, 0.01, 0.15],
  ];
  feetCoords.forEach(coord => {
    const foot = new THREE.Mesh(footGeo, brassMat);
    foot.position.set(...coord);
    foot.castShadow = true;
    studsGroup.add(foot);
  });

  // 7. Hanging Leather Luggage Tag with DYNAMIC 3D MONOGRAM
  const tagHangerCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.35, 0.82, bodyDepthTop / 2 + 0.02),
    new THREE.Vector3(0.40, 0.65, bodyDepthTop / 2 + 0.08),
  ]);
  const tagStrap = new THREE.Mesh(new THREE.TubeGeometry(tagHangerCurve, 12, 0.007, 8, false), leatherMat);
  handleFrontGroup.add(tagStrap);

  const tagGeo = new THREE.BoxGeometry(0.14, 0.20, 0.012);
  const tagMesh = new THREE.Mesh(tagGeo, monogramMat);
  tagMesh.position.set(0.40, 0.52, bodyDepthTop / 2 + 0.08);
  tagMesh.rotation.z = -0.12;
  tagMesh.castShadow = true;
  handleFrontGroup.add(tagMesh);

  // Dynamic Monogram Update Function
  function setMonogram(newText) {
    if (monogramMat.map) monogramMat.map.dispose();
    monogramTex = createMonogramCanvasTexture(newText);
    monogramMat.map = monogramTex;
    monogramMat.needsUpdate = true;
  }

  // Exploded View API
  function setExploded(t) {
    handleFrontGroup.position.y = t * 0.45;
    handleFrontGroup.position.z = t * 0.25;
    handleBackGroup.position.y = t * 0.45;
    handleBackGroup.position.z = -t * 0.25;
    studsGroup.position.y = -t * 0.2;
    bodyGroup.position.y = t * 0.05;
  }

  // Update Materials API
  function updateMaterials(newLeafHex, newLeatherHex, newBrassHex) {
    if (newLeafHex) leafMat.color.set(newLeafHex);
    if (newLeatherHex) leatherMat.color.set(newLeatherHex);
    if (newBrassHex) brassMat.color.set(newBrassHex);
  }

  // Patina aging simulator
  function setPatina(year) {
    const ratio = Math.min(year / 20, 1.0);
    const baseLeather = new THREE.Color(leatherHex);
    const agedLeather = new THREE.Color('#4D2916');
    leatherMat.color.copy(baseLeather).lerp(agedLeather, ratio);
    leatherMat.roughness = THREE.MathUtils.lerp(0.48, 0.32, ratio);

    const baseLeaf = new THREE.Color(leafHex);
    const agedLeaf = new THREE.Color('#9E6D38');
    leafMat.color.copy(baseLeaf).lerp(agedLeaf, ratio * 0.7);
  }

  root.setExploded = setExploded;
  root.updateMaterials = updateMaterials;
  root.setPatina = setPatina;
  root.setMonogram = setMonogram;

  return root;
}
