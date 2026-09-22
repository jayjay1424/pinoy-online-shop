import React, { useEffect, useRef, useState } from 'react';
import { SceneManager } from '../three/SceneManager';
import { CameraHUD } from './CameraHUD';
import { MoodStudio } from './MoodStudio';
import { PatinaSlider } from './PatinaSlider';
import { Maximize2, Minimize2 } from 'lucide-react';
import { sound } from '../utils/sound';

export function Stage3D({
  product,
  selectedMaterial,
  activeMood,
  onMoodChange,
  monogram,
}) {
  const mountRef = useRef(null);
  const containerRef = useRef(null);
  const sceneManagerRef = useRef(null);

  const [activePreset, setActivePreset] = useState('overview');
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isExploded, setIsExploded] = useState(false);
  const [patinaYear, setPatinaYear] = useState(0);
  const [isLuminaryLightOn, setIsLuminaryLightOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize Three.js SceneManager
  useEffect(() => {
    if (!mountRef.current) return;

    const sm = new SceneManager(mountRef.current);
    sceneManagerRef.current = sm;

    loadCurrentModel(sm, product, selectedMaterial, monogram);

    return () => {
      sm.destroy();
      sceneManagerRef.current = null;
    };
  }, []);

  // Handle product changes
  useEffect(() => {
    if (!sceneManagerRef.current || !product) return;
    loadCurrentModel(sceneManagerRef.current, product, selectedMaterial, monogram);
    setActivePreset('overview');
    setIsExploded(false);
    setPatinaYear(0);

    if (product.cameraPresets && product.cameraPresets[0]) {
      const p = product.cameraPresets[0];
      sceneManagerRef.current.cameraRig.flyTo(p.pos, p.target, 0.85);
    }
  }, [product.id]);

  // Handle material color changes
  useEffect(() => {
    if (!sceneManagerRef.current || !product) return;
    updateModelMaterials(sceneManagerRef.current, product.modelType, selectedMaterial);
  }, [selectedMaterial]);

  // Handle live monogram updates directly on the 3D mesh
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.updateMonogram(monogram);
    }
  }, [monogram]);

  // Handle lighting mood changes
  useEffect(() => {
    if (!sceneManagerRef.current) return;
    sceneManagerRef.current.setLightingMood(activeMood);
  }, [activeMood]);

  const loadCurrentModel = (sm, prod, mat, monoText) => {
    if (prod.modelType === 'bayong') {
      sm.loadModel('bayong', {
        leafHex: mat.hex || '#D8B781',
        leatherHex: mat.leatherHex || '#8C5A3C',
        brassHex: mat.brassHex || '#C4975D',
        monogramText: monoText || 'JR',
      });
    } else if (prod.modelType === 'pearl') {
      sm.loadModel('pearl', {
        metalHex: mat.hex || '#D4AF37',
        pearlTint: mat.pearlTint || '#FDF7E7',
      });
    } else if (prod.modelType === 'clutch') {
      sm.loadModel('clutch', {
        weaveHex: mat.hex || '#2B211E',
        frameHex: mat.frameHex || '#C4975D',
      });
    } else if (prod.modelType === 'luminary') {
      sm.loadModel('luminary', {
        capizHex: mat.hex || '#FFFDF8',
        brassHex: mat.brassHex || '#C4975D',
      });
    } else if (prod.modelType === 'barong') {
      sm.loadModel('barong', {
        fabricHex: mat.hex || '#FBF8F0',
        embroideryHex: mat.embroideryHex || '#E5C158',
        trimHex: mat.trimHex || '#5C3A21',
      });
    } else if (prod.modelType === 'solihiya') {
      sm.loadModel('solihiya', {
        woodHex: mat.woodHex || '#24140E',
        caneHex: mat.caneHex || '#D8B781',
        brassHex: mat.brassHex || '#C4975D',
      });
    } else if (prod.modelType === 'cuff') {
      sm.loadModel('cuff', {
        brassHex: mat.brassHex || '#C4975D',
        jadeHex: mat.jadeHex || '#2D6A4F',
      });
    }
  };

  const updateModelMaterials = (sm, modelType, mat) => {
    if (modelType === 'bayong') {
      sm.updateMaterials(mat.hex, mat.leatherHex, mat.brassHex);
    } else if (modelType === 'pearl') {
      sm.updateMaterials(mat.hex, mat.pearlTint);
    } else if (modelType === 'clutch') {
      sm.updateMaterials(mat.hex, mat.frameHex);
    } else if (modelType === 'luminary') {
      sm.updateMaterials(mat.hex, mat.brassHex);
    } else if (modelType === 'barong') {
      sm.updateMaterials(mat.hex, mat.embroideryHex, mat.trimHex);
    } else if (modelType === 'solihiya') {
      sm.updateMaterials(mat.woodHex, mat.caneHex, mat.brassHex);
    } else if (modelType === 'cuff') {
      sm.updateMaterials(mat.brassHex, mat.jadeHex);
    }
  };

  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.cameraRig.flyTo(preset.pos, preset.target, 0.85);
    }
  };

  const handleToggleAutoRotate = () => {
    const newState = !isAutoRotating;
    setIsAutoRotating(newState);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.cameraRig.setAutoRotate(newState);
    }
  };

  const handleToggleExploded = () => {
    const newState = !isExploded;
    setIsExploded(newState);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setExploded(newState);
    }
  };

  const handlePatinaChange = (year) => {
    setPatinaYear(year);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setPatina(year);
    }
  };

  const handleToggleLuminaryLight = () => {
    if (sceneManagerRef.current) {
      const newState = sceneManagerRef.current.toggleLuminaryLight();
      setIsLuminaryLightOn(newState);
    }
  };

  const handleResetCamera = () => {
    if (product.cameraPresets && product.cameraPresets[0]) {
      handleSelectPreset(product.cameraPresets[0]);
    }
    setIsAutoRotating(false);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.cameraRig.setAutoRotate(false);
    }
  };

  const toggleFullscreen = () => {
    sound.playBrassClick();
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      if (sceneManagerRef.current) sceneManagerRef.current.onResize();
    }, 100);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-3xl overflow-hidden glass-panel border border-[#5C3A21]/15 shadow-warm select-none transition-all duration-500 ${
        isFullscreen
          ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)] rounded-3xl shadow-warm-lg'
          : 'h-[460px] sm:h-[540px] lg:h-[620px]'
      }`}
    >
      {/* Three.js Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Fullscreen Toggle Button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-30 p-2.5 rounded-full glass-panel border border-[#5C3A21]/15 text-[#5C3A21] hover:bg-white transition-all shadow-xs"
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D Studio Salon'}
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>

      {/* Floating 3D Controls HUD */}
      <CameraHUD
        product={product}
        activePreset={activePreset}
        onSelectPreset={handleSelectPreset}
        isAutoRotating={isAutoRotating}
        onToggleAutoRotate={handleToggleAutoRotate}
        isExploded={isExploded}
        onToggleExploded={handleToggleExploded}
        isLuminaryLightOn={isLuminaryLightOn}
        onToggleLuminaryLight={handleToggleLuminaryLight}
        onResetCamera={handleResetCamera}
      />

      {/* Dynamic 3D Mood Studio Switcher */}
      <MoodStudio
        activeMood={activeMood}
        onSelectMood={onMoodChange}
      />

      {/* Pamana Patina Aging Simulator (For Bayong) */}
      {product.modelType === 'bayong' && (
        <PatinaSlider
          currentYear={patinaYear}
          onYearChange={handlePatinaChange}
        />
      )}

    </div>
  );
}
