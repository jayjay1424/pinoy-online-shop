import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Search,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Upload,
  Image as ImageIcon,
  Box,
  CheckCircle2,
  AlertCircle,
  Download,
  Layers,
  Sparkles,
  ExternalLink,
  ArrowLeft,
  RefreshCw,
  Sliders,
  DollarSign,
  Palette,
  Package,
  Award,
  Globe,
  Clock,
  Compass,
} from 'lucide-react';
import { CURRENCY_RATES } from '../data/products';
import { sound } from '../utils/sound';

const MASTER_PIN = 'LIKHA2026';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_SEC = 180; // 3 minutes lockout on brute-force

const COLLECTIONS = [
  'Habi & Dahon',
  'Perlas & Alahas',
  'Kasuotan & Sutla',
  'Tahanan & Luho',
];

const ARCHETYPES = [
  { id: 'bayong', label: 'Bayong Palm Leaf Tote' },
  { id: 'terno', label: 'Modern Sculptural Terno' },
  { id: 'pearl', label: 'Palawan Golden Pearl' },
  { id: 'solihiya', label: 'Solihiya Kamagong Box' },
  { id: 'luminary', label: 'Capiz Shell Luminary' },
  { id: 'watch', label: 'Damascus Kamagong Watch' },
  { id: 'ring', label: 'Butuan Granulated Gold Ring' },
  { id: 'salakot', label: 'Shaved Bamboo Salakot' },
  { id: 'robe', label: 'Batek Sacred Silk Robe' },
  { id: 'burnay', label: 'Vigan Burnay Decanter' },
  { id: 'dalisay', label: 'Classic Formal Barong' },
  { id: 'creolla', label: 'Creolla Hoop Earrings' },
  { id: 'vault', label: 'Carabao Horn Chrono Vault' },
];

