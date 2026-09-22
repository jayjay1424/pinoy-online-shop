import * as THREE from 'three';
import { MaterialsFactory } from '../Materials';

export function createLuminaryModel(capizHex = '#FFFDF8', brassHex = '#C4975D') {
  const root = new THREE.Group();
  root.name = 'CapizLuminary';

  const capizMat = MaterialsFactory.createCapizShellMaterial(capizHex);
  const brassMat = MaterialsFactory.createAntiqueBrassMaterial(brassHex);
  const woodMat = MaterialsFactory.createKamagongWoodMaterial();

  const pedestalGroup = new THREE.Group();
  const lanternGroup = new THREE.Group();
  const lightGroup = new THREE.Group();

  root.add(pedestalGroup);
  root.add(lanternGroup);
  root.add(lightGroup);

  // 1. Turned Kamagong Wood Base
  const baseGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.15, 32);
  const baseMesh = new THREE.Mesh(baseGeo, woodMat);
  baseMesh.position.y = 0.075;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  pedestalGroup.add(baseMesh);

  // 2. Brass Collar
  const collarGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.08, 32);
  const collarMesh = new THREE.Mesh(collarGeo, brassMat);
  collarMesh.position.y = 0.18;
  collarMesh.castShadow = true;
  pedestalGroup.add(collarMesh);

  // 3. Faceted Capiz Shell Lantern Body (Icosahedron / Dodecahedron faceted geometric look)
  const lanternGeo = new THREE.DodecahedronGeometry(0.75, 1);
  lanternGeo.scale(0.9, 1.3, 0.9);
  const lanternMesh = new THREE.Mesh(lanternGeo, capizMat);
  lanternMesh.position.y = 1.05;
  lanternMesh.castShadow = true;
  lanternMesh.receiveShadow = true;
  lanternGroup.add(lanternMesh);

  // Wireframe Brass Ribs (Faceted edges)
  const wireGeo = new THREE.WireframeGeometry(lanternGeo);
  const wireMat = new THREE.LineBasicMaterial({ color: new THREE.Color(brassHex), linewidth: 2 });
  const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
  wireMesh.position.copy(lanternMesh.position);
  lanternGroup.add(wireMesh);

  // 4. Internal Glowing Point Light
  const pointLight = new THREE.PointLight(0xFDB863, 1.8, 4.0, 1.5);
  pointLight.position.y = 1.05;
  lightGroup.add(pointLight);

  // Soft internal bulb core
  const bulbMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xFFF3D6 })
  );
  bulbMesh.position.y = 1.05;
  lightGroup.add(bulbMesh);

  let isLightOn = true;
  function toggleLight(on) {
    if (typeof on === 'boolean') {
      isLightOn = on;
    } else {
      isLightOn = !isLightOn;
    }
    pointLight.intensity = isLightOn ? 1.8 : 0;
    bulbMesh.visible = isLightOn;
    capizMat.roughness = isLightOn ? 0.25 : 0.45;
    return isLightOn;
  }

  // Exploded View API
  function setExploded(t) {
    lanternGroup.position.y = t * 0.4;
    pedestalGroup.position.y = -t * 0.2;
    lightGroup.position.y = t * 0.2;
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

