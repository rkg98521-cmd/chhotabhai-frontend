import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  RefreshCw,
  Award,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-slate-50 border-t border-slate-200 text-slate-600 text-xs mt-24">
      {/* 4-Pillar Trust Strip */}
      <div className="border-b border-slate-200 bg-white py-10">
        <div className="cb-container grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center p-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-brand-red mb-3 shadow-sm">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">1 Year Warranty</h4>
            <p className="text-[11px] text-slate-500 mt-1">Official replacement warranty across India</p>
          </div>

          <div className="flex flex-col items-center p-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-brand-red mb-3 shadow-sm">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">7 Days Replacement</h4>
            <p className="text-[11px] text-slate-500 mt-1">Hassle-free replacement for all accessories</p>
          </div>

          <div className="flex flex-col items-center p-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-brand-red mb-3 shadow-sm">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Free Express Delivery</h4>
            <p className="text-[11px] text-slate-500 mt-1">Fast doorstep dispatch on all prepaid orders</p>
          </div>

          <div className="flex flex-col items-center p-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-brand-red mb-3 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">100% Genuine Gear</h4>
            <p className="text-[11px] text-slate-500 mt-1">Directly engineered & authenticated</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="cb-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter select-none">
              Chhota<span className="text-[#e11938]">Bhai</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              India&apos;s hyper-growing mobile accessories brand. Military drop-tested shockproof cases, 9H privacy tempered glass, and 65W GaN charging gear engineered for modern mobile devices.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <Lock className="w-3.5 h-3.5 text-brand-red" />
              <span>100% Prepaid Secure Razorpay / UPI Gateway</span>
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">Mobile Accessories</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/shop?category=back-cases" className="hover:text-brand-red transition-colors">
                  MagSafe Back Covers
                </Link>
              </li>
              <li>
                <Link to="/shop?category=tempered-glass" className="hover:text-brand-red transition-colors">
                  9H Privacy Tempered Glass
                </Link>
              </li>
              <li>
                <Link to="/shop?category=fast-wall-chargers" className="hover:text-brand-red transition-colors">
                  65W GaN Fast Chargers
                </Link>
              </li>
              <li>
                <Link to="/shop?category=braided-data-cables" className="hover:text-brand-red transition-colors">
                  100W Braided Data Cables
                </Link>
              </li>
              <li>
                <Link to="/shop?category=camera-lens-protectors" className="hover:text-brand-red transition-colors">
                  Sapphire Lens Protectors
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">Customer Care</h4>
            <ul className="space-y-2.5">
              <li><Link to="/track" className="hover:text-brand-red transition-colors">Track Your Order</Link></li>
              <li><Link to="/shop" className="hover:text-brand-red transition-colors">Warranty Claim</Link></li>
              <li><Link to="/shop" className="hover:text-brand-red transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/shop" className="hover:text-brand-red transition-colors">Privacy Policy</Link></li>
              <li><Link to="/shop" className="hover:text-brand-red transition-colors">Prepaid Terms</Link></li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Join The VIP Club</h4>
            <p className="text-xs text-slate-500">
              Subscribe to get secret drop alerts, flash sale invites & promo codes.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="bg-white border border-slate-300 text-xs rounded-l-xl py-2.5 px-3 outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red flex-1 text-slate-900 placeholder-slate-400"
                />
                <button
                  type="submit"
                  className="bg-brand-red hover:bg-brand-red-hover text-white px-3.5 rounded-r-xl transition-colors flex items-center justify-center shadow-sm"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {subscribed && (
                <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Subscribed successfully! Check inbox.
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} ChhotaBhai Mobile Accessories Ltd. All rights reserved.</p>
          <div className="mt-3 sm:mt-0 flex items-center gap-4 text-slate-600">
            <span>Instant UPI</span>
            <span>•</span>
            <span>Google Pay</span>
            <span>•</span>
            <span>PhonePe</span>
            <span>•</span>
            <span>Cards</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">100% Prepaid Safe</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
