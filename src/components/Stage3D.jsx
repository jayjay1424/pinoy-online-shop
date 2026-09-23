import React, { useEffect, useRef, useState } from 'react';
import { SceneManager } from '../three/SceneManager';
import { CameraHUD } from './CameraHUD';
import { MoodStudio } from './MoodStudio';
import { PatinaSlider } from './PatinaSlider';
import { Maximize2, Minimize2, UploadCloud, Sparkles, CheckCircle2 } from 'lucide-react';
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
  const fileInputRef = useRef(null);
  const sceneManagerRef = useRef(null);

  const [activePreset, setActivePreset] = useState('overview');
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isExploded, setIsExploded] = useState(false);
  const [patinaYear, setPatinaYear] = useState(0);
  const [isLuminaryLightOn, setIsLuminaryLightOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [customModelInfo, setCustomModelInfo] = useState(null);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

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
    setCustomModelInfo(null);
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
    const matSafe = mat || {};
    if (prod.modelGlbUrl) {
      setIsLoadingModel(true);
      setLoadingProgress(0);
      sm.loadGLTFModel(
        prod.modelGlbUrl,
        () => {
          setIsLoadingModel(false);
          setLoadingProgress(100);
        },
        (xhr) => {
          if (xhr && xhr.lengthComputable) {
            setLoadingProgress(Math.round((xhr.loaded / xhr.total) * 100));
          }
        },
        (err) => {
          console.warn('Fallback to procedural for', prod.id, err);
          setIsLoadingModel(false);
          loadProceduralModel(sm, prod, matSafe, monoText);
        }
      );
      return;
    }
    setIsLoadingModel(false);
    loadProceduralModel(sm, prod, matSafe, monoText);
  };

  const loadProceduralModel = (sm, prod, matSafe, monoText) => {
    if (prod.modelType === 'bayong') {
      sm.loadModel('bayong', {
        leafHex: matSafe.hex || '#D8B781',
        leatherHex: matSafe.leatherHex || '#8C5A3C',
        brassHex: matSafe.brassHex || '#C4975D',
        monogramText: monoText || 'JR',
      });
    } else if (prod.modelType === 'pearl') {
      sm.loadModel('pearl', {
        metalHex: matSafe.hex || '#D4AF37',
        pearlTint: matSafe.pearlTint || '#FDF7E7',
      });
    } else if (prod.modelType === 'clutch' || prod.modelType === 'stole') {
      sm.loadModel('clutch', {
        weaveHex: matSafe.hex || '#2B211E',
        frameHex: matSafe.frameHex || '#C4975D',
      });
    } else if (prod.modelType === 'luminary') {
      sm.loadModel('luminary', {
        capizHex: matSafe.hex || '#FFFDF8',
        brassHex: matSafe.brassHex || '#C4975D',
      });
    } else if (prod.modelType === 'barong' || prod.modelType === 'dalisay') {
      sm.loadModel('barong', {
        fabricHex: matSafe.hex || '#FBF8F0',
        embroideryHex: matSafe.embroideryHex || '#E5C158',
        trimHex: matSafe.trimHex || '#5C3A21',
      });
    } else if (prod.modelType === 'solihiya') {
      sm.loadModel('solihiya', {
        woodHex: matSafe.woodHex || '#24140E',
        caneHex: matSafe.caneHex || '#D8B781',
        brassHex: matSafe.brassHex || '#C4975D',
      });
    } else if (prod.modelType === 'cuff') {
      sm.loadModel('cuff', {
        brassHex: matSafe.brassHex || '#C4975D',
        jadeHex: matSafe.jadeHex || '#2D6A4F',
      });
    } else if (prod.modelType === 'terno' || prod.modelType === 'trench' || prod.modelType === 'robe') {
      sm.loadModel('terno', {
        hex: matSafe.hex || '#FAF7EE',
      });
    } else if (prod.modelType === 'watch') {
      sm.loadModel('watch', {
        hex: matSafe.hex || '#24140E',
        steelHex: matSafe.steelHex || '#4A5568',
      });
    } else if (prod.modelType === 'ring') {
      sm.loadModel('ring', {
        hex: matSafe.hex || '#E5C158',
      });
    } else if (prod.modelType === 'salakot') {
      sm.loadModel('salakot', {
        hex: matSafe.hex || '#D8B781',
        silverHex: matSafe.silverHex || '#E2E8F0',
      });
    } else if (prod.modelType === 'burnay') {
      sm.loadModel('burnay', {
        hex: matSafe.hex || '#4A3528',
        brassHex: matSafe.brassHex || '#C4975D',
      });
    } else if (prod.modelType === 'creolla') {
      sm.loadModel('creolla', {
        hex: matSafe.hex || '#D4AF37',
      });
    } else if (prod.modelType === 'vault') {
      sm.loadModel('vault', {
        hex: matSafe.hex || '#24140E',
        hornHex: matSafe.hornHex || '#120D0A',
      });
    }
  };

  const updateModelMaterials = (sm, modelType, mat) => {
    if (!mat) return;
    if (modelType === 'bayong') {
      sm.updateMaterials(mat.hex, mat.leatherHex, mat.brassHex);
    } else if (modelType === 'pearl') {
      sm.updateMaterials(mat.hex, mat.pearlTint);
    } else if (modelType === 'clutch' || modelType === 'stole') {
      sm.updateMaterials(mat.hex, mat.frameHex);
    } else if (modelType === 'luminary') {
      sm.updateMaterials(mat.hex, mat.brassHex);
    } else if (modelType === 'barong' || modelType === 'dalisay') {
      sm.updateMaterials(mat.hex, mat.embroideryHex, mat.trimHex);
    } else if (modelType === 'solihiya') {
      sm.updateMaterials(mat.woodHex, mat.caneHex, mat.brassHex);
    } else if (modelType === 'cuff') {
      sm.updateMaterials(mat.brassHex, mat.jadeHex);
    } else if (modelType === 'terno' || modelType === 'trench' || modelType === 'robe') {
      sm.updateMaterials(mat.hex);
    } else if (modelType === 'watch') {
      sm.updateMaterials(mat.hex, mat.steelHex);
    } else if (modelType === 'ring') {
      sm.updateMaterials(mat.hex);
    } else if (modelType === 'salakot') {
      sm.updateMaterials(mat.hex, mat.silverHex);
    } else if (modelType === 'burnay') {
      sm.updateMaterials(mat.hex, mat.brassHex);
    } else if (modelType === 'creolla') {
      sm.updateMaterials(mat.hex);
    } else if (modelType === 'vault') {
      sm.updateMaterials(mat.hex, mat.hornHex);
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

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      loadCustom3DFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      loadCustom3DFile(e.target.files[0]);
    }
  };

  const loadCustom3DFile = (file) => {
    if (!sceneManagerRef.current) return;
    const nameLower = file.name.toLowerCase();
    if (!nameLower.endsWith('.glb') && !nameLower.endsWith('.gltf')) {
      alert('Please upload a 3D model file in .glb or .gltf format (exported from Meshy.ai or Blender).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const buffer = evt.target.result;
      sceneManagerRef.current.loadGLTFModel(
        buffer,
        () => {
          setCustomModelInfo({
            name: file.name,
            sizeMb: (file.size / (1024 * 1024)).toFixed(2),
          });
          sound.playBrassClick();
        },
        (err) => {
          alert('Could not render 3D model: ' + (err.message || 'Check GLB format.'));
        }
      );
    };
    reader.readAsArrayBuffer(file);
  };

  const handleRevertToAtelier = () => {
    if (!sceneManagerRef.current || !product) return;
    setCustomModelInfo(null);
    loadCurrentModel(sceneManagerRef.current, product, selectedMaterial, monogram);
    sound.playBrassClick();
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
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full rounded-3xl overflow-hidden glass-panel border border-[#5C3A21]/15 shadow-warm select-none transition-all duration-500 ${
        isFullscreen
          ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)] rounded-3xl shadow-warm-lg'
          : 'h-[460px] sm:h-[540px] lg:h-[620px]'
      }`}
    >
      {/* Hidden File Input for External .GLB / .GLTF Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".glb,.gltf"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Three.js Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* 3D Model Asset Loading Overlay */}
      {isLoadingModel && (
        <div className="absolute inset-0 z-35 bg-[#FAF8F5]/88 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fade-in pointer-events-none">
          <div className="w-12 h-12 rounded-full border-3 border-[#C4975D]/30 border-t-[#5C3A21] animate-spin mb-3 shadow-xs" />
          <h4 className="font-serif font-semibold text-base text-[#24140E]">
            {product.name}
          </h4>
          <span className="text-xs font-mono text-[#8C5A3C] mt-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C4975D] animate-spin" />
            <span>
              {loadingProgress > 0 ? `Streaming 3D Mesh... ${loadingProgress}%` : 'Loading haute couture 3D model...'}
            </span>
          </span>
        </div>
      )}

      {/* Active Custom 3D Model Badge */}
      {customModelInfo && (
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2.5 bg-[#FAF8F5]/92 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#C4975D]/40 shadow-warm text-xs text-[#24140E] animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-serif font-semibold text-[#5C3A21] max-w-[160px] truncate">
            {customModelInfo.name}
          </span>
          <span className="text-[10px] text-[#8C5A3C] font-mono">
            ({customModelInfo.sizeMb}MB)
          </span>
          <button
            onClick={handleRevertToAtelier}
            className="ml-1 text-[11px] underline text-[#8C5A3C] hover:text-[#5C3A21] font-medium"
            title="Switch back to Handcrafted Atelier Model"
          >
            Revert
          </button>
        </div>
      )}

      {/* Drag & Drop Visual Target Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-2 border-dashed border-[#C4975D] rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <UploadCloud className="w-12 h-12 text-[#C4975D] animate-bounce mb-3" />
          <h4 className="text-lg font-serif font-bold text-[#24140E] mb-1">
            Drop your Meshy.ai 3D Model (.glb / .gltf)
          </h4>
          <p className="text-xs text-[#6E5D53] max-w-sm">
            Release your file to instantly preview it inside the atelier with dynamic lighting, shadows, and 360° controls.
          </p>
        </div>
      )}

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
        onImport3D={() => fileInputRef.current?.click()}
      />

      {/* Dynamic 3D Mood Studio Switcher */}
      <MoodStudio
        activeMood={activeMood}
        onSelectMood={onMoodChange}
      />

      {/* Pamana Patina Aging Simulator (For Bayong) */}
      {!customModelInfo && product.modelType === 'bayong' && (
        <PatinaSlider
          currentYear={patinaYear}
          onYearChange={handlePatinaChange}
        />
      )}

    </div>
  );
}
