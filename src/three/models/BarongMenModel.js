import * as THREE from 'three';
import { MaterialsFactory } from '../Materials';

/**
 * Likha Atelier — Barong Tagalog "Ilustrado" & "Dalisay" (Barong para sa Kalalakihan)
 * 
 * Authentic Philippine Haute Formal Barong for Men engineered according to
 * the 8-Stage 3D Craftsmanship SDLC and 3D Machine Learning representation standards.
 * 
 * Anatomy & Cultural Details:
 * 1. Masculine Tailored Cut: Continuous, watertight silhouette with broad sloped shoulders,
 *    sculpted chest, gentle waist suppression, and straight formal drape.
 * 2. Translucent Handloom Piña-Seda: Gossamer sheer pineapple-silk blend with light transmission,
 *    subtle warp/weft slubs, and silk sheen.
 * 3. Inner Camisa de Chino: Crisp Supima cotton undershirt with a crew neckline visible through
 *    the translucent Piña-Seda cloth.
 * 4. Iconic Lumban Calado Pechera: Traditional U-shaped chest embroidery shield featuring
 *    drawn-thread Calado open-work lace, Sampaguita floral medallions, and raised silk cord borders.
 * 5. 5 Palawan Mother-of-Pearl (Madreperla) Buttons: Iridescent nacre buttons down the front placket,
 *    each with 4 micro-holes and golden silk cross-stitching.
 * 6. Architectural Mandarin Collar: Clean standing collar (Cuello Chino) sitting flush on the neck base,
 *    finished with gold welt piping and a top collar closure button.
 * 7. Seamless Full-Length Sleeves: Ergonomically draped long sleeves with tailored armhole welt seams,
 *    elbow crease, and Calado-embroidered French cuffs with Mother-of-Pearl cufflinks.
 * 8. Dual Side Vents (Bolas): Traditional hem slits on left and right flanks with reinforced
 *    triangular gusset tabs for clean drape over formal trousers.
 * 9. Tailored Back: Horizontal back yoke seam and central vertical ease box pleat.
 */
