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
    <footer className="bg-[#FAF8F5] border-t border-[#5C3A21]/15 pt-16 pb-12 px-4 sm:px-8 text-xs text-[#6E5D53]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
        
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-3">
          <span className="font-serif tracking-[0.22em] text-xl font-semibold text-[#24140E] uppercase block">
            Likha Atelier
          </span>
          <span className="text-[10px] tracking-[0.25em] text-[#8C5A3C] uppercase block -mt-1 font-medium">
            Manila • Genève
          </span>
          <p className="text-xs text-[#6E5D53] max-w-sm font-serif italic leading-relaxed pt-1">
            An ultra-luxury Philippine artisanal maison dedicated to elevating endemic craftsmanship through 3D spatial innovation, ethical community empowerment, and timeless heirloom design.
          </p>
        </div>

        {/* Boutiques */}
        <div>
          <h4 className="text-[11px] font-bold text-[#24140E] uppercase tracking-wider mb-3">
            Private Salons
          </h4>
          <ul className="space-y-1.5 text-xs text-[#5C3A21]">
            <li>Manila — BGC High Street Atelier</li>
            <li>Makati — Ayala Avenue Salon</li>
            <li>Cebu — Nustar Resort & Sanctuary</li>
            <li>Genève — Rue du Rhône 42</li>
            <li>Paris — Place Vendôme Private Suite</li>
          </ul>
        </div>

        {/* Collections */}
        <div>
          <h4 className="text-[11px] font-bold text-[#24140E] uppercase tracking-wider mb-3">
            Haute Collections
          </h4>
          <ul className="space-y-1.5 text-xs text-[#5C3A21]">
            <li>Bayong Royale Tote</li>
            <li>Perlas ng Silangan</li>
            <li>T'nalak Dreamweaves</li>
            <li>Capiz Shell Luminaries</li>
            <li>Piña-Seda Couture</li>
          </ul>
        </div>

        {/* Newsletter / Gazette */}
        <div>
          <h4 className="text-[11px] font-bold text-[#24140E] uppercase tracking-wider mb-3">
            The Atelier Gazette
          </h4>
          <p className="text-[11px] text-[#6E5D53] mb-3">
            Receive private invitations to limited harvest drops and master weaver documentaries.
          </p>
          {gazetteSubscribed ? (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300/80 text-[11px] text-amber-950 font-medium animate-fadeIn">
              ✓ Salamat! You are enrolled in the Atelier Gazette.
            </div>
          ) : (
            <form onSubmit={handleGazetteSubmit} className="flex items-center gap-1.5">
              <input
                type="email"
                value={gazetteEmail}
                onChange={(e) => setGazetteEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="w-full px-3 py-1.5 text-xs bg-white border border-[#5C3A21]/20 rounded-lg text-[#24140E] focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-[#5C3A21] text-white font-semibold text-xs hover:bg-[#432916] transition-all shrink-0 shadow-xs"
              >
                Join
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Bottom Legal Copyright */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-[#5C3A21]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8C5A3C]">
        <div className="flex items-center gap-4">
          <span>© 2026 Likha Atelier Genève. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