export function CuratorStudioPage({
  products,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onNavigateToStorefront,
  activeCurrency = 'PHP',
}) {
  // Authentication & Brute-force State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('likha_curator_auth') === 'verified';
    } catch {
      return false;
    }
  });

  const [pinInput, setPinInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pinError, setPinError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(() => {
    try {
      return parseInt(sessionStorage.getItem('likha_curator_fails') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Tabs & Views
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'editor' | 'system'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCollection, setFilterCollection] = useState('All');
  const [filterStock, setFilterStock] = useState('All');

  // Editor Form State
  const [editingId, setEditingId] = useState(null); // null = new, string = existing
  const [formData, setFormData] = useState(getInitialFormData());
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for uploads
  const imageFileInputRef = useRef(null);
  const glbFileInputRef = useRef(null);
  const backupFileInputRef = useRef(null);

  // Lockout timer effect
  useEffect(() => {
    if (lockoutRemaining > 0) {
      const timer = setTimeout(() => setLockoutRemaining((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutRemaining]);

  function getInitialFormData() {
    return {
      name: '',
      subtitle: '',
      collection: 'Habi & Dahon',
      tagline: '',
      pricePHP: 45000,
      edition: 'Edisyon Limitado — No. 01 ng 20',
      batchRemaining: 3,
      stockStatus: 'available', // 'available' | 'low_stock' | 'commission' | 'archived'
      leadTime: 'Handcrafted in 18 days',
      region: 'Lumban, Laguna',
      artisanCooperative: 'Master Heritage Artisans Collective',
      artisanMaster: 'Master Artisan',
      fairTradePercentage: 48,
      has3DModel: true,
      modelType: 'bayong',
      modelGlbUrl: '',
      image: '',
      description: '',
      specs: [
        { label: 'Craft Technique', value: 'Traditional Philippine Handloom Weave' },
        { label: 'Materials', value: 'Sustainably Harvested Indigenous Fibers' },
      ],
      materials: [
        { id: 'variant-1', name: 'Natural Heritage Finish', hex: '#D8B781' },
      ],
    };
  }

  // Handle Authentication Attempt
  const handleUnlock = (e) => {
    e.preventDefault();

    if (lockoutRemaining > 0) {
      sound.playWoodThud();
      return;
    }

    if (pinInput.trim().toUpperCase() === MASTER_PIN) {
      sound.playSuccessChime();
      setIsAuthenticated(true);
      setPinError('');
      setFailedAttempts(0);
      try {
        sessionStorage.setItem('likha_curator_auth', 'verified');
        sessionStorage.removeItem('likha_curator_fails');
      } catch {}
    } else {
      sound.playWoodThud();
      const nextFails = failedAttempts + 1;
      setFailedAttempts(nextFails);
      try {
        sessionStorage.setItem('likha_curator_fails', nextFails.toString());
      } catch {}

      if (nextFails >= MAX_ATTEMPTS) {
        setLockoutRemaining(LOCKOUT_DURATION_SEC);
        setPinError(`Security Protocol: Maximum attempts exceeded. Vault locked for ${LOCKOUT_DURATION_SEC} seconds.`);
      } else {
        setPinError(`Invalid Credentials. ${MAX_ATTEMPTS - nextFails} attempt(s) remaining before security lockdown.`);
      }
      setPinInput('');
    }
  };

  // Lock Out / Sign Out
  const handleLockSession = () => {
    sound.playBrassClick();
    setIsAuthenticated(false);
    setPinInput('');
    setPinError('');
    try {
      sessionStorage.removeItem('likha_curator_auth');
    } catch {}
  };

  // Switch to Create Mode
  const handleStartCreate = () => {
    sound.playBrassClick();
    setEditingId(null);
    setFormData(getInitialFormData());
    setFeedbackMsg('');
    setActiveTab('editor');
  };

  // Switch to Edit Mode
  const handleStartEdit = (prod) => {
    sound.playBrassClick();
    setEditingId(prod.id);
    setFormData({
      name: prod.name || '',
      subtitle: prod.subtitle || '',
      collection: prod.collection || 'Habi & Dahon',
      tagline: prod.tagline || '',
      pricePHP: prod.pricePHP || (prod.price ? prod.price.PHP : 45000) || 45000,
      edition: prod.edition || '',
      batchRemaining: prod.batchRemaining ?? 3,
      stockStatus: prod.stockStatus || (prod.batchRemaining === 0 ? 'archived' : 'available'),
      leadTime: prod.leadTime || 'Handcrafted in 18 days',
      region: prod.region || 'Luzon',
      artisanCooperative: prod.artisanCooperative || 'Artisan Cooperative',
      artisanMaster: prod.artisanMaster || 'Master Artisan',
      fairTradePercentage: prod.fairTradePercentage || 45,
      has3DModel: prod.has3DModel ?? (!!prod.modelType),
      modelType: prod.modelType || 'bayong',
      modelGlbUrl: prod.modelGlbUrl || '',
      image: prod.image || '',
      description: prod.description || '',
      specs: prod.specs && Array.isArray(prod.specs) ? [...prod.specs] : [
        { label: 'Craft Technique', value: 'Traditional Philippine Handloom Weave' },
      ],
      materials: prod.materials && Array.isArray(prod.materials) ? [...prod.materials] : [
        { id: 'variant-1', name: 'Natural Heritage Finish', hex: '#D8B781' },
      ],
    });
    setFeedbackMsg('');
    setActiveTab('editor');
  };

  // Duplicate as Template
  const handleDuplicate = (prod) => {
    sound.playBrassClick();
    setEditingId(null);
    setFormData({
      name: `${prod.name} (Atelier Study)`,
      subtitle: prod.subtitle || '',
      collection: prod.collection || 'Habi & Dahon',
      tagline: prod.tagline || '',
      pricePHP: prod.pricePHP || (prod.price ? prod.price.PHP : 45000),
      edition: 'Edisyon Limitado — Prototype Series',
      batchRemaining: 2,
      stockStatus: 'available',
      leadTime: prod.leadTime || 'Handcrafted in 21 days',
      region: prod.region || 'Luzon',
      artisanCooperative: prod.artisanCooperative || 'Artisan Cooperative',
      artisanMaster: prod.artisanMaster || 'Master Artisan',
      fairTradePercentage: prod.fairTradePercentage || 45,
      has3DModel: prod.has3DModel ?? (!!prod.modelType),
      modelType: prod.modelType || 'bayong',
      modelGlbUrl: prod.modelGlbUrl || '',
      image: prod.image || '',
      description: prod.description || '',
      specs: prod.specs ? JSON.parse(JSON.stringify(prod.specs)) : [],
      materials: prod.materials ? JSON.parse(JSON.stringify(prod.materials)) : [],
    });
    setFeedbackMsg('Cloned item into a new masterwork draft. Update details and save.');
    setActiveTab('editor');
  };

  // Delete product confirmation
  const handleDelete = (id, name) => {
    if (window.confirm(`Are you certain you want to permanently decommission "${name}" from the live catalog?`)) {
      sound.playWoodThud();
      onDeleteProduct(id);
      setFeedbackMsg(`"${name}" was decommissioned successfully.`);
    }
  };

  // Image Upload handler (PNG/JPG/WebP)
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP, SVG).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('Image file size exceeds 8MB. Please choose an optimized web image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target.result;
      setFormData((prev) => ({ ...prev, image: base64Data }));
      sound.playBrassClick();
    };
    reader.readAsDataURL(file);
  };

  // 3D GLB upload handler
  const handleGlbFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.glb') && !file.name.toLowerCase().endsWith('.gltf')) {
      alert('Please upload a 3D GLB or GLTF asset (.glb / .gltf).');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      modelGlbUrl: objectUrl,
      has3DModel: true,
    }));
    sound.playBrassClick();
  };

  // Handle Form Submission
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please provide a name for this masterwork.');
      return;
    }

    setIsSubmitting(true);
    sound.playBrassClick();

    const pricePHP = parseFloat(formData.pricePHP) || 45000;
    const productPayload = {
      id: editingId || `likha-${Date.now()}-${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20)}`,
      name: formData.name.trim(),
      subtitle: formData.subtitle.trim(),
      collection: formData.collection,
      tagline: formData.tagline.trim(),
      pricePHP: pricePHP,
      price: {
        PHP: pricePHP,
        USD: Math.round(pricePHP / CURRENCY_RATES.USD.rate),
        EUR: Math.round(pricePHP / CURRENCY_RATES.EUR.rate),
        GBP: Math.round(pricePHP / CURRENCY_RATES.GBP.rate),
        JPY: Math.round(pricePHP / CURRENCY_RATES.JPY.rate),
        SGD: Math.round(pricePHP / CURRENCY_RATES.SGD.rate),
        CHF: Math.round(pricePHP / CURRENCY_RATES.CHF.rate),
      },
      edition: formData.edition.trim(),
      batchRemaining: parseInt(formData.batchRemaining, 10) || 0,
      stockStatus: formData.stockStatus,
      leadTime: formData.leadTime.trim(),
      region: formData.region.trim(),
      artisanCooperative: formData.artisanCooperative.trim(),
      artisanMaster: formData.artisanMaster.trim(),
      fairTradePercentage: parseInt(formData.fairTradePercentage, 10) || 45,
      has3DModel: formData.has3DModel,
      modelType: formData.modelType,
      modelGlbUrl: formData.modelGlbUrl,
      image: formData.image,
      description: formData.description.trim(),
      specs: formData.specs.filter((s) => s.label && s.value),
      materials: formData.materials.filter((m) => m.name && m.hex),
    };

    if (editingId) {
      await onUpdateProduct(productPayload);
      setFeedbackMsg(`✓ Masterwork "${productPayload.name}" updated successfully.`);
    } else {
      await onCreateProduct(productPayload);
      setFeedbackMsg(`✓ New Masterwork "${productPayload.name}" commissioned to live catalog.`);
    }

    sound.playSuccessChime();
    setIsSubmitting(false);
    setActiveTab('inventory');
  };

  // Specs Rows handlers
  const handleAddSpec = () => {
    setFormData((prev) => ({
      ...prev,
      specs: [...prev.specs, { label: '', value: '' }],
    }));
  };

  const handleUpdateSpec = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.specs];
      updated[index][field] = value;
      return { ...prev, specs: updated };
    });
  };

  const handleRemoveSpec = (index) => {
    setFormData((prev) => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== index),
    }));
  };

  // Material Swatches handlers
  const handleAddMaterial = () => {
    setFormData((prev) => ({
      ...prev,
      materials: [
        ...prev.materials,
        { id: `mat-${Date.now()}`, name: 'Atelier Hue', hex: '#8C5A3C' },
      ],
    }));
  };

  const handleUpdateMaterial = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.materials];
      updated[index][field] = value;
      return { ...prev, materials: updated };
    });
  };

  const handleRemoveMaterial = (index) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  // Export JSON Catalog
  const handleExportJSON = () => {
    sound.playBrassClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `likha_catalog_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Catalog
  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported) && imported.length > 0) {
          if (window.confirm(`Importing this file will merge ${imported.length} items into the catalog. Proceed?`)) {
            imported.forEach((p) => {
              if (products.some((existing) => existing.id === p.id)) {
                onUpdateProduct(p);
              } else {
                onCreateProduct(p);
              }
            });
            sound.playSuccessChime();
            setFeedbackMsg(`Successfully imported ${imported.length} pieces.`);
          }
        } else {
          alert('Invalid catalog format. Must be an array of product objects.');
        }
      } catch (err) {
        alert('Failed to parse JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Filter products for Inventory view
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.subtitle && p.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.region && p.region.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.artisanCooperative && p.artisanCooperative.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCollection = filterCollection === 'All' || p.collection === filterCollection;
    const matchStock =
      filterStock === 'All' ||
      (filterStock === 'available' && p.stockStatus !== 'archived' && (p.batchRemaining ?? 1) > 0) ||
      (filterStock === 'low_stock' && (p.batchRemaining ?? 1) > 0 && (p.batchRemaining ?? 1) <= 3) ||
      (filterStock === 'commission' && p.stockStatus === 'commission') ||
      (filterStock === 'archived' && (p.stockStatus === 'archived' || p.batchRemaining === 0));

    return matchSearch && matchCollection && matchStock;
  });

  // ==========================================
  // VIEW A: High-Security Vault Unlock Screen
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1A0E08] text-[#FAF8F5] flex flex-col justify-between selection:bg-[#C4975D] selection:text-[#24140E]">
        {/* Subtle Top Status Header */}
        <header className="px-6 py-4 border-b border-[#5C3A21]/40 flex items-center justify-between text-xs tracking-widest uppercase font-mono text-[#8C5A3C]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-[#C4975D]">Curatorial Console</span>
            <span>•</span>
            <span className="text-[#EAD7B2]">Secured Route</span>
          </div>
          <button
            onClick={onNavigateToStorefront}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-[#C4975D]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </button>
        </header>

        {/* Center Security Lockbox */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#24140E] border border-[#C4975D]/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
            {/* Ambient Gold Radial Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#C4975D]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#8C5A3C]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Crest & Title */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-[#1A0E08] border border-[#C4975D]/50 flex items-center justify-center mx-auto mb-4 shadow-inner text-[#C4975D]">
                <Shield className="w-8 h-8" />
              </div>
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#C4975D] font-mono block mb-1">
                Restricted Atelier System
              </span>
              <h1 className="font-serif text-2xl font-bold tracking-wider text-[#FAF8F5]">
                Curator Vault Access
              </h1>
              <p className="text-xs text-[#EAD7B2]/70 mt-1.5 leading-relaxed font-sans">
                Authentication required to commission pieces, alter 3D models, manage artisan provenance, and modify catalog inventory.
              </p>
            </div>

            {/* Error or Lockout Notice */}
            {pinError && (
              <div className="mb-6 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 animate-shake">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-tight">{pinError}</span>
              </div>
            )}

            {lockoutRemaining > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-200 text-center text-xs space-y-1">
                <Clock className="w-5 h-5 text-amber-400 mx-auto mb-1 animate-spin" style={{ animationDuration: '8s' }} />
                <p className="font-semibold uppercase tracking-wider">Access Suspended</p>
                <p className="font-mono text-sm font-bold text-amber-300">{lockoutRemaining}s</p>
              </div>
            )}

            {/* PIN Entry Form */}
            <form onSubmit={handleUnlock} className="space-y-5">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-[#EAD7B2] mb-2 flex items-center justify-between">
                  <span>Curator Passcode</span>
                  <span className="text-[9px] text-[#8C5A3C] lowercase capitalize">Authorized Staff</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={pinInput}
                    disabled={lockoutRemaining > 0}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      if (pinError) setPinError('');
                    }}
                    placeholder="••••••••"
                    autoFocus
                    className="w-full bg-[#1A0E08] border border-[#5C3A21] focus:border-[#C4975D] rounded-xl px-4 py-3.5 text-center text-lg font-mono tracking-[0.3em] text-[#FAF8F5] focus:outline-none transition-all placeholder:text-[#5C3A21]/50 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C5A3C] hover:text-[#C4975D] transition-colors p-1"
                    title={showPassword ? 'Mask passcode' : 'Show passcode'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={lockoutRemaining > 0 || !pinInput.trim()}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#C4975D] to-[#8C5A3C] hover:from-[#d8a86a] hover:to-[#9f6946] text-[#1A0E08] font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Verify & Enter Studio</span>
              </button>
            </form>

            {/* Bottom Security Footer */}
            <div className="mt-8 pt-5 border-t border-[#5C3A21]/30 flex items-center justify-between text-[10px] font-mono text-[#8C5A3C]">
              <span>Likha Atelier 2026</span>
              <span className="text-emerald-500/80 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                TLS 256-bit Encrypted
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-4 text-[10px] text-[#5C3A21] font-mono">
          Private Management Environment • Unauthorized Access Prohibited
        </footer>
      </div>
    );
  }

  // ==========================================
  // VIEW B: Full Authenticated Curator Studio
  // ==========================================
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#24140E] flex flex-col justify-between selection:bg-[#C4975D] selection:text-[#24140E]">
      
      {/* Top Studio Prestige Bar */}
      <header className="sticky top-0 z-40 bg-[#24140E] text-[#FAF8F5] border-b border-[#C4975D]/30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
          
          {/* Atelier Brandmark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1A0E08] border border-[#C4975D]/40 flex items-center justify-center text-[#C4975D] shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif tracking-[0.2em] text-base font-bold text-[#FAF8F5] uppercase">
                  Curator Studio
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#C4975D]/20 text-[#EAD7B2] border border-[#C4975D]/30 uppercase font-semibold">
                  Admin Portal
                </span>
              </div>
              <span className="text-[10px] tracking-wider text-[#8C5A3C] uppercase block">
                Likha Atelier • Manila / Genève
              </span>
            </div>
          </div>

          {/* Center Tabs Navigation */}
          <div className="hidden md:flex items-center gap-1 bg-[#1A0E08]/80 p-1 rounded-full border border-[#5C3A21]/50 text-xs">
            <button
              onClick={() => { sound.playBrassClick(); setActiveTab('inventory'); }}
              className={`px-4 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'inventory'
                  ? 'bg-[#5C3A21] text-white shadow-xs font-semibold'
                  : 'text-[#EAD7B2] hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-[#C4975D]" />
              <span>Catalog Inventory ({products.length})</span>
            </button>

            <button
              onClick={handleStartCreate}
              className={`px-4 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'editor' && !editingId
                  ? 'bg-[#5C3A21] text-white shadow-xs font-semibold'
                  : 'text-[#EAD7B2] hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-[#C4975D]" />
              <span>Commission New Piece</span>
            </button>

            <button
              onClick={() => { sound.playBrassClick(); setActiveTab('system'); }}
              className={`px-4 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'system'
                  ? 'bg-[#5C3A21] text-white shadow-xs font-semibold'
                  : 'text-[#EAD7B2] hover:text-white'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#C4975D]" />
              <span>Backup & System</span>
            </button>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-3">
            
            {/* Return to Customer Storefront */}
            <button
              onClick={onNavigateToStorefront}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#EAD7B2] hover:text-white bg-[#1A0E08] border border-[#5C3A21] hover:border-[#C4975D] transition-all shadow-xs"
              title="Open the customer boutique view"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#C4975D]" />
              <span className="hidden sm:inline">View Storefront</span>
            </button>

            {/* Lock / Logout Button */}
            <button
              onClick={handleLockSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-red-200 hover:text-white bg-red-950/40 hover:bg-red-900 border border-red-800/40 transition-all shadow-xs"
              title="Lock Curator Studio session"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock Session</span>
            </button>

          </div>

        </div>

        {/* Mobile Navigation Tabs (visible on small screens) */}
        <div className="md:hidden px-4 py-2 border-t border-[#5C3A21]/30 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1 rounded-full whitespace-nowrap ${
              activeTab === 'inventory' ? 'bg-[#5C3A21] text-white font-semibold' : 'text-[#EAD7B2]'
            }`}
          >
            Inventory ({products.length})
          </button>
          <button
            onClick={handleStartCreate}
            className={`px-3 py-1 rounded-full whitespace-nowrap ${
              activeTab === 'editor' ? 'bg-[#5C3A21] text-white font-semibold' : 'text-[#EAD7B2]'
            }`}
          >
            + New Piece
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-3 py-1 rounded-full whitespace-nowrap ${
              activeTab === 'system' ? 'bg-[#5C3A21] text-white font-semibold' : 'text-[#EAD7B2]'
            }`}
          >
            Backup & Sync
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8">
        
        {/* Dynamic Status / Feedback Banner */}
        {feedbackMsg && (
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-medium flex items-center justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
            <button
              onClick={() => setFeedbackMsg('')}
              className="text-emerald-700 hover:text-emerald-950 font-bold px-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* ========================================================
            TAB 1: INVENTORY & MASTERWORKS LIST
            ======================================================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Top Toolbar: Search, Filters, Add New */}
            <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-[#5C3A21]/15 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C5A3C]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by piece title, artisan cooperative, or province..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#5C3A21]/20 bg-white/70 text-xs sm:text-sm text-[#24140E] placeholder:text-[#8C5A3C]/60 focus:outline-none focus:border-[#C4975D]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C5A3C] hover:text-[#24140E]"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* New Piece Button */}
                <button
                  onClick={handleStartCreate}
                  className="px-5 py-2.5 rounded-xl bg-[#5C3A21] hover:bg-[#432916] text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4 text-[#C4975D]" />
                  <span>Commission New Piece</span>
                </button>

              </div>

              {/* Collection & Stock Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#5C3A21]/10 text-xs">
                
                {/* Collection Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-[#8C5A3C] mr-1">Collection:</span>
                  {['All', ...COLLECTIONS].map((col) => (
                    <button
                      key={col}
                      onClick={() => setFilterCollection(col)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        filterCollection === col
                          ? 'bg-[#24140E] text-[#FAF8F5] shadow-xs'
                          : 'bg-white/60 text-[#5C3A21] hover:bg-white border border-[#5C3A21]/10'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>

                {/* Stock Status Filter */}
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#8C5A3C]">Stock Status:</span>
                  <select
                    value={filterStock}
                    onChange={(e) => setFilterStock(e.target.value)}
                    className="bg-white/80 border border-[#5C3A21]/20 rounded-lg px-2.5 py-1 text-xs text-[#24140E] focus:outline-none focus:border-[#C4975D]"
                  >
                    <option value="All">All Stock Tiers</option>
                    <option value="available">Available in Stock</option>
                    <option value="low_stock">Low Stock (≤ 3 remaining)</option>
                    <option value="commission">Bespoke Commission Only</option>
                    <option value="archived">Archived / Sold Out</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Masterworks Inventory Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p) => {
                const isSoldOut = p.stockStatus === 'archived' || p.batchRemaining === 0;
                const isCommission = p.stockStatus === 'commission';
                const isLowStock = !isSoldOut && !isCommission && p.batchRemaining <= 2;

                return (
                  <div
                    key={p.id}
                    className="glass-panel rounded-3xl p-5 border border-[#5C3A21]/15 hover:border-[#5C3A21]/30 transition-all shadow-sm flex flex-col justify-between group hover:shadow-warm relative bg-white/70"
                  >
                    {/* Top Row: Collection badge & Stock Status */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-mono tracking-wider uppercase font-semibold text-[#8C5A3C] bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#5C3A21]/15">
                          {p.collection}
                        </span>

                        <span
                          className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border ${
                            isSoldOut
                              ? 'bg-stone-100 text-stone-600 border-stone-300'
                              : isCommission
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : isLowStock
                              ? 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {isSoldOut
                            ? 'Sold Out'
                            : isCommission
                            ? 'Commission'
                            : isLowStock
                            ? `Low Stock (${p.batchRemaining})`
                            : `In Stock (${p.batchRemaining || 3})`}
                        </span>
                      </div>

                      {/* Image Preview Thumbnail */}
                      <div className="w-full h-44 rounded-2xl overflow-hidden mb-3 bg-[#FAF8F5] border border-[#5C3A21]/15 relative group-hover:border-[#5C3A21]/30 transition-all flex items-center justify-center">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-[#8C5A3C]/60 text-xs">
                            <Box className="w-10 h-10 mb-1 opacity-40 text-[#5C3A21]" />
                            <span>Procedural 3D Archetype</span>
                            <span className="text-[10px] font-mono text-[#C4975D] uppercase mt-0.5">
                              {p.modelType || '3D Asset'}
                            </span>
                          </div>
                        )}

                        {/* 3D Model Badge */}
                        {(p.has3DModel || p.modelGlbUrl) && (
                          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#24140E]/80 backdrop-blur-md text-[9px] font-mono text-[#EAD7B2] border border-[#C4975D]/40 flex items-center gap-1 shadow-xs">
                            <Box className="w-3 h-3 text-[#C4975D]" />
                            <span>Interactive 3D</span>
                          </div>
                        )}
                      </div>

                      {/* Product Name & Subtitle */}
                      <h3 className="font-serif text-lg font-bold text-[#24140E] group-hover:text-[#5C3A21] transition-colors line-clamp-1">
                        {p.name}
                      </h3>
                      <p className="text-xs text-[#8C5A3C] font-serif italic mb-2 line-clamp-1">
                        {p.subtitle || p.edition}
                      </p>

                      {/* Provenance Metadata */}
                      <div className="bg-[#FAF8F5] rounded-xl p-2.5 border border-[#5C3A21]/10 text-[11px] space-y-1 mb-3">
                        <div className="flex items-center justify-between text-[#5C3A21]">
                          <span className="text-[#8C5A3C]">Region:</span>
                          <span className="font-semibold">{p.region || 'Philippines'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[#5C3A21]">
                          <span className="text-[#8C5A3C]">Cooperative:</span>
                          <span className="font-semibold truncate max-w-[170px]">{p.artisanCooperative || 'Heritage Masters'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[#5C3A21]">
                          <span className="text-[#8C5A3C]">Fair-Trade Artisan Cut:</span>
                          <span className="font-bold text-amber-800">{p.fairTradePercentage || 45}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-[#5C3A21]/10 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-[#8C5A3C] uppercase tracking-wider block font-mono">
                          Price (PHP)
                        </span>
                        <span className="font-mono text-sm font-bold text-[#24140E]">
                          ₱ {(p.pricePHP || (p.price && p.price.PHP) || 0).toLocaleString()}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDuplicate(p)}
                          className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#5C3A21] transition-colors"
                          title="Clone as new template"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleStartEdit(p)}
                          className="px-3 py-1.5 rounded-lg bg-[#5C3A21] hover:bg-[#432916] text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                          title="Edit Masterwork specifications"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#C4975D]" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                          title="Decommission piece"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16 bg-white/50 rounded-3xl border border-dashed border-[#5C3A21]/20">
                <Box className="w-12 h-12 text-[#8C5A3C]/40 mx-auto mb-3" />
                <h4 className="font-serif text-lg font-bold text-[#24140E]">No Pieces Matched Your Search</h4>
                <p className="text-xs text-[#8C5A3C] mt-1 max-w-sm mx-auto">
                  Try adjusting the collection tab or search keywords, or commission a brand new masterwork.
                </p>
                <button
                  onClick={handleStartCreate}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#5C3A21] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C4975D]" />
                  <span>Create Masterwork</span>
                </button>
              </div>
            )}

          </div>
        )}

        {/* ========================================================
            TAB 2: MASTERWORK EDITOR (CREATE / EDIT)
            ======================================================== */}
        {activeTab === 'editor' && (
          <div className="animate-fadeIn max-w-4xl mx-auto space-y-6">
            
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="text-xs text-[#8C5A3C] hover:text-[#24140E] flex items-center gap-1 mb-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Inventory</span>
                </button>
                <h2 className="font-serif text-2xl font-bold text-[#24140E]">
                  {editingId ? `Edit Masterwork: ${formData.name}` : 'Commission New Masterwork Piece'}
                </h2>
                <p className="text-xs text-[#8C5A3C]">
                  Configure specs, upload high-resolution images, bind 3D models, and certify artisan provenance.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('inventory')}
                  className="px-4 py-2 rounded-xl border border-[#5C3A21]/20 text-xs font-semibold text-[#5C3A21] hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitForm}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#5C3A21] hover:bg-[#432916] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#C4975D]" />
                  <span>{isSubmitting ? 'Saving...' : editingId ? 'Update Masterwork' : 'Commission Piece'}</span>
                </button>
              </div>
            </div>

            {/* The Main Form */}
            <form onSubmit={handleSubmitForm} className="space-y-6">
              
              {/* Section 1: Core Nomenclature & Valuation */}
              <div className="glass-panel rounded-3xl p-6 border border-[#5C3A21]/15 shadow-sm space-y-4 bg-white/70">
                <h3 className="font-serif text-base font-bold text-[#24140E] flex items-center gap-2 border-b border-[#5C3A21]/10 pb-2">
                  <Award className="w-4 h-4 text-[#C4975D]" />
                  <span>1. Title, Collection & Valuation</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#5C3A21] mb-1">
                      Piece Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Bayong Royale No. 04"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#5C3A21]/20 text-xs focus:outline-none focus:border-[#C4975D] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5C3A21] mb-1">
                      Subtitle / Distinction
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="e.g. Handwoven Buri Palm & Solid Brass"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#5C3A21]/20 text-xs focus:outline-none focus:border-[#C4975D] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5C3A21] mb-1">
                      Heritage Collection
                    </label>
                    <select
                      value={formData.collection}
                      onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#5C3A21]/20 text-xs focus:outline-none focus:border-[#C4975D] bg-white"
                    >
                      {COLLECTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5C3A21] mb-1">
                      Valuation in Philippine Peso (PHP) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-[#8C5A3C]">₱</span>
                      <input
                        type="number"
                        min="1"
                        step="100"
                        required
                        value={formData.pricePHP}
                        onChange={(e) => setFormData({ ...formData, pricePHP: e.target.value })}
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#5C3A21]/20 text-xs font-mono font-bold focus:outline-none focus:border-[#C4975D] bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#5C3A21] mb-1">
                      Stock Availability Status
                    </label>
                    <select
                      value={formData.stockStatus}
                      onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#5C3A21]/20 text-xs bg-white focus:outline-none focus:border-[#C4975D]"
                    >
                      <option value="available">Available in Stock</option>
                      <option value="low_stock">Low Stock Alert</option>
                      <option value="commission">Bespoke Commission Only</option>
                      <option value="archived">Archived / Sold Out</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5C3A21] mb-1">
                      Remaining Atelier Units
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.batchRemaining}
                      onChange={(e) => setFormData({ ...formData, batchRemaining: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#5C3A21]/20 text-xs font-mono bg-white focus:outline-none focus:border-[#C4975D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5C3A21] mb-1">
                      Edition Inscription
                    </label>
                    <input
                      type="text"
                      value={formData.edition}
                      onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                      placeholder="e.g. Edisyon Limitado — No. 04 of 20"
                      className="w-full px-3 py-2 rounded-xl border border-[#5C3A21]/20 text-xs bg-white focus:outline-none focus:border-[#C4975D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C3A21] mb-1">
                    Heritage Narrative & Lore
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the cultural lineage, material preparation, and artisan legacy..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#5C3A21]/20 text-xs focus:outline-none focus:border-[#C4975D] bg-white resize-none"
                  />
                </div>
              </div>

              {/* Section 2: Media, Visuals & 3D Interactive Assets */}
              <div className="glass-panel rounded-3xl p-6 border border-[#5C3A21]/15 shadow-sm space-y-4 bg-white/70">
                <h3 className="font-serif text-base font-bold text-[#24140E] flex items-center gap-2 border-b border-[#5C3A21]/10 pb-2">
                  <Box className="w-4 h-4 text-[#C4975D]" />
                  <span>2. Visual Images & 3D Model Configuration</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left: Image Upload & Preview */}
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-[#5C3A21]">
                      Visual Image (PNG, JPG, WebP)
                    </label>
                    
                    <div
                      onClick={() => imageFileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#5C3A21]/30 hover:border-[#C4975D] rounded-2xl p-4 text-center cursor-pointer transition-all bg-[#FAF8F5] relative group min-h-[160px] flex flex-col items-center justify-center"
                    >
                      {formData.image ? (
                        <div className="relative w-full h-36 rounded-xl overflow-hidden">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                            Change Image
                          </div>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 text-[#8C5A3C] mb-2 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-semibold text-[#5C3A21]">Click or Drag to Upload Image</span>
                          <span className="text-[10px] text-[#8C5A3C] mt-0.5">Supports PNG, JPG, WebP up to 8MB</span>
                        </>
                      )}
                      <input
                        ref={imageFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileChange}
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-[#8C5A3C] block mb-1">Or Direct Image URL:</span>
                      <input
                        type="url"
                        value={formData.image.startsWith('data:') ? '' : formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-2 rounded-xl border border-[#5C3A21]/20 text-xs bg-white focus:outline-none focus:border-[#C4975D]"
                      />
                    </div>
                  </div>

                  {/* Right: 3D Model Binding */}
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-[#5C3A21]">
                      3D Interactive Model (.glb) or Archetype
                    </label>

                    {/* GLB File Upload */}
                    <div
                      onClick={() => glbFileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#5C3A21]/30 hover:border-[#C4975D] rounded-2xl p-4 text-center cursor-pointer transition-all bg-[#FAF8F5] relative group min-h-[160px] flex flex-col items-center justify-center"
                    >
                      <Box className="w-8 h-8 text-[#C4975D] mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-[#5C3A21]">
                        {formData.modelGlbUrl ? 'Custom 3D Model Loaded' : 'Upload 3D Asset (.glb / .gltf)'}
                      </span>
                      <span className="text-[10px] text-[#8C5A3C] mt-0.5">
                        {formData.modelGlbUrl ? 'Click to replace GLB model file' : 'Drag & drop binary glTF model'}
                      </span>
                      <input
                        ref={glbFileInputRef}
                        type="file"
                        accept=".glb,.gltf"
                        className="hidden"
                        onChange={handleGlbFileChange}
                      />
                    </div>

                    {/* Archetype Selector */}
                    <div>
                      <span className="text-[11px] text-[#8C5A3C] block mb-1">Or Procedural 3D Archetype:</span>
                      <select
                        value={formData.modelType}
                        onChange={(e) => setFormData({ ...formData, modelType: e.target.value, has3DModel: true })}
                        className="w-full px-3 py-2 rounded-xl border border-[#5C3A21]/20 text-xs bg-white focus:outline-none focus:border-[#C4975D]"
                      >
                        {ARCHETYPES.map((arch) => (
                          <option key={arch.id} value={arch.id}>{arch.label}</option>
                        ))}
                      </select>
                    </div>

                  </div>

                </div>
              </div>

              {/* Section 3: Artisan Provenance & Fair Trade */}
              <div className="glass-panel rounded-3xl p-6 border border-[#5C3A21]/15 shadow-sm space-y-4 bg-white/70">
                <h3 className="font-serif text-base font-bold text-[#24140E] flex items-center gap-2 border-b border-[#5C3A21]/10 pb-2">
                  <Compass className="w-4 h-4 text-[#C4975D]" />
                  <span>3. Artisan Provenance & Fair Trade</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#5C3A21] mb-1">
                      Region / Province of Origin
                    </label>
                    <input
                      type="text"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      placeholder="e.g. Lumban, Laguna"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#5C3A21]/20 text-xs bg-white focus:outline-none focus:border-[#C4975D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5C3A21] mb-1">
                      Artisan Cooperative
                    </label>
                    <input
                      type="text"
                      value={formData.artisanCooperative}
                      onChange={(e) => setFormData({ ...formData, artisanCooperative: e.target.value })}
                      placeholder="e.g. Lumban Master Embroidery Guild"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#5C3A21]/20 text-xs bg-white focus:outline-none focus:border-[#C4975D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5C3A21] mb-1">
                      Master Artisan Lineage
                    </label>
                    <input
                      type="text"
                      value={formData.artisanMaster}
                      onChange={(e) => setFormData({ ...formData, artisanMaster: e.target.value })}
                      placeholder="e.g. Master Weaver Aling Elena"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#5C3A21]/20 text-xs bg-white focus:outline-none focus:border-[#C4975D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5C3A21] mb-1">
                      Fair Trade Artisan Share (%)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="20"
                        max="80"
                        value={formData.fairTradePercentage}
                        onChange={(e) => setFormData({ ...formData, fairTradePercentage: e.target.value })}
                        className="flex-1 accent-[#C4975D]"
                      />
                      <span className="font-mono text-sm font-bold text-amber-900 w-12 text-right">
                        {formData.fairTradePercentage}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Specifications Key-Value Builder */}
              <div className="glass-panel rounded-3xl p-6 border border-[#5C3A21]/15 shadow-sm space-y-4 bg-white/70">
                <div className="flex items-center justify-between border-b border-[#5C3A21]/10 pb-2">
                  <h3 className="font-serif text-base font-bold text-[#24140E] flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#C4975D]" />
                    <span>4. Technical Specifications</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-[#5C3A21] flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C4975D]" />
                    <span>Add Spec Row</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formData.specs.map((spec, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={spec.label}
                        onChange={(e) => handleUpdateSpec(index, 'label', e.target.value)}
                        placeholder="Specification (e.g. Dimensions)"
                        className="w-1/3 px-3 py-2 rounded-xl border border-[#5C3A21]/20 text-xs bg-white focus:outline-none focus:border-[#C4975D]"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => handleUpdateSpec(index, 'value', e.target.value)}
                        placeholder="Value (e.g. 38cm x 28cm x 14cm)"
                        className="flex-1 px-3 py-2 rounded-xl border border-[#5C3A21]/20 text-xs bg-white focus:outline-none focus:border-[#C4975D]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove spec"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('inventory')}
                  className="px-6 py-3 rounded-xl border border-[#5C3A21]/20 text-xs font-semibold text-[#5C3A21] hover:bg-stone-100 transition-colors"
                >
                  Cancel & Exit
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#5C3A21] to-[#3E2315] hover:from-[#432916] hover:to-[#24140E] text-white text-xs font-bold uppercase tracking-widest shadow-md transition-all flex items-center gap-2 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#C4975D]" />
                  <span>{isSubmitting ? 'Synchronizing...' : editingId ? 'Update & Deploy Masterwork' : 'Commission Piece to Catalog'}</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ========================================================
            TAB 3: BACKUP & SYSTEM SYNC
            ======================================================== */}
        {activeTab === 'system' && (
          <div className="animate-fadeIn max-w-3xl mx-auto space-y-6">
            
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#5C3A21]/15 shadow-sm space-y-6 bg-white/70">
              <div className="border-b border-[#5C3A21]/10 pb-4">
                <h3 className="font-serif text-xl font-bold text-[#24140E]">
                  Database Synchronization & Disaster Recovery
                </h3>
                <p className="text-xs text-[#8C5A3C] mt-1">
                  Export complete snapshots of your 18-piece masterwork collection, or restore your catalog from a verified JSON backup.
                </p>
              </div>

              {/* System Health Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#5C3A21]/15">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-xs uppercase text-[#24140E]">PostgreSQL Database</span>
                  </div>
                  <span className="text-[11px] text-[#8C5A3C]">
                    Serverless API endpoint `/api/products` configured and active.
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#5C3A21]/15">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="font-bold text-xs uppercase text-[#24140E]">Local Storage Sync</span>
                  </div>
                  <span className="text-[11px] text-[#8C5A3C]">
                    Key `likha_catalog_items` synced ({products.length} masterworks cached).
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#5C3A21]/10 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleExportJSON}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#5C3A21] hover:bg-[#432916] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4 text-[#C4975D]" />
                  <span>Export JSON Catalog Snapshot</span>
                </button>

                <button
                  onClick={() => backupFileInputRef.current?.click()}
                  className="flex-1 py-3 px-4 rounded-xl border border-[#5C3A21]/30 hover:border-[#5C3A21] text-[#5C3A21] font-semibold text-xs flex items-center justify-center gap-2 bg-white transition-colors"
                >
                  <Upload className="w-4 h-4 text-[#8C5A3C]" />
                  <span>Import / Restore Catalog JSON</span>
                  <input
                    ref={backupFileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportJSON}
                  />
                </button>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Studio Footer */}
      <footer className="bg-[#24140E] text-[#8C5A3C] py-4 px-6 text-center text-xs font-mono border-t border-[#5C3A21]/40">
        Likha Atelier Curator Studio • Secured Admin Subsystem • Manila / Genève
      </footer>

    </div>
  );
}
