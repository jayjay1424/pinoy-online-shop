import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Box,
  CheckCircle2,
  AlertCircle,
  Download,
  Lock,
  Search,
  Eye,
  ArrowLeft,
  Award,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { CURRENCY_RATES } from '../data/products';
import { sound } from '../utils/sound';

const MASTER_PIN = 'LIKHA2026';

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

export function AdminModal({
  isOpen,
  onClose,
  products,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onSelectForStage,
  activeCurrency,
}) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'editor'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCollection, setFilterCollection] = useState('All');

  // Editor form state
  const [editingId, setEditingId] = useState(null); // null if new, string if editing
  const [formData, setFormData] = useState(getInitialFormData());
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const imageFileInputRef = useRef(null);
  const glbFileInputRef = useRef(null);
  const backupFileInputRef = useRef(null);

  const rateInfo = CURRENCY_RATES[activeCurrency] || CURRENCY_RATES.PHP;

  if (!isOpen) return null;

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

  // Handle PIN unlock
  const handleUnlock = (e) => {
    e.preventDefault();
    if (pinInput.trim().toUpperCase() === MASTER_PIN) {
      sound.playSuccessChime();
      setIsUnlocked(true);
      setPinError(false);
    } else {
      sound.playWoodThud();
      setPinError(true);
    }
  };

  // Open Editor for New Piece
  const handleNewPiece = () => {
    sound.playBrassClick();
    setEditingId(null);
    setFormData(getInitialFormData());
    setActiveTab('editor');
  };

  // Open Editor for Existing Piece
  const handleEditPiece = (prod) => {
    sound.playBrassClick();
    setEditingId(prod.id);
    setFormData({
      ...prod,
      specs: prod.specs || [],
      materials: prod.materials || [],
      stockStatus: prod.stockStatus || (prod.batchRemaining > 0 ? 'available' : 'archived'),
    });
    setActiveTab('editor');
  };

  // Duplicate as Template (1-Click Clone)
  const handleDuplicate = (prod) => {
    sound.playBrassClick();
    setEditingId(null);
    setFormData({
      ...prod,
      id: undefined,
      name: `${prod.name} (Copy)`,
      edition: 'Edisyon Limitado — Bagong Likha',
      specs: prod.specs ? JSON.parse(JSON.stringify(prod.specs)) : [],
      materials: prod.materials ? JSON.parse(JSON.stringify(prod.materials)) : [],
    });
    setActiveTab('editor');
    setFeedbackMsg(`Duplicated "${prod.name}" as template. Review and save.`);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // Handle Image Upload (PNG/JPG)
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playBrassClick();
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result;
      setFormData((prev) => ({ ...prev, image: dataUri }));
      sound.playSuccessChime();
    };
    reader.readAsDataURL(file);
  };

  // Handle 3D GLB File Upload
  const handleGlbFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playBrassClick();
    const blobUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      has3DModel: true,
      modelGlbUrl: blobUrl,
    }));
    sound.playSuccessChime();
  };

  // Specs helper: add row
  const handleAddSpecRow = () => {
    sound.playBrassClick();
    setFormData((prev) => ({
      ...prev,
      specs: [...prev.specs, { label: 'Feature', value: 'Details' }],
    }));
  };

  // Specs helper: update row
  const handleSpecChange = (index, field, value) => {
    setFormData((prev) => {
      const next = [...prev.specs];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, specs: next };
    });
  };

  // Specs helper: remove row
  const handleRemoveSpec = (index) => {
    sound.playWoodThud();
    setFormData((prev) => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== index),
    }));
  };

  // Materials helper: add color
  const handleAddMaterial = () => {
    sound.playBrassClick();
    setFormData((prev) => ({
      ...prev,
      materials: [
        ...prev.materials,
        {
          id: `var-${Date.now()}`,
          name: 'Custom Finish',
          hex: '#8C5A3C',
        },
      ],
    }));
  };

  // Materials helper: remove
  const handleRemoveMaterial = (index) => {
    sound.playWoodThud();
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  // AI / Heritage Lore generator helper
  const handleGenerateLore = () => {
    sound.playBrassClick();
    const regionNames = ['Lake Sebu, South Cotabato', 'Lumban, Laguna', 'Basey, Samar', 'Bohol & Panay', 'Vigan, Ilocos Sur'];
    const selectedRegion = regionNames[Math.floor(Math.random() * regionNames.length)];
    const generatedStory = `A bespoke architectural heirloom honoring the centuries-old Philippine handicraft traditions of ${selectedRegion}. Handwoven and granulated by accredited master artisans utilizing sustainable native botanical fibers and hand-chiseled cast brass elements.`;
    
    setFormData((prev) => ({
      ...prev,
      description: generatedStory,
      tagline: `Handcrafted in ${selectedRegion} • Master Guild Certified`,
    }));
    sound.playSuccessChime();
  };

  // Submit Save/Create Product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    sound.playBrassClick();

    if (!formData.name || !formData.pricePHP || !formData.collection) {
      alert('Please fill in Name, Price, and Collection.');
      return;
    }

    const payload = {
      ...formData,
      id: editingId || `prod-${Date.now()}`,
      pricePHP: Number(formData.pricePHP),
      batchRemaining: Number(formData.batchRemaining || 0),
      fairTradePercentage: Number(formData.fairTradePercentage || 45),
    };

    if (editingId) {
      onUpdateProduct(payload);
      setFeedbackMsg(`Updated "${payload.name}" successfully.`);
    } else {
      onCreateProduct(payload);
      setFeedbackMsg(`Created "${payload.name}" and cataloged to Atelier.`);
    }

    sound.playSuccessChime();
    setActiveTab('inventory');
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    sound.playBrassClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `likha-atelier-catalog-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    sound.playSuccessChime();
  };

  // Import JSON Backup
  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playBrassClick();
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result);
        if (Array.isArray(imported)) {
          imported.forEach((item) => onCreateProduct(item));
          sound.playSuccessChime();
          setFeedbackMsg(`Successfully imported ${imported.length} pieces.`);
          setTimeout(() => setFeedbackMsg(''), 4000);
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  // Filtered product inventory
  const filteredInventory = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.artisanCooperative || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.region || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCollection === 'All' || p.collection === filterCollection;
    return matchSearch && matchCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#FAF8F5] rounded-3xl shadow-warm-lg border border-[#5C3A21]/30 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Ribbon Header */}
        <div className="bg-[#24140E] text-[#FAF8F5] px-6 py-4 flex items-center justify-between border-b border-[#C4975D]/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#5C3A21] border border-[#C4975D] flex items-center justify-center text-xs font-serif font-bold text-[#EAD7B2]">
              LA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#FAF8F5]">
                  Curatorial Studio • Admin CRUD Portal
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#C4975D]/20 text-[#EAD7B2] border border-[#C4975D]/40">
                  PostgreSQL Sync Active
                </span>
              </div>
              <p className="text-[11px] text-[#EAD7B2]/70 font-mono">
                Philippine Haute Heritage Inventory • Live 3D & Image Engine
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playBrassClick();
              onClose();
            }}
            className="p-1.5 rounded-full text-[#EAD7B2] hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close Studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Curator PIN Guard Screen (if not unlocked) */}
        {!isUnlocked ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto my-auto space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#24140E] border-2 border-[#C4975D] mx-auto flex items-center justify-center shadow-md">
              <Lock className="w-7 h-7 text-[#C4975D]" />
            </div>

            <div>
              <h4 className="font-serif text-2xl font-bold text-[#24140E]">
                Atelier Curator Access
              </h4>
              <p className="text-xs text-[#6E5D53] mt-1 font-serif italic">
                Enter your Master Passcode to manage the live store inventory, prices, images, and 3D models.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-3">
              <div className="relative">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Master Passcode (Hint: LIKHA2026)"
                  className="w-full px-4 py-3 bg-white border border-[#5C3A21]/20 rounded-2xl text-center text-sm font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-[#5C3A21]"
                  autoFocus
                />
              </div>

              {pinError && (
                <p className="text-xs text-rose-600 font-semibold animate-shake">
                  Incorrect Master Passcode. Please try again or use LIKHA2026.
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#5C3A21] text-white text-xs uppercase font-bold tracking-wider hover:bg-[#432916] transition-all shadow-md active:scale-98"
              >
                Unlock Curatorial Studio
              </button>
            </form>
          </div>
        ) : (
          /* ================================================================ */
          /* UNLOCKED ADMIN STUDIO VIEW                                      */
          /* ================================================================ */
          <div className="flex flex-col flex-1 overflow-hidden">
            
            {/* Feedback Alert Banner */}
            {feedbackMsg && (
              <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center gap-2 text-xs text-emerald-900 font-medium animate-fadeIn shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{feedbackMsg}</span>
              </div>
            )}

            {/* Studio Navigation Bar */}
            <div className="px-6 py-3 bg-[#F2ECE4]/70 border-b border-[#5C3A21]/15 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playBrassClick();
                    setActiveTab('inventory');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                    activeTab === 'inventory'
                      ? 'bg-[#5C3A21] text-white shadow-xs'
                      : 'bg-white text-[#5C3A21] border border-[#5C3A21]/15 hover:bg-[#FAF8F5]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Collection Inventory ({products.length})</span>
                </button>

                <button
                  onClick={handleNewPiece}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                    activeTab === 'editor' && !editingId
                      ? 'bg-[#5C3A21] text-white shadow-xs'
                      : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 text-amber-800" />
                  <span>+ Add New Masterwork</span>
                </button>
              </div>

              {/* Data Import/Export Tools */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportBackup}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#5C3A21]/20 text-[11px] font-semibold text-[#5C3A21] hover:bg-[#FAF8F5] transition-all flex items-center gap-1"
                  title="Download JSON inventory backup"
                >
                  <Download className="w-3 h-3" />
                  <span>Export JSON</span>
                </button>

                <label className="px-3 py-1.5 rounded-lg bg-white border border-[#5C3A21]/20 text-[11px] font-semibold text-[#5C3A21] hover:bg-[#FAF8F5] transition-all flex items-center gap-1 cursor-pointer">
                  <Upload className="w-3 h-3" />
                  <span>Import JSON</span>
                  <input
                    ref={backupFileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* TAB 1: INVENTORY MANAGEMENT */}
            {activeTab === 'inventory' && (
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {/* Search & Filter Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#5C3A21]/15 shadow-2xs">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-[#8C5A3C] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search title, cooperative, region..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#5C3A21]/15 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                    {['All', ...COLLECTIONS].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          sound.playBrassClick();
                          setFilterCollection(cat);
                        }}
                        className={`px-3 py-1 rounded-lg text-[10px] font-semibold tracking-wider uppercase transition-all shrink-0 ${
                          filterCollection === cat
                            ? 'bg-[#5C3A21] text-white'
                            : 'bg-[#FAF8F5] text-[#6E5D53] hover:text-[#24140E]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Products Table */}
                <div className="space-y-3">
                  {filteredInventory.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#5C3A21]/20">
                      <p className="text-xs text-[#6E5D53] font-serif italic">
                        No pieces found matching "{searchQuery}".
                      </p>
                    </div>
                  ) : (
                    filteredInventory.map((prod) => {
                      const convertedPrice = Math.round(prod.pricePHP * rateInfo.rate);

                      return (
                        <div
                          key={prod.id}
                          className="bg-white p-4 rounded-2xl border border-[#5C3A21]/15 shadow-2xs hover:shadow-xs hover:border-[#5C3A21]/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          {/* Left: Thumbnail & Details */}
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Preview Thumbnail */}
                            <div className="w-14 h-14 rounded-xl bg-[#FAF8F5] border border-[#5C3A21]/20 flex items-center justify-center shrink-0 overflow-hidden relative">
                              {prod.image ? (
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : prod.has3DModel ? (
                                <Box className="w-6 h-6 text-[#C4975D]" />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-[#8C5A3C]/40" />
                              )}
                              {prod.has3DModel && (
                                <span className="absolute bottom-0 right-0 bg-[#5C3A21] text-white text-[8px] px-1 font-mono font-bold rounded-tl">
                                  3D
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-serif font-bold text-sm text-[#24140E] truncate">
                                  {prod.name}
                                </h4>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#F2ECE4] text-[#5C3A21] shrink-0">
                                  {prod.collection}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#8C5A3C] font-serif italic truncate">
                                {prod.subtitle}
                              </p>
                              <div className="flex items-center gap-3 text-[10px] text-[#6E5D53] mt-0.5">
                                <span>{prod.region}</span>
                                <span>•</span>
                                <span>{prod.artisanCooperative}</span>
                              </div>
                            </div>
                          </div>

                          {/* Middle: Price & Stock Status */}
                          <div className="flex items-center gap-4 shrink-0 sm:text-right">
                            <div>
                              <div className="text-sm font-bold text-[#5C3A21]">
                                {rateInfo.symbol} {convertedPrice.toLocaleString()} {activeCurrency}
                              </div>
                              <div className="text-[10px] font-mono text-[#8C5A3C]">
                                {prod.batchRemaining > 0
                                  ? `${prod.batchRemaining} in batch remaining`
                                  : 'Archived / Sold Out'}
                              </div>
                            </div>

                            <span
                              className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                prod.stockStatus === 'archived'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : prod.stockStatus === 'commission'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                  : prod.batchRemaining <= 2
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {prod.stockStatus === 'archived'
                                ? 'Archived'
                                : prod.stockStatus === 'commission'
                                ? 'Commission'
                                : prod.batchRemaining <= 2
                                ? 'Low Stock'
                                : 'Available'}
                            </span>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                            {/* View in 3D Hero */}
                            <button
                              onClick={() => {
                                sound.playBrassClick();
                                onSelectForStage(prod);
                                onClose();
                                document.getElementById('stage')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="p-2 rounded-xl bg-[#FAF8F5] text-[#5C3A21] hover:bg-[#5C3A21] hover:text-white transition-all"
                              title="Set as Hero in 3D Stage"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Duplicate as Template */}
                            <button
                              onClick={() => handleDuplicate(prod)}
                              className="p-2 rounded-xl bg-[#FAF8F5] text-[#5C3A21] hover:bg-[#5C3A21] hover:text-white transition-all"
                              title="Duplicate as Template"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleEditPiece(prod)}
                              className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 transition-all font-semibold"
                              title="Edit Masterwork Specs"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                sound.playWoodThud();
                                if (window.confirm(`Permanently remove "${prod.name}" from Likha Atelier?`)) {
                                  onDeleteProduct(prod.id);
                                  setFeedbackMsg(`Removed "${prod.name}" from inventory.`);
                                  setTimeout(() => setFeedbackMsg(''), 4000);
                                }
                              }}
                              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-800 transition-all"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: MASTERWORK EDITOR FORM */}
            {activeTab === 'editor' && (
              <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto flex-1 space-y-6">
                
                {/* Back to Inventory Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-[#5C3A21]/15">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playBrassClick();
                      setActiveTab('inventory');
                    }}
                    className="flex items-center gap-1.5 text-xs text-[#5C3A21] hover:text-[#24140E] font-semibold"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Inventory</span>
                  </button>

                  <span className="font-serif text-sm font-bold text-[#24140E]">
                    {editingId ? `Editing: ${formData.name}` : 'Curating New Philippine Masterwork'}
                  </span>
                </div>

                {/* Section 1: Core Identification */}
                <div className="bg-white p-5 rounded-2xl border border-[#5C3A21]/15 space-y-4">
                  <h4 className="font-serif text-sm font-bold text-[#24140E] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C4975D]" />
                    <span>1. Masterwork Identity & Collection</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[#6E5D53] mb-1 font-medium">Piece Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Modern Sculptural Terno"
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#5C3A21]/20 rounded-xl text-[#24140E]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#6E5D53] mb-1 font-medium">Subtitle / Material Headline</label>
                      <input
                        type="text"
                        value={formData.subtitle}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        placeholder="e.g. Haute Butterfly Sleeves in Woven Pandan"
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#5C3A21]/20 rounded-xl text-[#24140E]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#6E5D53] mb-1 font-medium">Collection *</label>
                      <select
                        value={formData.collection}
                        onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#5C3A21]/20 rounded-xl text-[#24140E]"
                      >
                        {COLLECTIONS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#6E5D53] mb-1 font-medium">Limited Edition Label</label>
                      <input
                        type="text"
                        value={formData.edition}
                        onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                        placeholder="e.g. Edisyon Limitado — No. 04 ng 12"
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#5C3A21]/20 rounded-xl text-[#24140E]"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Pricing & Stock Allocation */}
                <div className="bg-white p-5 rounded-2xl border border-[#5C3A21]/15 space-y-4">
                  <h4 className="font-serif text-sm font-bold text-[#24140E] flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#C4975D]" />
                    <span>2. Pricing, Valuation & Batch Stock</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[#6E5D53] mb-1 font-medium">Price in PHP (₱) *</label>
                      <input
                        type="number"
                        required
                        min="1000"
                        step="500"
                        value={formData.pricePHP}
                        onChange={(e) => setFormData({ ...formData, pricePHP: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#5C3A21]/20 rounded-xl text-[#24140E] font-bold"
                      />
                      <span className="text-[10px] text-[#8C5A3C] mt-1 block">
                        ≈ {rateInfo.symbol} {Math.round(formData.pricePHP * rateInfo.rate).toLocaleString()} {activeCurrency}
                      </span>
                    </div>

                    <div>
                      <label className="block text-[#6E5D53] mb-1 font-medium">Remaining Stock Allocation</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.batchRemaining}
                        onChange={(e) => setFormData({ ...formData, batchRemaining: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#5C3A21]/20 rounded-xl text-[#24140E]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#6E5D53] mb-1 font-medium">Stock Status Switch</label>
                      <select
                        value={formData.stockStatus}
                        onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#5C3A21]/20 rounded-xl text-[#24140E]"
                      >
                        <option value="available">Available (In Stock)</option>
                        <option value="low_stock">Low Allocation (&lt; 3 Left)</option>
                        <option value="commission">Bespoke Commission Only</option>
                        <option value="archived">Archived / Sold Out</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#6E5D53] mb-1 font-medium">Lead Time</label>
                      <input
                        type="text"
                        value={formData.leadTime}
                        onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
                        placeholder="e.g. Handcrafted over 24 days"
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#5C3A21]/20 rounded-xl text-[#24140E]"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Media & Assets (Image PNG / 3D GLB Upload) */}
                <div className="bg-white p-5 rounded-2xl border border-[#5C3A21]/15 space-y-4">
                  <h4 className="font-serif text-sm font-bold text-[#24140E] flex items-center gap-2">
                    <Box className="w-4 h-4 text-[#C4975D]" />
                    <span>3. Visual Assets (Images & 3D Interactive Model)</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Image / PNG Upload Dropzone */}
                    <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#5C3A21]/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#24140E] flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-[#8C5A3C]" />
                          Product Image (PNG / JPG / WebP)
                        </span>
                        {formData.image && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, image: '' })}
                            className="text-[10px] text-rose-600 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {/* Dropzone / Upload Box */}
                      <div
                        onClick={() => imageFileInputRef.current?.click()}
                        className="border-2 border-dashed border-[#5C3A21]/30 hover:border-[#5C3A21] rounded-xl p-4 text-center cursor-pointer transition-all bg-white flex flex-col items-center justify-center min-h-[110px]"
                      >
                        {formData.image ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={formData.image}
                              alt="Preview"
                              className="w-16 h-16 object-cover rounded-lg border border-[#5C3A21]/20 shadow-xs"
                            />
                            <div className="text-left text-xs">
                              <span className="font-semibold text-[#24140E] block">Image Ready</span>
                              <span className="text-[10px] text-[#8C5A3C]">Click to replace file</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-[#8C5A3C] mb-1" />
                            <span className="text-xs font-medium text-[#24140E]">Click to upload PNG or JPG</span>
                            <span className="text-[10px] text-[#6E5D53]">Drag & drop supported</span>
                          </>
                        )}
                        <input
                          ref={imageFileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-[#6E5D53] mb-1">Or paste Direct Image URL:</label>
                        <input
                          type="url"
                          value={formData.image?.startsWith('data:') ? '' : formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          placeholder="https://example.com/item.png"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-[#5C3A21]/20 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* 3D GLB Model Upload Dropzone */}
                    <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#5C3A21]/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#24140E] flex items-center gap-1.5">
                          <Box className="w-3.5 h-3.5 text-[#C4975D]" />
                          Interactive 3D Asset (.GLB)
                        </span>
                        <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.has3DModel}
                            onChange={(e) => setFormData({ ...formData, has3DModel: e.target.checked })}
                            className="rounded text-[#5C3A21]"
                          />
                          <span>3D Enabled</span>
                        </label>
                      </div>

                      {formData.has3DModel && (
                        <>
                          <div
                            onClick={() => glbFileInputRef.current?.click()}
                            className="border-2 border-dashed border-[#5C3A21]/30 hover:border-[#5C3A21] rounded-xl p-4 text-center cursor-pointer transition-all bg-white flex flex-col items-center justify-center min-h-[110px]"
                          >
                            <Box className="w-6 h-6 text-[#C4975D] mb-1" />
                            <span className="text-xs font-medium text-[#24140E]">
                              {formData.modelGlbUrl ? 'Custom 3D Model Attached' : 'Click to upload .GLB 3D File'}
                            </span>
                            <span className="text-[10px] text-[#6E5D53]">
                              {formData.modelGlbUrl ? formData.modelGlbUrl.substring(0, 32) + '...' : 'Drag & drop GLTF/GLB binary'}
                            </span>
                            <input
                              ref={glbFileInputRef}
                              type="file"
                              accept=".glb,.gltf"
                              onChange={handleGlbFileChange}
                              className="hidden"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="block text-[11px] text-[#6E5D53] mb-1">3D Archetype:</label>
                              <select
                                value={formData.modelType}
                                onChange={(e) => setFormData({ ...formData, modelType: e.target.value })}
                                className="w-full px-2.5 py-1.5 bg-white border border-[#5C3A21]/20 rounded-lg text-xs"
                              >
                                {ARCHETYPES.map((a) => (
                                  <option key={a.id} value={a.id}>{a.label}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] text-[#6E5D53] mb-1">Or GLB URL:</label>
                              <input
                                type="text"
                                value={formData.modelGlbUrl?.startsWith('blob:') ? '' : formData.modelGlbUrl}
                                onChange={(e) => setFormData({ ...formData, modelGlbUrl: e.target.value })}
                                placeholder="/models/custom.glb"
                                className="w-full px-2.5 py-1.5 bg-white border border-[#5C3A21]/20 rounded-lg text-xs"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 4: Artisan Provenance & Fair-Trade */}
                <div className="bg-white p-5 rounded-2xl border border-[#5C3A21]/15 space-y-4">
                  <h4 className="font-serif text-sm font-bold text-[#24140E] flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#C4975D]" />
                    <span>4. Fair-Trade Artisan Provenance</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[#6E5D53] mb-1 font-medium">Island / Region</label>
                      <input
                        type="text"
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        placeholder="e.g. Lake Sebu, Mindanao"
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#5C3A21]/20 rounded-xl text-[#24140E]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#6E5D53] mb-1 font-medium">Artisan Cooperative / Guild</label>
                      <input
                        type="text"
                        value={formData.artisanCooperative}
                        onChange={(e) => setFormData({ ...formData, artisanCooperative: e.target.value })}
                        placeholder="e.g. T'boli Dreamweavers Collective"
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#5C3A21]/20 rounded-xl text-[#24140E]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#6E5D53] mb-1 font-medium">Master Artisan Name</label>
                      <input
                        type="text"
                        value={formData.artisanMaster}
                        onChange={(e) => setFormData({ ...formData, artisanMaster: e.target.value })}
                        placeholder="e.g. Bo-i Maria"
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#5C3A21]/20 rounded-xl text-[#24140E]"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 5: Storytelling & Technical Specifications */}
                <div className="bg-white p-5 rounded-2xl border border-[#5C3A21]/15 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-sm font-bold text-[#24140E]">
                      5. Storytelling & Technical Specifications
                    </h4>
                    <button
                      type="button"
                      onClick={handleGenerateLore}
                      className="px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100 flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      <span>Generate Heritage Lore</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs text-[#6E5D53] mb-1 font-medium">Atelier Story & Description</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Narrative describing the piece, weaving technique, and cultural significance..."
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#5C3A21]/20 rounded-xl text-xs text-[#24140E]"
                    />
                  </div>

                  {/* Key-Value Specifications */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#24140E]">Specifications Rows</label>
                      <button
                        type="button"
                        onClick={handleAddSpecRow}
                        className="text-xs text-[#5C3A21] hover:underline font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Spec
                      </button>
                    </div>

                    {formData.specs.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={s.label}
                          onChange={(e) => handleSpecChange(idx, 'label', e.target.value)}
                          placeholder="Label (e.g. Dimensions)"
                          className="w-1/3 px-3 py-1.5 bg-[#FAF8F5] border border-[#5C3A21]/20 rounded-xl text-xs"
                        />
                        <input
                          type="text"
                          value={s.value}
                          onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                          placeholder="Specification value"
                          className="flex-1 px-3 py-1.5 bg-[#FAF8F5] border border-[#5C3A21]/20 rounded-xl text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(idx)}
                          className="p-1.5 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-2 flex items-center justify-between border-t border-[#5C3A21]/15">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playBrassClick();
                      setActiveTab('inventory');
                    }}
                    className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#6E5D53] hover:text-[#24140E]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-8 py-3 rounded-full bg-[#5C3A21] text-white text-xs uppercase font-bold tracking-wider hover:bg-[#432916] transition-all shadow-md active:scale-95"
                  >
                    {editingId ? 'Save & Update Masterwork' : 'Publish Masterwork to Atelier'}
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
