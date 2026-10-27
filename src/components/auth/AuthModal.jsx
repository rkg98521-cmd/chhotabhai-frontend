import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  X,
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
        const loggedUser = await googleLogin(credentialResponse.credential);
        const searchParams = new URLSearchParams(location.search);
        const redirectUrl = searchParams.get('redirect');

        if (redirectUrl) {
          closeAuthModal();
          navigate(redirectUrl, { replace: true });
          return;
        }

        if (loggedUser?.role === 'admin') {
          closeAuthModal();
          navigate('/admin', { replace: true });
          return;
        }

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
      let loggedUser;
      if (isRegister) {
        loggedUser = await register(formData);
      } else {
        loggedUser = await login(formData.email, formData.password);
      }

      const searchParams = new URLSearchParams(location.search);
      const redirectUrl = searchParams.get('redirect');

      if (redirectUrl) {
        closeAuthModal();
        navigate(redirectUrl, { replace: true });
        return;
      }

      if (loggedUser?.role === 'admin') {
        closeAuthModal();
        navigate('/admin', { replace: true });
        return;
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
      {/* Semi-transparent backdrop with blur (shows homepage cleanly underneath) */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      />

      {/* Pro-Engineered ChhotaBhai Dialog Card (Proportional, balanced & spacious) */}
      <div className="relative w-full max-w-[410px] sm:max-w-[430px] bg-white rounded-[30px] sm:rounded-[34px] border border-slate-200/90 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.28)] p-6 sm:p-8 text-left z-10 animate-in zoom-in-95 fade-in duration-200">
        
        {/* Top Header Bar: Brand Logo (Left) + Close Button (Right) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#e11938] to-[#ff4d6d] flex items-center justify-center text-white font-black text-sm shadow-xs">
              cb
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight font-sans">
              Chhota<span className="text-[#e11938]">Bhai</span>
            </span>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
            title="Close"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#e11938]" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* =========================================================================
            MODE 1: SPLASH (Google + Email Selection)
        ========================================================================= */}
        {mode === 'splash' && (
          <div className="animate-in fade-in duration-200">
            {/* Header Text Hierarchy */}
            <div className="pt-6 sm:pt-7 space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e11938]">
                WELCOME TO
              </p>
              <h2 className="text-2xl sm:text-[30px] font-black tracking-tight text-slate-900 font-sans leading-tight">
                Chhota<span className="text-[#e11938]">Bhai</span>
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-500 font-medium leading-relaxed pt-1">
                Your trusted platform for a better and easier experience.
              </p>
            </div>

            {/* Action Buttons: Google + Email (Both large, identical height & generous padding) */}
            <div className="mt-7 sm:mt-8 space-y-3.5">
              {/* 1. Continue with Google */}
              <div className="relative w-full h-14 sm:h-15 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 shadow-xs hover:shadow-sm flex items-center justify-between px-5 transition active:scale-[0.99] cursor-pointer overflow-hidden group">
                <div className="absolute inset-0 opacity-0 z-20 flex items-center justify-center overflow-hidden cursor-pointer scale-125">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    shape="rectangular"
                    size="large"
                    width="400"
                  />
                </div>

                <div className="flex items-center gap-3.5 relative z-10">
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                  <span className="h-5 w-px bg-slate-200" />
                  <span className="text-slate-800 text-sm sm:text-[15px] font-bold tracking-wide">
                    Continue with Google
                  </span>
                </div>

                <ArrowRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all relative z-10" />
              </div>

              {/* 2. Continue with email */}
              <button
                type="button"
                onClick={() => setMode('email')}
                className="w-full h-14 sm:h-15 rounded-2xl bg-slate-900 hover:bg-black text-white shadow-xs hover:shadow-sm flex items-center justify-between px-5 transition active:scale-[0.99] cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white/90" />
                  </div>
                  <span className="h-5 w-px bg-white/20" />
                  <span className="text-white text-sm sm:text-[15px] font-bold tracking-wide">
                    Continue with email
                  </span>
                </div>

                <ArrowRight className="w-4.5 h-4.5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            {/* Bottom Disclaimer with Shield (Centered) */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col items-center justify-center text-center text-[11px] text-slate-500">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>By continuing, you agree to our</span>
              </div>
              <div>
                <Link
                  to="/terms"
                  onClick={handleClose}
                  className="text-slate-900 font-bold underline underline-offset-2 hover:text-[#e11938]"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to="/privacy"
                  onClick={handleClose}
                  className="text-slate-900 font-bold underline underline-offset-2 hover:text-[#e11938]"
                >
                  Privacy Policy
                </Link>
                .
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODE 2: EMAIL / PASSWORD EXPANDED FORM (Roomy, Proportional & Bold Inputs)
        ========================================================================= */}
        {mode === 'email' && (
          <div className="pt-4 animate-in fade-in duration-200">
            {/* Header: Back Button & Mode Title */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setMode('splash')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to options
              </button>

              {/* Segmented Sign In / Register Tabs */}
              <div className="flex p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    !isRegister ? 'bg-[#e11938] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    isRegister ? 'bg-[#e11938] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {/* Form Title & Context */}
            <div className="pt-4 pb-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {isRegister ? 'Create an Account' : 'Welcome Back'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRegister
                  ? 'Sign up to track your orders and save items to wishlist.'
                  : 'Enter your credentials to continue to ChhotaBhai.'}
              </p>
            </div>

            {/* Input Form Fields: Roomy, Tall & Premium Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              {isRegister && (
                <>
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      Full Name
                    </label>
                    <div className="relative h-13 rounded-2xl bg-slate-50 border border-slate-200/90 focus-within:border-[#e11938] focus-within:bg-white focus-within:ring-4 focus-within:ring-rose-500/10 transition-all">
                      <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full h-full bg-transparent pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      Phone Number (Optional)
                    </label>
                    <div className="relative h-13 rounded-2xl bg-slate-50 border border-slate-200/90 focus-within:border-[#e11938] focus-within:bg-white focus-within:ring-4 focus-within:ring-rose-500/10 transition-all">
                      <Phone className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full h-full bg-transparent pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Email Address
                </label>
                <div className="relative h-13 rounded-2xl bg-slate-50 border border-slate-200/90 focus-within:border-[#e11938] focus-within:bg-white focus-within:ring-4 focus-within:ring-rose-500/10 transition-all">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@domain.com"
                    className="w-full h-full bg-transparent pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Password
                  </label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="text-xs text-[#e11938] hover:underline font-bold"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative h-13 rounded-2xl bg-slate-50 border border-slate-200/90 focus-within:border-[#e11938] focus-within:bg-white focus-within:ring-4 focus-within:ring-rose-500/10 transition-all">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full h-full bg-transparent pl-12 pr-12 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA (Matched to input height, powerful crimson button) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-13 sm:h-14 mt-6 bg-[#e11938] hover:bg-[#be123c] text-white text-sm font-bold uppercase tracking-wider rounded-2xl transition cursor-pointer shadow-lg shadow-rose-600/25 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* =========================================================================
            FORGOT PASSWORD SUB-VIEW
        ========================================================================= */}
        {showForgot && (
          <div className="absolute inset-0 bg-white rounded-[30px] sm:rounded-[34px] p-6 sm:p-8 flex flex-col justify-between z-30 animate-in fade-in">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-slate-900 uppercase">
                  Reset Password
                </h3>
                <button
                  onClick={() => setShowForgot(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Enter your account email to receive a password reset link.
              </p>

              {forgotSent ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Reset link sent to <strong>{forgotEmail}</strong>.</span>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="relative h-13 rounded-2xl bg-slate-50 border border-slate-200/90 focus-within:border-[#e11938] focus-within:bg-white focus-within:ring-4 focus-within:ring-rose-500/10 transition-all">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full h-full bg-transparent pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full h-13 bg-[#e11938] text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition shadow-md"
                  >
                    Send Reset Link
                  </button>
                </form>
              )}
            </div>

            <button
              onClick={() => setShowForgot(false)}
              className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 text-center cursor-pointer"
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
