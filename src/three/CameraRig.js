import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';

export class CameraRig {
  constructor(camera, domElement, onInteraction) {
    this.camera = camera;
    this.domElement = domElement;
    this.onInteraction = onInteraction;

    this.controls = new OrbitControls(this.camera, this.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05; // Finely tuned luxury inertia
    this.controls.minDistance = 1.1;
    this.controls.maxDistance = 5.2;
    this.controls.minPolarAngle = Math.PI * 0.08;
    this.controls.maxPolarAngle = Math.PI * 0.48; // Clamped above floor
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 1.2;

    this.isTweening = false;

    // Trigger subtle acoustic leaf rustle during rotation
    this.controls.addEventListener('change', () => {
      if (this.onInteraction && !this.isTweening) {
        this.onInteraction();
      }
    });
  }

  update() {
    this.controls.update();
  }

  flyTo(targetPos, lookAtTarget = [0, 0.4, 0], duration = 0.85) {
    this.isTweening = true;
    this.controls.enabled = false;

    const currentPos = this.camera.position;
    const currentTarget = this.controls.target;

    gsap.killTweensOf(currentPos);
    gsap.killTweensOf(currentTarget);

    const tl = gsap.timeline({
      onComplete: () => {
        this.controls.enabled = true;
        this.isTweening = false;
      }
    });

    tl.to(currentPos, {
      x: targetPos[0],
      y: targetPos[1],
      z: targetPos[2],
      duration,
      ease: 'power2.inOut',
    }, 0);

    tl.to(currentTarget, {
      x: lookAtTarget[0],
      y: lookAtTarget[1],
      z: lookAtTarget[2],
      duration,
      ease: 'power2.inOut',
    }, 0);
  }

  setAutoRotate(enabled) {
    this.controls.autoRotate = enabled;
  }

  dispose() {
    this.controls.dispose();
  }
}

