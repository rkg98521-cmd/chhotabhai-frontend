import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
  X
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/useStore';

export const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Mode: 'splash' (SparkAI-style 2-button screen) or 'email' (Email/Password form)
  const [viewMode, setViewMode] = useState('splash');
  const [isRegister, setIsRegister] = useState(location.pathname === '/register');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Sync route /register vs /login
  useEffect(() => {
    if (location.pathname === '/register') {
      setIsRegister(true);
    }
  }, [location.pathname]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const { login, register, googleLogin, loading, error } = useAuthStore();

  const handleAuthRedirect = (user) => {
    if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        const user = await register(formData);
        handleAuthRedirect(user);
      } else {
        const user = await login(formData.email, formData.password);
        handleAuthRedirect(user);
      }
    } catch (err) {
      console.error('Authentication Error:', err);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (credentialResponse?.credential) {
        const user = await googleLogin(credentialResponse.credential);
        handleAuthRedirect(user);
      }
    } catch (err) {
      console.error('Google Sign-In Error:', err);
    }
  };

  const handleGoogleError = () => {
    console.error('Google Sign-In Failed');
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100/70 text-slate-900 flex flex-col justify-between px-6 py-8 sm:py-12 relative overflow-hidden select-none font-sans">
      
      {/* Soft ambient brand atmosphere glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-[#e11938]/6 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-slate-200/50 rounded-full blur-[120px] pointer-events-none -z-0" />

      {/* Top Header Row with Back to Store & Close Button */}
      <div className="w-full max-w-sm sm:max-w-md mx-auto flex items-center justify-between relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
        >
          <span>← Back to Store</span>
        </Link>

        <Link
          to="/"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-slate-100 border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-500 hover:text-slate-900 transition cursor-pointer"
          title="Close & return to store"
          aria-label="Close"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </Link>
      </div>

      {/* Center Branding Area (Exact SparkAI Layout in Website Theme) */}
      <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center text-center my-auto py-6 sm:py-8 relative z-10">
        
        {/* App Logo Squircle Icon (Website Theme: Crisp White Card with Depth & Red Glow) */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[26px] bg-white border border-slate-200/90 shadow-[0_12px_32px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.04)] flex items-center justify-center relative p-3 group transition-transform duration-300 hover:scale-105">
          {/* Subtle top reflection sheen */}
          <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white to-transparent rounded-t-[26px] pointer-events-none" />

          {/* Glowing Brand 3D Ribbon Monogram */}
          <svg
            viewBox="0 0 64 64"
            className="w-12 h-12 sm:w-14 sm:h-14 filter drop-shadow-[0_4px_12px_rgba(225,25,56,0.25)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="cbGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#e11938" />
              </linearGradient>
            </defs>

            {/* Futuristic Interlocking Sound & Shield Loops */}
            <path
              d="M32 10C21 10 12 19 12 30C12 37 16 43 22 46.5L25 41C20.5 38.5 18 34.5 18 30C18 22.5 24.5 16 32 16C39.5 16 46 22.5 46 30C46 34.5 43.5 38.5 39 41L42 46.5C48 43 52 37 52 30C52 19 43 10 32 10Z"
              fill="url(#cbGradLight)"
            />
            <path
              d="M32 22C27.5 22 24 25.5 24 30C24 33.5 26 36.5 29 38L32 32.5L35 38C38 36.5 40 33.5 40 30C40 25.5 36.5 22 32 22Z"
              fill="#0f172a"
            />
            {/* Center Dynamic Bass Core */}
            <circle cx="32" cy="48" r="5" fill="#e11938" />
            <circle cx="32" cy="48" r="2.5" fill="#ffffff" />
          </svg>
        </div>

        {/* Brand Name Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-5 select-none font-sans">
          Chhota<span className="text-[#e11938]">Bhai</span>
        </h1>

        {/* Project Tagline Subtitle */}
        <p className="text-xs sm:text-sm text-slate-500 font-medium tracking-wide mt-1.5">
          Smart Mobile Audio & Gear
        </p>

        {/* Global Error Display */}
        {error && (
          <div className="mt-5 w-full p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center gap-2 text-rose-700 text-xs animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#e11938]" />
            <span>{error}</span>
          </div>
        )}

        {/* =========================================================================
            VIEW 1: SPARK-AI STYLE 2-BUTTON LANDING SCREEN (In Website Theme)
        ========================================================================= */}
        {viewMode === 'splash' && (
          <div className="w-full mt-8 sm:mt-10 space-y-3.5 animate-in fade-in duration-200">
            
            {/* Primary Action 1: Continue with Google (Clean White Pill) */}
            <div className="relative w-full h-13 sm:h-14 rounded-full bg-white hover:bg-slate-50 border border-slate-200 shadow-xs hover:shadow-sm flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer overflow-hidden group active:scale-[0.99]">
              
              {/* Invisible GoogleLogin overlay catching clicks natively */}
              <div className="absolute inset-0 opacity-0 z-20 flex items-center justify-center overflow-hidden cursor-pointer scale-125">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  shape="pill"
                  size="large"
                  width="400"
                />
              </div>

              {/* Official 4-color Google G Icon */}
              <svg className="w-5 h-5 shrink-0 relative z-10" viewBox="0 0 24 24">
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

              <span className="text-slate-800 text-sm sm:text-base font-semibold tracking-wide relative z-10">
                Continue with Google
              </span>
            </div>

            {/* Primary Action 2: Continue with email (Sleek Slate-900 Pill) */}
            <button
              type="button"
              onClick={() => setViewMode('email')}
              className="w-full h-13 sm:h-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow-md flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer active:scale-[0.99]"
            >
              <Mail className="w-5 h-5 text-white/90 shrink-0" />
              <span className="text-white text-sm sm:text-base font-semibold tracking-wide">
                Continue with email
              </span>
            </button>
          </div>
        )}

        {/* =========================================================================
            VIEW 2: EMAIL / PASSWORD EXPANDED FORM (In Website Theme)
        ========================================================================= */}
        {viewMode === 'email' && (
          <div className="w-full mt-6 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 text-left shadow-xl animate-in fade-in zoom-in-95 duration-200">
            
            {/* Back Button & Switcher Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setViewMode('splash')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <div className="flex p-0.5 bg-slate-100 border border-slate-200/60 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                    !isRegister ? 'bg-[#e11938] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                    isRegister ? 'bg-[#e11938] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {isRegister && (
                <>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Rohit Kumar"
                        className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-[#e11938] focus:ring-3 focus:ring-[#e11938]/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="10-digit mobile number"
                        className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-[#e11938] focus:ring-3 focus:ring-[#e11938]/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@domain.com"
                    className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-[#e11938] focus:ring-3 focus:ring-[#e11938]/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    Password
                  </label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
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
                    className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-[#e11938] focus:ring-3 focus:ring-[#e11938]/10 rounded-xl py-2.5 pl-9 pr-9 text-xs text-slate-900 placeholder-slate-400 outline-none transition"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 rounded-full bg-[#e11938] hover:bg-[#be123c] text-white text-xs font-black uppercase tracking-wider transition-all shadow-[0_4px_16px_rgba(225,25,56,0.25)] hover:shadow-[0_6px_20px_rgba(225,25,56,0.35)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In with Email'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Legal Disclaimer (SparkAI Style) */}
      <div className="w-full max-w-sm mx-auto text-center relative z-10 pb-2">
        <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
          By continuing, you agree to our{' '}
          <Link to="/" className="text-slate-700 hover:text-slate-900 underline font-medium transition">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/" className="text-slate-700 hover:text-slate-900 underline font-medium transition">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      {/* Forgot Password Helper Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full text-slate-900 relative shadow-2xl">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotSent(false);
                setForgotEmail('');
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-black text-slate-900 mb-1.5">Reset Your Password</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Enter your registered account email. We'll send a secure password reset link.
            </p>

            {forgotSent ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                <div className="text-xs">
                  <p className="font-bold text-slate-900">Reset link dispatched</p>
                  <p className="mt-0.5 text-slate-600">Check inbox at <strong className="text-slate-900">{forgotEmail}</strong>.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#e11938] rounded-xl py-2.5 px-3 text-xs text-slate-900 placeholder-slate-400 outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#e11938] hover:bg-[#be123c] text-white text-xs font-bold uppercase rounded-xl transition shadow-md"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
