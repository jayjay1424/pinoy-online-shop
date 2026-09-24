import React from 'react';
import { Clock, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/sound';

export function PatinaSlider({ currentYear, onYearChange }) {
  const years = [0, 5, 10, 20];

  return (
    <div className="absolute top-20 left-4 z-20 pointer-events-auto hidden md:block max-w-[220px] p-3.5 glass-panel rounded-2xl shadow-warm border border-[#5C3A21]/20">
      <div className="flex items-center gap-1.5 mb-1">
        <Clock className="w-3.5 h-3.5 text-[#C4975D]" />
        <span className="text-[10px] uppercase tracking-widest text-[#24140E] font-bold">
          Pamana Patina Aging
        </span>
      </div>
      <p className="text-[11px] text-[#6E5D53] leading-snug mb-2.5">
        Watch how natural Pandan leaves and Vachetta leather deepen into a rich honey patina over decades.
      </p>

      {/* Year Pill Selector */}
      <div className="flex items-center justify-between gap-1 p-1 bg-[#F2ECE4]/80 rounded-xl border border-[#5C3A21]/10">
        {years.map((y) => (
          <button
            key={y}
            onClick={() => {
              sound.playBrassClick();
              onYearChange(y);
            }}
            className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all text-center ${
              currentYear === y
                ? 'bg-[#24140E] text-[#EAD7B2] border border-[#C4975D]/40 shadow-xs'
                : 'text-[#6E5D53] hover:text-[#24140E]'
            }`}
          >
            {y === 0 ? 'Day 1' : `${y} Yrs`}
          </button>
        ))}
      </div>

      <div className="mt-2.5 flex items-center gap-1 text-[9.5px] text-[#8C5A3C] font-semibold">
        <ShieldCheck className="w-3 h-3 text-[#C4975D]" />
        <span>Lifetime natural patina warranty</span>
      </div>
    </div>
  );
}

