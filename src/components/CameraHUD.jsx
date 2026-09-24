import React from 'react';
import { RotateCw, Layers, Eye, Lightbulb, Compass, RotateCcw, Upload } from 'lucide-react';
import { sound } from '../utils/sound';

export function CameraHUD({
  product,
  activePreset,
  onSelectPreset,
  isAutoRotating,
  onToggleAutoRotate,
  isExploded,
  onToggleExploded,
  isLuminaryLightOn,
  onToggleLuminaryLight,
  onResetCamera,
  onImport3D,
}) {
  return (
    <div className="absolute inset-x-0 bottom-4 z-20 pointer-events-none px-4 flex flex-col items-center gap-2.5">
      
      {/* Interaction Affordance Hint */}
      <div className="px-3.5 py-1 rounded-full bg-[#24140E]/85 backdrop-blur-md text-[10.5px] font-mono tracking-wider text-[#EAD7B2] border border-[#C4975D]/30 flex items-center gap-2 shadow-warm pointer-events-auto">
        <Compass className="w-3.5 h-3.5 text-[#C4975D] animate-spin" style={{ animationDuration: '8s' }} />
        <span>360° SPATIAL VIEWPORT • DRAG TO ROTATE • PINCH / SCROLL TO INSPECT WEAVE</span>
      </div>

      {/* Main Glass Control HUD */}
      <div className="glass-panel rounded-full px-3 py-1.5 flex items-center gap-1.5 sm:gap-2 shadow-warm border border-[#5C3A21]/20 pointer-events-auto overflow-x-auto max-w-full">
        
        {/* Angle Presets */}
        {product.cameraPresets && product.cameraPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => {
              sound.playBrassClick();
              onSelectPreset(preset);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activePreset === preset.id
                ? 'bg-[#24140E] text-[#EAD7B2] border border-[#C4975D]/50 shadow-xs'
                : 'text-[#5C3A21] hover:bg-[#F2ECE4]'
            }`}
          >
            <Eye className={`w-3 h-3 ${activePreset === preset.id ? 'text-[#C4975D]' : 'opacity-60'}`} />
            <span>{preset.label}</span>
          </button>
        ))}

        <div className="w-[1px] h-4 bg-[#5C3A21]/20 mx-1 hidden sm:block" />

        {/* 360° Auto-Spin Toggle */}
        <button
          onClick={() => {
            sound.playBrassClick();
            onToggleAutoRotate();
          }}
          className={`px-3 py-1.5 rounded-full transition-all text-xs font-semibold flex items-center gap-1.5 ${
            isAutoRotating
              ? 'bg-[#C4975D] text-[#180D09] font-bold shadow-xs'
              : 'text-[#5C3A21] hover:bg-[#F2ECE4]'
          }`}
          title="Toggle 360° Turntable Rotation"
          aria-label="360 Rotation"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          <span className="hidden sm:inline text-[11px] font-bold">360° Spin</span>
        </button>

        {/* Exploded / Deconstructed View Toggle */}
        <button
          onClick={() => {
            sound.playBrassClick();
            onToggleExploded();
          }}
          className={`px-3 py-1.5 rounded-full transition-all text-xs font-semibold flex items-center gap-1.5 ${
            isExploded
              ? 'bg-[#8C5A3C] text-white shadow-xs'
              : 'text-[#5C3A21] hover:bg-[#F2ECE4]'
          }`}
          title="Deconstruct Craftsmanship Assembly"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">Exploded View</span>
        </button>

        {/* Special Luminary Light Toggle */}
        {product.modelType === 'luminary' && (
          <button
            onClick={() => {
              sound.playBrassClick();
              onToggleLuminaryLight();
            }}
            className={`px-3 py-1.5 rounded-full transition-all text-xs font-semibold flex items-center gap-1.5 ${
              isLuminaryLightOn
                ? 'bg-amber-400 text-amber-950 font-bold shadow-xs'
                : 'text-[#5C3A21] hover:bg-[#F2ECE4]'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{isLuminaryLightOn ? 'Light Glow: ON' : 'Light Glow: OFF'}</span>
          </button>
        )}

        {/* Import Custom 3D (.glb / .gltf) Button */}
        <button
          onClick={() => {
            sound.playBrassClick();
            if (onImport3D) onImport3D();
          }}
          className="px-3 py-1.5 rounded-full transition-all text-xs font-semibold flex items-center gap-1.5 text-[#5C3A21] bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#5C3A21]/20 shadow-2xs"
          title="Import 3D model (.glb / .gltf from Meshy.ai or Blender)"
        >
          <Upload className="w-3.5 h-3.5 text-[#8C5A3C]" />
          <span className="whitespace-nowrap font-semibold">Import .GLB</span>
        </button>

        {/* Reset Camera Button */}
        <button
          onClick={() => {
            sound.playBrassClick();
            onResetCamera();
          }}
          className="p-1.5 rounded-full text-[#6E5D53] hover:text-[#24140E] hover:bg-[#F2ECE4] transition-all"
          title="Reset Camera View"
          aria-label="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
}

