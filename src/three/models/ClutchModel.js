import * as THREE from 'three';
import { MaterialsFactory } from '../Materials';

export function createClutchModel(weaveHex = '#2B211E', frameHex = '#C4975D') {
  const root = new THREE.Group();
  root.name = 'TnalakClutch';

  const weaveMat = MaterialsFactory.createTnalakWeaveMaterial(weaveHex);
  const frameMat = MaterialsFactory.createAntiqueBrassMaterial(frameHex);
  const pearlClaspMat = MaterialsFactory.createPalawanPearlMaterial('#FFFDF8');
  const innerGoldMat = new THREE.MeshStandardMaterial({
    color: 0xD4AF37,
    roughness: 0.32,
    metalness: 0.85,
  });

  const bodyFrontGroup = new THREE.Group();
  const bodyBackGroup = new THREE.Group();
  const frameGroup = new THREE.Group();
  const claspGroup = new THREE.Group();

  root.add(bodyFrontGroup);
  root.add(bodyBackGroup);
  root.add(frameGroup);
  root.add(claspGroup);

  const halfWidth = 0.69;  // total width = 1.38
  const halfHeight = 0.44; // total height = 0.88
  const shellDepth = 0.11;
  const cornerExponent = 3.6; // Rounded luxury superellipse corners

  function superellipsePerimeter(u, w, h) {
    const theta = u * Math.PI * 2;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const sx = cosT >= 0 ? 1 : -1;
    const sy = sinT >= 0 ? 1 : -1;
    const x = w * sx * Math.pow(Math.abs(cosT), 2 / cornerExponent);
    const y = h * sy * Math.pow(Math.abs(sinT), 2 / cornerExponent);
    return { x, y };
  }

  // ==========================================================================
  // 1. SCULPTED ROUNDED-CORNER MINAUDIÈRE SHELLS (PILLOWED T'NALAK ABACA)
  // ==========================================================================
  function createMinaudiereShell(isFront = true) {
    const numRings = 16;
    const numRadial = 48;
    const verts = [];
    const uvs = [];
    const indices = [];
    const zSign = isFront ? 1 : -1;

    for (let r = 0; r <= numRings; r++) {
      const frac = r / numRings; // 0 at center, 1 at perimeter rim
      const curW = halfWidth * frac;
      const curH = halfHeight * frac;

      // Organic domed pillow bulge: highest at center (frac = 0), zero at rim (frac = 1)
      const domeZ = Math.cos(frac * Math.PI * 0.5) * shellDepth * zSign;

      for (let s = 0; s <= numRadial; s++) {
        const u = s / numRadial;
        const pt = superellipsePerimeter(u, curW, curH);

        verts.push(pt.x, pt.y + halfHeight + 0.12, domeZ);
        uvs.push(pt.x / halfWidth * 0.5 + 0.5, pt.y / halfHeight * 0.5 + 0.5);
      }
    }

    for (let r = 0; r < numRings; r++) {
      for (let s = 0; s < numRadial; s++) {
        const p1 = r * (numRadial + 1) + s;
        const p2 = p1 + 1;
        const p3 = (r + 1) * (numRadial + 1) + s;
        const p4 = p3 + 1;

        if (isFront) {
          indices.push(p1, p2, p3);
          indices.push(p2, p4, p3);
        } else {
          indices.push(p1, p3, p2);
          indices.push(p2, p3, p4);
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const mesh = new THREE.Mesh(geo, weaveMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  const frontMesh = createMinaudiereShell(true);
  bodyFrontGroup.add(frontMesh);

  const backMesh = createMinaudiereShell(false);
  bodyBackGroup.add(backMesh);

  // Interior Gilded Lining (Visible when exploded)
  const innerShell = createMinaudiereShell(true);
  innerShell.material = innerGoldMat;
  innerShell.scale.set(0.96, 0.96, 0.90);
  frameGroup.add(innerShell);

  // ==========================================================================
  // 2. ARCHITECTURAL ROUNDED BRASS RIM BEZEL & BARREL HINGES
  // ==========================================================================
  const rimPoints = [];
  const rimSteps = 64;
  for (let s = 0; s <= rimSteps; s++) {
    const u = s / rimSteps;
    const pt = superellipsePerimeter(u, halfWidth + 0.012, halfHeight + 0.012);
    rimPoints.push(new THREE.Vector3(pt.x, pt.y + halfHeight + 0.12, 0));
  }
  const rimCurve = new THREE.CatmullRomCurve3(rimPoints, true);

  const frameGeo = new THREE.TubeGeometry(rimCurve, 64, 0.022, 12, true);
  const frameMesh = new THREE.Mesh(frameGeo, frameMat);
  frameMesh.castShadow = true;
  frameGroup.add(frameMesh);

  // Bottom Mechanical Barrel Hinges (Left & Right)
  [-halfWidth * 0.55, halfWidth * 0.55].forEach(x => {
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.09, 16), frameMat);
    hinge.rotation.z = Math.PI / 2;
    hinge.position.set(x, 0.10, 0);
    hinge.castShadow = true;
    frameGroup.add(hinge);
  });

  // ==========================================================================
  // 3. TOP ARTISAN MOTHER-OF-PEARL CLASP ASSEMBLY
  // ==========================================================================
  const claspY = halfHeight * 2 + 0.13;

  // Solid brass push-lock stepped base
  const claspBase = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.065, 0.12), frameMat);
  claspBase.position.set(0, claspY + 0.03, 0);
  claspBase.castShadow = true;
  claspGroup.add(claspBase);

  // Hand-carved organic iridescent Mother-of-Pearl cabochon gemstone
  const claspGemGeo = new THREE.SphereGeometry(0.095, 36, 36);
  claspGemGeo.scale(1.55, 0.75, 1.05);
  const claspGem = new THREE.Mesh(claspGemGeo, pearlClaspMat);
  claspGem.position.set(0, claspY + 0.085, 0);
  claspGem.castShadow = true;
  claspGroup.add(claspGem);

  // 4 Solid brass prongs securing the mother-of-pearl cabochon
  [[-0.10, 0.05], [0.10, 0.05], [-0.10, -0.05], [0.10, -0.05]].forEach(([px, pz]) => {
    const prong = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.08, 10), frameMat);
    prong.position.set(px, claspY + 0.07, pz);
    prong.castShadow = true;
    claspGroup.add(prong);
  });

  // Exploded View API
  function setExploded(t) {
    bodyFrontGroup.position.z = t * 0.30;
    bodyBackGroup.position.z = -t * 0.30;
    claspGroup.position.y = t * 0.34;
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
