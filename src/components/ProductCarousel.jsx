import React, { useRef, useEffect } from 'react';
import { CURRENCY_RATES } from '../data/products';
import { sound } from '../utils/sound';
import {
  Sparkles,
  Layers,
  Box,
  Disc,
  Flame,
  Shirt,
  ShoppingBag,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export function ProductCarousel({
  products,
  activeProductId,
  onSelectProduct,
  activeCurrency,
}) {
  const rateInfo = CURRENCY_RATES[activeCurrency] || CURRENCY_RATES.PHP;
  const threeProducts = products.filter((p) => p.has3DModel);
  const scrollRef = useRef(null);

  // Auto-scroll active product into view
  useEffect(() => {
    if (!scrollRef.current) return;
    const activeBtn = scrollRef.current.querySelector(`[data-product-id="${activeProductId}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeProductId]);

  const handleScroll = (direction) => {
    sound.playBrassClick();
    if (!scrollRef.current) return;
    const offset = direction === 'left' ? -320 : 320;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const getCraftIcon = (modelType) => {
    switch (modelType) {
      case 'bayong':
        return <ShoppingBag className="w-3.5 h-3.5 text-[#C4975D]" />;
      case 'barong':
      case 'barong-men':
      case 'ilustrado':
      case 'dalisay':
      case 'terno':
      case 'trench':
      case 'robe':
        return <Shirt className="w-3.5 h-3.5 text-[#C4975D]" />;
      case 'pearl':
      case 'creolla':
      case 'ring':
        return <Sparkles className="w-3.5 h-3.5 text-[#C4975D]" />;
      case 'solihiya':
      case 'vault':
        return <Box className="w-3.5 h-3.5 text-[#C4975D]" />;
      case 'cuff':
      case 'watch':
        return <Disc className="w-3.5 h-3.5 text-[#C4975D]" />;
      case 'clutch':
      case 'stole':
        return <Layers className="w-3.5 h-3.5 text-[#C4975D]" />;
      case 'luminary':
      case 'burnay':
      case 'salakot':
        return <Flame className="w-3.5 h-3.5 text-[#C4975D]" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-[#C4975D]" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 mt-8 pb-4">
      {/* Deck Header with Left/Right Navigation */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C4975D]" />
          <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#5C3A21]">
            Interactive 3D Stage Collection ({threeProducts.length} Masterworks)
          </span>
        </div>

        {/* Scroll Buttons & Prompt */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8C5A3C] font-serif italic hidden lg:inline mr-2">
            Swipe or select piece to inspect in 3D WebGL studio
          </span>
          <button
            onClick={() => handleScroll('left')}
            className="p-1.5 rounded-full glass-panel border border-[#5C3A21]/15 text-[#5C3A21] hover:bg-white transition-all shadow-xs"
            title="Scroll Left"
            aria-label="Scroll Carousel Left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="p-1.5 rounded-full glass-panel border border-[#5C3A21]/15 text-[#5C3A21] hover:bg-white transition-all shadow-xs"
            title="Scroll Right"
            aria-label="Scroll Carousel Right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 18-Piece Scrollable Panoramic Luxury Ribbon Dock */}
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto pb-3 pt-2 px-1 scroll-smooth no-scrollbar"
      >
        {threeProducts.map((p) => {
          const isActive = p.id === activeProductId;
          const rawPrice = Number(p.pricePHP ?? p.price_php ?? (p.price && p.price.PHP) ?? 45000);
          const convertedPrice = Math.round(rawPrice * rateInfo.rate);

          return (
            <button
              key={p.id}
              data-product-id={p.id}
              onClick={() => {
                sound.playBrassClick();
                onSelectProduct(p);
              }}
              className={`min-w-[165px] max-w-[185px] shrink-0 text-left p-3.5 rounded-2xl transition-all duration-300 flex flex-col justify-between border relative group ${
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
                  {p.modelGlbUrl ? (
                    <span className="text-[8px] uppercase tracking-wider font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-full border border-amber-300/60 shadow-2xs">
                      ✨ 3D Couture
                    </span>
                  ) : (
                    <span className="text-[8px] uppercase tracking-wider font-semibold text-[#8C5A3C]">
                      3D Mesh
                    </span>
                  )}
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
