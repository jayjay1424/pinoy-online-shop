import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/sound';

export function AuthModal({ isOpen, onClose, initialTab = 'login', notice = '', onSuccess }) {
  const { login, register, requestPasswordReset, resetPassword } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab); // 'login' | 'register' | 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [simulatedCode, setSimulatedCode] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: request, 2: verify & set

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const switchTab = (tab) => {
    sound.playBrassClick();
    resetMessages();
    setActiveTab(tab);
  };

  // 1. Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);

    try {
      sound.playBrassClick();
      await login(loginEmail, loginPassword);
      sound.playSuccessChime();
      setSuccessMsg('Welcome back to Likha Atelier.');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
        setIsLoading(false);
      }, 600);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
      setIsLoading(false);
    }
  };

  // Demo auto-fill helper for instant testing
  const handleFillDemo = () => {
    sound.playBrassClick();
    setLoginEmail('maria.clara@likha-atelier.com');
    setLoginPassword('password123');
    resetMessages();
  };

  // 2. Handle Register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password must contain at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      sound.playBrassClick();
      await register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
      });
      sound.playSuccessChime();
      setSuccessMsg('Your Likha Atelier account has been created. Welcome to the Circle.');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
        setIsLoading(false);
      }, 800);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
      setIsLoading(false);
    }
  };

  // 3. Handle Forgot Password: Step 1 (Request Code)
  const handleForgotRequest = async (e) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);

    try {
      sound.playBrassClick();
      const res = await requestPasswordReset(forgotEmail);
      setSimulatedCode(res.resetCode);
      setResetCodeInput(res.resetCode); // Pre-fill convenience
      setForgotStep(2);
      setSuccessMsg(`A 6-digit verification code has been dispatched to ${res.email}.`);
      setIsLoading(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to request reset.');
      setIsLoading(false);
    }
  };

  // 4. Handle Forgot Password: Step 2 (Reset Password)
  const handleForgotReset = async (e) => {
    e.preventDefault();
    resetMessages();

    if (newPassword.length < 6) {
      setErrorMsg('New password must contain at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      sound.playBrassClick();
      await resetPassword(forgotEmail, newPassword, resetCodeInput);
      sound.playSuccessChime();
      setSuccessMsg('Your password has been successfully updated. You may now sign in.');
      setTimeout(() => {
        setActiveTab('login');
        setLoginEmail(forgotEmail);
        setLoginPassword(newPassword);
        setForgotStep(1);
        setIsLoading(false);
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update password.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-3xl shadow-warm-lg border border-[#5C3A21]/20 overflow-hidden flex flex-col">
        
        {/* Header Ribbon */}
        <div className="bg-[#24140E] text-[#FAF8F5] px-6 py-4 flex items-center justify-between border-b border-[#C4975D]/30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C4975D]" />
            <span className="font-serif tracking-widest text-xs uppercase font-semibold text-[#EAD7B2]">
              Likha Atelier Client Portal
            </span>
          </div>
          <button
            onClick={() => {
              sound.playBrassClick();
              onClose();
            }}
            className="p-1 rounded-full text-[#EAD7B2] hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order / Payment Requirement Notice */}
        {notice && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5 shadow-2xs animate-fadeIn">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-950">Patron Account Required</span>
              <span className="text-[11px] text-amber-900/90 leading-snug block mt-0.5">{notice}</span>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-2 mx-6 mt-4 bg-[#F2ECE4] rounded-2xl border border-[#5C3A21]/10 text-xs font-medium">
          <button
            onClick={() => switchTab('login')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'login' || activeTab === 'forgot'
                ? 'bg-[#5C3A21] text-white shadow-xs font-semibold'
                : 'text-[#6E5D53] hover:text-[#24140E]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => switchTab('register')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'register'
                ? 'bg-[#5C3A21] text-white shadow-xs font-semibold'
                : 'text-[#6E5D53] hover:text-[#24140E]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-7 flex-1 overflow-y-auto max-h-[75vh]">
          
          {/* Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 1: SIGN IN (LOGIN) */}
          {/* ================================================================ */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#24140E] mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C5A3C]/70" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="client@likha-atelier.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#5C3A21]/20 rounded-xl text-xs text-[#24140E] placeholder-[#8C5A3C]/40 focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-[#24140E] uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => switchTab('forgot')}
                    className="text-[11px] text-[#8C5A3C] hover:text-[#5C3A21] underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C5A3C]/70" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#5C3A21]/20 rounded-xl text-xs text-[#24140E] placeholder-[#8C5A3C]/40 focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C5A3C]/70 hover:text-[#24140E]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#6E5D53]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#5C3A21]/30 text-[#5C3A21] focus:ring-[#5C3A21]"
                  />
                  <span>Remember this terminal</span>
                </label>

                {/* Quick VIP demo filler */}
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[10px] text-[#C4975D] hover:text-[#8C5A3C] font-semibold underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Fill VIP Demo</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#5C3A21] text-white hover:bg-[#432916] font-medium text-xs tracking-wider uppercase transition-all shadow-warm flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                <span>{isLoading ? 'Authenticating...' : 'Sign In to Atelier'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C4975D]" />
              </button>

              <p className="text-center text-xs text-[#6E5D53] pt-3">
                Not yet a member of Likha Circle?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('register')}
                  className="text-[#8C5A3C] hover:text-[#5C3A21] font-semibold underline"
                >
                  Register an account
                </button>
              </p>
            </form>
          )}

          {/* ================================================================ */}
          {/* TAB 2: REGISTER (CREATE ACCOUNT) */}
          {/* ================================================================ */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#24140E] mb-1 uppercase tracking-wider">
                  Full Legal Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C5A3C]/70" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Juan Luna y Novicio"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#5C3A21]/20 rounded-xl text-xs text-[#24140E] placeholder-[#8C5A3C]/40 focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#24140E] mb-1 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C5A3C]/70" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="client@domain.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#5C3A21]/20 rounded-xl text-xs text-[#24140E] placeholder-[#8C5A3C]/40 focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#24140E] mb-1 uppercase tracking-wider">
                  Contact Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C5A3C]/70" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+63 917 000 0000"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#5C3A21]/20 rounded-xl text-xs text-[#24140E] placeholder-[#8C5A3C]/40 focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#24140E] mb-1 uppercase tracking-wider">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 chars"
                    className="w-full px-3 py-2.5 bg-white border border-[#5C3A21]/20 rounded-xl text-xs text-[#24140E] placeholder-[#8C5A3C]/40 focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#24140E] mb-1 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-3 py-2.5 bg-white border border-[#5C3A21]/20 rounded-xl text-xs text-[#24140E] placeholder-[#8C5A3C]/40 focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer text-[11px] text-[#6E5D53] pt-1">
                <input
                  type="checkbox"
                  checked={newsletterOptIn}
                  onChange={(e) => setNewsletterOptIn(e.target.checked)}
                  className="rounded border-[#5C3A21]/30 text-[#5C3A21] focus:ring-[#5C3A21] mt-0.5"
                />
                <span>Receive private invitations to confidential Philippine heritage auctions and salon exhibits.</span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#5C3A21] text-white hover:bg-[#432916] font-medium text-xs tracking-wider uppercase transition-all shadow-warm flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                <span>{isLoading ? 'Creating Account...' : 'Join Likha Circle'}</span>
                <Sparkles className="w-3.5 h-3.5 text-[#C4975D]" />
              </button>

              <p className="text-center text-xs text-[#6E5D53] pt-2">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className="text-[#8C5A3C] hover:text-[#5C3A21] font-semibold underline"
                >
                  Sign in here
                </button>
              </p>
            </form>
          )}

          {/* ================================================================ */}
          {/* TAB 3: FORGOT PASSWORD */}
          {/* ================================================================ */}
          {activeTab === 'forgot' && (
            <div>
              <div className="mb-4 text-center">
                <div className="w-10 h-10 rounded-full bg-[#F2ECE4] border border-[#5C3A21]/20 mx-auto flex items-center justify-center mb-2">
                  <KeyRound className="w-5 h-5 text-[#8C5A3C]" />
                </div>
                <h4 className="font-serif text-lg font-semibold text-[#24140E]">
                  Account Recovery
                </h4>
                <p className="text-xs text-[#6E5D53]">
                  {forgotStep === 1
                    ? 'Enter your registered email address to receive an atelier recovery code.'
                    : 'Enter the verification code and choose your new password.'}
                </p>
              </div>

              {forgotStep === 1 && (
                <form onSubmit={handleForgotRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#24140E] mb-1 uppercase tracking-wider">
                      Registered Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C5A3C]/70" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="client@likha-atelier.com"
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#5C3A21]/20 rounded-xl text-xs text-[#24140E] placeholder-[#8C5A3C]/40 focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-[#5C3A21] text-white hover:bg-[#432916] font-medium text-xs tracking-wider uppercase transition-all shadow-warm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{isLoading ? 'Dispatching Code...' : 'Send Recovery Code'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C4975D]" />
                  </button>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleForgotReset} className="space-y-4">
                  {simulatedCode && (
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-center justify-between">
                      <span>Simulated Secure Code:</span>
                      <strong className="font-mono text-sm tracking-widest text-[#5C3A21]">
                        {simulatedCode}
                      </strong>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-[#24140E] mb-1 uppercase tracking-wider">
                      6-Digit Recovery Code
                    </label>
                    <input
                      type="text"
                      required
                      value={resetCodeInput}
                      onChange={(e) => setResetCodeInput(e.target.value)}
                      placeholder="123456"
                      className="w-full px-3 py-2.5 bg-white border border-[#5C3A21]/20 rounded-xl text-center font-mono tracking-widest text-sm text-[#24140E] focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#24140E] mb-1 uppercase tracking-wider">
                      New Secret Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3 py-2.5 bg-white border border-[#5C3A21]/20 rounded-xl text-xs text-[#24140E] focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-[#5C3A21] text-white hover:bg-[#432916] font-medium text-xs tracking-wider uppercase transition-all shadow-warm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{isLoading ? 'Updating...' : 'Set New Password & Sign In'}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C4975D]" />
                  </button>
                </form>
              )}

              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className="text-xs text-[#8C5A3C] hover:text-[#24140E] font-medium underline"
                >
                  ← Return to Sign In
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

