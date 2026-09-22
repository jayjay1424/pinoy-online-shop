import React from 'react';
import { Award, Leaf, Shield, Heart } from 'lucide-react';

export function StorySection() {
  const PILLARS = [
    {
      icon: Leaf,
      title: 'Mula sa Lupa (Wild Foraged)',
      desc: 'Coastal Pandan leaves, sacred high-altitude Abaca, and organic vegetable dyes harvested with respect for natural seasonal cycles.',
    },
    {
      icon: Award,
      title: 'Living Heritage Artisans',
      desc: 'Every piece is crafted by recognized indigenous weaving masters across Laguna, Bohol, Palawan, Lumban, and Lake Sebu.',
    },
    {
      icon: Shield,
      title: 'Tamper-Evident Provenance',
      desc: 'Each masterwork bears a stamped artisanal hallmark and cryptographic digital certificate of authenticity.',
    },
    {
      icon: Heart,
      title: 'Bayanihan Fair-Trade',
      desc: 'Over 40% of every acquisition funds community weaver pensions, maternal healthcare, and loom preservation facilities.',
    },
  ];

  return (
    <section id="story" className="max-w-7xl mx-auto px-4 sm:px-8 py-20 border-t border-[#5C3A21]/15">
      
      {/* Editorial Story Header */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8C5A3C] block mb-2">
          Pilosopiya ng Likha
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#24140E] tracking-tight leading-tight mb-4">
          "Hindi lamang ito gamit; ito ay karangalan ng lahi."
        </h2>
        <p className="text-sm sm:text-base text-[#6E5D53] font-serif italic leading-relaxed">
          More than an accessory—each piece is a sacred dialogue between human hands and the natural Philippine earth, passed down through generations of master weavers.
        </p>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PILLARS.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div
              key={idx}
              className="glass-panel p-6 rounded-3xl border border-[#5C3A21]/15 shadow-warm flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#F2ECE4] border border-[#5C3A21]/15 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#8C5A3C]" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#24140E] mb-2">
                  {p.title}
                </h3>
                <p className="text-xs text-[#6E5D53] leading-relaxed">
                  {p.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}

