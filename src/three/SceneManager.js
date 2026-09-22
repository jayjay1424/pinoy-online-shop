import * as THREE from 'three';
import { CameraRig } from './CameraRig';
import { createBayongModel } from './models/BayongModel';
import { createPearlModel } from './models/PearlModel';
import { createClutchModel } from './models/ClutchModel';
import { createLuminaryModel } from './models/LuminaryModel';
import { createBarongBomberModel } from './models/BarongBomberModel';
import { createSolihiyaBoxModel } from './models/SolihiyaBoxModel';
import { createOkirCuffModel } from './models/OkirCuffModel';
import { sound } from '../utils/sound';
import gsap from 'gsap';

// Create a soft warm amber contact shadow canvas texture
function createWarmContactShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
  grad.addColorStop(0, 'rgba(42, 24, 15, 0.42)'); // warm espresso center
  grad.addColorStop(0.4, 'rgba(92, 58, 33, 0.22)');
  grad.addColorStop(0.8, 'rgba(180, 120, 70, 0.08)');
  grad.addColorStop(1, 'rgba(250, 248, 245, 0)'); // fade into alabaster

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth || window.innerWidth;
    this.height = container.clientHeight || 500;

    // 1. Scene & Renderer
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#FAF8F5'); // Warm Alabaster Canvas

    this.camera = new THREE.PerspectiveCamera(38, this.width / this.height, 0.1, 50);
    this.camera.position.set(0, 1.2, 3.2);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // 2. Camera Rig
    let lastRustleTime = 0;
    this.cameraRig = new CameraRig(this.camera, this.renderer.domElement, () => {
      const now = performance.now();
      if (now - lastRustleTime > 160) {
        sound.playRustle();
        lastRustleTime = now;
      }
    });

    // 3. 4-Point Studio Lighting Rig
    this.setupLighting();

    // 4. Ground Shadow Pedestal
    this.setupShadowPedestal();

    // 5. Active Model Holder
    this.activeModel = null;
    this.activeModelType = null;

    // 6. Double-Click Raycast Part Focus
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.onDoubleClick = this.onDoubleClick.bind(this);
    this.renderer.domElement.addEventListener('dblclick', this.onDoubleClick);

    // 7. Animation Loop & Resize
    this.isDisposed = false;
    this.animate = this.animate.bind(this);
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);

    this.animate();
  }

  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0xFFF9F0, 0.95);
    this.scene.add(this.ambientLight);

    // Warm Key Light (Natural 3200K Daylight)
    this.keyLight = new THREE.DirectionalLight(0xFFF5E6, 1.6);
    this.keyLight.position.set(3.2, 4.2, 3.2);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.keyLight.shadow.bias = -0.0005;
    this.scene.add(this.keyLight);

    // Cool Rim Light (Silhouetting edges & sheer fabrics)
    this.rimLight = new THREE.DirectionalLight(0xE2E8F0, 0.85);
    this.rimLight.position.set(-3.2, 2.5, -2.5);
    this.scene.add(this.rimLight);

    // Warm Floor Bounce Light
    this.bounceLight = new THREE.DirectionalLight(0xFDF8F3, 0.45);
    this.bounceLight.position.set(0, -2, 2);
    this.scene.add(this.bounceLight);

    // Pinpoint Specular Spotlight (for pearls, gems & brass)
    this.spotLight = new THREE.SpotLight(0xFFFFFF, 1.2, 10, Math.PI / 6, 0.3);
    this.spotLight.position.set(0, 3.5, 2.5);
    this.scene.add(this.spotLight);
  }

  setupShadowPedestal() {
    const shadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
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

  // Load or Swap Product Model (Supports all 7 models)
  loadModel(modelType, materialOptions = {}) {
    if (this.activeModel) {
      const oldModel = this.activeModel;
      gsap.to(oldModel.scale, {
        x: 0.001,
        y: 0.001,
        z: 0.001,
        duration: 0.25,
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
    } else if (modelType === 'clutch') {
      newModel = createClutchModel(materialOptions.weaveHex, materialOptions.frameHex);
    } else if (modelType === 'luminary') {
      newModel = createLuminaryModel(materialOptions.capizHex, materialOptions.brassHex);
    } else if (modelType === 'barong') {
      newModel = createBarongBomberModel(materialOptions.fabricHex, materialOptions.embroideryHex, materialOptions.trimHex);
    } else if (modelType === 'solihiya') {
      newModel = createSolihiyaBoxModel(materialOptions.woodHex, materialOptions.caneHex, materialOptions.brassHex);
    } else if (modelType === 'cuff') {
      newModel = createOkirCuffModel(materialOptions.brassHex, materialOptions.jadeHex);
    }

    if (!newModel) return;

    this.activeModel = newModel;
    this.activeModelType = modelType;

    newModel.scale.set(0.01, 0.01, 0.01);
    this.scene.add(newModel);

    gsap.to(newModel.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.5,
      ease: 'power2.out',
    });
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
        hitPoint.x + (this.camera.position.x > 0 ? 0.8 : -0.8),
        hitPoint.y + 0.3,
        hitPoint.z + 1.2
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
      gsap.to(this.keyLight.color, { r: 1.0, g: 0.65, b: 0.35, duration: 0.8 });
      gsap.to(this.keyLight, { intensity: 2.2, duration: 0.8 });
      gsap.to(this.ambientLight.color, { r: 0.85, g: 0.65, b: 0.5, duration: 0.8 });
      gsap.to(this.scene.background, { r: 0.98, g: 0.95, b: 0.91, duration: 0.8 });
    } else if (moodId === 'midnight_intramuros') {
      gsap.to(this.keyLight.color, { r: 0.9, g: 0.85, b: 0.8, duration: 0.8 });
      gsap.to(this.keyLight, { intensity: 1.4, duration: 0.8 });
      gsap.to(this.ambientLight.color, { r: 0.3, g: 0.25, b: 0.25, duration: 0.8 });
      gsap.to(this.scene.background, { r: 0.15, g: 0.10, b: 0.08, duration: 0.8 });
    } else if (moodId === 'banaue_mist') {
      gsap.to(this.keyLight.color, { r: 0.92, g: 0.94, b: 0.98, duration: 0.8 });
      gsap.to(this.keyLight, { intensity: 1.3, duration: 0.8 });
      gsap.to(this.ambientLight.color, { r: 0.9, g: 0.93, b: 0.96, duration: 0.8 });
      gsap.to(this.scene.background, { r: 0.95, g: 0.96, b: 0.97, duration: 0.8 });
    } else {
      gsap.to(this.keyLight.color, { r: 1.0, g: 0.96, b: 0.9, duration: 0.8 });
      gsap.to(this.keyLight, { intensity: 1.6, duration: 0.8 });
      gsap.to(this.ambientLight.color, { r: 1.0, g: 0.98, b: 0.94, duration: 0.8 });
      gsap.to(this.scene.background, { r: 0.98, g: 0.97, b: 0.96, duration: 0.8 });
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
    if (this.cameraRig) this.cameraRig.dispose();
  }
}
