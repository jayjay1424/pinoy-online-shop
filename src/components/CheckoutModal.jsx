import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  ShieldCheck,
  QrCode,
  CreditCard,
  Wallet,
  Landmark,
  Truck,
  FileText,
  ArrowLeft,
  Lock,
  Printer,
  Sparkles,
  Award,
} from 'lucide-react';
import { CURRENCY_RATES } from '../data/products';
import { sound } from '../utils/sound';

export function CheckoutModal({
  isOpen,
  onClose,
  items,
  packagingOptions,
  activeCurrency,
  onOrderCompleted,
}) {
  const [step, setStep] = useState('details'); // 'details' | 'paymode' | 'authorizing' | 'success'
  const [selectedPaymode, setSelectedPaymode] = useState('gcash');
  const [useBaybayin, setUseBaybayin] = useState(false);
  const [showCertificateView, setShowCertificateView] = useState(false);

  const [clientInfo, setClientInfo] = useState({
    name: 'Sofia Santos',
    email: 'sofia.santos@atelier-collector.ph',
    phone: '+63 917 888 2026',
    address: 'Forbes Park, Makati City, Metro Manila',
    notes: 'Please coordinate with residence concierge upon arrival.',
  });

  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const rateInfo = CURRENCY_RATES[activeCurrency] || CURRENCY_RATES.PHP;
  const subtotal = items.reduce((acc, item) => acc + item.price, 0);

  if (!isOpen) return null;

  const PAYMODES = [
    {
      id: 'gcash',
      name: 'GCash Express (QR Ph)',
      badge: 'Zero Transaction Fee',
      icon: Wallet,
      desc: 'Instant checkout via dynamic QR Ph scan or GCash deep-link rail.',
    },
    {
      id: 'maya',
      name: 'Maya Wallet & Maya Bank',
      badge: 'Real-Time Settlement',
      icon: Wallet,
      desc: 'One-click checkout with your Maya balance or Maya Bank deposit.',
    },
    {
      id: 'qrph',
      name: 'Universal QR Ph',
      badge: 'Any Philippine Bank',
      icon: QrCode,
      desc: 'Scannable by BDO, BPI, UnionBank, RCBC, Metrobank, or any QR Ph app.',
    },
    {
      id: 'card',
      name: 'Visa / Mastercard / AMEX',
      badge: '3D Secure 2.0',
      icon: CreditCard,
      desc: 'Protected by biometric verification and Stripe fraud shield.',
    },
    {
      id: 'billease',
      name: 'Billease 0% Luxury Installments',
      badge: '3 to 12 Mos',
      icon: CreditCard,
      desc: 'Split total into 3, 6, or 12 monthly payments with 60-second approval.',
    },
    {
      id: 'wire',
      name: 'Private Bank Wire & Escrow',
      badge: '> ₱100,000 Pieces',
      icon: Landmark,
      desc: 'Telegraphic wire to BDO Private Bank with funds secured in artisan escrow vault.',
    },
    {
      id: 'cod',
      name: 'White-Glove Armored Delivery',
      badge: 'Metro Manila Only',
      icon: Truck,
      desc: 'Inspect your masterwork upon arrival; settle via contactless POS card tap or cash.',
    },
  ];

  const handleSimulatePayment = () => {
    sound.playBrassClick();
    setStep('authorizing');

    setTimeout(() => {
      sound.playSuccessChime();
      const orderNumber = `LKH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const serialKey = `HABI-012/030-${Math.floor(100 + Math.random() * 900)}`;

      const orderData = {
        orderNumber,
        serialKey,
        client: clientInfo,
        items,
        packaging: packagingOptions,
        subtotal,
        currency: activeCurrency,
        paymode: PAYMODES.find((p) => p.id === selectedPaymode)?.name || 'Direct',
        timestamp: new Date().toLocaleDateString('en-PH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      };

      setConfirmedOrder(orderData);
      setStep('success');
      onOrderCompleted(orderData);
    }, 1800);
  };

  const handlePrintCertificate = () => {
    sound.playBrassClick();
    window.print();
  };

  const isQRPaymode = ['gcash', 'maya', 'qrph'].includes(selectedPaymode);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#24140E]/60 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-3xl border border-[#5C3A21]/20 shadow-warm-lg overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#5C3A21]/15 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#5C3A21]/20 flex items-center justify-center font-serif font-bold text-[#5C3A21]">
              {useBaybayin ? 'ᜎ' : 'L'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-widest font-semibold text-[#8C5A3C]">
                  {useBaybayin ? 'ᜎᜒᜃ᜔ᜑ ᜀᜆᜒᜎ᜔ᜌᜒᜇ᜔' : 'Likha Atelier Private Checkout'}
                </span>
                <button
                  onClick={() => {
                    sound.playBrassClick();
                    setUseBaybayin(!useBaybayin);
                  }}
                  className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#5C3A21]/20 text-[#5C3A21] hover:bg-[#FAF8F5] transition-all"
                  title="Toggle Baybayin Script"
                >
                  {useBaybayin ? 'Latin' : 'ᜊᜌ᜔ᜊᜌᜒᜈ᜔'}
                </button>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#24140E]">
                {step === 'success'
                  ? (useBaybayin ? 'ᜃᜆᜒᜊᜌᜈ᜔ ᜅ᜔ ᜉᜄ᜔ᜋᜋᜌ᜔-ᜀᜇᜒ' : 'Acquisition Confirmed')
                  : (useBaybayin ? 'ᜉᜄ᜔ᜊᜌᜇ᜔ ᜐ ᜎᜒᜃ᜔ᜑ' : 'Private Order Settlement')}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playWoodThud();
              onClose();
            }}
            className="p-2 rounded-full text-[#6E5D53] hover:text-[#24140E] hover:bg-[#F2ECE4] transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Client Shipping & Delivery Coordinates */}
        {step === 'details' && (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#5C3A21]/10">
              <span className="text-xs uppercase tracking-wider font-bold text-[#24140E]">
                1. Delivery Coordinates & Client Details
              </span>
              <span className="text-xs font-serif italic text-[#8C5A3C]">
                Valuation: {rateInfo.symbol} {subtotal.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#6E5D53] mb-1 font-medium">Collector Full Name</label>
                <input
                  type="text"
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#5C3A21]/20 rounded-xl text-[#24140E] focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                />
              </div>

              <div>
                <label className="block text-[#6E5D53] mb-1 font-medium">Mobile Phone (For Courier Coordination)</label>
                <input
                  type="text"
                  value={clientInfo.phone}
                  onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#5C3A21]/20 rounded-xl text-[#24140E] focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#6E5D53] mb-1 font-medium">Email Address (For Cryptographic Certificate)</label>
                <input
                  type="email"
                  value={clientInfo.email}
                  onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#5C3A21]/20 rounded-xl text-[#24140E] focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#6E5D53] mb-1 font-medium">Delivery Address / Residence Coordinates</label>
                <input
                  type="text"
                  value={clientInfo.address}
                  onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#5C3A21]/20 rounded-xl text-[#24140E] focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#6E5D53] mb-1 font-medium">Delivery Notes / Security Gate Protocol</label>
                <input
                  type="text"
                  value={clientInfo.notes}
                  onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#5C3A21]/20 rounded-xl text-[#24140E] focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-[11px] text-[#6E5D53]">
                Protected under RA 10173 (Philippine Data Privacy Act)
              </span>
              <button
                onClick={() => {
                  sound.playBrassClick();
                  setStep('paymode');
                }}
                className="px-6 py-2.5 rounded-full bg-[#5C3A21] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#432916] transition-all shadow-md"
              >
                Proceed to Payment Rail
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Paymode Selection & Dynamic QR Ph / Card Screen */}
        {step === 'paymode' && (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#5C3A21]/10">
              <button
                onClick={() => {
                  sound.playBrassClick();
                  setStep('details');
                }}
                className="flex items-center gap-1 text-xs text-[#5C3A21] hover:text-[#24140E] font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Details
              </button>
              <span className="text-xs uppercase tracking-wider font-bold text-[#24140E]">
                2. Select Preferred Paymode
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
              {PAYMODES.map((mode) => {
                const Icon = mode.icon;
                const isSelected = selectedPaymode === mode.id;

                return (
                  <button
                    key={mode.id}
                    onClick={() => {
                      sound.playBrassClick();
                      setSelectedPaymode(mode.id);
                    }}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white border-[#5C3A21] shadow-warm ring-1 ring-[#5C3A21]/30'
                        : 'bg-[#FAF8F5] border-[#5C3A21]/15 hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-[#8C5A3C]" />
                          <span className="font-semibold text-xs text-[#24140E]">{mode.name}</span>
                        </div>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-[#5C3A21]" />}
                      </div>
                      <p className="text-[11px] text-[#6E5D53] leading-snug line-clamp-2">
                        {mode.desc}
                      </p>
                    </div>

                    <span className="mt-2 text-[9px] font-bold text-[#8C5A3C] uppercase tracking-wider block">
                      {mode.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Philippine QR Ph Graphic for GCash / Maya / Universal QR Ph */}
            {isQRPaymode && (
              <div className="p-4 rounded-2xl bg-white border border-[#5C3A21]/20 shadow-xs flex flex-col sm:flex-row items-center gap-4">
                {/* Authentic EMVCo QR Ph SVG Display */}
                <div className="w-28 h-28 p-2 rounded-xl bg-white border-2 border-[#5C3A21]/30 flex flex-col items-center justify-center relative shrink-0 shadow-2xs">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-[#24140E]" fill="currentColor">
                    {/* Top-Left Finder */}
                    <rect x="5" y="5" width="26" height="26" rx="3" fill="none" stroke="currentColor" strokeWidth="4" />
                    <rect x="11" y="11" width="14" height="14" rx="2" />
                    {/* Top-Right Finder */}
                    <rect x="69" y="5" width="26" height="26" rx="3" fill="none" stroke="currentColor" strokeWidth="4" />
                    <rect x="75" y="11" width="14" height="14" rx="2" />
                    {/* Bottom-Left Finder */}
                    <rect x="5" y="69" width="26" height="26" rx="3" fill="none" stroke="currentColor" strokeWidth="4" />
                    <rect x="11" y="75" width="14" height="14" rx="2" />
                    {/* QR Matrix Elements */}
                    <rect x="36" y="8" width="6" height="6" />
                    <rect x="46" y="14" width="6" height="6" />
                    <rect x="56" y="8" width="6" height="6" />
                    <rect x="8" y="38" width="6" height="6" />
                    <rect x="18" y="46" width="6" height="6" />
                    <rect x="38" y="38" width="6" height="6" />
                    <rect x="48" y="44" width="6" height="6" />
                    <rect x="58" y="38" width="6" height="6" />
                    <rect x="72" y="38" width="6" height="6" />
                    <rect x="84" y="46" width="6" height="6" />
                    <rect x="38" y="58" width="6" height="6" />
                    <rect x="48" y="68" width="6" height="6" />
                    <rect x="62" y="62" width="6" height="6" />
                    <rect x="76" y="74" width="6" height="6" />
                    <rect x="86" y="64" width="6" height="6" />
                    <rect x="86" y="86" width="6" height="6" />
                    <rect x="64" y="86" width="6" height="6" />
                    {/* Center Seal */}
                    <circle cx="50" cy="50" r="12" fill="#FAF8F5" stroke="#C4975D" strokeWidth="2" />
                  </svg>
                  <span className="absolute text-[8px] font-serif font-bold text-[#5C3A21]">
                    LA
                  </span>
                  <div className="absolute -bottom-1 px-1.5 py-0.2 bg-[#5C3A21] text-[7px] text-white font-bold rounded">
                    QR Ph
                  </div>
                </div>

                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      Bangko Sentral ng Pilipinas Compliant
                    </span>
                    <span className="text-[10px] text-[#8C5A3C] font-mono">EMVCo Co-Op</span>
                  </div>
                  <h5 className="font-serif text-sm font-semibold text-[#24140E]">
                    Scan to Pay via GCash, Maya, BDO or Any Philippine Bank
                  </h5>
                  <p className="text-[11px] text-[#6E5D53] leading-snug mt-0.5">
                    Open your mobile banking app, select "Scan QR Ph", and scan this merchant code. Instant zero-surcharge authorization.
                  </p>
                </div>
              </div>
            )}

            {/* Interactive Payment Preview Box */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#5C3A21]/15 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F2ECE4] border border-[#5C3A21]/15 flex items-center justify-center text-xs font-bold text-[#5C3A21]">
                  {selectedPaymode === 'gcash'
                    ? 'GCash'
                    : selectedPaymode === 'maya'
                    ? 'Maya'
                    : selectedPaymode === 'qrph'
                    ? 'QR Ph'
                    : selectedPaymode === 'billease'
                    ? 'BillEase'
                    : 'Card'}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#24140E] block">
                    Total Surcharge-Free Valuation:
                  </span>
                  <span className="text-sm font-bold text-[#5C3A21]">
                    {rateInfo.symbol} {subtotal.toLocaleString()} {activeCurrency}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSimulatePayment}
                className="px-6 py-2.5 rounded-full bg-[#5C3A21] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#432916] transition-all shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-[#C4975D]" />
                <span>Authorize Acquisition</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Authorizing Simulation Screen */}
        {step === 'authorizing' && (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-[#F2ECE4] border-t-[#5C3A21] animate-spin mb-4" />
            <h4 className="font-serif text-2xl font-semibold text-[#24140E] mb-1">
              Authorizing via 3D Secure Rail...
            </h4>
            <p className="text-xs text-[#6E5D53] max-w-sm font-serif italic">
              Communicating with encrypted financial gateway. Locking master artisan batch slot and issuing cryptographic serial stamp.
            </p>
          </div>
        )}

        {/* Step 4: Success & Confirmed Order Receipt */}
        {step === 'success' && confirmedOrder && (
          <div className="p-6 sm:p-8 space-y-6 text-center animate-fadeIn">
            {!showCertificateView ? (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto text-2xl shadow-xs">
                  <CheckCircle className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#8C5A3C] block mb-1">
                    {useBaybayin ? 'ᜆ4ᜈ᜔ᜐᜃ᜔ᜐᜒᜌᜓᜈ᜔ ᜋᜆᜄᜓᜋ᜔ᜉᜌ᜔' : 'Transaksiyon Matagumpay • Payment Authorized'}
                  </span>
                  <h3 className="font-serif text-3xl font-semibold text-[#24140E]">
                    Maraming Salamat, {confirmedOrder.client.name.split(' ')[0]}
                  </h3>
                  <p className="text-xs text-[#6E5D53] max-w-md mx-auto mt-1 font-serif italic">
                    Your heirloom piece has been allocated. Master artisans at the guild have received your order dispatch.
                  </p>
                </div>

                {/* Receipt Summary Card */}
                <div className="p-4 rounded-2xl bg-white border border-[#5C3A21]/15 text-left text-xs space-y-2 shadow-xs">
                  <div className="flex justify-between border-b border-[#5C3A21]/10 pb-2">
                    <span className="text-[#6E5D53]">Order Reference</span>
                    <span className="font-mono font-bold text-[#24140E]">{confirmedOrder.orderNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#5C3A21]/10 pb-2">
                    <span className="text-[#6E5D53]">Artisan Serial Key</span>
                    <span className="font-mono font-bold text-[#8C5A3C]">{confirmedOrder.serialKey}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#5C3A21]/10 pb-2">
                    <span className="text-[#6E5D53]">Settlement Rail</span>
                    <span className="font-medium text-[#24140E]">{confirmedOrder.paymode}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#5C3A21]/10 pb-2">
                    <span className="text-[#6E5D53]">Packaging</span>
                    <span className="font-medium text-[#24140E]">{confirmedOrder.packaging?.packagingType || 'Kamagong Crate'}</span>
                  </div>
                  <div className="flex justify-between pt-1 font-semibold text-sm">
                    <span className="text-[#24140E]">Amount Paid</span>
                    <span className="text-[#5C3A21]">{rateInfo.symbol} {confirmedOrder.subtotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      sound.playBrassClick();
                      setShowCertificateView(true);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-white border border-[#5C3A21]/30 text-[#5C3A21] hover:bg-[#FAF8F5] text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#C4975D]" />
                    <span>View Archival Certificate</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playBrassClick();
                      onClose();
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#5C3A21] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#432916] transition-all shadow-md"
                  >
                    Return to Atelier
                  </button>
                </div>
              </>
            ) : (
              /* Archival Certificate of Authenticity Sheet View */
              <div className="text-left space-y-4 animate-fadeIn">
                <div className="p-6 rounded-2xl bg-white border-2 border-[#C4975D] shadow-warm relative">
                  <div className="border border-[#C4975D]/40 p-4 rounded-xl text-center space-y-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#C4975D]" />
                      <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#8C5A3C]">
                        {useBaybayin ? 'ᜃᜆᜒᜊᜌᜈ᜔ ᜅ᜔ ᜉᜄ᜔ᜋᜋᜌ᜔-ᜀᜇᜒ' : 'Katibayan ng Pagmamay-ari'}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl font-bold text-[#24140E]">
                      Certificate of Artisanal Provenance
                    </h3>
                    <p className="text-[11px] text-[#6E5D53] font-serif italic max-w-sm mx-auto">
                      Attesting to the sovereign Philippine heritage provenance, registered batch number, and ethical fair-trade certification.
                    </p>

                    <div className="my-3 py-3 border-y border-[#5C3A21]/15 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[#8C5A3C] block font-semibold">Registered To</span>
                        <span className="font-serif font-bold text-[#24140E]">{confirmedOrder.client.name}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[#8C5A3C] block font-semibold">Archival Registry</span>
                        <span className="font-mono font-bold text-[#5C3A21]">{confirmedOrder.serialKey}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[#8C5A3C] block font-semibold">Date of Issuance</span>
                        <span className="font-sans text-[#24140E]">{confirmedOrder.timestamp}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[#8C5A3C] block font-semibold">Provenance Seal</span>
                        <span className="font-serif font-bold text-emerald-800">Verified Heirloom</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#8C5A3C] pt-1">
                      <span>LIKHA ATELIER • MANILA & GENÈVE</span>
                      <span>PRESIDENCY OF GUILDS</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => {
                      sound.playBrassClick();
                      setShowCertificateView(false);
                    }}
                    className="flex items-center gap-1 text-xs text-[#5C3A21] hover:text-[#24140E] font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Receipt
                  </button>

                  <button
                    onClick={handlePrintCertificate}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#5C3A21] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#432916] transition-all shadow-md"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#C4975D]" />
                    <span>Print Archival Certificate</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
