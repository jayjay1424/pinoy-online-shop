import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CameraRig } from './CameraRig';
import { createBayongModel } from './models/BayongModel';
import { createPearlModel } from './models/PearlModel';
import { createClutchModel } from './models/ClutchModel';
import { createLuminaryModel } from './models/LuminaryModel';
import { createBarongBomberModel } from './models/BarongBomberModel';
import { createBarongMenModel } from './models/BarongMenModel';
import { createSolihiyaBoxModel } from './models/SolihiyaBoxModel';
import { createOkirCuffModel } from './models/OkirCuffModel';
import {
  createTernoCapeletModel,
  createMandirigmaWatchModel,
  createButuanRingModel,
  createSalakotModel,
  createBurnayDecanterModel,
  createCreollaEarringsModel,
  createChronoVaultModel
} from './models/AdditionalHeritageModels';
import { sound } from '../utils/sound';
import gsap from 'gsap';

// Multi-tier Soft Warm Contact Shadow with Ambient Occlusion Core
function createWarmContactShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(256, 256, 10, 256, 256, 240);
  grad.addColorStop(0, 'rgba(24, 14, 8, 0.68)');   // Deep ambient occlusion anchor
  grad.addColorStop(0.2, 'rgba(48, 28, 16, 0.42)');
  grad.addColorStop(0.5, 'rgba(92, 58, 33, 0.20)');
  grad.addColorStop(0.78, 'rgba(180, 125, 75, 0.06)');
  grad.addColorStop(1, 'rgba(250, 248, 245, 0)');  // Clean falloff into studio floor

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth || window.innerWidth;
    this.height = container.clientHeight || 500;

    // 1. Scene & Photorealistic Renderer Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#FAF8F5'); // Warm Alabaster Atelier Floor

    this.camera = new THREE.PerspectiveCamera(36, this.width / this.height, 0.1, 50);
    this.camera.position.set(0, 1.2, 3.2);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ACESFilmic Tone Mapping with calibrated dynamic range
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;

    // High-Resolution PCF Soft Shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // 2. High-Fidelity Studio Environment Map (IBL for realistic reflections)
    this.setupEnvironment();

    // 3. Camera Rig
    let lastRustleTime = 0;
    this.cameraRig = new CameraRig(this.camera, this.renderer.domElement, () => {
      const now = performance.now();
      if (now - lastRustleTime > 160) {
        sound.playRustle();
        lastRustleTime = now;
      }
    });

    // 4. 4-Point Calibrated Atelier Studio Lighting Rig
    this.setupLighting();

    // 5. Contact Shadow Pedestal
    this.setupShadowPedestal();

    // 6. Active Model Holder & GLTF Loader
    this.activeModel = null;
    this.activeModelType = null;
    this.isCustomModel = false;
    this.gltfLoader = new GLTFLoader();

    // 7. Double-Click Raycast Part Focus
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.onDoubleClick = this.onDoubleClick.bind(this);
    this.renderer.domElement.addEventListener('dblclick', this.onDoubleClick);

    // 8. Animation Loop & Resize
    this.isDisposed = false;
    this.animate = this.animate.bind(this);
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);

    this.animate();
  }

  // Generates real-time PBR environment reflections (softboxes & studio bounce)
  setupEnvironment() {
    try {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      pmremGenerator.compileEquirectangularShader();
      const roomEnv = new RoomEnvironment();
      this.envMap = pmremGenerator.fromScene(roomEnv, 0.04).texture;
      this.scene.environment = this.envMap;
      if ('environmentIntensity' in this.scene) {
        this.scene.environmentIntensity = 0.85;
      }
      roomEnv.dispose();
      pmremGenerator.dispose();
    } catch (err) {
      console.warn('Environment map initialization fallback:', err);
    }
  }

  setupLighting() {
    // Warm Atelier Ambient Light
    this.ambientLight = new THREE.AmbientLight(0xFFF9F2, 0.75);
    this.scene.add(this.ambientLight);

    // Warm Key Light (Natural 3200K Studio Softbox) with razor-sharp contact shadows
    this.keyLight = new THREE.DirectionalLight(0xFFF5E8, 1.85);
    this.keyLight.position.set(3.5, 4.8, 3.2);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.left = -2.2;
    this.keyLight.shadow.camera.right = 2.2;
    this.keyLight.shadow.camera.top = 2.4;
    this.keyLight.shadow.camera.bottom = -2.0;
    this.keyLight.shadow.camera.near = 0.1;
    this.keyLight.shadow.camera.far = 15;
    this.keyLight.shadow.bias = -0.0003;
    this.keyLight.shadow.normalBias = 0.02; // Eliminates shadow acne on curved woven geometries
    this.scene.add(this.keyLight);

    // Cool Sky Rim Light (Edge separation & sheer fabric backlighting)
    this.rimLight = new THREE.DirectionalLight(0xDEE9F7, 0.95);
    this.rimLight.position.set(-3.6, 3.2, -2.8);
    this.scene.add(this.rimLight);

    // Warm Floor Bounce Light (Simulates warm marble/wood reflection under the item)
    this.bounceLight = new THREE.DirectionalLight(0xFBF4E8, 0.55);
    this.bounceLight.position.set(0, -2.5, 2.5);
    this.scene.add(this.bounceLight);

    // Pinpoint Specular Spotlight (Crisp caustics on gold, brass, pearl nacre & jade)
    this.spotLight = new THREE.SpotLight(0xFFFFFF, 1.5, 12, Math.PI / 5, 0.25, 1.2);
    this.spotLight.position.set(0.4, 4.2, 2.8);
    this.scene.add(this.spotLight);
  }

  setupShadowPedestal() {
    const shadowGeo = new THREE.PlaneGeometry(4.0, 4.0);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: createWarmContactShadowTexture(),
      transparent: true,
      depthWrite: false,
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = 0.002;
    this.scene.add(this.shadowMesh);
  }

  // Load or Swap Product Model (Supports all Philippine masterworks in the catalog)
  loadModel(modelType, materialOptions = {}) {
    if (this.activeModel) {
      const oldModel = this.activeModel;
      gsap.to(oldModel.scale, {
        x: 0.001,
        y: 0.001,
        z: 0.001,
        duration: 0.22,
        ease: 'power2.in',
        onComplete: () => {
          this.scene.remove(oldModel);
        }
      });
    }

    let newModel = null;
    if (modelType === 'bayong') {
      newModel = createBayongModel(
        materialOptions.leafHex,
        materialOptions.leatherHex,
        materialOptions.brassHex,
        materialOptions.monogramText || 'JR'
      );
    } else if (modelType === 'pearl') {
      newModel = createPearlModel(materialOptions.metalHex, materialOptions.pearlTint);
    } else if (modelType === 'clutch' || modelType === 'stole') {
      newModel = createClutchModel(materialOptions.weaveHex || materialOptions.hex, materialOptions.frameHex);
    } else if (modelType === 'luminary') {
      newModel = createLuminaryModel(materialOptions.capizHex, materialOptions.brassHex);
    } else if (
      modelType === 'barong-men' ||
      modelType === 'barong_men' ||
      modelType === 'ilustrado' ||
      modelType === 'barong' ||
      modelType === 'dalisay'
    ) {
      newModel = createBarongMenModel(
        materialOptions.fabricHex || materialOptions.hex,
        materialOptions.embroideryHex || materialOptions.trimHex,
        materialOptions.buttonHex || materialOptions.goldHex
      );
    } else if (modelType === 'solihiya') {
      newModel = createSolihiyaBoxModel(materialOptions.woodHex, materialOptions.caneHex, materialOptions.brassHex);
    } else if (modelType === 'cuff') {
      newModel = createOkirCuffModel(materialOptions.brassHex, materialOptions.jadeHex);
    } else if (modelType === 'terno' || modelType === 'trench' || modelType === 'robe') {
      newModel = createTernoCapeletModel(materialOptions.hex || materialOptions.fabricHex);
    } else if (modelType === 'watch') {
      newModel = createMandirigmaWatchModel(materialOptions.hex, materialOptions.steelHex);
    } else if (modelType === 'ring') {
      newModel = createButuanRingModel(materialOptions.hex);
    } else if (modelType === 'salakot') {
      newModel = createSalakotModel(materialOptions.hex, materialOptions.silverHex);
    } else if (modelType === 'burnay') {
      newModel = createBurnayDecanterModel(materialOptions.hex, materialOptions.brassHex);
    } else if (modelType === 'creolla') {
      newModel = createCreollaEarringsModel(materialOptions.hex);
    } else if (modelType === 'vault') {
      newModel = createChronoVaultModel(materialOptions.hex, materialOptions.hornHex);
    }

    if (!newModel) return;

    this.activeModel = newModel;
    this.activeModelType = modelType;
    this.isCustomModel = false;

    newModel.scale.set(0.01, 0.01, 0.01);
    this.scene.add(newModel);

    gsap.to(newModel.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.45,
      ease: 'power2.out',
    });
  }

  // Load external 3D Model (.glb / .gltf, such as exports from Meshy.ai or Blender)
  loadGLTFModel(source, onLoaded, onProgress, onError) {
    const handleGLTFScene = (gltfScene) => {
      if (this.activeModel) {
        this.scene.remove(this.activeModel);
      }

      gltfScene.updateMatrixWorld(true);

      // Compute bounding box to normalize scale and place precisely on the atelier pedestal
      const bbox = new THREE.Box3().setFromObject(gltfScene);
      const size = new THREE.Vector3();
      bbox.getSize(size);
      const center = new THREE.Vector3();
      bbox.getCenter(center);

      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const targetScale = 1.6 / maxDim;

      const container = new THREE.Group();
      container.name = 'CustomGLTFContainer';

      // Center model and sit flush on floor
      gltfScene.position.x = -center.x;
      gltfScene.position.y = -bbox.min.y; // Sit directly on studio contact shadow pedestal
      gltfScene.position.z = -center.z;

      container.add(gltfScene);
      container.position.y = 0.005;

      // Enable PCF Soft Shadows, DoubleSide rendering, and PBR material setup
      container.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.side = THREE.DoubleSide; // Critical for woven cloth/garment geometries
            child.material.needsUpdate = true;
          }
        }
      });

      // Dummy methods for UI controls
      container.updateMaterials = () => {};
      container.setExploded = () => {};
      container.setPatina = () => {};

      this.activeModel = container;
      this.isCustomModel = true;

      container.scale.set(0.001, 0.001, 0.001);
      this.scene.add(container);

      gsap.to(container.scale, {
        x: targetScale,
        y: targetScale,
        z: targetScale,
        duration: 0.5,
        ease: 'power2.out',
      });

      if (onLoaded) onLoaded(container);
    };

    if (source instanceof ArrayBuffer) {
      this.gltfLoader.parse(
        source,
        '',
        (gltf) => handleGLTFScene(gltf.scene),
        (err) => {
          console.error('Failed to parse GLTF buffer:', err);
          if (onError) onError(err);
        }
      );
    } else if (typeof source === 'string') {
      this.gltfLoader.load(
        source,
        (gltf) => handleGLTFScene(gltf.scene),
        onProgress,
        (err) => {
          console.warn('Failed to load GLTF from URL:', source, err);
          if (onError) onError(err);
        }
      );
    }
  }

  // Double Click Focus on Specific Mesh Detail
  onDoubleClick(event) {
    if (!this.activeModel || !this.renderer) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.activeModel.children, true);

    if (intersects.length > 0) {
      sound.playBrassClick();
      const hitPoint = intersects[0].point;
      const targetPos = [
        hitPoint.x + (this.camera.position.x > 0 ? 0.75 : -0.75),
        hitPoint.y + 0.25,
        hitPoint.z + 1.15
      ];
      this.cameraRig.flyTo(targetPos, [hitPoint.x, hitPoint.y, hitPoint.z], 0.75);
    }
  }

  // Live Monogram update on the 3D model tag
  updateMonogram(text) {
    if (this.activeModel && this.activeModel.setMonogram) {
      this.activeModel.setMonogram(text);
    }
  }

  // Mood Studio Lighting
  setLightingMood(moodId) {
    if (moodId === 'manila_sunset') {
      gsap.to(this.keyLight.color, { r: 1.0, g: 0.62, b: 0.32, duration: 0.8 });
      gsap.to(this.keyLight, { intensity: 2.3, duration: 0.8 });
      gsap.to(this.ambientLight.color, { r: 0.90, g: 0.65, b: 0.48, duration: 0.8 });
      gsap.to(this.scene.background, { r: 0.98, g: 0.94, b: 0.89, duration: 0.8 });
      if ('environmentIntensity' in this.scene) gsap.to(this.scene, { environmentIntensity: 1.1, duration: 0.8 });
    } else if (moodId === 'midnight_intramuros') {
      gsap.to(this.keyLight.color, { r: 0.92, g: 0.88, b: 0.82, duration: 0.8 });
      gsap.to(this.keyLight, { intensity: 1.6, duration: 0.8 });
      gsap.to(this.ambientLight.color, { r: 0.28, g: 0.24, b: 0.22, duration: 0.8 });
      gsap.to(this.scene.background, { r: 0.14, g: 0.09, b: 0.07, duration: 0.8 });
      if ('environmentIntensity' in this.scene) gsap.to(this.scene, { environmentIntensity: 0.65, duration: 0.8 });
    } else if (moodId === 'banaue_mist') {
      gsap.to(this.keyLight.color, { r: 0.92, g: 0.95, b: 0.99, duration: 0.8 });
      gsap.to(this.keyLight, { intensity: 1.45, duration: 0.8 });
      gsap.to(this.ambientLight.color, { r: 0.88, g: 0.92, b: 0.96, duration: 0.8 });
      gsap.to(this.scene.background, { r: 0.94, g: 0.96, b: 0.98, duration: 0.8 });
      if ('environmentIntensity' in this.scene) gsap.to(this.scene, { environmentIntensity: 0.75, duration: 0.8 });
    } else {
      gsap.to(this.keyLight.color, { r: 1.0, g: 0.96, b: 0.91, duration: 0.8 });
      gsap.to(this.keyLight, { intensity: 1.85, duration: 0.8 });
      gsap.to(this.ambientLight.color, { r: 1.0, g: 0.98, b: 0.95, duration: 0.8 });
      gsap.to(this.scene.background, { r: 0.98, g: 0.97, b: 0.96, duration: 0.8 });
      if ('environmentIntensity' in this.scene) gsap.to(this.scene, { environmentIntensity: 0.85, duration: 0.8 });
    }
  }

  updateMaterials(...args) {
    if (this.activeModel && this.activeModel.updateMaterials) {
      this.activeModel.updateMaterials(...args);
    }
  }

  setExploded(isExploded) {
    if (!this.activeModel || !this.activeModel.setExploded) return;
    const target = isExploded ? 1 : 0;
    const obj = { t: this.activeModel.explodedProgress || 0 };
    gsap.to(obj, {
      t: target,
      duration: 0.65,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.activeModel.setExploded(obj.t);
        this.activeModel.explodedProgress = obj.t;
      }
    });
  }

  setPatina(year) {
    if (this.activeModel && this.activeModel.setPatina) {
      this.activeModel.setPatina(year);
    }
  }

  toggleLuminaryLight(on) {
    if (this.activeModel && this.activeModel.toggleLight) {
      return this.activeModel.toggleLight(on);
    }
    return false;
  }

  onResize() {
    if (this.isDisposed || !this.container) return;
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight || 500;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  animate() {
    if (this.isDisposed) return;
    requestAnimationFrame(this.animate);
    this.cameraRig.update();
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.isDisposed = true;
    window.removeEventListener('resize', this.onResize);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.removeEventListener('dblclick', this.onDoubleClick);
      this.renderer.domElement.remove();
      this.renderer.dispose();
    }
    if (this.envMap) this.envMap.dispose();
    if (this.cameraRig) this.cameraRig.dispose();
  }
}
