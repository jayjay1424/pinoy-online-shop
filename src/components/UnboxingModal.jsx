import React, { useState } from 'react';
import { X, Sparkles, Check, Gift, ArrowRight, Scroll, ShoppingBag } from 'lucide-react';
import { sound } from '../utils/sound';

export function UnboxingModal({ isOpen, onClose }) {
  const [stage, setStage] = useState(0); // 0: crate, 1: ribbon untied, 2: seal cracked, 3: inabel cloth opened, 4: revealed

  if (!isOpen) return null;

  const handleStep = () => {
    if (stage === 0) {
      sound.playRustle();
      setStage(1);
    } else if (stage === 1) {
      sound.playBrassClick();
      setStage(2);
    } else if (stage === 2) {
      sound.playWoodThud();
      setStage(3);
    } else if (stage === 3) {
      sound.playSuccessChime();
      setStage(4);
    }
  };

  const handleReset = () => {
    sound.playBrassClick();
    setStage(0);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#24140E]/70 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#FAF8F5] rounded-3xl border border-[#5C3A21]/20 shadow-warm-lg overflow-hidden p-6 sm:p-8 text-center">
        
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playWoodThud();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-[#6E5D53] hover:text-[#24140E] hover:bg-[#F2ECE4] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8C5A3C] block mb-1">
          Ritwal ng Pagbubukas
        </span>
        <h3 className="font-serif text-3xl font-semibold text-[#24140E]">
          The 3D Unboxing Ceremony
        </h3>
        <p className="text-xs text-[#6E5D53] max-w-sm mx-auto mt-1 font-serif italic mb-8">
          Every piece arrives in a hand-carved Philippine Kamagong crate, sealed with hot botanical wax and wrapped in handwoven Inabel cloth.
        </p>

        {/* Interactive Visual Stage */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto mb-8 flex items-center justify-center">
          
          {/* Stage 0: Intact Kamagong Crate with Ribbon & Seal */}
          {stage === 0 && (
            <div className="w-48 h-48 rounded-3xl bg-[#24140E] border-4 border-[#C4975D] shadow-warm-lg flex flex-col items-center justify-center relative animate-pulse cursor-pointer group" onClick={handleStep}>
              <div className="absolute inset-x-0 h-4 bg-[#C4975D]/80 top-1/2 -translate-y-1/2" />
              <div className="absolute inset-y-0 w-4 bg-[#C4975D]/80 left-1/2 -translate-x-1/2" />
              <div className="w-14 h-14 rounded-full bg-rose-900 border-2 border-[#C4975D] flex items-center justify-center shadow-md z-10 text-white font-serif font-bold text-xs">
                LIKHA
              </div>
              <span className="absolute bottom-2 text-[9px] text-[#C4975D] uppercase tracking-wider font-semibold">
                Click to Untie Ribbon
              </span>
            </div>
          )}

          {/* Stage 1: Ribbon Untied, Wax Seal Ready */}
          {stage === 1 && (
            <div className="w-48 h-48 rounded-3xl bg-[#24140E] border-4 border-[#5C3A21]/50 shadow-warm-lg flex flex-col items-center justify-center relative cursor-pointer" onClick={handleStep}>
              <div className="w-16 h-16 rounded-full bg-rose-900 border-2 border-[#C4975D] flex items-center justify-center shadow-lg animate-bounce text-white font-serif font-bold text-sm">
                SEAL
              </div>
              <span className="absolute bottom-2 text-[9px] text-[#C4975D] uppercase tracking-wider font-semibold">
                Click to Break Wax Seal
              </span>
            </div>
          )}

          {/* Stage 2: Seal Broken, Crate Opens, Inabel Textile revealed */}
          {stage === 2 && (
            <div className="w-52 h-52 rounded-3xl bg-[#F2ECE4] border-2 border-[#8C5A3C] shadow-warm flex flex-col items-center justify-center relative cursor-pointer" onClick={handleStep}>
              <div className="w-14 h-14 rounded-full bg-white border border-[#8C5A3C]/30 flex items-center justify-center mb-2 shadow-xs">
                <Scroll className="w-7 h-7 text-[#8C5A3C]" />
              </div>
              <span className="text-xs font-serif font-bold text-[#24140E]">
                Ilocos Inabel Textile Wrap
              </span>
              <span className="text-[10px] text-[#8C5A3C] mt-1">
                Click to Unfold Cloth
              </span>
            </div>
          )}

          {/* Stage 3 & 4: Masterpiece Revealed */}
          {(stage === 3 || stage === 4) && (
            <div className="w-56 h-56 rounded-3xl bg-white border border-[#C4975D] shadow-warm-lg flex flex-col items-center justify-center relative animate-fadeIn p-4">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#C4975D] flex items-center justify-center mb-2 shadow-xs">
                <ShoppingBag className="w-8 h-8 text-[#5C3A21]" />
              </div>
              <h5 className="font-serif text-lg font-bold text-[#24140E]">
                Bayong Royale No. 12
              </h5>
              <span className="text-[10px] text-[#8C5A3C] font-mono font-bold mt-1">
                CERTIFICATE OF ARTISANAL PROVENANCE
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-2 border border-emerald-200">
                <Check className="w-3 h-3" /> Seal Intact • Passed Quality Hallmark
              </span>
            </div>
          )}

        </div>

        {/* Action Button */}
        {stage < 4 ? (
          <button
            onClick={handleStep}
            className="px-8 py-3 rounded-full bg-[#5C3A21] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#432916] transition-all shadow-md flex items-center justify-center gap-2 mx-auto"
          >
            <span>{stage === 0 ? 'Untie Abaca Ribbon' : stage === 1 ? 'Break Wax Seal' : stage === 2 ? 'Unfold Inabel Cloth' : 'Reveal Masterwork'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C4975D]" />
          </button>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-full bg-[#F2ECE4] text-[#5C3A21] text-xs font-semibold hover:bg-[#E5DBD0] transition-all"
            >
              Replay Ritual
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-[#5C3A21] text-white text-xs font-semibold hover:bg-[#432916] transition-all shadow-md"
            >
              Close & Explore
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
