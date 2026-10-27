import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  X
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../../store/useStore';

export const AuthModal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthModalOpen, closeAuthModal, login, register, googleLogin, loading, error } = useAuthStore();

  const [mode, setMode] = useState('splash'); // 'splash' | 'email'
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  // Automatically open modal if visiting /login or /register
  const isDirectAuthUrl = location.pathname === '/login' || location.pathname === '/register';
  const isOpen = isAuthModalOpen || isDirectAuthUrl;

  useEffect(() => {
    if (location.pathname === '/register') {
      setIsRegister(true);
    }
  }, [location.pathname]);

  const handleClose = () => {
    closeAuthModal();
    setMode('splash');
    setShowForgot(false);
    if (isDirectAuthUrl) {
      navigate('/', { replace: true });
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (credentialResponse?.credential) {
        await googleLogin(credentialResponse.credential);
        handleClose();
      }
    } catch (err) {
      console.error('Google Sign-In Error:', err);
    }
  };

  const handleGoogleError = () => {
    console.error('Google Sign-In Failed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await register(formData);
      } else {
        await login(formData.email, formData.password);
      }
      handleClose();
    } catch (err) {
      console.error('Auth Error:', err);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 select-none font-sans">
      {/* Semi-transparent backdrop with blur (Shows homepage underneath) */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      />

      {/* Compact boAt-style Modal Dialog Card */}
      <div className="relative w-full max-w-[390px] sm:max-w-[410px] bg-white rounded-[28px] border border-slate-200/90 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.25)] p-6 sm:p-7 text-center z-10 animate-in zoom-in-95 fade-in duration-200">
        
        {/* Top-Right Circular Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
          title="Close"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ChhotaBhai Brand Logo Squircle */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200/90 shadow-xs flex items-center justify-center mx-auto p-2.5">
          <svg
            viewBox="0 0 64 64"
            className="w-10 h-10 sm:w-11 sm:h-11 filter drop-shadow-[0_2px_8px_rgba(225,25,56,0.3)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="cbModalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#e11938" />
              </linearGradient>
            </defs>
            <path
              d="M32 10C21 10 12 19 12 30C12 37 16 43 22 46.5L25 41C20.5 38.5 18 34.5 18 30C18 22.5 24.5 16 32 16C39.5 16 46 22.5 46 30C46 34.5 43.5 38.5 39 41L42 46.5C48 43 52 37 52 30C52 19 43 10 32 10Z"
              fill="url(#cbModalGrad)"
            />
            <path
              d="M32 22C27.5 22 24 25.5 24 30C24 33.5 26 36.5 29 38L32 32.5L35 38C38 36.5 40 33.5 40 30C40 25.5 36.5 22 32 22Z"
              fill="#0f172a"
            />
            <circle cx="32" cy="48" r="5" fill="#e11938" />
            <circle cx="32" cy="48" r="2.5" fill="#ffffff" />
          </svg>
        </div>

        {/* Headline matching boAt Reference Screen */}
        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-3">
          Welcome! Sign in to avail the best deals!
        </h3>

        {/* boAt-style Benefit Pill Badge */}
        <div className="mt-2 inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-full py-1 px-3 text-[11px] font-semibold text-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-[#e11938]" />
          <span>1 Year Warranty • Instant Prepaid Discounts</span>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-center gap-2 text-rose-700 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#e11938]" />
            <span className="truncate">{error}</span>
          </div>
        )}

        {/* =========================================================================
            MODE 1: SPLASH (SparkAI 2-Button Minimalist View)
        ========================================================================= */}
        {mode === 'splash' && (
          <div className="mt-5 space-y-2.5 animate-in fade-in duration-200">
            {/* Continue with Google */}
            <div className="relative w-full h-12 rounded-full bg-white hover:bg-slate-50 border border-slate-300 shadow-xs hover:shadow-sm flex items-center justify-center gap-2.5 transition active:scale-[0.99] cursor-pointer overflow-hidden group">
              <div className="absolute inset-0 opacity-0 z-20 flex items-center justify-center overflow-hidden cursor-pointer scale-125">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  shape="pill"
                  size="large"
                  width="360"
                />
              </div>

              <svg className="w-4 h-4 shrink-0 relative z-10" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>

              <span className="text-slate-800 text-xs sm:text-sm font-bold tracking-wide relative z-10">
                Continue with Google
              </span>
            </div>

            {/* Continue with email */}
            <button
              type="button"
              onClick={() => setMode('email')}
              className="w-full h-12 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-xs hover:shadow-sm flex items-center justify-center gap-2.5 transition active:scale-[0.99] cursor-pointer"
            >
              <Mail className="w-4 h-4 text-white/90 shrink-0" />
              <span className="text-white text-xs sm:text-sm font-bold tracking-wide">
                Continue with email
              </span>
            </button>
          </div>
        )}

        {/* =========================================================================
            MODE 2: EMAIL / PASSWORD EXPANDED FORM
        ========================================================================= */}
        {mode === 'email' && (
          <div className="mt-4 text-left animate-in fade-in duration-200">
            {/* Back button & Tab Switcher */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => setMode('splash')}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 transition cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>

              <div className="flex p-0.5 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                    !isRegister ? 'bg-[#e11938] text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                    isRegister ? 'bg-[#e11938] text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5">
              {isRegister && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Rohit Kumar"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#e11938] rounded-xl py-2 pl-8 pr-3 text-xs text-slate-900 outline-none"
                      />
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                      Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="10-digit number"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#e11938] rounded-xl py-2 pl-8 pr-3 text-xs text-slate-900 outline-none"
                      />
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@domain.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#e11938] rounded-xl py-2 pl-8 pr-3 text-xs text-slate-900 outline-none"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[10px] font-bold text-slate-700">
                    Password
                  </label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="text-[10px] font-semibold text-[#e11938] hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#e11938] rounded-xl py-2 pl-8 pr-8 text-xs text-slate-900 outline-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 rounded-full bg-[#e11938] hover:bg-[#be123c] text-white text-xs font-black uppercase tracking-wider transition-all shadow-xs disabled:opacity-50 cursor-pointer active:scale-[0.99]"
              >
                {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
              </button>
            </form>
          </div>
        )}

        {/* Footer Disclaimer */}
        <p className="mt-4 text-[10px] sm:text-[11px] text-slate-500 leading-relaxed">
          By continuing, you agree to our{' '}
          <Link to="/" onClick={handleClose} className="text-slate-700 hover:text-slate-900 underline font-medium">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/" onClick={handleClose} className="text-slate-700 hover:text-slate-900 underline font-medium">
            Privacy Policy
          </Link>
          .
        </p>

        {/* Forgot Password Mini Sheet */}
        {showForgot && (
          <div className="absolute inset-0 bg-white rounded-[28px] p-6 flex flex-col justify-between text-left animate-in fade-in duration-150 z-30">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-black text-slate-900">Reset Password</h4>
                <button
                  onClick={() => {
                    setShowForgot(false);
                    setForgotSent(false);
                    setForgotEmail('');
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Enter your account email to receive a password reset link.
              </p>

              {forgotSent ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Reset link sent to <strong>{forgotEmail}</strong>.</span>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-2.5">
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-[#e11938] text-white text-xs font-bold uppercase rounded-xl transition"
                  >
                    Send Reset Link
                  </button>
                </form>
              )}
            </div>

            <button
              onClick={() => setShowForgot(false)}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 text-center"
            >
              ← Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
