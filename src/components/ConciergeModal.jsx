import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

export function ConciergeModal({ isOpen, onClose }) {
  const [salon, setSalon] = useState('BGC High Street Atelier, Manila');
  const [date, setDate] = useState('2026-10-15');
  const [time, setTime] = useState('14:00');
  const [service, setService] = useState('Private Masterwork Viewing & Champagne Consultation');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    sound.playSuccessChime();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  // Escape key dismiss
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        sound.playWoodThud();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sound.playWoodThud();
          onClose();
        }
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#24140E]/70 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn"
    >
      <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl border border-[#5C3A21]/20 shadow-warm-lg overflow-hidden p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playWoodThud();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-[#6E5D53] hover:text-[#24140E] hover:bg-[#F2ECE4] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C4975D]" />
            <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8C5A3C]">
              Konsiyerhe ng Likha
            </span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#24140E]">
            Private Boutique Appointment
          </h3>
          <p className="text-xs text-[#6E5D53] font-serif italic mt-1 max-w-sm mx-auto">
            Reserve a private salon suite for a bespoke viewing of our Philippine heritage masterworks with an atelier gemologist or master tailor.
          </p>
        </div>

        {submitted ? (
          <div className="py-12 text-center space-y-3 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h4 className="font-serif text-2xl font-semibold text-[#24140E]">
              Appointment Reserved
            </h4>
            <p className="text-xs text-[#6E5D53] max-w-xs mx-auto font-serif italic">
              Our salon director will confirm your private suite coordinates via SMS and email. We look forward to welcoming you.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#6E5D53] mb-1 font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#8C5A3C]" />
                Select Private Salon Location
              </label>
              <select
                value={salon}
                onChange={(e) => setSalon(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#5C3A21]/20 rounded-xl text-[#24140E] focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
              >
                <option>BGC High Street Atelier, Manila</option>
                <option>Ayala Avenue Private Suite, Makati</option>
                <option>Nustar Resort Sanctuary, Cebu</option>
                <option>Rue du Rhône 42, Genève</option>
                <option>Virtual 1-on-1 Video Consultation (Worldwide)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#6E5D53] mb-1 font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#8C5A3C]" />
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#5C3A21]/20 rounded-xl text-[#24140E] focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                />
              </div>

              <div>
                <label className="block text-[#6E5D53] mb-1 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#8C5A3C]" />
                  Time Slot
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#5C3A21]/20 rounded-xl text-[#24140E] focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                >
                  <option>10:30 AM (Morning Salon)</option>
                  <option>02:00 PM (Afternoon Tea)</option>
                  <option>04:30 PM (Sunset Tasting)</option>
                  <option>07:00 PM (Private Evening Viewing)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#6E5D53] mb-1 font-semibold">Service Type</label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#5C3A21]/20 rounded-xl text-[#24140E] focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
              >
                <option>Private Masterwork Viewing & Champagne Consultation</option>
                <option>Bespoke Piña Barong Tailoring & Measurement</option>
                <option>South Sea Pearl Gemologist Selection</option>
                <option>Kasalan Wedding Heirloom Registry Consultation</option>
              </select>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-full bg-[#5C3A21] text-white font-semibold uppercase tracking-wider hover:bg-[#432916] transition-all shadow-warm active:scale-98"
              >
                Confirm Private Appointment
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
