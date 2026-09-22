import React, { useState } from 'react';
import { ShoppingBag, Volume2, VolumeX, MapPin, Globe, Sparkles, Calendar } from 'lucide-react';
import { CURRENCY_RATES } from '../data/products';
import { sound } from '../utils/sound';

export function Navbar({
  cartCount,
  onOpenCart,
  onOpenMap,
  onOpenUnboxing,
  onOpenConcierge,
  activeCurrency,
  onCurrencyChange,
}) {
  const [audioActive, setAudioActive] = useState(sound.enabled);
  const [currencyDropdown, setCurrencyDropdown] = useState(false);

  const toggleSound = () => {
    const newState = sound.toggle();
    setAudioActive(newState);
    if (newState) sound.playBrassClick();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300">
      {/* Top Heritage Notice Ticker */}
      <div className="bg-[#24140E] text-[#FAF8F5] text-[10px] sm:text-[11px] py-1 px-4 text-center tracking-widest font-mono flex items-center justify-center gap-2 border-b border-[#C4975D]/30">
        <span className="text-[#C4975D] font-bold">EDISYON 2026</span>
        <span>•</span>
        <span className="truncate">WHITE-GLOVE COURIER DELIVERY TO MANILA, GENEVA, TOKYO & NEW YORK</span>
        <span>•</span>
        <button
          onClick={() => {
            sound.playBrassClick();
            if (onOpenConcierge) onOpenConcierge();
          }}
          className="text-[#C4975D] underline font-sans hover:text-white transition-colors hidden sm:inline"
        >
          Book Salon Viewing
        </button>
      </div>

      <div className="px-3 sm:px-8 py-2.5">
        <div className="max-w-7xl mx-auto glass-panel rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-warm border border-[#5C3A21]/15">
          
          {/* Brandmark / Logo */}
          <div className="flex items-center gap-2">
            <a href="#" className="flex flex-col">
              <span className="font-serif tracking-[0.22em] text-lg sm:text-xl font-semibold text-[#24140E] uppercase hover:text-[#5C3A21] transition-colors">
                Likha Atelier
              </span>
              <span className="text-[9px] tracking-[0.25em] text-[#8C5A3C] uppercase -mt-0.5 font-medium">
                Manila • Genève
              </span>
            </a>
          </div>

          {/* Center Navigation Links (Hidden on small mobile) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium tracking-wider text-[#5C3A21] uppercase">
            <a href="#stage" className="hover:text-[#24140E] transition-colors py-1">The 3D Stage</a>
            <a href="#catalog" className="hover:text-[#24140E] transition-colors py-1">Heritage Catalog</a>
            <a href="#story" className="hover:text-[#24140E] transition-colors py-1">Mula sa Lupa</a>
            <button
              onClick={() => { sound.playBrassClick(); onOpenMap(); }}
              className="flex items-center gap-1.5 hover:text-[#24140E] transition-colors py-1"
            >
              <MapPin className="w-3.5 h-3.5 text-[#8C5A3C]" />
              Ang Arkipelago
            </button>
            <button
              onClick={() => { sound.playBrassClick(); if (onOpenConcierge) onOpenConcierge(); }}
              className="flex items-center gap-1.5 hover:text-[#24140E] transition-colors py-1"
            >
              <Calendar className="w-3.5 h-3.5 text-[#8C5A3C]" />
              Private Concierge
            </button>
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Virtual Unboxing Trigger */}
            <button
              onClick={() => { sound.playBrassClick(); onOpenUnboxing(); }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#5C3A21] bg-[#FAF8F5] border border-[#5C3A21]/15 hover:bg-[#5C3A21] hover:text-white transition-all shadow-xs"
              title="3D Virtual Unboxing Ceremony"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C4975D]" />
              <span>Unboxing Ritual</span>
            </button>

            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => { sound.playBrassClick(); setCurrencyDropdown(!currencyDropdown); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-[#24140E] hover:bg-[#FAF8F5] transition-colors border border-[#5C3A21]/15"
                aria-label="Currency Selector"
              >
                <Globe className="w-3.5 h-3.5 text-[#8C5A3C]" />
                <span>{activeCurrency}</span>
              </button>

              {currencyDropdown && (
                <div className="absolute right-0 mt-2 w-32 glass-panel rounded-xl shadow-warm-lg p-1.5 border border-[#5C3A21]/15 z-50 animate-fadeIn">
                  {Object.keys(CURRENCY_RATES).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => {
                        onCurrencyChange(curr);
                        setCurrencyDropdown(false);
                        sound.playBrassClick();
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                        activeCurrency === curr
                          ? 'bg-[#5C3A21] text-white font-semibold'
                          : 'text-[#24140E] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <span>{curr}</span>
                      <span className="opacity-70">{CURRENCY_RATES[curr].symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-full border transition-all ${
                audioActive
                  ? 'border-[#5C3A21]/30 text-[#5C3A21] hover:bg-[#FAF8F5]'
                  : 'border-[#5C3A21]/15 text-[#8C5A3C]/60 hover:text-[#24140E]'
              }`}
              title={audioActive ? 'Mute Haptic Sound' : 'Enable Leaf & Brass Acoustics'}
              aria-label="Toggle Sound"
            >
              {audioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Atelier Bag Trigger */}
            <button
              onClick={() => { sound.playWoodThud(); onOpenCart(); }}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-[#5C3A21] text-white hover:bg-[#432916] active:scale-95 transition-all shadow-md"
              aria-label="Open Atelier Bag"
            >
              <ShoppingBag className="w-4 h-4 text-[#C4975D]" />
              <span className="text-xs font-semibold tracking-wider">BAG</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#C4975D] text-[#24140E] text-[10px] font-bold flex items-center justify-center -ml-0.5 animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
