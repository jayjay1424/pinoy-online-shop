import React from 'react';
import { CURRENCY_RATES } from '../data/products';
import { sound } from '../utils/sound';
import { Sparkles, Layers, Box, Disc, Flame, Shirt, ShoppingBag } from 'lucide-react';

export function ProductCarousel({
  products,
  activeProductId,
  onSelectProduct,
  activeCurrency,
}) {
  const rateInfo = CURRENCY_RATES[activeCurrency] || CURRENCY_RATES.PHP;
  const threeProducts = products.filter((p) => p.has3DModel);

  const getCraftIcon = (modelType) => {
    switch (modelType) {
      case 'bayong':
        return <ShoppingBag className="w-3.5 h-3.5 text-[#C4975D]" />;
      case 'barong':
        return <Shirt className="w-3.5 h-3.5 text-[#C4975D]" />;
      case 'pearl':
        return <Sparkles className="w-3.5 h-3.5 text-[#C4975D]" />;
      case 'solihiya':
        return <Box className="w-3.5 h-3.5 text-[#C4975D]" />;
      case 'cuff':
        return <Disc className="w-3.5 h-3.5 text-[#C4975D]" />;
      case 'clutch':
        return <Layers className="w-3.5 h-3.5 text-[#C4975D]" />;
      case 'luminary':
        return <Flame className="w-3.5 h-3.5 text-[#C4975D]" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-[#C4975D]" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 mt-8 pb-4">
      {/* Deck Header */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C4975D]" />
          <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#5C3A21]">
            Interactive 3D Stage Collection ({threeProducts.length} Masterworks)
          </span>
        </div>
        <span className="text-xs text-[#8C5A3C] font-serif italic hidden sm:inline">
          Select piece to inspect in real-time WebGL studio
        </span>
      </div>

      {/* 7-Piece Grid / Panoramic Dock */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {threeProducts.map((p) => {
          const isActive = p.id === activeProductId;
          const convertedPrice = Math.round(p.pricePHP * rateInfo.rate);

          return (
            <button
              key={p.id}
              onClick={() => {
                sound.playBrassClick();
                onSelectProduct(p);
              }}
              className={`text-left p-3 rounded-2xl transition-all duration-300 flex flex-col justify-between border relative group ${
                isActive
                  ? 'bg-white border-[#5C3A21] shadow-warm scale-[1.03] ring-1 ring-[#5C3A21]/30 z-10'
                  : 'bg-[#FAF8F5]/90 border-[#5C3A21]/15 hover:bg-white hover:border-[#5C3A21]/40 hover:shadow-xs'
              }`}
            >
              {/* Active Indicator Top Notch */}
              {isActive && (
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#5C3A21] text-[8px] font-mono text-white rounded-full uppercase tracking-wider shadow-xs">
                  Active
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="p-1 rounded-lg bg-[#F2ECE4] border border-[#5C3A21]/10 group-hover:border-[#5C3A21]/25 transition-colors">
                    {getCraftIcon(p.modelType)}
                  </span>
                  <span className="text-[8px] uppercase tracking-wider font-semibold text-[#8C5A3C]">
                    3D Mesh
                  </span>
                </div>

                <span className="text-[8px] uppercase tracking-wider font-semibold text-[#8C5A3C] block mb-0.5 truncate">
                  {p.collection}
                </span>
                <h4 className="font-serif text-xs sm:text-sm font-semibold text-[#24140E] leading-snug line-clamp-2">
                  {p.name}
                </h4>
              </div>

              <div className="mt-2.5 pt-2 border-t border-[#5C3A21]/10 flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#5C3A21]">
                  {rateInfo.symbol} {convertedPrice.toLocaleString()}
                </span>
                {isActive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5C3A21] animate-ping" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5C3A21]/20 group-hover:bg-[#5C3A21]/60" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
