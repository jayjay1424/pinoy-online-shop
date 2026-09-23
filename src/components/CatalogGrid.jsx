import React, { useState } from 'react';
import { CURRENCY_RATES } from '../data/products';
import { sound } from '../utils/sound';
import { Eye, ShoppingBag, Sparkles, Award } from 'lucide-react';

export function CatalogGrid({
  products,
  onSelectProduct,
  onQuickAddToCart,
  activeCurrency,
}) {
  const [activeCategory, setActiveCategory] = useState('All');
  const rateInfo = CURRENCY_RATES[activeCurrency] || CURRENCY_RATES.PHP;

  const categories = ['All', 'Habi & Dahon', 'Perlas & Alahas', 'Kasuotan & Sutla', 'Tahanan & Luho'];

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.collection === activeCategory);

  return (
    <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
      
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#8C5A3C] block mb-2">
          Gawang Pilipino • Pamana at Sining
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#24140E] tracking-tight">
          The Heritage Haute Collection
        </h2>
        <p className="text-xs sm:text-sm text-[#6E5D53] mt-2 font-serif italic">
          Eighteen rare artisanal masterworks hand-crafted from wild pandan leaves, Palawan pearls, sacred abaca, Piña-Seda silk, Kamagong wood, and heirloom gold.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              sound.playBrassClick();
              setActiveCategory(cat);
            }}
            className={`px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all ${
              activeCategory === cat
                ? 'bg-[#5C3A21] text-white shadow-warm'
                : 'bg-white text-[#5C3A21] border border-[#5C3A21]/15 hover:bg-[#FAF8F5]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 9-Product Luxury Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredProducts.map((p) => {
          const convertedPrice = Math.round(p.pricePHP * rateInfo.rate);

          return (
            <div
              key={p.id}
              className="group glass-panel rounded-3xl p-5 border border-[#5C3A21]/15 shadow-warm hover:shadow-warm-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Badges & 3D Indicator */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-semibold bg-[#F2ECE4] text-[#5C3A21]">
                    {p.collection}
                  </span>
                  {p.has3DModel ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8C5A3C] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                      <Sparkles className="w-3 h-3 text-[#C4975D]" />
                      3D Interactive
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#6E5D53] font-serif italic">Bespoke Atelier</span>
                  )}
                </div>

                {/* Visual Image Asset (PNG / JPG preview) */}
                {p.image && (
                  <div className="w-full h-44 rounded-2xl overflow-hidden mb-3 border border-[#5C3A21]/15 relative group-hover:border-[#5C3A21]/30 transition-all bg-[#FAF8F5]">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  </div>
                )}

                {/* Product Title & Subtitle */}
                <h3 className="font-serif text-2xl font-semibold text-[#24140E] group-hover:text-[#5C3A21] transition-colors leading-tight mb-1">
                  {p.name}
                </h3>
                <p className="text-xs text-[#8C5A3C] font-serif italic mb-3">
                  {p.subtitle}
                </p>

                {/* Tagline & Origin */}
                <p className="text-xs text-[#6E5D53] leading-relaxed mb-4 line-clamp-3">
                  {p.description}
                </p>

                {/* Artisan Guild Attribution */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF8F5] border border-[#5C3A21]/10 mb-4 text-[11px] text-[#5C3A21]">
                  <Award className="w-3.5 h-3.5 text-[#C4975D] shrink-0" />
                  <span className="truncate"><strong>{p.artisanCooperative}</strong> ({p.region})</span>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="pt-4 border-t border-[#5C3A21]/10 flex items-center justify-between gap-2">
                <div>
                  <span className="text-lg font-bold text-[#5C3A21]">
                    {rateInfo.symbol} {convertedPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[#8C5A3C] block font-serif">
                    {p.stockStatus === 'archived' || p.batchRemaining === 0
                      ? 'Archived / Sold Out'
                      : p.stockStatus === 'commission'
                      ? 'Bespoke Commission'
                      : p.batchRemaining
                      ? `Only ${p.batchRemaining} left`
                      : 'Bespoke piece'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {p.has3DModel && (
                    <button
                      onClick={() => {
                        sound.playBrassClick();
                        onSelectProduct(p);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-2.5 rounded-full bg-[#F2ECE4] text-[#5C3A21] hover:bg-[#5C3A21] hover:text-white transition-all shadow-xs"
                      title="Inspect in 3D Stage"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    disabled={p.stockStatus === 'archived' || p.batchRemaining === 0}
                    onClick={() => {
                      sound.playWoodThud();
                      onQuickAddToCart(p, convertedPrice, activeCurrency);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all shadow-xs ${
                      p.stockStatus === 'archived' || p.batchRemaining === 0
                        ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                        : 'bg-[#5C3A21] text-white hover:bg-[#432916] active:scale-95'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-[#C4975D]" />
                    <span>
                      {p.stockStatus === 'archived' || p.batchRemaining === 0
                        ? 'Sold Out'
                        : p.stockStatus === 'commission'
                        ? 'Commission'
                        : 'Acquire'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}

