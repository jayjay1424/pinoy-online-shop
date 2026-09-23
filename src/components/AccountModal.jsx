import React, { useState } from 'react';
import {
  X,
  User,
  Package,
  MapPin,
  Shield,
  LogOut,
  Sparkles,
  CheckCircle2,
  Clock,
  Award,
  ExternalLink,
  Plus,
  Edit3,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/sound';

export function AccountModal({ isOpen, onClose }) {
  const { currentUser, logout, updateProfile, saveAddress } = useAuth();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'addresses' | 'profile'
  const [showCertModal, setShowCertModal] = useState(null); // Selected order for certificate view

  // Profile edit state
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  // New address state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newProvince, setNewProvince] = useState('');
  const [newPostal, setNewPostal] = useState('');
  const [newIsDefault, setNewIsDefault] = useState(false);

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [securityMsg, setSecurityMsg] = useState('');
  const [securityError, setSecurityError] = useState('');

  if (!isOpen || !currentUser) return null;

  const handleSaveProfile = (e) => {
    e.preventDefault();
    sound.playBrassClick();
    updateProfile({
      name: profileName,
      email: profileEmail,
      phone: profilePhone,
    });
    sound.playSuccessChime();
    setProfileSavedMsg('Your atelier profile has been updated.');
    setTimeout(() => setProfileSavedMsg(''), 3000);
  };

  const handleCreateAddress = (e) => {
    e.preventDefault();
    sound.playBrassClick();
    saveAddress({
      label: newLabel || 'Residence',
      recipient: currentUser.name,
      phone: currentUser.phone,
      street: newStreet,
      city: newCity,
      province: newProvince,
      postal: newPostal,
      isDefault: newIsDefault,
    });
    sound.playSuccessChime();
    setIsAddingAddress(false);
    setNewLabel('');
    setNewStreet('');
    setNewCity('');
    setNewProvince('');
    setNewPostal('');
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

  const handleChangePassword = (e) => {
    e.preventDefault();
    setSecurityError('');
    setSecurityMsg('');

    if (currentUser.password && currentPass && currentPass !== currentUser.password) {
      setSecurityError('Current password is incorrect.');
      return;
    }

    if (newPass.length < 6) {
      setSecurityError('New password must contain at least 6 characters.');
      return;
    }

    if (newPass !== confirmPass) {
      setSecurityError('Passwords do not match.');
      return;
    }

    sound.playBrassClick();
    updateProfile({ password: newPass });
    sound.playSuccessChime();
    setSecurityMsg('Password updated successfully.');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setSecurityMsg(''), 3000);
  };

  const orders = currentUser.orders || [];
  const addresses = currentUser.savedAddresses || [];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sound.playWoodThud();
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-3xl shadow-warm-lg border border-[#5C3A21]/20 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* VIP Client Header */}
        <div className="bg-[#24140E] text-[#FAF8F5] px-6 py-5 flex items-center justify-between border-b border-[#C4975D]/30 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#5C3A21] border-2 border-[#C4975D] flex items-center justify-center text-lg font-serif font-bold text-[#FAF8F5] shadow-inner">
              {currentUser.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#FAF8F5]">
                  {currentUser.name}
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#C4975D]/20 text-[#EAD7B2] border border-[#C4975D]/40">
                  <Sparkles className="w-3 h-3 text-[#C4975D]" />
                  {currentUser.tier || 'Kliyente de Honor'}
                </span>
              </div>
              <p className="text-xs text-[#EAD7B2]/70 font-mono">
                {currentUser.email} • Kasapi mula {currentUser.memberSince || '2026'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playBrassClick();
              onClose();
            }}
            className="p-1.5 rounded-full text-[#EAD7B2] hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-[#5C3A21]/15 bg-[#FAF8F5] shrink-0 text-xs font-medium">
          <button
            onClick={() => {
              sound.playBrassClick();
              setActiveTab('orders');
            }}
            className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'orders'
                ? 'border-[#5C3A21] text-[#24140E] font-semibold'
                : 'border-transparent text-[#6E5D53] hover:text-[#24140E]'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-[#8C5A3C]" />
            <span>Vault Acquisitions ({orders.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playBrassClick();
              setActiveTab('addresses');
            }}
            className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'addresses'
                ? 'border-[#5C3A21] text-[#24140E] font-semibold'
                : 'border-transparent text-[#6E5D53] hover:text-[#24140E]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#8C5A3C]" />
            <span>Delivery Residences ({addresses.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playBrassClick();
              setActiveTab('profile');
            }}
            className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-[#5C3A21] text-[#24140E] font-semibold'
                : 'border-transparent text-[#6E5D53] hover:text-[#24140E]'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#8C5A3C]" />
            <span>Profile & Security</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* ================================================================ */}
          {/* TAB 1: VAULT ACQUISITIONS / ORDER HISTORY */}
          {/* ================================================================ */}
          {activeTab === 'orders' && (
            <div>
              {orders.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-14 h-14 rounded-full bg-[#F2ECE4] border border-[#5C3A21]/20 mx-auto flex items-center justify-center mb-3">
                    <Package className="w-6 h-6 text-[#8C5A3C]" />
                  </div>
                  <h4 className="font-serif text-lg font-semibold text-[#24140E] mb-1">
                    No Vault Acquisitions Yet
                  </h4>
                  <p className="text-xs text-[#6E5D53] max-w-sm mx-auto mb-5 font-serif italic">
                    Acquire rare numbered masterworks from our Philippine Heritage Haute Collection.
                  </p>
                  <button
                    onClick={() => {
                      sound.playBrassClick();
                      onClose();
                    }}
                    className="px-5 py-2.5 rounded-full bg-[#5C3A21] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#432916] transition-all"
                  >
                    Explore Atelier Collection
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white border border-[#5C3A21]/15 shadow-xs hover:border-[#5C3A21]/30 transition-all space-y-3"
                    >
                      {/* Order Title & Status */}
                      <div className="flex items-start justify-between flex-wrap gap-2 border-b border-[#5C3A21]/10 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#5C3A21]">
                              {ord.orderNumber}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                              {ord.serialKey}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#8C5A3C] flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {ord.timestamp}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {ord.status || 'Allocated & Insured'}
                          </span>
                          <span className="block text-xs font-semibold text-[#24140E] mt-1">
                            {ord.currency || 'PHP'} {Number(ord.total).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Items in Order */}
                      <div className="space-y-2">
                        {ord.items &&
                          ord.items.map((it, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#C4975D]" />
                                <span className="font-medium text-[#24140E]">
                                  {it.product?.name || 'Heritage Piece'}
                                </span>
                                {it.selectedMaterial && (
                                  <span className="text-[11px] text-[#8C5A3C]">
                                    ({it.selectedMaterial.name})
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-[#5C3A21]">
                                {it.currency} {Number(it.price).toLocaleString()}
                              </span>
                            </div>
                          ))}
                      </div>

                      {/* White-Glove Details & Certificate Link */}
                      <div className="flex items-center justify-between pt-2 text-[11px] text-[#6E5D53] border-t border-[#5C3A21]/10">
                        <span>
                          Carrier: <strong>{ord.trackingNumber || 'White-Glove Insured Armored'}</strong>
                        </span>
                        <button
                          onClick={() => {
                            sound.playBrassClick();
                            setShowCertModal(ord);
                          }}
                          className="text-[#8C5A3C] hover:text-[#5C3A21] font-semibold underline flex items-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5 text-[#C4975D]" />
                          <span>Provenance Certificate</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 2: DELIVERY ADDRESSES */}
          {/* ================================================================ */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#24140E]">
                  Registered Private Residences
                </span>
                {!isAddingAddress && (
                  <button
                    onClick={() => {
                      sound.playBrassClick();
                      setIsAddingAddress(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FAF8F5] border border-[#5C3A21]/20 text-[#5C3A21] hover:bg-[#5C3A21] hover:text-white transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Residence</span>
                  </button>
                )}
              </div>

              {/* Add Address Form */}
              {isAddingAddress && (
                <form
                  onSubmit={handleCreateAddress}
                  className="p-4 rounded-2xl bg-[#F2ECE4]/60 border border-[#5C3A21]/20 space-y-3 animate-fadeIn"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-[#24140E] block">
                    New White-Glove Delivery Location
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block mb-1 text-[11px] font-medium text-[#24140E]">Residence Label</label>
                      <input
                        type="text"
                        required
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        placeholder="e.g. Forbes Park Villa"
                        className="w-full px-3 py-2 bg-white border border-[#5C3A21]/20 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[11px] font-medium text-[#24140E]">Street Address</label>
                      <input
                        type="text"
                        required
                        value={newStreet}
                        onChange={(e) => setNewStreet(e.target.value)}
                        placeholder="House No., Street, Village"
                        className="w-full px-3 py-2 bg-white border border-[#5C3A21]/20 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[11px] font-medium text-[#24140E]">City / Municipality</label>
                      <input
                        type="text"
                        required
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        placeholder="Makati / Taguig / Cebu"
                        className="w-full px-3 py-2 bg-white border border-[#5C3A21]/20 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[11px] font-medium text-[#24140E]">Province / Postal Code</label>
                      <input
                        type="text"
                        required
                        value={newProvince}
                        onChange={(e) => setNewProvince(e.target.value)}
                        placeholder="Metro Manila 1225"
                        className="w-full px-3 py-2 bg-white border border-[#5C3A21]/20 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-[#6E5D53]">
                      <input
                        type="checkbox"
                        checked={newIsDefault}
                        onChange={(e) => setNewIsDefault(e.target.checked)}
                        className="rounded border-[#5C3A21]/30 text-[#5C3A21]"
                      />
                      <span>Set as primary delivery residence</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="px-3 py-1.5 rounded-xl text-xs text-[#6E5D53] hover:text-[#24140E]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-[#5C3A21] text-white text-xs font-semibold hover:bg-[#432916]"
                      >
                        Save Residence
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Saved Addresses List */}
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-4 rounded-2xl bg-white border transition-all ${
                      addr.isDefault
                        ? 'border-[#5C3A21] shadow-xs'
                        : 'border-[#5C3A21]/15 hover:border-[#5C3A21]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#8C5A3C]" />
                        <span className="text-xs font-semibold text-[#24140E]">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                            Primary
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-[#6E5D53] leading-relaxed">
                      {addr.street}, {addr.city}, {addr.province} {addr.postal}
                    </p>
                    <p className="text-[11px] text-[#8C5A3C] mt-1">
                      Recipient: {addr.recipient} ({addr.phone})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 3: PROFILE & SECURITY */}
          {/* ================================================================ */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              
              {/* Profile Details Form */}
              <form onSubmit={handleSaveProfile} className="p-4 rounded-2xl bg-white border border-[#5C3A21]/15 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#24140E] block">
                  Personal Information
                </span>

                {profileSavedMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{profileSavedMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block mb-1 text-[11px] font-medium text-[#24140E]">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#5C3A21]/20 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-[11px] font-medium text-[#24140E]">Email Address</label>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#5C3A21]/20 rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block mb-1 text-[11px] font-medium text-[#24140E]">VIP Contact Number</label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#5C3A21]/20 rounded-xl"
                    />
                  </div>
                </div>

                <div className="pt-2 text-right">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#5C3A21] text-white text-xs font-semibold hover:bg-[#432916] transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>

              {/* Password Change Form */}
              <form onSubmit={handleChangePassword} className="p-4 rounded-2xl bg-white border border-[#5C3A21]/15 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#24140E] block">
                  Security & Password
                </span>

                {securityError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                    {securityError}
                  </div>
                )}

                {securityMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{securityMsg}</span>
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block mb-1 text-[11px] font-medium text-[#24140E]">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#5C3A21]/20 rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-[11px] font-medium text-[#24140E]">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="At least 6 chars"
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#5C3A21]/20 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[11px] font-medium text-[#24140E]">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#5C3A21]/20 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-right">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#5C3A21] text-white text-xs font-semibold hover:bg-[#432916] transition-all"
                  >
                    Update Secret Password
                  </button>
                </div>
              </form>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#F2ECE4]/60 border-t border-[#5C3A21]/15 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              sound.playWoodThud();
              logout();
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs text-rose-800 hover:text-rose-950 font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Atelier</span>
          </button>

          <button
            onClick={() => {
              sound.playBrassClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-[#5C3A21] text-white text-xs font-semibold hover:bg-[#432916] transition-all"
          >
            Return to Gallery
          </button>
        </div>

      </div>

      {/* Provenance Certificate Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border-2 border-[#C4975D] shadow-warm-lg text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#24140E] border-2 border-[#C4975D] mx-auto flex items-center justify-center shadow-lg">
              <Award className="w-8 h-8 text-[#C4975D]" />
            </div>

            <span className="font-serif tracking-[0.25em] text-xs uppercase font-semibold text-[#8C5A3C] block">
              Katunayan ng Pagmamay-ari • Certificate of Authenticity
            </span>

            <h3 className="font-serif text-2xl font-bold text-[#24140E]">
              LIKHA ATELIER GENÈVE
            </h3>

            <p className="text-xs text-[#5C3A21]/80 max-w-md mx-auto leading-relaxed">
              This document certifies that the masterwork allocated under serial key{' '}
              <strong className="font-mono text-[#24140E]">{showCertModal.serialKey}</strong> is an authentic,
              numbered haute-couture piece handcrafted by accredited master Philippine artisans.
            </p>

            <div className="p-3 bg-[#F2ECE4] rounded-2xl border border-[#5C3A21]/15 text-xs font-mono text-[#5C3A21] space-y-1 text-left">
              <div>Order No: <span className="font-bold text-[#24140E]">{showCertModal.orderNumber}</span></div>
              <div>Registered Patron: <span className="font-bold text-[#24140E]">{currentUser.name}</span></div>
              <div>Date of Harvest & Sealing: <span className="font-bold text-[#24140E]">{showCertModal.timestamp}</span></div>
              <div>Dispatch Protocol: <span className="font-bold text-[#24140E]">White-Glove Insured Courier</span></div>
            </div>

            <button
              onClick={() => {
                sound.playBrassClick();
                setShowCertModal(null);
              }}
              className="px-6 py-2.5 rounded-full bg-[#5C3A21] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#432916]"
            >
              Close Certificate
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

