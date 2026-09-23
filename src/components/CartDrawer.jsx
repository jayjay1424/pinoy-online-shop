import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Trash2,
  Clock,
  ShieldCheck,
  Sparkles,
  Gift,
  ArrowRight,
  ShoppingBag,
  Box,
  Shirt,
  Disc,
  Layers,
  Flame,
  PlusCircle,
  Lock,
} from 'lucide-react';
import { CURRENCY_RATES } from '../data/products';
import { sound } from '../utils/sound';
import { useAuth } from '../context/AuthContext';

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onProceedToCheckout,
  activeCurrency,
}) {
  const { isAuthenticated } = useAuth();
  const rateInfo = CURRENCY_RATES[activeCurrency] || CURRENCY_RATES.PHP;
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [packagingType, setPackagingType] = useState('Kamagong Crate');
  const [giftNote, setGiftNote] = useState('');
  const warnedRef = useRef(false);

  // 15-Minute Vault Allocation Timer
  useEffect(() => {
    if (!isOpen || items.length === 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        if (prev === 120 && !warnedRef.current) {
          sound.playBrassClick();
          warnedRef.current = true;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, items]);

  const handleExtendTime = () => {
    sound.playBrassClick();
    setTimeLeft((prev) => prev + 300); // add 5 minutes (300 seconds)
    warnedRef.current = false;
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = timeLeft < 180;

  const subtotal = items.reduce((acc, item) => acc + item.price, 0);

  const getItemIcon = (modelType) => {
    switch (modelType) {
      case 'bayong':
        return <ShoppingBag className="w-5 h-5 text-[#8C5A3C]" />;
      case 'barong':
        return <Shirt className="w-5 h-5 text-[#8C5A3C]" />;
      case 'pearl':
        return <Sparkles className="w-5 h-5 text-[#C4975D]" />;
      case 'solihiya':
        return <Box className="w-5 h-5 text-[#8C5A3C]" />;
      case 'cuff':
        return <Disc className="w-5 h-5 text-[#8C5A3C]" />;
      case 'clutch':
        return <Layers className="w-5 h-5 text-[#8C5A3C]" />;
      case 'luminary':
        return <Flame className="w-5 h-5 text-[#C4975D]" />;
      default:
        return <ShoppingBag className="w-5 h-5 text-[#8C5A3C]" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={() => {
          sound.playWoodThud();
          onClose();
        }}
        className="absolute inset-0 bg-[#24140E]/40 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] border-l border-[#5C3A21]/20 shadow-warm-lg flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-[#5C3A21]/15 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[#8C5A3C] block">
                Likha Atelier
              </span>
              <h3 className="font-serif text-2xl font-semibold text-[#24140E]">
                Your Atelier Bag ({items.length})
              </h3>
            </div>
            <button
              onClick={() => {
                sound.playWoodThud();
                onClose();
              }}
              className="p-2 rounded-full text-[#6E5D53] hover:text-[#24140E] hover:bg-[#F2ECE4] transition-all"
              aria-label="Close Bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 15-Minute Allocation Countdown Alert & Extend Action */}
          {items.length > 0 && (
            <div className={`px-5 py-2.5 border-b flex items-center justify-between text-xs transition-colors ${
              isUrgent
                ? 'bg-rose-50 border-rose-200/70 text-rose-900'
                : 'bg-amber-50 border-amber-200/60 text-amber-900'
            }`}>
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${isUrgent ? 'text-rose-600 animate-pulse' : 'text-amber-700 animate-spin'}`} style={{ animationDuration: '8s' }} />
                <span className="font-medium">
                  {isUrgent ? 'Allocation expiring soon:' : 'Vault Allocation Reserved:'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                  isUrgent ? 'bg-rose-100 text-rose-900 animate-pulse' : 'bg-amber-100/80 text-amber-800'
                }`}>
                  {formattedTime}
                </span>
                <button
                  onClick={handleExtendTime}
                  className="flex items-center gap-1 text-[10px] font-semibold text-[#5C3A21] hover:text-[#24140E] bg-white px-2 py-0.5 rounded-full border border-[#5C3A21]/20 hover:border-[#5C3A21]/50 shadow-2xs transition-all"
                  title="Add 5 more minutes to reservation"
                >
                  <PlusCircle className="w-3 h-3 text-[#C4975D]" />
                  <span>+5m</span>
                </button>
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#5C3A21]/10">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-full bg-[#F2ECE4] border border-[#5C3A21]/15 flex items-center justify-center mb-3">
                  <ShoppingBag className="w-7 h-7 text-[#8C5A3C]" />
                </div>
                <h4 className="font-serif text-xl font-semibold text-[#24140E] mb-1">
                  Your bag is empty
                </h4>
                <p className="text-xs text-[#6E5D53] max-w-xs font-serif italic mb-6">
                  Explore our Philippine Heritage Collection and acquire limited-edition handcrafted masterworks.
                </p>
                <button
                  onClick={() => {
                    sound.playBrassClick();
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold bg-[#5C3A21] text-white hover:bg-[#432916] transition-all"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map((item, index) => (
                <div key={index} className="py-4 flex gap-4 items-start">
                  <div className="w-16 h-16 rounded-2xl bg-[#F2ECE4] border border-[#5C3A21]/15 flex items-center justify-center shrink-0 shadow-2xs">
                    {getItemIcon(item.product.modelType)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] uppercase tracking-wider text-[#8C5A3C] font-semibold block">
                      {item.product.collection}
                    </span>
                    <h5 className="font-serif text-base font-semibold text-[#24140E] truncate">
                      {item.product.name}
                    </h5>
                    
                    {item.selectedMaterial && (
                      <span className="text-[11px] text-[#6E5D53] block">
                        Finish: {item.selectedMaterial.name}
                      </span>
                    )}

                    {item.monogram && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#5C3A21] bg-[#F2ECE4] px-2 py-0.5 rounded mt-1 font-bold">
                        <Sparkles className="w-2.5 h-2.5 text-[#C4975D]" />
                        24K Monogram: "{item.monogram}"
                      </span>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#5C3A21]">
                        {rateInfo.symbol} {item.price.toLocaleString()}
                      </span>
                      <button
                        onClick={() => {
                          sound.playBrassClick();
                          onRemoveItem(index);
                        }}
                        className="text-xs text-rose-600 hover:text-rose-800 p-1 flex items-center gap-1"
                        title="Remove piece"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Luxury Packaging & Gifting Options */}
          {items.length > 0 && (
            <div className="p-4 bg-[#F2ECE4]/70 border-t border-[#5C3A21]/15">
              <div className="flex items-center gap-1.5 mb-2">
                <Gift className="w-3.5 h-3.5 text-[#C4975D]" />
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#24140E]">
                  Complimentary Haute Packaging
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => { sound.playBrassClick(); setPackagingType('Kamagong Crate'); }}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    packagingType === 'Kamagong Crate'
                      ? 'bg-white border-[#5C3A21] text-[#24140E] font-bold shadow-xs'
                      : 'border-[#5C3A21]/15 text-[#6E5D53] hover:bg-white'
                  }`}
                >
                  Kamagong Wood Crate
                </button>
                <button
                  onClick={() => { sound.playBrassClick(); setPackagingType('Inabel Cloth'); }}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    packagingType === 'Inabel Cloth'
                      ? 'bg-white border-[#5C3A21] text-[#24140E] font-bold shadow-xs'
                      : 'border-[#5C3A21]/15 text-[#6E5D53] hover:bg-white'
                  }`}
                >
                  Ilocos Inabel Pouch
                </button>
              </div>

              <input
                type="text"
                placeholder="Optional wax-seal card message (e.g. For Maria, Happy Anniversary)"
                value={giftNote}
                onChange={(e) => setGiftNote(e.target.value)}
                className="w-full mt-2 px-3 py-1.5 text-xs bg-white border border-[#5C3A21]/20 rounded-lg text-[#24140E] focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
              />
            </div>
          )}

          {/* Footer & Checkout Trigger */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#5C3A21]/15 bg-white space-y-3">
              <div className="flex items-center justify-between text-xs text-[#6E5D53]">
                <span>White-Glove Insured Shipping</span>
                <span className="font-semibold text-emerald-700 uppercase">Complimentary</span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="font-serif text-base text-[#24140E]">Total Valuation</span>
                <span className="text-xl font-bold text-[#5C3A21]">
                  {rateInfo.symbol} {subtotal.toLocaleString()}
                </span>
              </div>

              {!isAuthenticated && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300/80 text-[11px] text-amber-950 flex items-center gap-2 animate-fadeIn">
                  <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Patron sign-in required. You will be prompted to log in before checking out.</span>
                </div>
              )}

              <button
                onClick={() => {
                  sound.playWoodThud();
                  onProceedToCheckout({
                    packagingType,
                    giftNote,
                    subtotal,
                  });
                }}
                className="w-full py-3.5 px-6 rounded-full bg-[#5C3A21] text-white hover:bg-[#432916] active:scale-98 transition-all font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-warm"
              >
                <span>{isAuthenticated ? 'Proceed to Private Checkout' : 'Sign In & Place Order'}</span>
                <ArrowRight className="w-4 h-4 text-[#C4975D]" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#8C5A3C]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C4975D]" />
                <span>3D Secure 2.0 • Escrow Guarantee • Tamper-Evident Seal</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
