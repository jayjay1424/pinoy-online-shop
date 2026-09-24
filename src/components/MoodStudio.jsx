import React from 'react';
import { Sun, Moon, CloudSun, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

export function MoodStudio({ activeMood, onSelectMood }) {
  const MOODS = [
    { id: 'jeweler_daylight', label: 'Daylight', icon: Sparkles },
    { id: 'manila_sunset', label: 'Manila Sunset', icon: Sun },
    { id: 'midnight_intramuros', label: 'Midnight', icon: Moon },
    { id: 'banaue_mist', label: 'Highland Mist', icon: CloudSun },
  ];

  return (
    <div className="absolute top-20 right-4 z-20 pointer-events-auto hidden lg:flex flex-col gap-1.5 p-2 glass-panel rounded-2xl shadow-warm border border-[#5C3A21]/20">
      <span className="text-[9px] uppercase tracking-widest text-[#8C5A3C] font-mono font-bold px-2 py-0.5 text-center">
        ATMOSPHERE
      </span>
      {MOODS.map((m) => {
        const Icon = m.icon;
        const isActive = activeMood === m.id;
        return (
          <button
            key={m.id}
            onClick={() => {
              sound.playBrassClick();
              onSelectMood(m.id);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? 'bg-[#24140E] text-[#EAD7B2] border border-[#C4975D]/40 shadow-xs'
                : 'text-[#5C3A21] hover:bg-[#F2ECE4]'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C4975D]' : 'text-[#8C5A3C]'}`} />
            <span className="text-[11px] whitespace-nowrap">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}