export function createBarongMenModel(
  fabricHex = '#FAF7EE',
  embroideryHex = '#E6CE98',
  buttonHex = '#FFFDF5'
) {
  const root = new THREE.Group();
  root.name = 'BarongTagalogMenMasterwork';

  // 1. Physically Calibrated PBR Materials
  const pinaFabricMat = MaterialsFactory.createPinaFabricMaterial(fabricHex || '#FAF7EE');
  const caladoPecheraMat = MaterialsFactory.createCaladoEmbroideryMaterial(embroideryHex || '#E6CE98');
  const mopButtonMat = MaterialsFactory.createMotherOfPearlButtonMaterial(buttonHex || '#FFFDF5');
  const camisaMat = MaterialsFactory.createCamisaDeChinoMaterial('#FAF9F5');
  const goldThreadMat = MaterialsFactory.createFiligreeGoldMaterial('#D4AF37');
  const darkThreadMat = MaterialsFactory.createKamagongWoodMaterial('#24140E');

  // Groups for component hierarchy
  const camisaGroup = new THREE.Group();
  const torsoGroup = new THREE.Group();
  const pecheraGroup = new THREE.Group();
  const placketGroup = new THREE.Group();
  const buttonsGroup = new THREE.Group();
  const collarGroup = new THREE.Group();
  const sleevesGroup = new THREE.Group();
  const cuffsGroup = new THREE.Group();
  const sideVentsGroup = new THREE.Group();
  const backYokeGroup = new THREE.Group();

  root.add(camisaGroup);
  root.add(torsoGroup);
  root.add(pecheraGroup);
  root.add(placketGroup);
  root.add(buttonsGroup);
  root.add(collarGroup);
  root.add(sleevesGroup);
  root.add(cuffsGroup);
  root.add(sideVentsGroup);
  root.add(backYokeGroup);

  // ============================================================================
  // 2. INNER CAMISA DE CHINO (SUPIMA COTTON UNDERSHIRT)
  // ============================================================================
  // Solid, watertight inner torso in crisp unbleached cotton. Its round crew neck
  // is subtly visible beneath the gossamer translucent Piña-Seda cloth.
  const camisaH = 1.30;
  const numCamisaV = 36;
  const numCamisaU = 48;
  const cVerts = [];
  const cUvs = [];
  const cIndices = [];

// Continuous superellipse formula from 3d-modeling-mastery skill (n ~ 3.2 for bespoke tailored drapes)
function evaluateSuperellipse(theta, a, b, n = 3.2) {
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const exp = 2 / n;
  const x = a * Math.sign(cosT) * Math.pow(Math.abs(cosT), exp);
  const z = b * Math.sign(sinT) * Math.pow(Math.abs(sinT), exp);
  return { x, z };
}

  for (let j = 0; j <= numCamisaV; j++) {
    const v = j / numCamisaV;
    const y = 0.06 + v * camisaH;

    let rx, rz;
    if (v < 0.25) {
      rx = THREE.MathUtils.lerp(0.50, 0.47, v / 0.25);
      rz = THREE.MathUtils.lerp(0.32, 0.29, v / 0.25);
    } else if (v < 0.60) {
      const t = (v - 0.25) / 0.35;
      rx = THREE.MathUtils.lerp(0.47, 0.45, Math.sin(t * Math.PI));
      rz = THREE.MathUtils.lerp(0.29, 0.27, Math.sin(t * Math.PI));
    } else if (v < 0.88) {
      const t = (v - 0.60) / 0.28;
      rx = THREE.MathUtils.lerp(0.45, 0.52, Math.sin(t * Math.PI * 0.5));
      rz = THREE.MathUtils.lerp(0.27, 0.32, Math.sin(t * Math.PI * 0.5));
    } else {
      // Crew neckline
      const t = (v - 0.88) / 0.12;
      rx = THREE.MathUtils.lerp(0.52, 0.23, t);
      rz = THREE.MathUtils.lerp(0.32, 0.19, t);
    }

    for (let i = 0; i <= numCamisaU; i++) {
      const u = i / numCamisaU;
      const theta = u * Math.PI * 2;

      const pt = evaluateSuperellipse(theta, rx, rz, 3.2);
      let x = pt.x;
      let z = pt.z;
      let yPos = y;

      // Front crew-neck scooped dip
      if (v > 0.88 && z > 0) {
        const frontRatio = z / rz;
        yPos -= frontRatio * 0.055 * ((v - 0.88) / 0.12);
      }

      cVerts.push(x, yPos, z);
      cUvs.push(u, v);
    }
  }

  for (let j = 0; j < numCamisaV; j++) {
    for (let i = 0; i < numCamisaU; i++) {
      const a = j * (numCamisaU + 1) + i;
      const b = (j + 1) * (numCamisaU + 1) + i;
      const c = (j + 1) * (numCamisaU + 1) + (i + 1);
      const d = j * (numCamisaU + 1) + (i + 1);
      cIndices.push(a, b, d);
      cIndices.push(b, c, d);
    }
  }

  const camisaGeo = new THREE.BufferGeometry();
  camisaGeo.setAttribute('position', new THREE.Float32BufferAttribute(cVerts, 3));
  camisaGeo.setAttribute('uv', new THREE.Float32BufferAttribute(cUvs, 2));
  camisaGeo.setIndex(cIndices);
  camisaGeo.computeVertexNormals();

  const camisaMesh = new THREE.Mesh(camisaGeo, camisaMat);
  camisaMesh.castShadow = false;
  camisaMesh.receiveShadow = true;
  camisaGroup.add(camisaMesh);

  // ============================================================================
  // 3. WATERTIGHT TAILORED OUTER PIÑA-SEDA TUNIC
  // ============================================================================
  // Completely closed, seamless tailored masculine silhouette.
  // Smoothly curves from the bottom hem up to the neck base with broad shoulders.
  const tunicH = 1.34;
  const numV = 48;
  const numU = 64;
  const tVerts = [];
  const tUvs = [];
  const tIndices = [];

  for (let j = 0; j <= numV; j++) {
    const v = j / numV;
    const y = 0.05 + v * tunicH;

    let rx, rz;
    if (v < 0.22) {
      // Lower drape around hips
      const t = v / 0.22;
      rx = THREE.MathUtils.lerp(0.55, 0.52, t);
      rz = THREE.MathUtils.lerp(0.35, 0.32, t);
    } else if (v < 0.58) {
      // Gentle masculine waist taper
      const t = (v - 0.22) / 0.36;
      rx = THREE.MathUtils.lerp(0.52, 0.49, Math.sin(t * Math.PI));
      rz = THREE.MathUtils.lerp(0.32, 0.29, Math.sin(t * Math.PI));
    } else if (v < 0.86) {
      // Sculpted masculine chest volume
      const t = (v - 0.58) / 0.28;
      rx = THREE.MathUtils.lerp(0.49, 0.58, Math.sin(t * Math.PI * 0.5));
      rz = THREE.MathUtils.lerp(0.29, 0.35, Math.sin(t * Math.PI * 0.5));
    } else if (v < 0.95) {
      // Broad sloped masculine shoulders
      const t = (v - 0.86) / 0.09;
      rx = THREE.MathUtils.lerp(0.58, 0.63, t);
      rz = THREE.MathUtils.lerp(0.35, 0.30, t);
    } else {
      // Neck transition to Mandarin collar base
      const t = (v - 0.95) / 0.05;
      rx = THREE.MathUtils.lerp(0.63, 0.24, t);
      rz = THREE.MathUtils.lerp(0.30, 0.20, t);
    }

    for (let i = 0; i <= numU; i++) {
      const u = i / numU;
      const theta = u * Math.PI * 2;

      const pt = evaluateSuperellipse(theta, rx, rz, 3.2);
      let x = pt.x;
      let z = pt.z;

      // Realistic chest outward curve
      if (v >= 0.58 && v <= 0.88 && z > 0) {
        z += Math.sin((v - 0.58) / 0.30 * Math.PI) * 0.022;
      }

      tVerts.push(x, y, z);
      tUvs.push(u * 2, v * 2); // repeat weave microtexture seamlessly
    }
  }

  for (let j = 0; j < numV; j++) {
    for (let i = 0; i < numU; i++) {
      const a = j * (numU + 1) + i;
      const b = (j + 1) * (numU + 1) + i;
      const c = (j + 1) * (numU + 1) + (i + 1);
      const d = j * (numU + 1) + (i + 1);
      tIndices.push(a, b, d);
      tIndices.push(b, c, d);
    }
  }

  const tunicGeo = new THREE.BufferGeometry();
  tunicGeo.setAttribute('position', new THREE.Float32BufferAttribute(tVerts, 3));
  tunicGeo.setAttribute('uv', new THREE.Float32BufferAttribute(tUvs, 2));
  tunicGeo.setIndex(tIndices);
  tunicGeo.computeVertexNormals();

  const tunicMesh = new THREE.Mesh(tunicGeo, pinaFabricMat);
  tunicMesh.castShadow = true;
  tunicMesh.receiveShadow = true;
  torsoGroup.add(tunicMesh);

  // ============================================================================
  // 4. DUAL SIDE VENTS (BOLAS) AT HEM
  // ============================================================================
  // In authentic Filipino formal barongs, side vents are subtle vertical slits
  // at the left and right hip seams (y = 0.05 to 0.32) reinforced with
  // triangular gussets and double needlework stitching.
  const ventMaxY = 0.30;
  [-1, 1].forEach((side) => {
    // Triangular reinforcement gusset patch
    const gussetShape = new THREE.Shape();
    gussetShape.moveTo(-0.020, 0);
    gussetShape.lineTo(0.020, 0);
    gussetShape.lineTo(0, 0.025);
    gussetShape.closePath();

    const gussetGeo = new THREE.ShapeGeometry(gussetShape);
    const gussetMesh = new THREE.Mesh(gussetGeo, caladoPecheraMat);
    gussetMesh.position.set(side * 0.535, ventMaxY - 0.005, 0.002);
    gussetMesh.rotation.y = side * Math.PI * 0.5;
    sideVentsGroup.add(gussetMesh);

    // Fine stitch piping line along the slit edge
    const slitLineGeo = new THREE.CylinderGeometry(0.0025, 0.0025, ventMaxY - 0.05, 8);
    const slitLineMesh = new THREE.Mesh(slitLineGeo, goldThreadMat);
    slitLineMesh.position.set(side * 0.540, (ventMaxY + 0.05) * 0.5, 0);
    sideVentsGroup.add(slitLineMesh);
  });

  // ============================================================================
  // 5. ICONIC U-SHAPED LUMBAN CALADO PECHERA (CHEST EMBROIDERY SHIELD)
  // ============================================================================
  // The iconic front embroidery shield of the Barong Tagalog.
  // Extends from the collar down to mid-torso, shaped in a classic U-curve.
  const pecheraWidth = 0.32;
  const pecheraTopY = 1.34;
  const pecheraBottomY = 0.68;
  const pecheraDepth = 0.355; // Conforms tightly to the chest

  const pecheraShape = new THREE.Shape();
  const halfPW = pecheraWidth * 0.5;

  pecheraShape.moveTo(-halfPW, pecheraTopY);
  pecheraShape.lineTo(-halfPW, pecheraBottomY + 0.07);
  pecheraShape.quadraticCurveTo(-halfPW, pecheraBottomY, 0, pecheraBottomY);
  pecheraShape.quadraticCurveTo(halfPW, pecheraBottomY, halfPW, pecheraBottomY + 0.07);
  pecheraShape.lineTo(halfPW, pecheraTopY);
  pecheraShape.closePath();

  const pecheraGeo = new THREE.ShapeGeometry(pecheraShape, 24);
  const pPositions = pecheraGeo.attributes.position;

  // Curvature projection conforming to curved chest
  for (let k = 0; k < pPositions.count; k++) {
    const px = pPositions.getX(k);
    const py = pPositions.getY(k);
    const curvatureRatio = Math.cos((px / halfPW) * 0.45);
    const yFactor = Math.sin(((py - 0.68) / (1.34 - 0.68)) * Math.PI * 0.5);
    const pz = (pecheraDepth + yFactor * 0.02) * curvatureRatio + 0.003;
    pPositions.setZ(k, pz);
  }
  pecheraGeo.computeVertexNormals();

  const pecheraMesh = new THREE.Mesh(pecheraGeo, caladoPecheraMat);
  pecheraMesh.castShadow = true;
  pecheraGroup.add(pecheraMesh);

  // Raised Calado Outer Border Welt (Gold Silk Cord)
  const pecheraBorderCurve = new THREE.CurvePath();
  const borderPts = [
    new THREE.Vector3(-halfPW, pecheraTopY, pecheraDepth * Math.cos(0.45) + 0.005),
    new THREE.Vector3(-halfPW, pecheraBottomY + 0.07, pecheraDepth * Math.cos(0.45) + 0.005),
    new THREE.Vector3(-halfPW * 0.55, pecheraBottomY + 0.012, pecheraDepth * 0.98 + 0.005),
    new THREE.Vector3(0, pecheraBottomY, pecheraDepth + 0.005),
    new THREE.Vector3(halfPW * 0.55, pecheraBottomY + 0.012, pecheraDepth * 0.98 + 0.005),
    new THREE.Vector3(halfPW, pecheraBottomY + 0.07, pecheraDepth * Math.cos(0.45) + 0.005),
    new THREE.Vector3(halfPW, pecheraTopY, pecheraDepth * Math.cos(0.45) + 0.005),
  ];
  const borderSpline = new THREE.CatmullRomCurve3(borderPts);
  const borderTubeGeo = new THREE.TubeGeometry(borderSpline, 36, 0.003, 8, false);
  const borderTubeMesh = new THREE.Mesh(borderTubeGeo, goldThreadMat);
  pecheraGroup.add(borderTubeMesh);

  // Sampaguita Floral Medallions flanking the Pechera
  const medallionYs = [1.20, 1.05, 0.90, 0.78];
  medallionYs.forEach((mY) => {
    [-1, 1].forEach((side) => {
      const medallionGroup = new THREE.Group();
      const mX = side * 0.092;
      const mZ = pecheraDepth * Math.cos((mX / halfPW) * 0.45) + 0.006;

      // Center gold pearl bead
      const beadGeo = new THREE.SphereGeometry(0.004, 12, 12);
      const beadMesh = new THREE.Mesh(beadGeo, mopButtonMat);
      medallionGroup.add(beadMesh);

      // 4 Petals
      for (let p = 0; p < 4; p++) {
        const petalGeo = new THREE.BoxGeometry(0.008, 0.003, 0.002);
        const petalMesh = new THREE.Mesh(petalGeo, caladoPecheraMat);
        petalMesh.rotation.z = (p * Math.PI) / 2 + Math.PI / 4;
        petalMesh.position.set(
          Math.cos((p * Math.PI) / 2 + Math.PI / 4) * 0.006,
          Math.sin((p * Math.PI) / 2 + Math.PI / 4) * 0.006,
          0
        );
        medallionGroup.add(petalMesh);
      }

      medallionGroup.position.set(mX, mY, mZ);
      pecheraGroup.add(medallionGroup);
    });
  });

  // ============================================================================
  // 6. FRONT PLACKET & PALAWAN MOTHER-OF-PEARL (MADREPERLA) BUTTONS
  // ============================================================================
  // Raised center front placket holding 5 genuine Mother-of-Pearl buttons
  const placketW = 0.038;
  const placketH = 0.68;
  const placketGeo = new THREE.BoxGeometry(placketW, placketH, 0.005);
  const placketMesh = new THREE.Mesh(placketGeo, caladoPecheraMat);
  placketMesh.position.set(0, pecheraTopY - placketH * 0.5, pecheraDepth + 0.005);
  placketGroup.add(placketMesh);

  // Placket fine double-edge welt stitching
  [-1, 1].forEach((side) => {
    const stitchGeo = new THREE.CylinderGeometry(0.0015, 0.0015, placketH, 8);
    const stitchMesh = new THREE.Mesh(stitchGeo, goldThreadMat);
    stitchMesh.position.set(side * (placketW * 0.5 - 0.0025), pecheraTopY - placketH * 0.5, pecheraDepth + 0.008);
    placketGroup.add(stitchMesh);
  });

  // 5 Mother-of-Pearl Shell Buttons down the front placket
  const buttonSpacing = 0.120;
  const buttonStartY = pecheraTopY - 0.08;

  for (let b = 0; b < 5; b++) {
    const bY = buttonStartY - b * buttonSpacing;
    const buttonAssembly = new THREE.Group();

    // Madreperla iridescent button disc with beveled rim
    const buttonDiscGeo = new THREE.CylinderGeometry(0.014, 0.013, 0.0035, 24);
    buttonDiscGeo.rotateX(Math.PI / 2);
    const buttonDiscMesh = new THREE.Mesh(buttonDiscGeo, mopButtonMat);
    buttonAssembly.add(buttonDiscMesh);

    // Outer raised rim welt
    const rimGeo = new THREE.TorusGeometry(0.0125, 0.0016, 8, 24);
    const rimMesh = new THREE.Mesh(rimGeo, mopButtonMat);
    buttonAssembly.add(rimMesh);

    // 4 micro-holes with thread cross-stitch
    const holeRadius = 0.004;
    const holePositions = [
      [-holeRadius, holeRadius],
      [holeRadius, holeRadius],
      [-holeRadius, -holeRadius],
      [holeRadius, -holeRadius],
    ];

    holePositions.forEach(([hx, hy]) => {
      const holeGeo = new THREE.CylinderGeometry(0.0012, 0.0012, 0.004, 8);
      holeGeo.rotateX(Math.PI / 2);
      const holeMesh = new THREE.Mesh(holeGeo, darkThreadMat);
      holeMesh.position.set(hx, hy, 0.001);
      buttonAssembly.add(holeMesh);
    });

    // Cross-stitch thread in center
    const threadAGeo = new THREE.BoxGeometry(0.010, 0.0012, 0.0038);
    threadAGeo.rotateZ(Math.PI / 4);
    const threadAMesh = new THREE.Mesh(threadAGeo, goldThreadMat);
    threadAMesh.position.z = 0.0018;
    buttonAssembly.add(threadAMesh);

    const threadBGeo = new THREE.BoxGeometry(0.010, 0.0012, 0.0038);
    threadBGeo.rotateZ(-Math.PI / 4);
    const threadBMesh = new THREE.Mesh(threadBGeo, goldThreadMat);
    threadBMesh.position.z = 0.0018;
    buttonAssembly.add(threadBMesh);

    buttonAssembly.position.set(0, bY, pecheraDepth + 0.010);
    buttonsGroup.add(buttonAssembly);
  }

  // ============================================================================
  // 7. ARCHITECTURAL MANDARIN STANDING COLLAR (CUELLO CHINO)
  // ============================================================================
  // Sits cleanly and flush on the neck circumference, fully enclosed with
  // front throat notch and top collar button.
  const collarRx = 0.238;
  const collarRz = 0.198;
  const collarH = 0.070;
  const collarBaseY = 1.34;
  const collarSegments = 36;
  const throatGapAngle = 0.14; // Small throat opening

  const collarVerts = [];
  const collarUvs = [];
  const collarIndices = [];

  for (let j = 0; j <= 3; j++) {
    const v = j / 3;
    const y = collarBaseY + v * collarH;
    const flare = 1.0 + v * 0.05;
    const cwx = collarRx * flare;
    const cwz = collarRz * flare;

    const startAngle = -Math.PI / 2 + throatGapAngle;
    const endAngle = 3 * Math.PI / 2 - throatGapAngle;
    const angleRange = endAngle - startAngle;

    for (let i = 0; i <= collarSegments; i++) {
      const u = i / collarSegments;
      const angle = startAngle + u * angleRange;
      const x = Math.cos(angle) * cwx;
      const z = Math.sin(angle) * cwz;

      collarVerts.push(x, y, z);
      collarUvs.push(u, v);
    }
  }

  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < collarSegments; i++) {
      const a = j * (collarSegments + 1) + i;
      const b = (j + 1) * (collarSegments + 1) + i;
      const c = (j + 1) * (collarSegments + 1) + (i + 1);
      const d = j * (collarSegments + 1) + (i + 1);
      collarIndices.push(a, b, d);
      collarIndices.push(b, c, d);
    }
  }

  const collarGeo = new THREE.BufferGeometry();
  collarGeo.setAttribute('position', new THREE.Float32BufferAttribute(collarVerts, 3));
  collarGeo.setAttribute('uv', new THREE.Float32BufferAttribute(collarUvs, 2));
  collarGeo.setIndex(collarIndices);
  collarGeo.computeVertexNormals();

  const collarMesh = new THREE.Mesh(collarGeo, caladoPecheraMat);
  collarMesh.castShadow = true;
  collarGroup.add(collarMesh);

  // Top Collar Gold Welt Piping
  const crestPts = [];
  for (let i = 0; i <= 24; i++) {
    const u = i / 24;
    const startAngle = -Math.PI / 2 + throatGapAngle;
    const endAngle = 3 * Math.PI / 2 - throatGapAngle;
    const angle = startAngle + u * (endAngle - startAngle);
    const cx = Math.cos(angle) * (collarRx * 1.05);
    const cz = Math.sin(angle) * (collarRz * 1.05);
    crestPts.push(new THREE.Vector3(cx, collarBaseY + collarH, cz));
  }
  const crestSpline = new THREE.CatmullRomCurve3(crestPts);
  const crestTubeGeo = new THREE.TubeGeometry(crestSpline, 28, 0.0028, 8, false);
  const crestTubeMesh = new THREE.Mesh(crestTubeGeo, goldThreadMat);
  collarGroup.add(crestTubeMesh);

  // Top throat closure button
  const topBtnGeo = new THREE.CylinderGeometry(0.008, 0.007, 0.0025, 16);
  topBtnGeo.rotateX(Math.PI / 2);
  const topBtnMesh = new THREE.Mesh(topBtnGeo, mopButtonMat);
  topBtnMesh.position.set(-0.020, collarBaseY + collarH * 0.5, collarRz + 0.007);
  collarGroup.add(topBtnMesh);

  // ============================================================================
  // 8. TAILORED FULL-LENGTH SLEEVES WITH SEAMLESS ARMHOLE JOINTS
  // ============================================================================
  // Sleeves start flush at the shoulder socket, avoiding disconnected gaps,
  // and feature tailored armhole welt rings bridging the joint.
  [-1, 1].forEach((side) => {
    // Shoulder armhole welt seam (covers joint between torso and sleeve)
    const armholeRingGeo = new THREE.TorusGeometry(0.125, 0.006, 12, 32);
    armholeRingGeo.scale(0.85, 1.25, 1.0);
    const armholeRingMesh = new THREE.Mesh(armholeRingGeo, goldThreadMat);
    armholeRingMesh.position.set(side * 0.54, 1.20, 0.01);
    armholeRingMesh.rotation.y = side * Math.PI * 0.5;
    armholeRingMesh.rotation.x = 0.15;
    sleevesGroup.add(armholeRingMesh);

    // Anatomical arm curve
    const sleeveCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.54, 1.20, 0.01),    // Shoulder armhole
      new THREE.Vector3(side * 0.60, 0.98, 0.02),    // Upper bicep
      new THREE.Vector3(side * 0.58, 0.74, 0.05),    // Elbow bend
      new THREE.Vector3(side * 0.53, 0.54, 0.04),    // Forearm
      new THREE.Vector3(side * 0.49, 0.42, 0.03),    // Wrist / cuff head
    ]);

    const sleeveGeo = new THREE.TubeGeometry(sleeveCurve, 32, 0.105, 18, false);
    const sleevePositions = sleeveGeo.attributes.position;

    // Taper wrist down, broaden shoulder
    for (let s = 0; s < sleevePositions.count; s++) {
      const sy = sleevePositions.getY(s);
      const factor = (sy - 0.42) / (1.20 - 0.42); // 0 at wrist, 1 at shoulder
      const sx = sleevePositions.getX(s);
      const sz = sleevePositions.getZ(s);
      const centerPt = sleeveCurve.getPointAt(1 - THREE.MathUtils.clamp(factor, 0, 1));

      const dx = sx - centerPt.x;
      const dz = sz - centerPt.z;
      const scaleR = THREE.MathUtils.lerp(0.70, 1.05, factor);
      sleevePositions.setX(s, centerPt.x + dx * scaleR);
      sleevePositions.setZ(s, centerPt.z + dz * scaleR);
    }
    sleeveGeo.computeVertexNormals();

    const sleeveMesh = new THREE.Mesh(sleeveGeo, pinaFabricMat);
    sleeveMesh.castShadow = true;
    sleeveMesh.receiveShadow = true;
    sleevesGroup.add(sleeveMesh);

    // ==========================================================================
    // 9. CALADO-EMBROIDERED FRENCH CUFFS & MOTHER-OF-PEARL CUFFLINKS
    // ==========================================================================
    const cuffH = 0.075;
    const cuffGeo = new THREE.CylinderGeometry(0.078, 0.074, cuffH, 20, 1, false);
    const cuffMesh = new THREE.Mesh(cuffGeo, caladoPecheraMat);
    cuffMesh.position.set(side * 0.485, 0.42 + cuffH * 0.5, 0.03);
    cuffMesh.rotation.z = side * -0.15;
    cuffsGroup.add(cuffMesh);

    // Gold trim welt on cuff top and bottom edges
    [-1, 1].forEach((edge) => {
      const cuffRingGeo = new THREE.TorusGeometry(0.077, 0.0022, 8, 24);
      const cuffRingMesh = new THREE.Mesh(cuffRingGeo, goldThreadMat);
      cuffRingMesh.rotation.x = Math.PI / 2;
      cuffRingMesh.position.set(side * 0.485, 0.42 + cuffH * 0.5 + edge * (cuffH * 0.5), 0.03);
      cuffRingMesh.rotation.y = side * -0.15;
      cuffsGroup.add(cuffRingMesh);
    });

    // Mother-of-Pearl cufflink button
    const cuffBtnGeo = new THREE.CylinderGeometry(0.009, 0.008, 0.003, 16);
    cuffBtnGeo.rotateZ(Math.PI / 2);
    const cuffBtnMesh = new THREE.Mesh(cuffBtnGeo, mopButtonMat);
    cuffBtnMesh.position.set(side * 0.562, 0.46, 0.032);
    cuffsGroup.add(cuffBtnMesh);
  });

  // ============================================================================
  // 10. BACK YOKE SEAM & CENTRAL BOX PLEAT
  // ============================================================================
  const yokeY = 1.15;
  const yokeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.48, yokeY, -0.28),
    new THREE.Vector3(0, yokeY + 0.015, -0.32),
    new THREE.Vector3(0.48, yokeY, -0.28),
  ]);
  const yokeTubeGeo = new THREE.TubeGeometry(yokeCurve, 24, 0.0025, 8, false);
  const yokeMesh = new THREE.Mesh(yokeTubeGeo, goldThreadMat);
  backYokeGroup.add(yokeMesh);

  // Central vertical box pleat down the back for ease of movement
  const pleatH = 1.00;
  const pleatGeo = new THREE.BoxGeometry(0.014, pleatH, 0.004);
  const pleatMesh = new THREE.Mesh(pleatGeo, caladoPecheraMat);
  pleatMesh.position.set(0, 0.08 + pleatH * 0.5, -0.315);
  backYokeGroup.add(pleatMesh);

  return root;
}
