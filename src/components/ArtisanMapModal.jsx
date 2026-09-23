import React, { useState } from 'react';
import { X, MapPin, Award, Compass, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

export function ArtisanMapModal({ isOpen, onClose }) {
  const [selectedRegion, setSelectedRegion] = useState(0);

  if (!isOpen) return null;

  const REGIONS = [
    {
      id: 'laguna',
      name: 'Laguna & Bohol',
      island: 'Luzon & Visayas',
      craft: 'Pandan & Buri Leaf Herringbone Weaving',
      guild: 'Laguna Leaf Weavers Master Guild',
      master: 'Nanay Elena & 14 Master Strippers',
      products: 'Bayong Royale Tote',
      description: 'Along the tropical shores of Laguna and Bohol, wild coastal pandan leaves are harvested by hand, boiled in bamboo vats, and sun-dried across grass mats before being stripped into fine ribbons for diagonal herringbone weaving.'
    },
    {
      id: 'palawan',
      name: 'Palawan Coral Archipelago',
      island: 'MIMAROPA, Western Visayas',
      craft: 'Sustainable Golden South Sea Pearl Mariculture',
      guild: 'Palawan Pearl Divers Sanctuary',
      master: 'Mang Celso & Meycauayan Goldsmiths',
      products: 'Perlas ng Silangan Pendant',
      description: 'Deep within the crystalline marine sanctuaries of Palawan, indigenous divers sustainably cultivate the Pinctada maxima oyster over 2 to 5 years, yielding rare natural golden pearls with mirror-like orient.'
    },
    {
      id: 'lakesebu',
      name: 'Lake Sebu, South Cotabato',
      island: 'Mindanao',
      craft: "T'nalak Sacred Abaca Dreamweaving",
      guild: "T'boli Sacred Dreamweavers Collective",
      master: 'Bo-i Maria (Living Treasure Lineage)',
      products: "Sacred T'nalak Master Tapestries",
      description: "T'boli women receive sacred textile patterns directly in dreams from Fu Dalu, the spirit of abaca. The fibers are hand-stripped, tie-dyed using boiled river mud and forest bark roots, and loomed over months."
    },
    {
      id: 'lumban',
      name: 'Lumban & Kalibo',
      island: 'Laguna & Aklan, Panay',
      craft: 'Red Spanish Pineapple Leaf Scraping & Calado Needlework',
      guild: 'Lumban Master Embroiderers Guild',
      master: 'Aling Remedios (Calado Master)',
      products: 'Barong Tagalog "Dalisay"',
      description: 'Individual red pineapple leaf fibers are delicately scraped with porcelain shards, hand-knotted strand by strand, and loomed with raw silk before master embroiderers pull threads for open-work Calado motifs.'
    },
    {
      id: 'basilan',
      name: 'Lamitan, Basilan',
      island: 'Bangsamoro, Mindanao',
      craft: 'Yakan Geometric Backstrap Weaving',
      guild: 'Yakan Indigenous Weavers Village',
      master: 'Hadja Sitti (Master Weaver)',
      products: 'Yakan Indigenous Tapestries & Textiles',
      description: 'Using traditional backstrap wooden looms tied to the artisan’s waist, Yakan women weave kaleidoscopic python-eye and diamond patterns using 100% natural botanical plant dyes.'
    }
  ];

  const active = REGIONS[selectedRegion];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#24140E]/70 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#FAF8F5] rounded-3xl border border-[#5C3A21]/20 shadow-warm-lg overflow-hidden flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playWoodThud();
            onClose();
          }}
          className="absolute top-4 right-4 z-10 p-2 rounded-full text-[#6E5D53] hover:text-[#24140E] hover:bg-[#F2ECE4] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Regional Pin List */}
        <div className="w-full md:w-5/12 p-6 border-b md:border-b-0 md:border-r border-[#5C3A21]/15 bg-white">
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-4 h-4 text-[#C4975D]" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#8C5A3C]">
              Ang Arkipelago
            </span>
          </div>
          <h3 className="font-serif text-2xl font-semibold text-[#24140E] mb-4">
            Artisan Provenance
          </h3>

          <div className="space-y-2">
            {REGIONS.map((reg, idx) => {
              const isSelected = selectedRegion === idx;
              return (
                <button
                  key={reg.id}
                  onClick={() => {
                    sound.playBrassClick();
                    setSelectedRegion(idx);
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-[#5C3A21] text-white border-[#5C3A21] shadow-warm'
                      : 'bg-[#FAF8F5] text-[#24140E] border-[#5C3A21]/10 hover:bg-[#F2ECE4]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-semibold text-sm">{reg.name}</span>
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-[#C4975D]' : 'text-[#8C5A3C]'}`} />
                  </div>
                  <span className={`text-[10px] block mt-0.5 line-clamp-1 ${isSelected ? 'text-white/80' : 'text-[#6E5D53]'}`}>
                    {reg.craft}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Region Spotlight */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-semibold bg-[#F2ECE4] text-[#5C3A21]">
                {active.island}
              </span>
              <span className="text-xs text-[#8C5A3C] font-serif italic">
                Master Craft Guild
              </span>
            </div>

            <h4 className="font-serif text-3xl font-semibold text-[#24140E] mb-1">
              {active.name}
            </h4>
            <p className="text-xs font-semibold text-[#8C5A3C] mb-4">
              {active.craft}
            </p>

            <p className="text-xs sm:text-sm text-[#5C3A21]/85 leading-relaxed mb-6 font-body">
              {active.description}
            </p>

            <div className="p-4 rounded-2xl bg-white border border-[#5C3A21]/15 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#C4975D] shrink-0" />
                <span className="text-[#24140E] font-medium"><strong>Artisan Master:</strong> {active.master}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C4975D] shrink-0" />
                <span className="text-[#24140E] font-medium"><strong>Showcase Masterwork:</strong> {active.products}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#5C3A21]/15 flex items-center justify-between text-[11px] text-[#6E5D53]">
            <span>100% Endemic & Sustainably Foraged</span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-[#5C3A21] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#432916] transition-all"
            >
              Explore Collection
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

