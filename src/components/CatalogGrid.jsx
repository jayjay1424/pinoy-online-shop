import React, { useState, useMemo } from 'react';
import { CURRENCY_RATES } from '../data/products';
import { sound } from '../utils/sound';
import { Eye, ShoppingBag, Sparkles, Award, Search, SlidersHorizontal, X } from 'lucide-react';

export function CatalogGrid({
  products,
  onSelectProduct,
  onQuickAddToCart,
  activeCurrency,
}) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('curated');

  const rateInfo = CURRENCY_RATES[activeCurrency] || CURRENCY_RATES.PHP;
  const categories = ['All', 'Habi & Dahon', 'Perlas & Alahas', 'Kasuotan & Sutla', 'Tahanan & Luho'];

  const processedProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesCategory = activeCategory === 'All' || p.collection === activeCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      return (
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.region && p.region.toLowerCase().includes(query)) ||
        (p.artisanCooperative && p.artisanCooperative.toLowerCase().includes(query)) ||
        (p.collection && p.collection.toLowerCase().includes(query))
      );
    });

    if (sortBy === 'price_desc') {
      result.sort((a, b) => {
        const pA = Number(a.pricePHP ?? a.price_php ?? a.price?.PHP ?? 45000);
        const pB = Number(b.pricePHP ?? b.price_php ?? b.price?.PHP ?? 45000);
        return pB - pA;
      });
    } else if (sortBy === 'price_asc') {
      result.sort((a, b) => {
        const pA = Number(a.pricePHP ?? a.price_php ?? a.price?.PHP ?? 45000);
        const pB = Number(b.pricePHP ?? b.price_php ?? b.price?.PHP ?? 45000);
        return pA - pB;
      });
    } else if (sortBy === 'fairtrade') {
      result.sort((a, b) => (b.fairTradePercentage || 0) - (a.fairTradePercentage || 0));
    }

    return result;
  }, [products, activeCategory, searchQuery, sortBy]);

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
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
              activeCategory === cat
                ? 'bg-[#24140E] text-[#EAD7B2] border border-[#C4975D]/50 shadow-warm ring-1 ring-[#C4975D]/30'
                : 'bg-white/85 text-[#5C3A21] border border-[#5C3A21]/15 hover:bg-white hover:border-[#5C3A21]/35'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-10 max-w-4xl mx-auto">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C5A3C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search piece by name, technique (e.g. Piña, T'nalak), or guild region..."
            className="w-full pl-9 pr-9 py-2.5 bg-white border border-[#5C3A21]/20 rounded-full text-xs text-[#24140E] placeholder:text-[#6E5D53]/60 focus:outline-none focus:ring-1 focus:ring-[#C4975D] shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => {
                sound.playBrassClick();
                setSearchQuery('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C5A3C] hover:text-[#24140E] p-1"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown & Counter */}
        <div className="flex items-center gap-2 shrink-0 justify-end">
          <span className="text-[11px] text-[#8C5A3C] font-mono mr-1">
            {processedProducts.length} {processedProducts.length === 1 ? 'piece' : 'masterworks'}
          </span>
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#8C5A3C]" />
          <select
            value={sortBy}
            onChange={(e) => {
              sound.playBrassClick();
              setSortBy(e.target.value);
            }}
            className="px-3.5 py-2 bg-white border border-[#5C3A21]/20 rounded-full text-xs text-[#24140E] font-semibold focus:outline-none focus:ring-1 focus:ring-[#C4975D] shadow-2xs cursor-pointer"
          >
            <option value="curated">Curated Order</option>
            <option value="price_asc">Valuation: Low to High</option>
            <option value="price_desc">Valuation: High to Low</option>
            <option value="fairtrade">Fair-Trade Guild %</option>
          </select>
        </div>
      </div>

      {/* Grid or Empty State */}
      {processedProducts.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white/70 border border-dashed border-[#5C3A21]/20 rounded-3xl max-w-md mx-auto animate-fadeIn">
          <span className="text-3xl mb-2 block">🌿</span>
          <h4 className="font-serif text-xl font-semibold text-[#24140E]">No Artisanal Pieces Found</h4>
          <p className="text-xs text-[#6E5D53] mt-1 font-serif italic">
            Try adjusting your search criteria or resetting the collection filter.
          </p>
          <button
            onClick={() => {
              sound.playBrassClick();
              setSearchQuery('');
              setActiveCategory('All');
            }}
            className="mt-4 px-5 py-2 rounded-full bg-[#5C3A21] text-white text-xs font-semibold hover:bg-[#432916] transition-all shadow-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {processedProducts.map((p) => {
            const rawPrice = Number(p.pricePHP ?? p.price_php ?? (p.price && p.price.PHP) ?? 45000);
            const convertedPrice = Math.round(rawPrice * rateInfo.rate);
            const monthlyInst = Math.round(convertedPrice / 12);

            return (
              <div
                key={p.id}
                className="group glass-panel rounded-3xl p-5 border border-[#5C3A21]/15 shadow-warm hover:shadow-warm-lg hover:border-[#C4975D]/45 hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between bg-white/80"
              >
                <div>
                  {/* Badges & 3D Indicator */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold bg-[#F2ECE4] text-[#5C3A21] border border-[#5C3A21]/10">
                      {p.collection}
                    </span>
                    {p.has3DModel ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300/60 shadow-2xs">
                        <Sparkles className="w-3 h-3 text-[#C4975D]" />
                        3D Interactive
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#8C5A3C] font-serif italic">Bespoke Harvest</span>
                    )}
                  </div>

                  {/* Visual Image Asset (PNG / JPG preview) or Luxury Embossed Fallback */}
                  {p.image ? (
                    <div className="w-full h-48 rounded-2xl overflow-hidden mb-3.5 border border-[#5C3A21]/15 relative group-hover:border-[#C4975D]/40 transition-all bg-[#FAF8F5]">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#24140E]/30 via-transparent to-transparent pointer-events-none" />
                    </div>
                  ) : (
                    <div className="w-full h-48 rounded-2xl mb-3.5 border border-dashed border-[#C4975D]/40 bg-gradient-to-br from-[#FAF8F5] to-[#F2ECE4] flex flex-col items-center justify-center p-4 text-center group-hover:border-[#C4975D] transition-all relative overflow-hidden">
                      <div className="w-12 h-12 rounded-full bg-[#24140E] border border-[#C4975D] flex items-center justify-center text-[#C4975D] mb-2 shadow-xs font-serif font-bold text-lg">
                        ᜎ
                      </div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#8C5A3C] font-bold">
                        {p.collection}
                      </span>
                      <span className="text-[11px] text-[#6E5D53] font-serif italic mt-0.5">
                        {p.leadTime || 'Bespoke Atelier Commission'}
                      </span>
                    </div>
                  )}

                  {/* Product Title & Subtitle */}
                  <h3 className="font-serif text-2xl font-bold text-[#24140E] group-hover:text-[#5C3A21] transition-colors leading-tight mb-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-[#8C5A3C] font-serif italic mb-3">
                    {p.subtitle}
                  </p>

                  {/* Tagline & Origin */}
                  <p className="text-xs text-[#6E5D53] leading-relaxed mb-4 line-clamp-3 font-body">
                    {p.description}
                  </p>

                  {/* Artisan Guild Attribution */}
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#5C3A21]/10 mb-4 text-[11px] text-[#5C3A21]">
                    <Award className="w-3.5 h-3.5 text-[#C4975D] shrink-0" />
                    <span className="truncate"><strong>{p.artisanCooperative}</strong> ({p.region})</span>
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="pt-4 border-t border-[#5C3A21]/15 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-lg font-bold text-[#24140E] block">
                      {rateInfo.symbol} {convertedPrice.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#8C5A3C] block font-serif">
                      Or {rateInfo.symbol} {monthlyInst.toLocaleString()}/mo • 0%
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
                        className="p-2.5 rounded-full bg-[#F2ECE4] text-[#5C3A21] hover:bg-[#24140E] hover:text-[#C4975D] border border-[#5C3A21]/15 transition-all shadow-xs"
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
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
                        p.stockStatus === 'archived' || p.batchRemaining === 0
                          ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                          : 'bg-[#24140E] text-[#FAF8F5] hover:bg-[#341E15] border border-[#C4975D]/40 active:scale-95'
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
      )}

    </section>
  );
}

