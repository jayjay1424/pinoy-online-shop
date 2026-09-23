import * as THREE from 'three';
import { MaterialsFactory } from '../Materials';

export function createBarongBomberModel(
  fabricHex = '#C89D66',
  trimHex = '#9B1B48',
  goldHex = '#D4AF37'
) {
  const root = new THREE.Group();
  root.name = 'PhilippineWovenBarongTunic';

  // 1. Physically Calibrated PBR Materials
  const photoGarmentMat = MaterialsFactory.createMeshyGarmentPhotoMaterial();
  const magentaEmbroideredMat = MaterialsFactory.createMeshyMagentaEmbroideryMaterial();
  const innerLinenMat = MaterialsFactory.createInnerLinenLiningMaterial();
  const frogClosureMat = MaterialsFactory.createGoldenFrogClosureMaterial(goldHex || '#D4AF37');
  const pipingGoldMat = MaterialsFactory.createAntiqueBrassMaterial(goldHex || '#D4AF37');

  // Groups for 3D staging & interactive exploded view
  const torsoGroup = new THREE.Group();
  const liningGroup = new THREE.Group();
  const placketGroup = new THREE.Group();
  const fastenersGroup = new THREE.Group();
  const collarGroup = new THREE.Group();
  const sleevesGroup = new THREE.Group();
  const cuffsGroup = new THREE.Group();

  root.add(liningGroup);
  root.add(torsoGroup);
  root.add(placketGroup);
  root.add(fastenersGroup);
  root.add(collarGroup);
  root.add(sleevesGroup);
  root.add(cuffsGroup);

  // ==========================================================================
  // 2. TAILORED OPEN-FRONT WOVEN PANDAN TUNIC (PHOTOGRAMMETRIC PROJECTION)
  // ==========================================================================
  // Tailored masculine silhouette matching media_1790134471600.png:
  // - Open center front slit (gap between x = -0.038 and +0.038)
  // - Structured tailored shoulders (y = 1.34, width ~0.94)
  // - Sculpted chest projection (y = 0.95, width ~0.88)
  // - Waist suppression (y = 0.68, width ~0.76)
  // - Flared hip drape down to hem (y = 0.02, width ~0.90)
  const numV = 44;
  const numU = 56;
  const tunicHeight = 1.34;
  const openGapHalfW = 0.038;

  const tunicGeo = new THREE.BufferGeometry();
  const tVerts = [];
  const tUvs = [];
  const tIndices = [];

  for (let j = 0; j <= numV; j++) {
    const v = j / numV;
    const y = v * tunicHeight;

    let wRadius; // half-width (X)
    let dRadius; // half-depth (Z)

    if (v < 0.22) {
      // Flared hip drape with side ease
      const t = v / 0.22;
      wRadius = THREE.MathUtils.lerp(0.64, 0.58, t);
      dRadius = THREE.MathUtils.lerp(0.40, 0.36, t);
    } else if (v < 0.55) {
      // Tailored waist suppression
      const t = (v - 0.22) / 0.33;
      wRadius = THREE.MathUtils.lerp(0.58, 0.54, Math.sin(t * Math.PI));
      dRadius = THREE.MathUtils.lerp(0.36, 0.34, Math.sin(t * Math.PI));
    } else if (v < 0.82) {
      // Sculpted chest volume
      const t = (v - 0.55) / 0.27;
      wRadius = THREE.MathUtils.lerp(0.54, 0.63, Math.sin(t * Math.PI * 0.5));
      dRadius = THREE.MathUtils.lerp(0.34, 0.39, Math.sin(t * Math.PI * 0.5));
    } else if (v < 0.94) {
      // Structured sloped shoulders
      const t = (v - 0.82) / 0.12;
      wRadius = THREE.MathUtils.lerp(0.63, 0.69, t);
      dRadius = THREE.MathUtils.lerp(0.39, 0.35, t);
    } else {
      // Neck slope to Mandarin collar base
      const t = (v - 0.94) / 0.06;
      wRadius = THREE.MathUtils.lerp(0.69, 0.29, t);
      dRadius = THREE.MathUtils.lerp(0.35, 0.24, t);
    }

    // Open-front angular sweep:
    // Starts at right front edge, wraps around right flank, back, left flank,
    // and terminates at left front edge.
    const thetaRight = Math.asin(Math.min(0.95, openGapHalfW / wRadius));
    const thetaLeft = Math.PI - thetaRight;
    const totalSweep = Math.PI * 2 - (thetaLeft - thetaRight);

    for (let i = 0; i <= numU; i++) {
      const u = i / numU;
      const angle = thetaRight - u * totalSweep;

      let x = Math.cos(angle) * wRadius;
      let z = Math.sin(angle) * dRadius;

      // Subtle chest projection (+Z) on front panels
      if (z > 0 && v > 0.30 && v < 0.85) {
        z += Math.sin((v - 0.30) / 0.55 * Math.PI) * 0.034 * (z / dRadius);
      }

      // Upper back blade ease (-Z)
      if (z < 0 && v > 0.45 && v < 0.85) {
        z -= Math.sin((v - 0.45) / 0.40 * Math.PI) * 0.024 * (-z / dRadius);
      }

      tVerts.push(x, y + 0.02, z);

      // PHOTOGRAMMETRIC CONFORMAL UV PROJECTION:
      // Front vertices (z >= 0) map directly into the high-resolution photo pixels
      // of meshy_jacket.png!
      // Back vertices (z < 0) map cleanly into the woven herringbone fabric zone.
      let uvU, uvV;
      uvV = THREE.MathUtils.lerp(0.08, 0.88, v);

      if (z >= 0) {
        // Front surface: Conformal horizontal projection matching photo coordinates
        uvU = (x / 1.70) * 0.90 + 0.50;
        // Clamp to valid range
        uvU = THREE.MathUtils.clamp(uvU, 0.02, 0.98);
      } else {
        // Back surface: Sample clear woven herringbone twill
        const backFrac = (Math.cos(angle) + 1.0) * 0.5; // 0 to 1
        uvU = THREE.MathUtils.lerp(0.20, 0.36, backFrac);
      }

      tUvs.push(uvU, uvV);
    }
  }

  for (let j = 0; j < numV; j++) {
    for (let i = 0; i < numU; i++) {
      const p1 = j * (numU + 1) + i;
      const p2 = p1 + 1;
      const p3 = (j + 1) * (numU + 1) + i;
      const p4 = p3 + 1;

      tIndices.push(p1, p3, p2);
      tIndices.push(p2, p3, p4);
    }
  }

  tunicGeo.setAttribute('position', new THREE.Float32BufferAttribute(tVerts, 3));
  tunicGeo.setAttribute('uv', new THREE.Float32BufferAttribute(tUvs, 2));
  tunicGeo.setIndex(tIndices);
  tunicGeo.computeVertexNormals();

  const tunicMesh = new THREE.Mesh(tunicGeo, photoGarmentMat);
  tunicMesh.castShadow = true;
  tunicMesh.receiveShadow = true;
  torsoGroup.add(tunicMesh);

  // Bottom Hem Welt Border (Finished tailored curved hem)
  const hemCurvePoints = [];
  const hemSegs = 36;
  const hemRadiusW = 0.645;
  const hemRadiusD = 0.405;
  const hemThetaRight = Math.asin(openGapHalfW / hemRadiusW);
  const hemThetaLeft = Math.PI - hemThetaRight;
  const hemTotalSweep = Math.PI * 2 - (hemThetaLeft - hemThetaRight);

  for (let k = 0; k <= hemSegs; k++) {
    const frac = k / hemSegs;
    const ang = hemThetaRight - frac * hemTotalSweep;
    hemCurvePoints.push(new THREE.Vector3(
      Math.cos(ang) * hemRadiusW,
      0.024,
      Math.sin(ang) * hemRadiusD
    ));
  }
  const hemCurve = new THREE.CatmullRomCurve3(hemCurvePoints);
  const hemWeltMesh = new THREE.Mesh(
    new THREE.TubeGeometry(hemCurve, 40, 0.009, 8, false),
    pipingGoldMat
  );
  torsoGroup.add(hemWeltMesh);

  // ==========================================================================
  // 3. NATURAL RUSTIC LINEN INTERIOR LINING (VISIBLE THROUGH OPEN FRONT)
  // ==========================================================================
  // Visible inside the open tunic gap and neck opening, recreating the exact
  // interior depth seen in media_1790134471600.png!
  const liningW = 0.72;
  const liningH = 1.28;
  const liningGeo = new THREE.PlaneGeometry(liningW, liningH, 20, 20);
  const lPos = liningGeo.attributes.position;
  for (let i = 0; i < lPos.count; i++) {
    const lx = lPos.getX(i);
    const ly = lPos.getY(i);
    // Concave back-wall contour conforming to interior
    const lz = -0.22 - Math.cos((lx / (liningW / 2)) * (Math.PI / 2)) * 0.08;
    lPos.setZ(i, lz);
  }
  liningGeo.computeVertexNormals();

  const liningMesh = new THREE.Mesh(liningGeo, innerLinenMat);
  liningMesh.position.set(0, 0.68, 0);
  liningMesh.receiveShadow = true;
  liningGroup.add(liningMesh);

  // Inner back atelier leather brand tag with gold monogram
  const tagGeo = new THREE.BoxGeometry(0.12, 0.065, 0.006);
  const tagMat = MaterialsFactory.createVachettaLeatherMaterial('#6E473B');
  const tagMesh = new THREE.Mesh(tagGeo, tagMat);
  tagMesh.position.set(0, 1.18, -0.29);
  liningGroup.add(tagMesh);

  const tagPlaque = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.035, 0.004),
    MaterialsFactory.createFiligreeGoldMaterial('#D4AF37')
  );
  tagPlaque.position.set(0, 1.18, -0.285);
  liningGroup.add(tagPlaque);

  // ==========================================================================
  // 4. RAISED 3D IMPERIAL MAGENTA & GOLD EMBROIDERED PLACKET BORDERS
  // ==========================================================================
  // Dedicated 3D relief strips with crisp contact shadows and gold piping welts!
  const placketW = 0.046;
  const placketH = tunicHeight;
  const placketSegs = 36;

  function createPlacketBorder(isLeft = true) {
    const group = new THREE.Group();
    const geo = new THREE.PlaneGeometry(placketW, placketH, 4, placketSegs);
    const pos = geo.attributes.position;
    const uvs = geo.attributes.uv;

    const uMin = isLeft ? 0.408 : 0.528;
    const uMax = isLeft ? 0.472 : 0.592;
    const vMin = 0.085;
    const vMax = 0.865;

    const xBase = isLeft ? -(openGapHalfW + placketW / 2) : +(openGapHalfW + placketW / 2);

    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i);
      const py = pos.getY(i);
      const vFrac = (py / placketH) + 0.5; // 0 to 1 bottom-to-top
      const uFrac = (px / placketW) + 0.5;

      // Chest contour curvature matching the tunic body with subtle 3D lift
      let zCurv = 0.405;
      if (vFrac > 0.30 && vFrac < 0.85) {
        zCurv += Math.sin((vFrac - 0.30) / 0.55 * Math.PI) * 0.036;
      }
      pos.setZ(i, zCurv);

      // Exact UV mapping into photo's vertical embroidered trim
      uvs.setXY(i, THREE.MathUtils.lerp(uMin, uMax, uFrac), THREE.MathUtils.lerp(vMin, vMax, vFrac));
    }
    geo.computeVertexNormals();

    const mesh = new THREE.Mesh(geo, magentaEmbroideredMat);
    mesh.position.set(xBase, tunicHeight / 2 + 0.02, 0);
    mesh.castShadow = true;
    group.add(mesh);

    // Inner & Outer fine gold piping welts framing the embroidered band
    [-placketW / 2, placketW / 2].forEach(ox => {
      const welt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0035, 0.0035, placketH, 12),
        pipingGoldMat
      );
      welt.position.set(xBase + ox, tunicHeight / 2 + 0.02, 0.428);
      group.add(welt);
    });

    return group;
  }

  const leftPlacket = createPlacketBorder(true);
  const rightPlacket = createPlacketBorder(false);
  placketGroup.add(leftPlacket);
  placketGroup.add(rightPlacket);

  // ==========================================================================
  // 5. 10 PAIRS OF 3D BRAIDED FROG FASTENERS & GOLD KNOT TOGGLES
  // ==========================================================================
  // Matching the 10 button closures seen along the front opening!
  const fastenerYCoords = [
    0.16, 0.27, 0.38, 0.49, 0.60, 0.71, 0.82, 0.93, 1.04, 1.15, 1.25
  ];

  fastenerYCoords.forEach(fy => {
    // Right Placket: Braided loop extending inward + Gold knot toggle button
    const rightLoopCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(+openGapHalfW + 0.002, fy, 0.430),
      new THREE.Vector3(+openGapHalfW - 0.012, fy + 0.008, 0.433),
      new THREE.Vector3(+openGapHalfW - 0.016, fy, 0.435),
      new THREE.Vector3(+openGapHalfW - 0.012, fy - 0.008, 0.433),
      new THREE.Vector3(+openGapHalfW + 0.002, fy, 0.430),
    ]);
    const rightLoop = new THREE.Mesh(
      new THREE.TubeGeometry(rightLoopCurve, 16, 0.0025, 8, true),
      pipingGoldMat
    );
    fastenersGroup.add(rightLoop);

    // Cast 18K Gold spherical knot toggle button
    const toggleBtn = new THREE.Mesh(
      new THREE.SphereGeometry(0.009, 16, 16),
      frogClosureMat
    );
    toggleBtn.scale.set(1.0, 1.1, 0.9);
    toggleBtn.position.set(+openGapHalfW - 0.016, fy, 0.438);
    toggleBtn.castShadow = true;
    fastenersGroup.add(toggleBtn);

    // Left Placket: Matching receiving loop
    const leftLoopCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-openGapHalfW - 0.002, fy, 0.430),
      new THREE.Vector3(-openGapHalfW + 0.010, fy + 0.008, 0.433),
      new THREE.Vector3(-openGapHalfW + 0.014, fy, 0.435),
      new THREE.Vector3(-openGapHalfW + 0.010, fy - 0.008, 0.433),
      new THREE.Vector3(-openGapHalfW - 0.002, fy, 0.430),
    ]);
    const leftLoop = new THREE.Mesh(
      new THREE.TubeGeometry(leftLoopCurve, 16, 0.0025, 8, true),
      pipingGoldMat
    );
    fastenersGroup.add(leftLoop);

    // Fine decorative frog soutache horizontal bar tacks on both plackets
    [-1, 1].forEach(side => {
      const soutache = new THREE.Mesh(
        new THREE.CylinderGeometry(0.002, 0.002, 0.024, 8),
        pipingGoldMat
      );
      soutache.rotation.z = Math.PI / 2;
      soutache.position.set(side * (openGapHalfW + 0.018), fy, 0.432);
      fastenersGroup.add(soutache);
    });
  });

  // ==========================================================================
  // 6. ARCHITECTURAL MANDARIN / BAND STAND COLLAR
  // ==========================================================================
  // Upright standing collar (~4cm high) with open throat gap and matching
  // outer magenta & gold embroidered band plus inner lining!
  const collarR = 0.28;
  const collarH = 0.11;
  const collarSegs = 32;

  // Outer collar embroidered band
  const collarThetaRight = Math.asin(openGapHalfW / collarR);
  const collarThetaLeft = Math.PI - collarThetaRight;
  const collarSweep = Math.PI * 2 - (collarThetaLeft - collarThetaRight);

  const collarGeo = new THREE.CylinderGeometry(
    collarR,
    collarR + 0.015,
    collarH,
    collarSegs,
    1,
    true,
    collarThetaRight - collarSweep,
    collarSweep
  );
  collarGeo.scale(1.0, 1.0, 0.88);

  // Map UVs of collar to top magenta border from photo
  const cUvs = collarGeo.attributes.uv;
  for (let k = 0; k < cUvs.count; k++) {
    const cu = cUvs.getX(k);
    const cv = cUvs.getY(k);
    cUvs.setXY(
      k,
      THREE.MathUtils.lerp(0.398, 0.602, cu),
      THREE.MathUtils.lerp(0.865, 0.950, cv)
    );
  }
  collarGeo.computeVertexNormals();

  const collarMesh = new THREE.Mesh(collarGeo, magentaEmbroideredMat);
  collarMesh.position.set(0, tunicHeight + collarH / 2 + 0.015, 0);
  collarMesh.castShadow = true;
  collarGroup.add(collarMesh);

  // Inner collar lining band (Natural unbleached linen)
  const innerCollarMesh = new THREE.Mesh(collarGeo.clone(), innerLinenMat);
  innerCollarMesh.scale.set(0.97, 1.0, 0.97);
  innerCollarMesh.position.copy(collarMesh.position);
  collarGroup.add(innerCollarMesh);

  // Gold piping rim along collar top edge
  const collarRimCurvePts = [];
  for (let k = 0; k <= collarSegs; k++) {
    const frac = k / collarSegs;
    const a = (collarThetaRight - collarSweep) + frac * collarSweep;
    collarRimCurvePts.push(new THREE.Vector3(
      Math.cos(a) * collarR,
      collarH / 2,
      Math.sin(a) * collarR * 0.88
    ));
  }
  const collarRimMesh = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(collarRimCurvePts), 36, 0.004, 8, false),
    pipingGoldMat
  );
  collarRimMesh.position.copy(collarMesh.position);
  collarGroup.add(collarRimMesh);

  // ==========================================================================
  // 7. TAILORED SLEEVES & IMPERIAL MAGENTA EMBROIDERED CUFFS
  // ==========================================================================
  // Natural arm drape hanging gracefully downward with photorealistic texture
  function createWovenSleeve(side = 1) {
    const group = new THREE.Group();

    // Natural posture curve
    const curvePoints = [
      new THREE.Vector3(side * 0.68, 1.25, 0.02),
      new THREE.Vector3(side * 0.84, 0.95, 0.04),
      new THREE.Vector3(side * 0.90, 0.58, 0.07), // natural elbow ease
      new THREE.Vector3(side * 0.84, 0.20, 0.10), // wrist terminal
    ];
    const curve = new THREE.CatmullRomCurve3(curvePoints);

    const sleeveSegs = 36;
    const sleeveCirc = 26;
    const sVerts = [];
    const sUvs = [];
    const sIndices = [];

    for (let j = 0; j <= sleeveSegs; j++) {
      const t = j / sleeveSegs;
      const center = curve.getPoint(t);
      const tangent = curve.getTangent(t);

      // Tailored sleeve taper from shoulder to wrist
      let radius;
      if (t < 0.25) {
        radius = THREE.MathUtils.lerp(0.22, 0.19, t / 0.25);
      } else if (t < 0.70) {
        radius = THREE.MathUtils.lerp(0.19, 0.165, (t - 0.25) / 0.45);
      } else {
        radius = THREE.MathUtils.lerp(0.165, 0.145, (t - 0.70) / 0.30);
      }

      const normal = new THREE.Vector3(0, 1, 0).cross(tangent).normalize();
      const binormal = tangent.clone().cross(normal).normalize();

      for (let i = 0; i <= sleeveCirc; i++) {
        const u = i / sleeveCirc;
        const ang = u * Math.PI * 2;
        const cosA = Math.cos(ang);
        const sinA = Math.sin(ang);

        const pt = center.clone()
          .addScaledVector(normal, cosA * radius * 1.04)
          .addScaledVector(binormal, sinA * radius * 0.96);

        sVerts.push(pt.x, pt.y, pt.z);

        // Conformal sleeve mapping into clean woven pandan herringbone
        const sUvU = side === 1 ? THREE.MathUtils.lerp(0.72, 0.92, u) : THREE.MathUtils.lerp(0.08, 0.28, u);
        const sUvV = THREE.MathUtils.lerp(0.22, 0.82, 1.0 - t);
        sUvs.push(sUvU, sUvV);
      }
    }

    for (let j = 0; j < sleeveSegs; j++) {
      for (let i = 0; i < sleeveCirc; i++) {
        const p1 = j * (sleeveCirc + 1) + i;
        const p2 = p1 + 1;
        const p3 = (j + 1) * (sleeveCirc + 1) + i;
        const p4 = p3 + 1;

        if (side === 1) {
          sIndices.push(p1, p2, p3);
          sIndices.push(p2, p4, p3);
        } else {
          sIndices.push(p1, p3, p2);
          sIndices.push(p2, p3, p4);
        }
      }
    }

    const sleeveGeo = new THREE.BufferGeometry();
    sleeveGeo.setAttribute('position', new THREE.Float32BufferAttribute(sVerts, 3));
    sleeveGeo.setAttribute('uv', new THREE.Float32BufferAttribute(sUvs, 2));
    sleeveGeo.setIndex(sIndices);
    sleeveGeo.computeVertexNormals();

    const sleeveMesh = new THREE.Mesh(sleeveGeo, photoGarmentMat);
    sleeveMesh.castShadow = true;
    sleeveMesh.receiveShadow = true;
    group.add(sleeveMesh);

    // Tailored Cuff Ringed with Imperial Magenta & Gold Embroidered Band
    // Left Cuff UV:  u in [0.055, 0.188], v in [0.138, 0.238]
    // Right Cuff UV: u in [0.812, 0.945], v in [0.138, 0.238]
    const cuffHeight = 0.12;
    const cuffGeo = new THREE.CylinderGeometry(0.150, 0.146, cuffHeight, 28);
    const cuffUvs = cuffGeo.attributes.uv;
    const cUmin = side === -1 ? 0.055 : 0.812;
    const cUmax = side === -1 ? 0.188 : 0.945;

    for (let k = 0; k < cuffUvs.count; k++) {
      const uFrac = cuffUvs.getX(k);
      const vFrac = cuffUvs.getY(k);
      cuffUvs.setXY(
        k,
        THREE.MathUtils.lerp(cUmin, cUmax, uFrac),
        THREE.MathUtils.lerp(0.138, 0.238, vFrac)
      );
    }
    cuffGeo.computeVertexNormals();

    const cuffMesh = new THREE.Mesh(cuffGeo, magentaEmbroideredMat);
    cuffMesh.position.set(side * 0.84, 0.14, 0.10);
    cuffMesh.rotation.z = side * -0.22;
    cuffMesh.rotation.x = 0.12;
    cuffMesh.castShadow = true;
    cuffsGroup.add(cuffMesh);

    // Fine gold welt piping along cuff top and bottom
    [-cuffHeight / 2, cuffHeight / 2].forEach(cy => {
      const cuffRim = new THREE.Mesh(
        new THREE.TorusGeometry(0.150, 0.0035, 8, 28),
        pipingGoldMat
      );
      cuffRim.position.copy(cuffMesh.position);
      cuffRim.position.y += cy;
      cuffRim.rotation.copy(cuffMesh.rotation);
      cuffsGroup.add(cuffRim);
    });

    return group;
  }

  sleevesGroup.add(createWovenSleeve(1));
  sleevesGroup.add(createWovenSleeve(-1));

  // ==========================================================================
  // 8. BACK YOKE & SEAM DETAILS
  // ==========================================================================
  const yokeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.60, 1.18, -0.25),
    new THREE.Vector3(0, 1.21, -0.31),
    new THREE.Vector3(0.60, 1.18, -0.25),
  ]);
  const yokeSeam = new THREE.Mesh(
    new THREE.TubeGeometry(yokeCurve, 24, 0.005, 6, false),
    pipingGoldMat
  );
  torsoGroup.add(yokeSeam);

  // Inverted center back pleat
  const pleatGeo = new THREE.BoxGeometry(0.012, 0.65, 0.008);
  const pleatMesh = new THREE.Mesh(pleatGeo, pipingGoldMat);
  pleatMesh.position.set(0, 0.82, -0.315);
  torsoGroup.add(pleatMesh);

  // ==========================================================================
  // 9. INTERACTIVE EXPLODED VIEW & MATERIALS API
  // ==========================================================================
  function setExploded(t) {
    placketGroup.position.z = t * 0.35;
    fastenersGroup.position.z = t * 0.42;
    collarGroup.position.y = t * 0.16;
    cuffsGroup.position.x = t * 0.22;
    sleevesGroup.position.x = t * 0.26;
    liningGroup.position.z = -t * 0.20;
    torsoGroup.position.y = -t * 0.04;
  }

  function updateMaterials(newFabricHex, newTrimHex, newGoldHex) {
    if (newFabricHex) photoGarmentMat.color.set(newFabricHex);
    if (newTrimHex) magentaEmbroideredMat.color.set(newTrimHex);
    if (newGoldHex) {
      frogClosureMat.color.set(newGoldHex);
      pipingGoldMat.color.set(newGoldHex);
    }
  }

  root.setExploded = setExploded;
  root.updateMaterials = updateMaterials;

  return root;
}
