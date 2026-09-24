import React, { useState } from 'react';
import { sound } from '../utils/sound';

export function Footer() {
  const [gazetteEmail, setGazetteEmail] = useState('');
  const [gazetteSubscribed, setGazetteSubscribed] = useState(false);

  const handleGazetteSubmit = (e) => {
    e.preventDefault();
    if (!gazetteEmail || !gazetteEmail.includes('@')) return;
    sound.playSuccessChime();
    setGazetteSubscribed(true);
    setGazetteEmail('');
    setTimeout(() => setGazetteSubscribed(false), 4000);
  };
  return (
    <footer className="bg-[#180D09] text-[#FAF8F5] border-t border-[#C4975D]/30 pt-16 pb-12 px-4 sm:px-8 text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
        
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#24140E] border border-[#C4975D] flex items-center justify-center text-[#C4975D] shadow-xs">
              <span className="font-serif text-sm font-bold leading-none select-none">ᜎ</span>
            </div>
            <span className="font-serif tracking-[0.24em] text-xl font-bold text-white uppercase block">
              Likha Atelier
            </span>
          </div>
          <span className="text-[9px] tracking-[0.3em] text-[#C4975D] uppercase block font-mono">
            Manila • Genève • Paris
          </span>
          <p className="text-xs text-[#EAD7B2]/80 max-w-sm font-serif italic leading-relaxed pt-1">
            An ultra-luxury Philippine artisanal maison dedicated to elevating endemic craftsmanship through 3D spatial innovation, ethical community empowerment, and timeless heirloom design.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[10px] text-[#A67C52] font-mono">
            <span>Direct to Weaver Fund: 48% Guaranteed</span>
          </div>
        </div>

        {/* Boutiques */}
        <div>
          <h4 className="text-[11px] font-bold text-[#C4975D] uppercase tracking-wider mb-3">
            Private Salons
          </h4>
          <ul className="space-y-1.5 text-xs text-[#EAD7B2]/85">
            <li>Manila — BGC High Street Atelier</li>
            <li>Makati — Ayala Avenue Salon</li>
            <li>Cebu — Nustar Resort & Sanctuary</li>
            <li>Genève — Rue du Rhône 42</li>
            <li>Paris — Place Vendôme Suite</li>
          </ul>
        </div>

        {/* Collections */}
        <div>
          <h4 className="text-[11px] font-bold text-[#C4975D] uppercase tracking-wider mb-3">
            Haute Collections
          </h4>
          <ul className="space-y-1.5 text-xs text-[#EAD7B2]/85">
            <li>Modern Sculptural Terno</li>
            <li>Bayong Royale Imperial Tote</li>
            <li>Perlas ng Silangan South Sea</li>
            <li>T'boli T'nalak Dreamweaves</li>
            <li>Capiz Shell Luminaries</li>
          </ul>
        </div>

        {/* Newsletter / Gazette */}
        <div>
          <h4 className="text-[11px] font-bold text-[#C4975D] uppercase tracking-wider mb-3">
            The Atelier Gazette
          </h4>
          <p className="text-[11px] text-[#EAD7B2]/80 mb-3 leading-relaxed">
            Receive private invitations to limited harvest drops, salon previews, and master weaver monographs.
          </p>
          {gazetteSubscribed ? (
            <div className="p-2.5 rounded-xl bg-amber-900/60 border border-[#C4975D]/50 text-[11px] text-[#EAD7B2] font-medium animate-fadeIn">
              ✓ Salamat! You are enrolled in the Atelier Gazette.
            </div>
          ) : (
            <form onSubmit={handleGazetteSubmit} className="flex items-center gap-1.5">
              <input
                type="email"
                value={gazetteEmail}
                onChange={(e) => setGazetteEmail(e.target.value)}
                placeholder="Patron email address"
                required
                className="w-full px-3 py-2 text-xs bg-[#24140E] border border-[#C4975D]/30 rounded-xl text-white placeholder:text-[#EAD7B2]/40 focus:outline-none focus:ring-1 focus:ring-[#C4975D]"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-[#C4975D] text-[#180D09] font-bold text-xs hover:bg-[#E5C378] transition-all shrink-0 shadow-xs"
              >
                Join
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Bottom Legal & Payment Trust Badges */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-[#C4975D]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#A67C52]">
        <div className="flex items-center gap-3">
          <span>© 2026 Likha Atelier Genève & Manila. All rights reserved.</span>
          <span>•</span>
          <span className="text-[#C4975D]">Bespoke Certified</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-[#EAD7B2]/70">
          <span>GCash • Maya • QR Ph • Visa • White-Glove Armored Courier</span>
        </div>
      </div>
    </footer>
  );
}

