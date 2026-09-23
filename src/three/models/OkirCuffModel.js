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

  // ==========================================================================
  // 1. COMPLETE CONTINUOUS WRIST-CONTOURED ELLIPTICAL SOLID BRASS TORQUE
  // ==========================================================================
  // Anatomical human wrist torque (wider on X, flatter on Z)
  // Continuous smooth curve from left terminal finial all the way around to right terminal finial.
  const radiusX = 0.78;
  const radiusY = 0.62;
  const gapAngle = 0.46; // Opening gap at the underside of the wrist
  const centerY = 0.68;
  const tubeRadius = 0.12;

  const curvePoints = [];
  const numSteps = 56;
  const startAngle = Math.PI * 1.5 + gapAngle;
  const endAngle = Math.PI * 3.5 - gapAngle;

  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps;
    const ang = THREE.MathUtils.lerp(startAngle, endAngle, t);
    const x = Math.cos(ang) * radiusX;
    const y = Math.sin(ang) * radiusY + centerY;
    // Subtle anatomical tilt: slightly lower on the outer wrist
    const z = Math.sin(ang * 2) * 0.035;
    curvePoints.push(new THREE.Vector3(x, y, z));
  }

  const cuffCurve = new THREE.CatmullRomCurve3(curvePoints);

  // Heavy, solid cast brass torque with realistic cross-section
  const cuffGeo = new THREE.TubeGeometry(cuffCurve, 72, tubeRadius, 28, false);
  const cuffMesh = new THREE.Mesh(cuffGeo, brassMat);
  cuffMesh.castShadow = true;
  cuffMesh.receiveShadow = true;
  cuffGroup.add(cuffMesh);

  // Integrated Terminal End Finials (Smoothly capped acorn/bulbous terminals at the opening)
  const leftTip = curvePoints[0];
  const rightTip = curvePoints[curvePoints.length - 1];

  function createTerminalFinial(pos, tParam) {
    const finialGroup = new THREE.Group();
    finialGroup.position.copy(pos);

    const tangent = cuffCurve.getTangent(tParam).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, tangent);
    finialGroup.quaternion.copy(quat);

    // Bulbous cast brass finial acorn
    const bulbGeo = new THREE.SphereGeometry(0.145, 24, 24);
    bulbGeo.scale(1.1, 1.3, 1.1);
    const bulb = new THREE.Mesh(bulbGeo, brassMat);
    bulb.castShadow = true;
    finialGroup.add(bulb);

    // Triple filigree collar rings where the finial joins the cuff band
    for (let c = 0; c < 3; c++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.016, 12, 24), brassMat);
      ring.position.y = (c - 1) * 0.035;
      ring.rotation.x = Math.PI / 2;
      ring.castShadow = true;
      finialGroup.add(ring);
    }

    return finialGroup;
  }

  cuffGroup.add(createTerminalFinial(leftTip, 0));
  cuffGroup.add(createTerminalFinial(rightTip, 1));

  // ==========================================================================
  // 2. MATHEMATICALLY ANCHORED MARANAO OKIR RELIEF CARVINGS (FRENET-SERRET)
  // ==========================================================================
  // Eliminates detached/floating tendril bugs. Every relief element is placed
  // directly onto the outer metal crest using the local outward surface normal.
  const reliefCountPerSide = 9;
  const wristCenter = new THREE.Vector3(0, centerY, 0);

  for (let s = -1; s <= 1; s += 2) {
    for (let i = 0; i < reliefCountPerSide; i++) {
      const frac = (i + 1) / (reliefCountPerSide + 2);
      const t = s === 1 ? 0.5 + frac * 0.44 : 0.5 - frac * 0.44;

      const point = cuffCurve.getPoint(t);
      const tangent = cuffCurve.getTangent(t).normalize();

      // Calculate outward normal from wrist center, orthogonalized to curve tangent
      const radialVec = point.clone().sub(wristCenter);
      const dot = radialVec.dot(tangent);
      const outwardNormal = radialVec.clone().subScaledVector(tangent, dot).normalize();
      const binormal = new THREE.Vector3().crossVectors(tangent, outwardNormal).normalize();

      // Precise point on the outer tube surface
      const surfacePoint = point.clone().addScaledVector(outwardNormal, tubeRadius * 0.95);

      // Construct local coordinate frame matrix
      const rotMatrix = new THREE.Matrix4().makeBasis(tangent, outwardNormal, binormal);
      const quat = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);

      // Chiseled Okir spiral scroll tendril
      const tendrilGeo = new THREE.TorusGeometry(0.065, 0.018, 12, 24, Math.PI * 1.35);
      const tendril = new THREE.Mesh(tendrilGeo, brassMat);
      tendril.position.copy(surfacePoint);
      tendril.quaternion.copy(quat);
      tendril.castShadow = true;
      reliefGroup.add(tendril);

      // Raised Okir spine bead
      const beadPoint = surfacePoint.clone().addScaledVector(outwardNormal, 0.018);
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 12), brassMat);
      bead.position.copy(beadPoint);
      bead.castShadow = true;
      reliefGroup.add(bead);
    }
  }

  // Dual Filigree Wire Reliefs flanking the crest
  for (let side = -1; side <= 1; side += 2) {
    const wirePoints = [];
    for (let j = 0; j <= 40; j++) {
      const t = j / 40;
      const pt = cuffCurve.getPoint(t);
      const tg = cuffCurve.getTangent(t).normalize();
      const rad = pt.clone().sub(wristCenter);
      const outN = rad.clone().subScaledVector(tg, rad.dot(tg)).normalize();
      const binN = new THREE.Vector3().crossVectors(tg, outN).normalize();

      const wirePt = pt.clone()
        .addScaledVector(outN, tubeRadius * 0.92)
        .addScaledVector(binN, side * 0.065);
      wirePoints.push(wirePt);
    }
    const wireCurve = new THREE.CatmullRomCurve3(wirePoints);
    const wireMesh = new THREE.Mesh(
      new THREE.TubeGeometry(wireCurve, 48, 0.008, 8, false),
      brassMat
    );
    reliefGroup.add(wireMesh);
  }

  // ==========================================================================
  // 3. ROYAL CROWN BEZEL & TRANSLUCENT MINDORO NEPHRITE JADE CABOCHON
  // ==========================================================================
  // Apex of the cuff: centered top crest at (0, radiusY + centerY, 0)
  const apexY = radiusY + centerY;

  // Solid brass stepped bezel mount
  const bezelBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.12, 36), brassMat);
  bezelBase.position.set(0, apexY + 0.06, 0.02);
  bezelBase.rotation.x = 0.15;
  bezelBase.castShadow = true;
  gemGroup.add(bezelBase);

  // Granulated bead crown encircling the gemstone setting (20 micro-granules)
  const crownBeadCount = 20;
  for (let g = 0; g < crownBeadCount; g++) {
    const gang = (g / crownBeadCount) * Math.PI * 2;
    const gbead = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), brassMat);
    gbead.position.set(
      Math.cos(gang) * 0.30,
      apexY + 0.11 + Math.sin(gang) * 0.03,
      0.02 + Math.sin(gang) * 0.22
    );
    gbead.castShadow = true;
    gemGroup.add(gbead);
  }

  // Smooth, high-clarity Mindoro Nephrite Jade oval cabochon
  const jadeGeo = new THREE.SphereGeometry(0.23, 64, 64);
  jadeGeo.scale(1.25, 0.78, 0.92);
  const jadeMesh = new THREE.Mesh(jadeGeo, jadeMat);
  jadeMesh.position.set(0, apexY + 0.14, 0.04);
  jadeMesh.rotation.x = 0.15;
  jadeMesh.castShadow = true;
  jadeMesh.receiveShadow = true;
  gemGroup.add(jadeMesh);

  // 4 Brass retaining bezel prongs holding the jade cabochon
  [[-0.24, 0.08], [0.24, 0.08], [-0.24, -0.04], [0.24, -0.04]].forEach(([px, pz]) => {
    const prong = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.10, 10), brassMat);
    prong.position.set(px, apexY + 0.13, 0.02 + pz);
    prong.castShadow = true;
    gemGroup.add(prong);
  });

  // Exploded View API
  function setExploded(t) {
    gemGroup.position.y = t * 0.40;
    gemGroup.position.z = t * 0.20;
    reliefGroup.position.z = t * 0.18;
    cuffGroup.position.y = -t * 0.05;
  }

  function updateMaterials(newBrassHex, newJadeHex) {
    if (newBrassHex) brassMat.color.set(newBrassHex);
    if (newJadeHex) {
      jadeMat.color.set(newJadeHex);
      if (jadeMat.attenuationColor) jadeMat.attenuationColor.set(newJadeHex);
    }
  }

  root.setExploded = setExploded;
  root.updateMaterials = updateMaterials;

  return root;
}
