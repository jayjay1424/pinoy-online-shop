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
              className={`min-w-[175px] max-w-[195px] shrink-0 text-left p-3.5 rounded-2xl transition-all duration-300 flex flex-col justify-between border relative group ${
                isActive
                  ? 'bg-[#24140E] text-[#FAF8F5] border-[#C4975D] shadow-warm-lg scale-[1.04] ring-2 ring-[#C4975D]/40 z-10'
                  : 'bg-white/85 border-[#5C3A21]/15 hover:bg-white hover:border-[#C4975D]/50 hover:shadow-warm'
              }`}
            >
              {/* Active Indicator Top Notch */}
              {isActive && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-[#C4975D] text-[8.5px] font-mono font-bold text-[#180D09] rounded-full uppercase tracking-widest shadow-xs">
                  IN STAGE
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`p-1.5 rounded-xl border transition-colors ${
                    isActive
                      ? 'bg-[#341E15] border-[#C4975D]/40'
                      : 'bg-[#F2ECE4] border-[#5C3A21]/10 group-hover:border-[#5C3A21]/25'
                  }`}>
                    {getCraftIcon(p.modelType)}
                  </span>
                  {p.modelGlbUrl ? (
                    <span className={`text-[8px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border shadow-2xs ${
                      isActive
                        ? 'bg-[#C4975D]/20 text-[#EAD7B2] border-[#C4975D]/40'
                        : 'text-amber-900 bg-amber-100 border-amber-300/60'
                    }`}>
                      ✨ 3D Couture
                    </span>
                  ) : (
                    <span className={`text-[8px] uppercase tracking-wider font-semibold ${
                      isActive ? 'text-[#C4975D]' : 'text-[#8C5A3C]'
                    }`}>
                      3D Mesh
                    </span>
                  )}
                </div>

                <span className={`text-[8.5px] uppercase tracking-widest font-semibold block mb-0.5 truncate ${
                  isActive ? 'text-[#C4975D]' : 'text-[#8C5A3C]'
                }`}>
                  {p.collection}
                </span>
                <h4 className={`font-serif text-xs sm:text-sm font-semibold leading-snug line-clamp-2 ${
                  isActive ? 'text-white' : 'text-[#24140E]'
                }`}>
                  {p.name}
                </h4>
              </div>

              <div className={`mt-3 pt-2 border-t flex items-center justify-between ${
                isActive ? 'border-[#C4975D]/30' : 'border-[#5C3A21]/10'
              }`}>
                <span className={`text-[11px] font-bold ${
                  isActive ? 'text-[#EAD7B2]' : 'text-[#5C3A21]'
                }`}>
                  {rateInfo.symbol} {convertedPrice.toLocaleString()}
                </span>
                {isActive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C4975D] animate-ping" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5C3A21]/20 group-hover:bg-[#C4975D]" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
