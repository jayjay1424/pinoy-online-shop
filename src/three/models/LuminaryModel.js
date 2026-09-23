import * as THREE from 'three';
import { MaterialsFactory } from '../Materials';

export function createLuminaryModel(capizHex = '#FFFDF8', brassHex = '#C4975D') {
  const root = new THREE.Group();
  root.name = 'CapizLuminary';

  const capizMat = MaterialsFactory.createCapizShellMaterial(capizHex);
  const brassMat = MaterialsFactory.createAntiqueBrassMaterial(brassHex);
  const woodMat = MaterialsFactory.createKamagongWoodMaterial('#24140E');

  const pedestalGroup = new THREE.Group();
  const lanternGroup = new THREE.Group();
  const lightGroup = new THREE.Group();

  root.add(pedestalGroup);
  root.add(lanternGroup);
  root.add(lightGroup);

  // 1. Turned Native Kamagong Ebony Wood Pedestal Base
  const baseGeo = new THREE.CylinderGeometry(0.56, 0.68, 0.16, 36);
  const baseMesh = new THREE.Mesh(baseGeo, woodMat);
  baseMesh.position.y = 0.08;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  pedestalGroup.add(baseMesh);

  // Stepped brass accent collar ring
  const collarGeo = new THREE.CylinderGeometry(0.36, 0.46, 0.09, 36);
  const collarMesh = new THREE.Mesh(collarGeo, brassMat);
  collarMesh.position.y = 0.19;
  collarMesh.castShadow = true;
  pedestalGroup.add(collarMesh);

  // 2. Faceted Natural Capiz Shell Lantern Body
  const lanternGeo = new THREE.DodecahedronGeometry(0.78, 1);
  lanternGeo.scale(0.92, 1.34, 0.92);
  const lanternMesh = new THREE.Mesh(lanternGeo, capizMat);
  lanternMesh.position.y = 1.08;
  lanternMesh.castShadow = true;
  lanternMesh.receiveShadow = true;
  lanternGroup.add(lanternMesh);

  // Soldered Brass Came Framing Ribbons (Facets edges)
  const wireGeo = new THREE.WireframeGeometry(lanternGeo);
  const wireMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(brassHex),
    linewidth: 2,
    transparent: true,
    opacity: 0.85,
  });
  const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
  wireMesh.position.copy(lanternMesh.position);
  lanternGroup.add(wireMesh);

  // Solid Brass Solder Nodes at Key Vertices
  const solderGeo = new THREE.SphereGeometry(0.024, 10, 10);
  const lanternPos = lanternGeo.attributes.position;
  // Place nodes on a subset of unique vertices
  for (let i = 0; i < lanternPos.count; i += 6) {
    const vx = lanternPos.getX(i);
    const vy = lanternPos.getY(i) + 1.08;
    const vz = lanternPos.getZ(i);
    const node = new THREE.Mesh(solderGeo, brassMat);
    node.position.set(vx, vy, vz);
    lanternGroup.add(node);
  }

  // 3. Internal Warm 2400K Glowing Point Light & Emissive Bulb Core
  const pointLight = new THREE.PointLight(0xFFA834, 2.2, 5.0, 1.4);
  pointLight.position.y = 1.08;
  lightGroup.add(pointLight);

  // Soft internal bulb core with intense glowing filament
  const bulbMat = new THREE.MeshBasicMaterial({
    color: 0xFFF2D1,
  });
  const bulbMesh = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 20), bulbMat);
  bulbMesh.position.y = 1.08;
  lightGroup.add(bulbMesh);

  // Gentle ambient glow aura inside lantern
  const auraMat = new THREE.MeshBasicMaterial({
    color: 0xFFA834,
    transparent: true,
    opacity: 0.18,
    side: THREE.BackSide,
  });
  const auraMesh = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), auraMat);
  auraMesh.position.y = 1.08;
  lightGroup.add(auraMesh);

  let isLightOn = true;
  function toggleLight(on) {
    if (typeof on === 'boolean') {
      isLightOn = on;
    } else {
      isLightOn = !isLightOn;
    }
    pointLight.intensity = isLightOn ? 2.2 : 0;
    bulbMesh.visible = isLightOn;
    auraMesh.visible = isLightOn;
    capizMat.roughness = isLightOn ? 0.16 : 0.42;
    capizMat.transmission = isLightOn ? 0.72 : 0.50;
    return isLightOn;
  }

  // Exploded View API
  function setExploded(t) {
    lanternGroup.position.y = t * 0.42;
    pedestalGroup.position.y = -t * 0.22;
    lightGroup.position.y = t * 0.22;
  }

  function updateMaterials(newCapizHex, newBrassHex) {
    if (newCapizHex) capizMat.color.set(newCapizHex);
    if (newBrassHex) {
      brassMat.color.set(newBrassHex);
      wireMat.color.set(newBrassHex);
    }
  }

  root.setExploded = setExploded;
  root.updateMaterials = updateMaterials;
  root.toggleLight = toggleLight;

  return root;
}
