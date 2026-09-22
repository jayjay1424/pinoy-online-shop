import React, { useState } from 'react';
import { ShoppingBag, ChevronDown, ChevronUp, Sparkles, Check, Heart, Shield, Award, CreditCard, Info } from 'lucide-react';
import { CURRENCY_RATES } from '../data/products';
import { sound } from '../utils/sound';

export function ProductInfo({
  product,
  selectedMaterial,
  onSelectMaterial,
  monogram,
  onMonogramChange,
  activeCurrency,
  onAddToCart,
}) {
  const [specsOpen, setSpecsOpen] = useState(false);
  const [installmentInfoOpen, setInstallmentInfoOpen] = useState(false);
  const [selectedEmbroidery, setSelectedEmbroidery] = useState('Alon ng Dagat');
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const rateInfo = CURRENCY_RATES[activeCurrency] || CURRENCY_RATES.PHP;
  const convertedPrice = Math.round(product.pricePHP * rateInfo.rate);
  const formattedPrice = `${rateInfo.symbol} ${convertedPrice.toLocaleString()}`;

  // 12-month 0% installment calculation
  const monthly12 = Math.round(convertedPrice / 12);

  const handleAdd = () => {
    sound.playWoodThud();
    setAddedAnimation(true);
    onAddToCart({
      product,
      selectedMaterial,
      monogram,
      embroideryMotif: product.modelType === 'barong' ? selectedEmbroidery : null,
      price: convertedPrice,
      currency: activeCurrency,
    });
    setTimeout(() => setAddedAnimation(false), 1400);
  };

  return (
    <div className="flex flex-col justify-center max-w-xl mx-auto lg:max-w-none">
      
      {/* Collection & Edition Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#F2ECE4] text-[#5C3A21] border border-[#5C3A21]/15">
          {product.collection}
        </span>
        <span className="text-xs text-[#8C5A3C] font-serif italic">
          {product.edition}
        </span>
      </div>

      {/* Product Title */}
      <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#24140E] tracking-tight leading-none mb-1.5">
        {product.name}
      </h1>
      <p className="text-sm sm:text-base text-[#6E5D53] font-serif italic mb-4">
        {product.subtitle}
      </p>

      {/* Price & Scarcity Indicator */}
      <div className="flex items-baseline gap-4 pb-2 mb-2 border-b border-[#5C3A21]/10">
        <span className="text-2xl sm:text-3xl font-semibold text-[#5C3A21] tracking-tight">
          {formattedPrice}
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Only {product.batchRemaining || 3} remaining in this harvest
        </span>
      </div>

      {/* 0% Luxury Installment Widget */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#5C3A21]/10 text-xs text-[#6E5D53]">
        <div className="flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-[#8C5A3C]" />
          <span>Or <strong>{rateInfo.symbol} {monthly12.toLocaleString()} / mo</strong> for 12 mos with 0% interest</span>
        </div>
        <button
          onClick={() => { sound.playBrassClick(); setInstallmentInfoOpen(!installmentInfoOpen); }}
          className="text-[11px] text-[#8C5A3C] hover:text-[#5C3A21] font-semibold underline flex items-center gap-0.5"
        >
          <span>Plans</span>
          <Info className="w-3 h-3" />
        </button>
      </div>

      {/* Installment breakdown popover */}
      {installmentInfoOpen && (
        <div className="mb-4 p-3 rounded-2xl bg-[#FAF8F5] border border-[#5C3A21]/15 text-xs text-[#5C3A21] space-y-1.5 animate-fadeIn">
          <span className="font-bold block text-[#24140E] text-[11px] uppercase tracking-wider">0% Interest Financing Schedule</span>
          <div className="flex justify-between"><span>3 Months Plan:</span> <strong className="text-[#24140E]">{rateInfo.symbol} {Math.round(convertedPrice / 3).toLocaleString()}/mo</strong></div>
          <div className="flex justify-between"><span>6 Months Plan:</span> <strong className="text-[#24140E]">{rateInfo.symbol} {Math.round(convertedPrice / 6).toLocaleString()}/mo</strong></div>
          <div className="flex justify-between"><span>12 Months Plan:</span> <strong className="text-[#5C3A21]">{rateInfo.symbol} {monthly12.toLocaleString()}/mo</strong></div>
          <span className="text-[10px] text-[#6E5D53] block pt-1">Supported by Billease, BDO, BPI, and Metrobank at checkout.</span>
        </div>
      )}

      {/* Editorial Description */}
      <p className="text-xs sm:text-sm text-[#5C3A21]/80 leading-relaxed mb-5 font-body">
        {product.description}
      </p>

      {/* Material & Finish Selector */}
      {product.materials && product.materials.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-[#24140E] font-semibold">
              Select Finish: <span className="font-normal text-[#6E5D53]">{selectedMaterial.name} ({selectedMaterial.colorName})</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {product.materials.map((mat) => {
              const isSelected = selectedMaterial.id === mat.id;
              return (
                <button
                  key={mat.id}
                  onClick={() => {
                    sound.playBrassClick();
                    onSelectMaterial(mat);
                  }}
                  className={`group flex items-center gap-2 p-1.5 rounded-full border transition-all ${
                    isSelected
                      ? 'border-[#5C3A21] bg-[#FAF8F5] shadow-xs'
                      : 'border-transparent hover:border-[#5C3A21]/30'
                  }`}
                  title={`${mat.name} - ${mat.colorName}`}
                >
                  <span
                    className="w-7 h-7 rounded-full border border-black/10 shadow-inner flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ backgroundColor: mat.hex }}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" />}
                  </span>
                  <span className={`text-xs pr-2 font-medium ${isSelected ? 'text-[#24140E]' : 'text-[#6E5D53]'}`}>
                    {mat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Barong Embroidery Motif Selector (When Barong is active) */}
      {product.modelType === 'barong' && (
        <div className="mb-5 p-3 rounded-2xl bg-[#F2ECE4]/60 border border-[#5C3A21]/15">
          <span className="text-xs font-semibold text-[#24140E] uppercase tracking-wider block mb-2">
            Pechera Needlework Motif: <span className="text-[#8C5A3C]">{selectedEmbroidery}</span>
          </span>
          <div className="grid grid-cols-3 gap-2">
            {['Alon ng Dagat', 'Sampaguita Royale', 'Bayanihan Lattice'].map((motif) => (
              <button
                key={motif}
                onClick={() => {
                  sound.playBrassClick();
                  setSelectedEmbroidery(motif);
                }}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-medium border transition-all text-center ${
                  selectedEmbroidery === motif
                    ? 'bg-[#5C3A21] text-white border-[#5C3A21] shadow-xs'
                    : 'bg-white text-[#24140E] border-[#5C3A21]/20 hover:bg-[#FAF8F5]'
                }`}
              >
                {motif}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bespoke Leather Monogramming (Mapped live in 3D!) */}
      {product.modelType === 'bayong' && (
        <div className="p-3 rounded-2xl bg-[#F2ECE4]/60 border border-[#5C3A21]/15 mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C4975D]" />
              <span className="text-xs font-semibold text-[#24140E] uppercase tracking-wider">
                Live 3D Gold-Leaf Monogram (Complimentary)
              </span>
            </div>
            <span className="text-[10px] text-[#8C5A3C] font-semibold">Updates on 3D tag live</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              maxLength={4}
              value={monogram}
              onChange={(e) => onMonogramChange(e.target.value.toUpperCase())}
              placeholder="e.g. JR"
              className="w-28 px-3 py-1.5 text-xs font-mono tracking-widest uppercase bg-white border border-[#5C3A21]/20 rounded-lg text-[#24140E] focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
            />
            <span className="text-[11px] text-[#6E5D53]">
              Stamped in 24k gold leaf directly on the Vachetta leather tag in the 3D stage above.
            </span>
          </div>
        </div>
      )}

      {/* Primary Actions: Acquire Piece & Wishlist */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleAdd}
          className={`flex-1 py-3.5 px-6 rounded-full font-medium text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-warm active:scale-98 ${
            addedAnimation
              ? 'bg-[#8C5A3C] text-white scale-98'
              : 'bg-[#5C3A21] text-white hover:bg-[#432916] hover:shadow-warm-lg'
          }`}
        >
          {addedAnimation ? (
            <>
              <Check className="w-4 h-4 text-[#C4975D]" />
              <span>Added to Atelier Bag (15m Lock Active)</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-[#C4975D]" />
              <span>Acquire Piece • {formattedPrice}</span>
            </>
          )}
        </button>

        <button
          onClick={() => {
            sound.playBrassClick();
            setIsWishlisted(!isWishlisted);
          }}
          className={`p-3.5 rounded-full border transition-all ${
            isWishlisted
              ? 'bg-rose-50 border-rose-200 text-rose-600'
              : 'border-[#5C3A21]/20 text-[#6E5D53] hover:text-[#24140E] hover:bg-[#F2ECE4]'
          }`}
          title="Save to Private Wishlist"
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      {/* Fair-Trade Artisan Provenance Box */}
      <div className="p-3.5 rounded-2xl bg-white border border-[#5C3A21]/15 mb-5 shadow-xs">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#5C3A21]/20 flex items-center justify-center shrink-0 mt-0.5">
            <Award className="w-4 h-4 text-[#C4975D]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#24140E]">Artisan Guild Provenance</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/60">
                {product.fairTradePercentage}% Direct Artisan Fund
              </span>
            </div>
            <p className="text-[11px] text-[#6E5D53] mt-0.5">
              Hand-crafted by <strong>{product.artisanMaster}</strong> of the <strong>{product.artisanCooperative}</strong> ({product.region}).
            </p>
          </div>
        </div>
      </div>

      {/* Expandable Specifications Accordion */}
      {product.specs && product.specs.length > 0 && (
        <div className="border-t border-[#5C3A21]/15 pt-3">
          <button
            onClick={() => {
              sound.playBrassClick();
              setSpecsOpen(!specsOpen);
            }}
            className="w-full flex items-center justify-between text-xs font-bold text-[#24140E] uppercase tracking-wider py-1 hover:text-[#5C3A21] transition-colors"
          >
            <span>Technical Specifications & Craft Details</span>
            {specsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {specsOpen && (
            <div className="mt-3 divide-y divide-[#5C3A21]/10 text-xs animate-fadeIn">
              {product.specs.map((s, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between">
                  <span className="text-[#6E5D53]">{s.label}</span>
                  <span className="font-medium text-[#24140E] text-right">{s.value}</span>
                </div>
              ))}
              <div className="py-2 flex items-center justify-between">
                <span className="text-[#6E5D53]">Lead Time</span>
                <span className="font-medium text-[#8C5A3C]">{product.leadTime}</span>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
