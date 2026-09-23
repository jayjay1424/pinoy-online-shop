import * as THREE from 'three';
import { MaterialsFactory } from '../Materials';

/**
 * Likha Atelier — Barong Tagalog "Ilustrado" (Barong para sa Kalalakihan)
 * 
 * An authentic Philippine Haute Formal Barong for Men engineered according to
 * the 8-Stage 3D Craftsmanship SDLC and 3D Machine Learning representation standards.
 * 
 * Features:
 * - Masculine tailored silhouette with broad sloped shoulders and straight drop
 * - Authentic dual side vents (bolas) at the hem with reinforced gussets
 * - Semi-translucent handloom Piña-Seda fabric with gossamer sheen
 * - Camisa de Chino cotton undershirt visible through the sheer translucent weave
 * - Architectural Mandarin standing collar with embroidered border
 * - Traditional U-shaped Lumban Calado Pechera chest embroidery shield
 * - Raised center placket with 5 iridescent Palawan Mother-of-Pearl (Madreperla) buttons
 * - Tailored full-length sleeves with embroidered French cuffs and cufflink buttons
 * - Back horizontal yoke seam with central vertical ease box pleat
 */
export function createBarongMenModel(
  fabricHex = '#FAF6EB',
  embroideryHex = '#E6CE98',
  buttonHex = '#FFFDF5'
) {
  const root = new THREE.Group();
  root.name = 'BarongTagalogMenIlustrado';

  // 1. Physically Calibrated PBR Materials
  const pinaFabricMat = MaterialsFactory.createPinaFabricMaterial(fabricHex || '#FAF6EB');
  const caladoPecheraMat = MaterialsFactory.createCaladoEmbroideryMaterial(embroideryHex || '#E6CE98');
  const mopButtonMat = MaterialsFactory.createMotherOfPearlButtonMaterial(buttonHex || '#FFFDF5');
  const camisaMat = MaterialsFactory.createCamisaDeChinoMaterial('#FAF9F5');
  const goldThreadMat = MaterialsFactory.createFiligreeGoldMaterial('#D4AF37');
  const darkHornMat = MaterialsFactory.createKamagongWoodMaterial('#24140E');

  // Interactive component groups
  const torsoGroup = new THREE.Group();
  const camisaGroup = new THREE.Group();
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
  // In authentic Filipino formalwear, the sheer translucent Piña barong is worn
  // over a white cotton Camisa de Chino. Its round crew neck is subtly visible
  // through the gossamer fabric, providing genuine two-tone depth.
  const camisaHeight = 1.30;
  const numCamisaV = 32;
  const numCamisaU = 48;
  const cVerts = [];
  const cUvs = [];
  const cIndices = [];

  for (let j = 0; j <= numCamisaV; j++) {
    const v = j / numCamisaV;
    const y = 0.06 + v * camisaHeight;

    let wR, dR;
    if (v < 0.25) {
      wR = THREE.MathUtils.lerp(0.56, 0.52, v / 0.25);
      dR = THREE.MathUtils.lerp(0.35, 0.32, v / 0.25);
    } else if (v < 0.60) {
      const t = (v - 0.25) / 0.35;
      wR = THREE.MathUtils.lerp(0.52, 0.50, Math.sin(t * Math.PI));
      dR = THREE.MathUtils.lerp(0.32, 0.30, Math.sin(t * Math.PI));
    } else if (v < 0.88) {
      const t = (v - 0.60) / 0.28;
      wR = THREE.MathUtils.lerp(0.50, 0.58, Math.sin(t * Math.PI * 0.5));
      dR = THREE.MathUtils.lerp(0.30, 0.35, Math.sin(t * Math.PI * 0.5));
    } else {
      // Crew neckline dip on front, higher on back
      const t = (v - 0.88) / 0.12;
      wR = THREE.MathUtils.lerp(0.58, 0.25, t);
      dR = THREE.MathUtils.lerp(0.35, 0.21, t);
    }

    for (let i = 0; i <= numCamisaU; i++) {
      const u = i / numCamisaU;
      const theta = u * Math.PI * 2;

      let x = Math.cos(theta) * wR;
      let z = Math.sin(theta) * dR;
      let yOffset = y;

      // Front crew-neck scooped dip
      if (v > 0.88 && z > 0) {
        const frontRatio = z / dR;
        yOffset -= frontRatio * 0.05 * ((v - 0.88) / 0.12);
      }

      cVerts.push(x, yOffset, z);
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
  // 3. TAILORED OUTER PIÑA-SEDA TUNIC WITH DUAL SIDE VENTS (BOLAS)
  // ============================================================================
  // Men's formal Barong Tagalog features a straight, clean masculine drape
  // with side vents (slits) from the hem up to mid-hip (~0.32m height) allowing
  // the garment to fall impeccably over formal pants without bunching.
  const tunicH = 1.34;
  const numV = 44;
  const numU = 64;
  const ventMaxY = 0.32; // Height where side vents close

  // We build the body in two sections:
  // Section A: Hem to vent apex (split into front and back drape)
  // Section B: Vent apex to collar (continuous tubular torso)
  const tVerts = [];
  const tUvs = [];
  const tIndices = [];

  for (let j = 0; j <= numV; j++) {
    const v = j / numV;
    const y = 0.05 + v * tunicH;

    let wR, dR;
    if (v < 0.22) {
      // Lower drape around hips
      const t = v / 0.22;
      wR = THREE.MathUtils.lerp(0.61, 0.58, t);
      dR = THREE.MathUtils.lerp(0.38, 0.35, t);
    } else if (v < 0.56) {
      // Subtle masculine waist taper
      const t = (v - 0.22) / 0.34;
      wR = THREE.MathUtils.lerp(0.58, 0.54, Math.sin(t * Math.PI));
      dR = THREE.MathUtils.lerp(0.35, 0.32, Math.sin(t * Math.PI));
    } else if (v < 0.84) {
      // Sculpted chest volume
      const t = (v - 0.56) / 0.28;
      wR = THREE.MathUtils.lerp(0.54, 0.64, Math.sin(t * Math.PI * 0.5));
      dR = THREE.MathUtils.lerp(0.32, 0.38, Math.sin(t * Math.PI * 0.5));
    } else if (v < 0.95) {
      // Broad sloped masculine shoulders
      const t = (v - 0.84) / 0.11;
      wR = THREE.MathUtils.lerp(0.64, 0.70, t);
      dR = THREE.MathUtils.lerp(0.38, 0.34, t);
    } else {
      // Neck slope towards collar base
      const t = (v - 0.95) / 0.05;
      wR = THREE.MathUtils.lerp(0.70, 0.27, t);
      dR = THREE.MathUtils.lerp(0.34, 0.23, t);
    }

    for (let i = 0; i <= numU; i++) {
      const u = i / numU;
      const theta = u * Math.PI * 2;

      let x = Math.cos(theta) * wR;
      let z = Math.sin(theta) * dR;

      // Realistic chest outward drape and back ease
      if (v >= 0.55 && v <= 0.88 && z > 0) {
        z += Math.sin((v - 0.55) / 0.33 * Math.PI) * 0.024;
      }

      // Side vent flare: below vent apex, ease the side seams slightly outward
      if (y < ventMaxY) {
        const ventEase = (1 - y / ventMaxY) * 0.014;
        if (Math.abs(Math.cos(theta)) > 0.85) {
          x += Math.sign(x) * ventEase;
        }
      }

      tVerts.push(x, y, z);
      tUvs.push(u, v);
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
  // 4. DUAL SIDE VENTS DETAIL (REINFORCED TRIANGULAR GUSSETS & STITCHING)
  // ============================================================================
  // At the top of each side vent (apex at y ~ 0.32), master tailors sew a reinforced
  // triangle gusset and double needle-stitched binding to prevent tearing.
  [-1, 1].forEach((side) => {
    // Gusset triangle
    const gussetShape = new THREE.Shape();
    gussetShape.moveTo(-0.022, 0);
    gussetShape.lineTo(0.022, 0);
    gussetShape.lineTo(0, 0.028);
    gussetShape.closePath();

    const gussetGeo = new THREE.ShapeGeometry(gussetShape);
    const gussetMesh = new THREE.Mesh(gussetGeo, caladoPecheraMat);
    gussetMesh.position.set(side * 0.585, ventMaxY - 0.005, 0.002);
    gussetMesh.rotation.y = side * Math.PI * 0.5;
    sideVentsGroup.add(gussetMesh);

    // Fine stitch piping line along the slit edge
    const slitLineGeo = new THREE.CylinderGeometry(0.003, 0.003, ventMaxY - 0.05, 8);
    const slitLineMesh = new THREE.Mesh(slitLineGeo, caladoPecheraMat);
    slitLineMesh.position.set(side * 0.59, (ventMaxY + 0.05) * 0.5, 0);
    sideVentsGroup.add(slitLineMesh);
  });

  // ============================================================================
  // 5. ICONIC U-SHAPED LUMBAN CALADO PECHERA (CHEST EMBROIDERY SHIELD)
  // ============================================================================
  // The Pechera is the crown of the Barong Tagalog. It forms an elegant U-shape
  // down the chest, filled with intricate drawn-thread Calado open-work,
  // Sampaguita floral medallions, and geometric borders.
  const pecheraWidth = 0.34;
  const pecheraTopY = 1.34;
  const pecheraBottomY = 0.64;
  const pecheraDepth = 0.384; // sits slightly proud of the chest contour

  const pecheraShape = new THREE.Shape();
  const halfPW = pecheraWidth * 0.5;

  // Outer U-contour with rounded bottom curve
  pecheraShape.moveTo(-halfPW, pecheraTopY);
  pecheraShape.lineTo(-halfPW, pecheraBottomY + 0.08);
  pecheraShape.quadraticCurveTo(-halfPW, pecheraBottomY, 0, pecheraBottomY);
  pecheraShape.quadraticCurveTo(halfPW, pecheraBottomY, halfPW, pecheraBottomY + 0.08);
  pecheraShape.lineTo(halfPW, pecheraTopY);
  pecheraShape.closePath();

  // Subdivide pechera geometry along curved chest
  const pecheraGeo = new THREE.ShapeGeometry(pecheraShape, 24);
  const pPositions = pecheraGeo.attributes.position;

  // Project pechera vertices onto the curved cylindrical curvature of the chest
  for (let k = 0; k < pPositions.count; k++) {
    const px = pPositions.getX(k);
    const py = pPositions.getY(k);
    const curvatureRatio = Math.cos((px / halfPW) * 0.48);
    const pz = pecheraDepth * curvatureRatio + 0.004;
    pPositions.setZ(k, pz);
  }
  pecheraGeo.computeVertexNormals();

  const pecheraMesh = new THREE.Mesh(pecheraGeo, caladoPecheraMat);
  pecheraMesh.castShadow = true;
  pecheraGroup.add(pecheraMesh);

  // Raised Calado Outer Border Piping (Golden-silk embroidery cord)
  const pecheraBorderCurve = new THREE.CurvePath();
  const pts = [
    new THREE.Vector3(-halfPW, pecheraTopY, pecheraDepth * Math.cos(0.48) + 0.006),
    new THREE.Vector3(-halfPW, pecheraBottomY + 0.08, pecheraDepth * Math.cos(0.48) + 0.006),
    new THREE.Vector3(-halfPW * 0.6, pecheraBottomY + 0.015, pecheraDepth * 0.98 + 0.006),
    new THREE.Vector3(0, pecheraBottomY, pecheraDepth + 0.006),
    new THREE.Vector3(halfPW * 0.6, pecheraBottomY + 0.015, pecheraDepth * 0.98 + 0.006),
    new THREE.Vector3(halfPW, pecheraBottomY + 0.08, pecheraDepth * Math.cos(0.48) + 0.006),
    new THREE.Vector3(halfPW, pecheraTopY, pecheraDepth * Math.cos(0.48) + 0.006),
  ];
  const borderSpline = new THREE.CatmullRomCurve3(pts);
  const borderTubeGeo = new THREE.TubeGeometry(borderSpline, 36, 0.0035, 8, false);
  const borderTubeMesh = new THREE.Mesh(borderTubeGeo, goldThreadMat);
  pecheraGroup.add(borderTubeMesh);

  // Handcrafted Sampaguita Floral Medallions flanking the Pechera
  const medallionYs = [1.18, 1.02, 0.86, 0.74];
  medallionYs.forEach((mY) => {
    [-1, 1].forEach((side) => {
      const medallionGroup = new THREE.Group();
      const mX = side * 0.095;
      const mZ = pecheraDepth * Math.cos((mX / halfPW) * 0.48) + 0.007;

      // Center gold bead
      const beadGeo = new THREE.SphereGeometry(0.0045, 12, 12);
      const beadMesh = new THREE.Mesh(beadGeo, goldThreadMat);
      medallionGroup.add(beadMesh);

      // 4 Petal micro-quads
      for (let p = 0; p < 4; p++) {
        const petalGeo = new THREE.BoxGeometry(0.009, 0.0035, 0.002);
        const petalMesh = new THREE.Mesh(petalGeo, caladoPecheraMat);
        petalMesh.rotation.z = (p * Math.PI) / 2 + Math.PI / 4;
        petalMesh.position.set(
          Math.cos((p * Math.PI) / 2 + Math.PI / 4) * 0.007,
          Math.sin((p * Math.PI) / 2 + Math.PI / 4) * 0.007,
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
  // The center front placket holds 5 genuine Palawan Mother-of-Pearl buttons,
  // each displaying soft iridescent nacre reflections and 4 thread-sewn holes.
  const placketW = 0.044;
  const placketH = 0.72; // from collar to mid-abdomen
  const placketGeo = new THREE.BoxGeometry(placketW, placketH, 0.006);
  const placketMesh = new THREE.Mesh(placketGeo, caladoPecheraMat);
  placketMesh.position.set(0, pecheraTopY - placketH * 0.5, pecheraDepth + 0.005);
  placketGroup.add(placketMesh);

  // Placket fine double-edge welt stitching
  [-1, 1].forEach((side) => {
    const stitchGeo = new THREE.CylinderGeometry(0.0018, 0.0018, placketH, 8);
    const stitchMesh = new THREE.Mesh(stitchGeo, goldThreadMat);
    stitchMesh.position.set(side * (placketW * 0.5 - 0.003), pecheraTopY - placketH * 0.5, pecheraDepth + 0.009);
    placketGroup.add(stitchMesh);
  });

  // 5 Mother-of-Pearl Shell Buttons down the front placket
  const buttonSpacing = 0.125;
  const buttonStartY = pecheraTopY - 0.07;

  for (let b = 0; b < 5; b++) {
    const bY = buttonStartY - b * buttonSpacing;
    const buttonAssembly = new THREE.Group();

    // Madreperla iridescent button disc with beveled rim
    const buttonDiscGeo = new THREE.CylinderGeometry(0.015, 0.014, 0.004, 24);
    buttonDiscGeo.rotateX(Math.PI / 2);
    const buttonDiscMesh = new THREE.Mesh(buttonDiscGeo, mopButtonMat);
    buttonAssembly.add(buttonDiscMesh);

    // Outer raised rim welt
    const rimGeo = new THREE.TorusGeometry(0.0135, 0.0018, 8, 24);
    const rimMesh = new THREE.Mesh(rimGeo, mopButtonMat);
    buttonAssembly.add(rimMesh);

    // 4 needlework thread holes with golden-ecru silk cross-stitch
    const holeRadius = 0.0045;
    const holePositions = [
      [-holeRadius, holeRadius],
      [holeRadius, holeRadius],
      [-holeRadius, -holeRadius],
      [holeRadius, -holeRadius],
    ];

    holePositions.forEach(([hx, hy]) => {
      const holeGeo = new THREE.CylinderGeometry(0.0015, 0.0015, 0.005, 8);
      holeGeo.rotateX(Math.PI / 2);
      const holeMesh = new THREE.Mesh(holeGeo, darkHornMat);
      holeMesh.position.set(hx, hy, 0.001);
      buttonAssembly.add(holeMesh);
    });

    // Cross-stitch thread in center
    const threadAGeo = new THREE.BoxGeometry(0.011, 0.0015, 0.0045);
    threadAGeo.rotateZ(Math.PI / 4);
    const threadAMesh = new THREE.Mesh(threadAGeo, goldThreadMat);
    threadAMesh.position.z = 0.002;
    buttonAssembly.add(threadAMesh);

    const threadBGeo = new THREE.BoxGeometry(0.011, 0.0015, 0.0045);
    threadBGeo.rotateZ(-Math.PI / 4);
    const threadBMesh = new THREE.Mesh(threadBGeo, goldThreadMat);
    threadBMesh.position.z = 0.002;
    buttonAssembly.add(threadBMesh);

    buttonAssembly.position.set(0, bY, pecheraDepth + 0.011);
    buttonsGroup.add(buttonAssembly);
  }

  // ============================================================================
  // 7. ARCHITECTURAL MANDARIN STANDING COLLAR
  // ============================================================================
  // Upright standing Mandarin collar (Cuello Chino) with Calado edge piping,
  // clean front throat notch, and small top closure button.
  const collarR_X = 0.265;
  const collarR_Z = 0.225;
  const collarH = 0.075;
  const collarBaseY = 1.34;
  const collarSegments = 40;
  const throatGapAngle = 0.16; // Small notch opening at center throat

  const collarVerts = [];
  const collarUvs = [];
  const collarIndices = [];

  for (let j = 0; j <= 4; j++) {
    const v = j / 4;
    const y = collarBaseY + v * collarH;
    // Slight upward flare at collar crest
    const flare = 1.0 + v * 0.06;
    const cwx = collarR_X * flare;
    const cwz = collarR_Z * flare;

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

  for (let j = 0; j < 4; j++) {
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
  const collarCrestCurve = new THREE.CurvePath();
  const crestPts = [];
  for (let i = 0; i <= 24; i++) {
    const u = i / 24;
    const startAngle = -Math.PI / 2 + throatGapAngle;
    const endAngle = 3 * Math.PI / 2 - throatGapAngle;
    const angle = startAngle + u * (endAngle - startAngle);
    const cx = Math.cos(angle) * (collarR_X * 1.06);
    const cz = Math.sin(angle) * (collarR_Z * 1.06);
    crestPts.push(new THREE.Vector3(cx, collarBaseY + collarH, cz));
  }
  const crestSpline = new THREE.CatmullRomCurve3(crestPts);
  const crestTubeGeo = new THREE.TubeGeometry(crestSpline, 32, 0.003, 8, false);
  const crestTubeMesh = new THREE.Mesh(crestTubeGeo, goldThreadMat);
  collarGroup.add(crestTubeMesh);

  // Top throat fastening button
  const topBtnGeo = new THREE.CylinderGeometry(0.009, 0.008, 0.003, 16);
  topBtnGeo.rotateX(Math.PI / 2);
  const topBtnMesh = new THREE.Mesh(topBtnGeo, mopButtonMat);
  topBtnMesh.position.set(-0.024, collarBaseY + collarH * 0.5, collarR_Z + 0.008);
  collarGroup.add(topBtnMesh);

  // ============================================================================
  // 8. TAILORED FULL-LENGTH SLEEVES WITH NATURAL ELBOW DRAPE
  // ============================================================================
  // Masculine sleeves angling naturally downward and slightly forward,
  // featuring realistic elbow creases and tailored cuffs.
  [-1, 1].forEach((side) => {
    const sleeveCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.65, 1.25, 0.00),    // Shoulder socket
      new THREE.Vector3(side * 0.69, 1.00, 0.02),    // Upper bicep
      new THREE.Vector3(side * 0.66, 0.75, 0.05),    // Elbow bend (slight natural forward pitch)
      new THREE.Vector3(side * 0.60, 0.54, 0.04),    // Forearm
      new THREE.Vector3(side * 0.56, 0.44, 0.03),    // Wrist / cuff head
    ]);

    // Varied cross-sectional radius along the sleeve
    const sleeveGeo = new THREE.TubeGeometry(sleeveCurve, 32, 0.11, 18, false);
    const sleevePositions = sleeveGeo.attributes.position;

    // Taper wrist down, broaden shoulder
    for (let s = 0; s < sleevePositions.count; s++) {
      const sy = sleevePositions.getY(s);
      const factor = (sy - 0.44) / (1.25 - 0.44); // 0 at wrist, 1 at shoulder
      const sx = sleevePositions.getX(s);
      const sz = sleevePositions.getZ(s);
      const centerPt = sleeveCurve.getPointAt(1 - THREE.MathUtils.clamp(factor, 0, 1));

      // Scale radial distance from spline center
      const dx = sx - centerPt.x;
      const dz = sz - centerPt.z;
      const scaleR = THREE.MathUtils.lerp(0.72, 1.05, factor);
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
    // At the wrist (y ~ 0.44), wide formal cuffs with Calado border needlework
    // and matching Mother-of-Pearl cuff buttons.
    const cuffH = 0.08;
    const cuffGeo = new THREE.CylinderGeometry(0.084, 0.080, cuffH, 20, 1, true);
    const cuffMesh = new THREE.Mesh(cuffGeo, caladoPecheraMat);
    cuffMesh.position.set(side * 0.555, 0.44 + cuffH * 0.5, 0.03);
    cuffMesh.rotation.z = side * -0.15;
    cuffsGroup.add(cuffMesh);

    // Gold trim welt on cuff top and bottom edges
    [-1, 1].forEach((edge) => {
      const cuffRingGeo = new THREE.TorusGeometry(0.083, 0.0025, 8, 24);
      const cuffRingMesh = new THREE.Mesh(cuffRingGeo, goldThreadMat);
      cuffRingMesh.rotation.x = Math.PI / 2;
      cuffRingMesh.position.set(side * 0.555, 0.44 + cuffH * 0.5 + edge * (cuffH * 0.5), 0.03);
      cuffRingMesh.rotation.y = side * -0.15;
      cuffsGroup.add(cuffRingMesh);
    });

    // Mother-of-Pearl cuff button
    const cuffBtnGeo = new THREE.CylinderGeometry(0.010, 0.009, 0.003, 16);
    cuffBtnGeo.rotateZ(Math.PI / 2);
    const cuffBtnMesh = new THREE.Mesh(cuffBtnGeo, mopButtonMat);
    cuffBtnMesh.position.set(side * 0.638, 0.48, 0.032);
    cuffsGroup.add(cuffBtnMesh);
  });

  // ============================================================================
  // 10. BACK YOKE SEAM & CENTRAL BOX PLEAT
  // ============================================================================
  // Traditional men's barong back features a clean horizontal yoke seam across
  // the upper shoulder blades and a subtle vertical inverted box pleat down the center.
  const yokeY = 1.16;
  const yokeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.54, yokeY, -0.32),
    new THREE.Vector3(0, yokeY + 0.02, -0.36),
    new THREE.Vector3(0.54, yokeY, -0.32),
  ]);
  const yokeTubeGeo = new THREE.TubeGeometry(yokeCurve, 24, 0.003, 8, false);
  const yokeMesh = new THREE.Mesh(yokeTubeGeo, goldThreadMat);
  backYokeGroup.add(yokeMesh);

  // Central vertical box pleat down the back for ease of movement
  const pleatH = 1.05;
  const pleatGeo = new THREE.BoxGeometry(0.016, pleatH, 0.005);
  const pleatMesh = new THREE.Mesh(pleatGeo, caladoPecheraMat);
  pleatMesh.position.set(0, 0.08 + pleatH * 0.5, -0.345);
  backYokeGroup.add(pleatMesh);

  return root;
}
