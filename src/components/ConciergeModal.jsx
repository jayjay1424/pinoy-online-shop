import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Bot,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Send,
  Check,
  Copy,
  MapPin,
  Calendar,
  Clock,
  Eye,
  CheckCircle,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { sound } from '../utils/sound';
import { EcommerceOrchestrator } from '../agents/EcommerceAgents';

export function ConciergeModal({
  isOpen,
  onClose,
  catalog = [],
  activeProduct = null,
  onSelectProduct = () => {},
  onAddToCart = () => {},
  orders = [],
}) {
  const [activeTab, setActiveTab] = useState('agent'); // 'agent' | 'appointment'
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [expandedTraceIndex, setExpandedTraceIndex] = useState(null);

  // Initialize Orchestrator instance
  const orchestratorRef = useRef(null);
  useEffect(() => {
    orchestratorRef.current = new EcommerceOrchestrator(catalog, orders);
  }, [catalog, orders]);

  // Initial welcome message from the Orchestrator
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      agent: 'Likha Atelier Orchestrator',
      text: 'Mabuhay at malugod na pagdating sa **Likha Atelier AI Konsiyerhe**. Ako ang inyong multi-agent shopping assistant. Maipaglilingkod ko kayo sa pagtuklas ng mga obrang Pilipino, pagsubaybay ng inyong order, pagsusuri ng mga pambihirang diskwento, at pagtingin sa mga testimonial ng ating mga patron.',
      steps: [
        {
          agent: 'Orchestrator',
          tool: 'init_session',
          input: { channel: 'web_atelier_concierge' },
          output: { ready: true, specialistAgentsLoaded: 5 },
          durationMs: 12,
        },
      ],
      generativeUI: {
        type: 'PROMPT_SUGGESTIONS',
      },
    },
  ]);

  const messagesEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === 'agent' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // Escape key dismiss
  useEffect(() => {
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

  if (!isOpen) return null;

  // Handle user query submission
  const handleSendMessage = async (queryText) => {
    const text = (queryText || inputMessage).trim();
    if (!text || isProcessing) return;

    sound.playRustle();
    setInputMessage('');
    setIsProcessing(true);

    const userMsgId = `user-${Date.now()}`;
    const newMessages = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        text,
      },
    ];
    setMessages(newMessages);

    try {
      if (!orchestratorRef.current) {
        orchestratorRef.current = new EcommerceOrchestrator(catalog, orders);
      }

      // Simulate realistic multi-agent execution pipeline
      const response = await orchestratorRef.current.processQuery(text, activeProduct);

      sound.playSuccessChime();
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          agent: response.intent
            ? `${response.intent.replace('_', ' ')} SPECIALIST`
            : 'Likha Atelier Orchestrator',
          text: response.text,
          steps: response.steps || [],
          generativeUI: response.generativeUI,
        },
      ]);
    } catch (err) {
      console.error('Agent processing error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          agent: 'System Recovery',
          text: 'Patawad, nagkaroon ng pansamantalang sagabal sa network. Narito ang ating kasalukuyang koleksyon ng mga pamanang obra.',
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyCouponCode = (code) => {
    sound.playBrassClick();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Appointment Form state
  const [salon, setSalon] = useState('BGC High Street Atelier, Manila');
  const [date, setDate] = useState('2026-10-15');
  const [time, setTime] = useState('14:00');
  const [service, setService] = useState('Private Masterwork Viewing & Champagne Consultation');
  const [submitted, setSubmitted] = useState(false);

  const handleAppointmentSubmit = (e) => {
    e.preventDefault();
    sound.playSuccessChime();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sound.playWoodThud();
          onClose();
        }
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#24140E]/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-3xl border border-[#5C3A21]/20 shadow-warm-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Atelier Header Bar */}
        <div className="px-6 py-4 border-b border-[#5C3A21]/10 bg-white/70 backdrop-blur-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#5C3A21] text-[#FAF8F5] flex items-center justify-center shadow-warm">
              <Sparkles className="w-5 h-5 text-[#E6CE98]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-[#24140E]">
                  Likha Atelier Concierge
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                  6 Agents Active
                </span>
              </div>
              <p className="text-[11px] text-[#6E5D53] font-serif italic">
                A2A Multi-Agent Architecture · Product Discovery, Orders, Pricing & Reviews
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playWoodThud();
              onClose();
            }}
            className="p-2 rounded-full text-[#6E5D53] hover:text-[#24140E] hover:bg-[#F2ECE4] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation: Multi-Agent AI vs Private Appointment */}
        <div className="flex border-b border-[#5C3A21]/10 bg-[#F4EFE6]/60 text-xs font-semibold px-6 pt-2">
          <button
            onClick={() => {
              sound.playBrassClick();
              setActiveTab('agent');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all ${
              activeTab === 'agent'
                ? 'border-[#5C3A21] text-[#5C3A21] bg-[#FAF8F5] rounded-t-xl'
                : 'border-transparent text-[#7D6B60] hover:text-[#24140E]'
            }`}
          >
            <Bot className="w-4 h-4 text-[#C4975D]" />
            AI Multi-Agent Concierge
          </button>

          <button
            onClick={() => {
              sound.playBrassClick();
              setActiveTab('appointment');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all ${
              activeTab === 'appointment'
                ? 'border-[#5C3A21] text-[#5C3A21] bg-[#FAF8F5] rounded-t-xl'
                : 'border-transparent text-[#7D6B60] hover:text-[#24140E]'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#8C5A3C]" />
            Private Salon Suite Booking
          </button>
        </div>

        {/* MAIN BODY: AI MULTI-AGENT CHAT */}
        {activeTab === 'agent' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#FAF8F5]">
            
            {/* Scrollable Message History */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender Tag */}
                  {msg.sender === 'assistant' && (
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-semibold text-[#8C5A3C] uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-[#C4975D]" />
                      <span>{msg.agent}</span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#5C3A21] text-white rounded-br-none shadow-warm'
                        : 'bg-white border border-[#5C3A21]/15 text-[#24140E] rounded-bl-none shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-line">
                      {msg.text.split('**').map((chunk, i) =>
                        i % 2 === 1 ? <strong key={i} className="font-semibold text-[#5C3A21]">{chunk}</strong> : chunk
                      )}
                    </div>

                    {/* Agent Activity Timeline Disclosure (A2A Protocol Trace) */}
                    {msg.steps && msg.steps.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-[#5C3A21]/10">
                        <button
                          onClick={() =>
                            setExpandedTraceIndex(expandedTraceIndex === idx ? null : idx)
                          }
                          className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-[#8C5A3C] hover:text-[#5C3A21] transition-colors"
                        >
                          {expandedTraceIndex === idx ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                          <span>A2A Protocol Trace ({msg.steps.length} steps)</span>
                        </button>

                        {expandedTraceIndex === idx && (
                          <div className="mt-2 space-y-1.5 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#5C3A21]/10 text-[10px] font-mono text-[#5C3A21]">
                            {msg.steps.map((st, sIdx) => (
                              <div key={sIdx} className="flex items-start gap-1.5">
                                <span className="text-[#C4975D] font-bold">↳</span>
                                <div>
                                  <span className="font-bold text-[#24140E]">{st.agent}</span>
                                  <span className="text-[#8C5A3C]"> :: </span>
                                  <span className="bg-amber-100 text-amber-900 px-1 rounded">{st.tool}</span>
                                  <span className="text-gray-500 ml-1">({st.durationMs}ms)</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* GENERATIVE UI COMPONENT RENDERING */}
                    {msg.generativeUI && (
                      <div className="mt-3 pt-2 border-t border-[#5C3A21]/10">
                        
                        {/* 1. PRODUCT DISCOVERY CARDS */}
                        {msg.generativeUI.type === 'PRODUCT_CARDS' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                            {msg.generativeUI.products.map((prod) => (
                              <div
                                key={prod.id}
                                className="bg-[#FAF8F5] border border-[#5C3A21]/20 rounded-xl p-2.5 flex flex-col justify-between hover:border-[#5C3A21] transition-all shadow-sm"
                              >
                                <div>
                                  <div className="relative aspect-video rounded-lg overflow-hidden mb-2 bg-[#F2ECE4]">
                                    <img
                                      src={prod.image}
                                      alt={prod.name}
                                      className="w-full h-full object-cover"
                                    />
                                    <span className="absolute top-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#24140E]/80 text-white backdrop-blur-sm">
                                      {prod.collection || 'Heirloom'}
                                    </span>
                                  </div>
                                  <h4 className="font-serif font-bold text-xs text-[#24140E] line-clamp-1">
                                    {prod.name}
                                  </h4>
                                  <p className="text-[10px] text-[#6E5D53] italic">
                                    {prod.region} · {prod.artisanMaster || 'Master Artisan'}
                                  </p>
                                  <div className="font-serif font-bold text-sm text-[#5C3A21] mt-1">
                                    ₱{prod.pricePHP.toLocaleString()}
                                  </div>
                                </div>

                                <div className="flex gap-1.5 mt-2.5">
                                  <button
                                    onClick={() => {
                                      sound.playBrassClick();
                                      onSelectProduct(prod);
                                      onClose();
                                    }}
                                    className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-[#5C3A21]/30 text-[10px] font-bold text-[#5C3A21] hover:bg-[#5C3A21] hover:text-white transition-all flex items-center justify-center gap-1"
                                  >
                                    <Eye className="w-3 h-3" />
                                    View in 3D
                                  </button>
                                  <button
                                    onClick={() => {
                                      sound.playSuccessChime();
                                      onAddToCart(prod, prod.pricePHP, 'PHP');
                                    }}
                                    className="flex-1 py-1.5 px-2 rounded-lg bg-[#5C3A21] text-[10px] font-bold text-white hover:bg-[#432916] transition-all flex items-center justify-center gap-1 shadow-sm"
                                  >
                                    <ShoppingBag className="w-3 h-3" />
                                    Add to Bayong
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 2. ORDER TRACKER MILESTONE STEPPER */}
                        {msg.generativeUI.type === 'ORDER_TRACKER' && msg.generativeUI.order && (
                          <div className="bg-[#FAF8F5] border border-[#5C3A21]/20 rounded-2xl p-3.5 mt-2">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C5A3C]">
                                  Artisan Vault Order
                                </span>
                                <h4 className="font-serif font-bold text-sm text-[#24140E]">
                                  {msg.generativeUI.order.orderNumber}
                                </h4>
                              </div>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                {msg.generativeUI.order.status}
                              </span>
                            </div>

                            <p className="text-[11px] text-[#6E5D53] mb-3">
                              Piece: <strong className="text-[#24140E]">{msg.generativeUI.order.productName}</strong>
                              <br />
                              Estimated Arrival: <strong className="text-emerald-700">{msg.generativeUI.order.estimatedDelivery}</strong>
                            </p>

                            {/* Milestone Stepper */}
                            <div className="space-y-2 mt-2 pt-2 border-t border-[#5C3A21]/10">
                              {msg.generativeUI.order.milestones?.map((ms, mIdx) => (
                                <div key={mIdx} className="flex items-start gap-2.5 text-[10px]">
                                  <div
                                    className={`w-4 h-4 rounded-full flex items-center justify-center mt-0.5 shrink-0 ${
                                      ms.completed
                                        ? 'bg-emerald-600 text-white'
                                        : ms.current
                                        ? 'bg-amber-500 text-white animate-pulse'
                                        : 'bg-gray-200 text-gray-400'
                                    }`}
                                  >
                                    {ms.completed ? <Check className="w-2.5 h-2.5" /> : '•'}
                                  </div>
                                  <div className="flex-1">
                                    <div className={`font-semibold ${ms.completed ? 'text-[#24140E]' : 'text-gray-500'}`}>
                                      {ms.label}
                                    </div>
                                    <div className="text-[9px] text-[#8C5A3C]">{ms.date}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 3. PROMOTIONS & VOUCHER CARDS */}
                        {msg.generativeUI.type === 'PROMOTIONS' && (
                          <div className="space-y-2 mt-2">
                            {msg.generativeUI.promotions.map((promo) => (
                              <div
                                key={promo.code}
                                className="bg-[#FAF8F5] border border-amber-300/60 rounded-xl p-3 flex items-center justify-between shadow-sm"
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                                      {promo.code}
                                    </span>
                                    <span className="text-[10px] font-bold text-emerald-700">
                                      {promo.discount}
                                    </span>
                                  </div>
                                  <h5 className="font-semibold text-[11px] text-[#24140E] mt-1">
                                    {promo.title}
                                  </h5>
                                  <p className="text-[10px] text-[#6E5D53]">
                                    {promo.description}
                                  </p>
                                </div>

                                <button
                                  onClick={() => copyCouponCode(promo.code)}
                                  className="py-1.5 px-3 rounded-lg bg-[#5C3A21] text-white text-[10px] font-bold hover:bg-[#432916] transition-all flex items-center gap-1"
                                >
                                  {copiedCode === promo.code ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-300" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      Apply Code
                                    </>
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 4. REVIEW & SENTIMENT CARD */}
                        {msg.generativeUI.type === 'REVIEW_SENTIMENT' && msg.generativeUI.data && (
                          <div className="bg-[#FAF8F5] border border-[#5C3A21]/20 rounded-xl p-3.5 mt-2">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                <span className="font-serif font-bold text-sm text-[#24140E]">
                                  {msg.generativeUI.data.rating} / 5.0
                                </span>
                                <span className="text-[10px] text-[#6E5D53]">
                                  ({msg.generativeUI.data.totalReviews} verified patrons)
                                </span>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {msg.generativeUI.data.sentimentScore}% Positive Sentiment
                              </span>
                            </div>

                            {/* Aspect Breakdown Gauges */}
                            <div className="space-y-1.5 my-2.5">
                              {msg.generativeUI.data.aspects.map((asp, aIdx) => (
                                <div key={aIdx} className="text-[10px]">
                                  <div className="flex justify-between text-[#24140E] font-medium mb-0.5">
                                    <span>{asp.label}</span>
                                    <span className="font-bold text-[#5C3A21]">{asp.score}% · {asp.sentiment}</span>
                                  </div>
                                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-[#5C3A21] rounded-full transition-all"
                                      style={{ width: `${asp.score}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Featured Testimonial */}
                            <div className="bg-white p-2.5 rounded-lg border border-[#5C3A21]/10 text-[10px] italic text-[#5C3A21] mt-2">
                              "{msg.generativeUI.data.featuredTestimonial.review}"
                              <div className="mt-1 font-semibold not-italic text-[#24140E] text-[9px] flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                {msg.generativeUI.data.featuredTestimonial.author} · {msg.generativeUI.data.featuredTestimonial.tier}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 5. INVENTORY & FULFILLMENT ALERT */}
                        {msg.generativeUI.type === 'INVENTORY_ALERT' && msg.generativeUI.data && (
                          <div className="bg-[#FAF8F5] border border-amber-300 rounded-xl p-3.5 mt-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] uppercase font-bold text-[#8C5A3C]">
                                Live Batch Allocation
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                {msg.generativeUI.data.batchRemaining} Units Left in Batch
                              </span>
                            </div>

                            <h5 className="font-serif font-bold text-xs text-[#24140E]">
                              {msg.generativeUI.data.productName}
                            </h5>
                            <p className="text-[10px] text-[#6E5D53] mt-1">
                              Origin: <strong>{msg.generativeUI.data.region}</strong> · Cooperative: <strong>{msg.generativeUI.data.artisanCooperative}</strong>
                              <br />
                              Lead Time: <strong>{msg.generativeUI.data.leadTime}</strong>
                            </p>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isProcessing && (
                <div className="flex items-center gap-2 text-xs text-[#8C5A3C] italic px-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#C4975D] animate-spin" />
                  <span>Nagsasagawa ng multi-agent A2A routing at pagsusuri...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Prompt Chips */}
            <div className="px-4 py-2 bg-[#F4EFE6]/60 border-t border-[#5C3A21]/10 flex gap-1.5 overflow-x-auto text-[10px]">
              <button
                onClick={() => handleSendMessage('Ipakita ang mga pambihirang perlas sa Palawan')}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-[#5C3A21]/20 hover:border-[#5C3A21] text-[#5C3A21] font-medium transition-all"
              >
                ✨ Palawan Golden Pearls
              </button>
              <button
                onClick={() => handleSendMessage('Track my order LKH-2026-1001')}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-[#5C3A21]/20 hover:border-[#5C3A21] text-[#5C3A21] font-medium transition-all"
              >
                📦 Track #LKH-2026-1001
              </button>
              <button
                onClick={() => handleSendMessage('May diskwento ba o active promotion code?')}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-[#5C3A21]/20 hover:border-[#5C3A21] text-[#5C3A21] font-medium transition-all"
              >
                🏷️ Active Promos
              </button>
              <button
                onClick={() => handleSendMessage('Suriin ang reviews at sentiment para sa Solihiya box')}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-[#5C3A21]/20 hover:border-[#5C3A21] text-[#5C3A21] font-medium transition-all"
              >
                ⭐ Solihiya Reviews
              </button>
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 sm:p-4 bg-white border-t border-[#5C3A21]/15 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Tanungin ang Konsiyerhe ukol sa obra, order, diskwento..."
                className="flex-1 px-4 py-2.5 bg-[#FAF8F5] border border-[#5C3A21]/20 rounded-full text-xs text-[#24140E] placeholder-[#8C7A70] focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isProcessing}
                className="p-2.5 rounded-full bg-[#5C3A21] text-white hover:bg-[#432916] disabled:opacity-40 transition-all shadow-sm active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        )}

        {/* TAB 2: PRIVATE SALON SUITE APPOINTMENT */}
        {activeTab === 'appointment' && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#FAF8F5]">
            <div className="text-center mb-6">
              <h3 className="font-serif text-2xl font-semibold text-[#24140E]">
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
              <form onSubmit={handleAppointmentSubmit} className="space-y-4 text-xs">
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
        )}

      </div>
    </div>
  );
}
