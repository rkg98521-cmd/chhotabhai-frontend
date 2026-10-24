import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, User, Phone, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/useStore';

export const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(location.pathname === '/register');

  useEffect(() => {
    setIsRegister(location.pathname === '/register');
  }, [location.pathname]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const { login, register, loading, error } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        const user = await register(formData);
        navigate(user?.role === 'admin' ? '/admin' : '/shop');
      } else {
        const user = await login(formData.email, formData.password);
        navigate(user?.role === 'admin' ? '/admin' : '/shop');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFillDemo = (email, password) => {
    setFormData((prev) => ({ ...prev, email, password }));
    setIsRegister(false);
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4 bg-white text-slate-900">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
            {isRegister ? 'Join The' : 'Welcome to'}{' '}
            <span className="text-brand-red">ChhotaBhai</span>
          </h1>
          <p className="text-xs text-slate-500">
            {isRegister
              ? 'Create your account to unlock VIP pricing and fast tracking'
              : 'Sign in to access your orders and saved cart items'}
          </p>
        </div>

        {/* Demo Credentials Quick-Fill Banner */}
        {!isRegister && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-red" /> Quick Demo Access
              </span>
              <span className="text-[10px] text-slate-400">Click to autofill</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('rohit@chhotabhai.com', 'Customer@12345')}
                className="py-2 px-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all group cursor-pointer shadow-2xs"
              >
                <div className="text-[11px] font-bold text-slate-900 group-hover:text-brand-red flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-500" /> Customer Demo
                </div>
                <div className="text-[10px] text-slate-500 truncate">rohit@chhotabhai.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('admin@chhotabhai.com', 'Admin@12345')}
                className="py-2 px-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all group cursor-pointer shadow-2xs"
              >
                <div className="text-[11px] font-bold text-slate-900 group-hover:text-brand-red flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-brand-red" /> Admin Demo
                </div>
                <div className="text-[10px] text-slate-500 truncate">admin@chhotabhai.com</div>
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-brand-red rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="text-xs text-slate-600 block mb-1 font-medium">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-red focus:bg-white"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 block mb-1 font-medium">Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Mobile number"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-red focus:bg-white"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs text-slate-600 block mb-1 font-medium">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@domain.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-red focus:bg-white"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600 block mb-1 font-medium">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-red focus:bg-white"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-red hover:bg-brand-red-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isRegister ? 'Create Account' : 'Sign In'} <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => {
              const nextState = !isRegister;
              setIsRegister(nextState);
              navigate(nextState ? '/register' : '/login');
            }}
            className="text-xs text-slate-500 hover:text-brand-red transition-colors font-semibold"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
