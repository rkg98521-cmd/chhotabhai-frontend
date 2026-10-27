import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  X,
  MessageCircle
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/useStore';

export const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(location.pathname === '/register');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [demoFeedback, setDemoFeedback] = useState('');

  // Dynamically calculate Google button width to prevent overflow on small mobile screens
  const [googleWidth, setGoogleWidth] = useState('320');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 360) {
        setGoogleWidth('270');
      } else if (width < 420) {
        setGoogleWidth('300');
      } else {
        setGoogleWidth('340');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsRegister(location.pathname === '/register');
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

  const toggleAuthMode = (registerMode) => {
    setIsRegister(registerMode);
    navigate(registerMode ? '/register' : '/login', { replace: true });
  };

  // Quick autofill demo credentials helper
  const autofillDemo = (role) => {
    if (role === 'admin') {
      setFormData({
        name: 'Store Administrator',
        email: 'admin@chhotabhai.com',
        password: 'Admin@12345',
        phone: '9852124942',
      });
      setIsRegister(false);
      setDemoFeedback('Admin demo loaded');
    } else {
      setFormData({
        name: 'Rohit Customer',
        email: 'rohit@chhotabhai.com',
        password: 'Customer@12345',
        phone: '9852124942',
      });
      setIsRegister(false);
      setDemoFeedback('Customer demo loaded');
    }
    setTimeout(() => setDemoFeedback(''), 2500);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center pt-4 pb-28 sm:py-12 px-4 bg-gradient-to-b from-slate-50 via-white to-slate-100 relative">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-red-100/40 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-slate-200/50 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Main Authentication Card */}
      <div className="w-full max-w-[430px] bg-white rounded-3xl border border-slate-200/90 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.08)] p-6 sm:p-8 relative z-10 transition-all">
        
        {/* Header Branding */}
        <div className="text-center space-y-1.5 mb-5">
          <Link to="/" className="inline-block group focus:outline-none">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
              Chhota<span className="text-[#e11938]">Bhai</span>
            </span>
          </Link>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
            {isRegister
              ? 'Create an account to track orders & unlock exclusive member deals'
              : 'Sign in to access your orders, cart & saved delivery addresses'}
          </p>
        </div>

        {/* Auth Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => toggleAuthMode(false)}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              !isRegister
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => toggleAuthMode(true)}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              isRegister
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="mb-4 p-2.5 bg-slate-50/90 border border-slate-200/70 rounded-2xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#e11938]" />
              Quick Demo Access
            </span>
            {demoFeedback && (
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3 h-3" />
                {demoFeedback}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => autofillDemo('customer')}
              className="px-2.5 py-1.5 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 active:scale-98 border border-slate-200 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Customer Demo</span>
            </button>
            <button
              type="button"
              onClick={() => autofillDemo('admin')}
              className="px-2.5 py-1.5 text-[11px] font-bold text-rose-700 bg-rose-50/60 hover:bg-rose-100/70 active:scale-98 border border-rose-200/80 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-700 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <p className="text-xs font-semibold leading-relaxed">{error}</p>
          </div>
        )}

        {/* Google Login Section - Sized responsively to never clip or squish */}
        <div className="space-y-3">
          <div className="w-full flex justify-center items-center overflow-hidden min-h-[44px]">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              shape="rectangular"
              theme="outline"
              size="large"
              text={isRegister ? 'signup_with' : 'signin_with'}
              width={googleWidth}
              logo_alignment="left"
            />
          </div>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Or continue with email
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>
        </div>

        {/* Standard Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rohit Kumar"
                    className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#e11938] focus:ring-3 focus:ring-[#e11938]/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none transition"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#e11938] focus:ring-3 focus:ring-[#e11938]/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none transition"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@domain.com"
                className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#e11938] focus:ring-3 focus:ring-[#e11938]/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Password
              </label>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-semibold text-[#e11938] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#e11938] focus:ring-3 focus:ring-[#e11938]/10 rounded-xl py-2.5 pl-10 pr-10 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3.5 bg-gradient-to-r from-[#e11938] to-[#c4142f] hover:from-[#c4142f] hover:to-[#a81026] active:scale-[0.99] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_16px_rgba(225,25,56,0.28)] hover:shadow-[0_6px_20px_rgba(225,25,56,0.36)] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security & SSL Trust Badge */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>256-bit SSL encrypted • Official Authentic Store</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowForgotModal(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#e11938]" />
                <h3 className="font-bold text-sm text-slate-900">Reset Your Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSent ? (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm text-slate-900">Reset Request Received</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  If an account exists for <span className="font-semibold text-slate-800">{forgotEmail}</span>, recovery instructions will be sent shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSent(false);
                    setForgotEmail('');
                  }}
                  className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your registered email address and we'll help you regain access, or connect with our support team on WhatsApp.
                </p>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#e11938] rounded-xl py-2 px-3 text-xs font-medium text-slate-900 outline-none"
                  />
                </div>
                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#e11938] hover:bg-[#c4142f] text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Request Password Reset
                  </button>
                  <a
                    href="https://wa.me/919852124942?text=Hi%20ChhotaBhai%2C%20I%20need%20help%20resetting%20my%20account%20password."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Instant Help via WhatsApp</span>
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
