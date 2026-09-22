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
    <div className="absolute top-20 right-4 z-20 pointer-events-auto hidden lg:flex flex-col gap-1.5 p-1.5 glass-panel rounded-2xl shadow-warm border border-[#5C3A21]/15">
      <span className="text-[9px] uppercase tracking-widest text-[#8C5A3C] font-semibold px-2 py-0.5 text-center">
        3D Atmosphere
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
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              isActive
                ? 'bg-[#5C3A21] text-white shadow-xs'
                : 'text-[#24140E] hover:bg-[#F2ECE4]'
            }`}
          >
            <Icon className="w-3.5 h-3.5 text-[#C4975D]" />
            <span className="text-[11px] whitespace-nowrap">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}

