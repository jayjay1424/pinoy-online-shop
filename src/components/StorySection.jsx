import React from 'react';
import { Award, Leaf, Shield, Heart, Sparkles, MapPin } from 'lucide-react';

export function StorySection() {
  const PILLARS = [
    {
      icon: Leaf,
      title: 'Mula sa Lupa (Wild Foraged)',
      desc: 'Coastal Pandan leaves, sacred high-altitude Abaca, and organic vegetable dyes harvested with respect for natural seasonal cycles and lunar tides.',
      tag: 'Endemic Botanical',
    },
    {
      icon: Award,
      title: 'Living Heritage Artisans',
      desc: 'Every piece is crafted by recognized indigenous weaving masters across Laguna, Bohol, Palawan, Lumban, and Lake Sebu.',
      tag: 'Master Guilds',
    },
    {
      icon: Shield,
      title: 'Tamper-Evident Provenance',
      desc: 'Each masterwork bears a stamped artisanal hallmark, unique harvest serial number, and cryptographic certificate of authenticity.',
      tag: 'Hallmark Seal',
    },
    {
      icon: Heart,
      title: 'Bayanihan Fair-Trade',
      desc: 'Over 40% of every acquisition directly funds community weaver pensions, maternal healthcare, and traditional loom preservation.',
      tag: '48% Direct Fund',
    },
  ];

  const REGIONS = [
    { name: 'Lumban, Laguna', craft: 'Calado Embroidery & Piña-Seda' },
    { name: 'Basey, Samar', craft: 'Tikog Reed & Intricate Mat Weaving' },
    { name: 'Lake Sebu, South Cotabato', craft: 'T\'boli Sacred T\'nalak Dreamweaves' },
    { name: 'Bacuit Bay, Palawan', craft: 'Golden South Sea Pearls & Nacre' },
    { name: 'Tubigon, Bohol', craft: 'Wild Pandan & Raffia Fiber Weaves' },
  ];

  return (
    <section id="story" className="max-w-7xl mx-auto px-4 sm:px-8 py-24 border-t border-[#5C3A21]/15">
      
      {/* Editorial Story Header */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#24140E] text-[#EAD7B2] text-[10px] font-mono tracking-widest uppercase mb-4 border border-[#C4975D]/40 shadow-xs">
          <Sparkles className="w-3 h-3 text-[#C4975D]" />
          <span>Pilosopiya ng Likha Atelier</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#24140E] tracking-tight leading-[1.15] mb-4">
          "Hindi lamang ito gamit; ito ay karangalan at kaluluwa ng lahi."
        </h2>
        <p className="text-sm sm:text-base text-[#6E5D53] font-serif italic leading-relaxed max-w-2xl mx-auto">
          More than luxury objects—each creation is a sacred dialogue between human hands and the Philippine earth, bridging ancestral memory with 3D spatial innovation.
        </p>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {PILLARS.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div
              key={idx}
              className="glass-panel p-6 sm:p-7 rounded-3xl border border-[#5C3A21]/15 shadow-warm hover:shadow-warm-lg hover:border-[#C4975D]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between bg-white/80 group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#24140E] border border-[#C4975D]/40 flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:border-[#C4975D] transition-all">
                    <Icon className="w-5 h-5 text-[#C4975D]" />
                  </div>
                  <span className="text-[9.5px] uppercase font-mono font-bold tracking-wider text-[#8C5A3C] bg-[#F2ECE4] px-2.5 py-0.5 rounded-full border border-[#5C3A21]/10">
                    {p.tag}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#24140E] mb-2 group-hover:text-[#5C3A21] transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs text-[#6E5D53] leading-relaxed font-body">
                  {p.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Archipelago Guild Presence Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[#24140E] text-[#FAF8F5] border border-[#C4975D]/40 shadow-warm-lg flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="max-w-md text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-2 text-[#C4975D] mb-1">
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-mono uppercase tracking-widest font-bold">Ang Pitong Libong Pulo</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-white mb-1.5">
            5 Living Artisan Cooperatives
          </h3>
          <p className="text-xs text-[#EAD7B2]/80 leading-relaxed font-serif italic">
            Directly connected to Likha Atelier's private salons in Manila, Geneva, and Paris.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
          {REGIONS.map((r, i) => (
            <div
              key={i}
              className="px-3.5 py-2 rounded-2xl bg-white/10 border border-[#C4975D]/30 backdrop-blur-xs text-center hover:bg-white/15 transition-all"
            >
              <span className="text-[11px] font-bold text-white block">{r.name}</span>
              <span className="text-[9.5px] text-[#C4975D] font-mono block mt-0.5">{r.craft}</span>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}

