import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  LayoutGrid,
  Zap,
  X,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { useFilterStore } from '../../store/useStore';
import CategoryIcon from '../common/CategoryIcon';

/**
 * MobileBottomNav Component
 * Faithful implementation of modern mobile e-commerce bottom navigation
 * Includes: Home, Categories (with slide-up drawer), Crazy Deals, and Chat (WhatsApp)
 * Full safe area support for iOS / Android home bars.
 */
export const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [categoriesDrawerOpen, setCategoriesDrawerOpen] = useState(false);

  const { setCategory } = useFilterStore();

  const rawNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '9852124942';
  const digitsOnly = String(rawNumber).replace(/\D/g, '');
  const formattedNumber =
    digitsOnly.startsWith('91') && digitsOnly.length > 10
      ? digitsOnly
      : `91${digitsOnly.slice(-10)}`;

  const defaultMessage = encodeURIComponent(
    'Hello ChhotaBhai Support, I need help regarding products & orders.'
  );
  const whatsappUrl = `https://wa.me/${formattedNumber}?text=${defaultMessage}`;

  const categories = [
    { name: 'True Wireless Earbuds', slug: 'tws-earbuds', tag: 'Best Sellers' },
    { name: 'Wireless Neckbands', slug: 'neckbands', tag: 'Trending' },
    { name: 'Smartwatches', slug: 'smartwatches', tag: 'AMOLED' },
    { name: 'Wireless Headphones', slug: 'headphones', tag: 'Bass' },
    { name: 'Wired Earphones', slug: 'wired-earphones', tag: 'Type-C / 3.5mm' },
    { name: 'Power Banks', slug: 'power-banks', tag: 'Fast Charging' },
    { name: 'Fast Chargers', slug: 'fast-wall-chargers', tag: '65W GaN' },
    { name: 'Mobile Back Covers', slug: 'back-cases', tag: 'Custom Fit' },
    { name: '9H Tempered Glass', slug: 'tempered-glass', tag: 'Edge-to-Edge' },
    { name: 'Car Accessories', slug: 'car-accessories', tag: 'MagSafe' },
    { name: 'Cables & Adapters', slug: 'cables-adapters', tag: 'Braided' },
    { name: 'Bluetooth Speakers', slug: 'speakers', tag: 'Party Bass' },
  ];

  const isHomeActive = location.pathname === '/' && !categoriesDrawerOpen;
  const isShopActive = (location.pathname === '/shop' || categoriesDrawerOpen) && !location.search.includes('deal') && !location.search.includes('crazy-deals');
  const isDealsActive = location.search.includes('deal') || location.search.includes('crazy-deals');

  const handleCategorySelect = (slug) => {
    setCategory(slug);
    setCategoriesDrawerOpen(false);
    navigate(`/shop?category=${slug}`);
  };

  return (
    <>
      {/* ============================================================== */}
      {/* CATEGORIES SLIDE-UP BOTTOM SHEET (When "Categories" is tapped) */}
      {/* ============================================================== */}
      {categoriesDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={() => setCategoriesDrawerOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Bottom Sheet Modal */}
          <div
            className="relative w-full max-h-[82vh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 z-10"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
          >
            {/* Grab Bar Handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1" />

            {/* Header */}
            <div className="px-5 py-3 flex items-center justify-between border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-[#e11938]" />
                  <span>Shop by Category</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Select a category to browse tailored accessories
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCategoriesDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                aria-label="Close categories"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Categories Grid (Scrollable) */}
            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-2">
              <div className="grid grid-cols-2 gap-2.5">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => handleCategorySelect(cat.slug)}
                    className="flex items-center gap-3 p-2.5 rounded-2xl border border-slate-100 hover:border-slate-300 bg-slate-50/70 hover:bg-white text-left transition-all active:scale-98 cursor-pointer shadow-xs"
                  >
                    <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0 border border-slate-200/60 shadow-xs">
                      <CategoryIcon slug={cat.slug} className="w-8 h-8" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 leading-tight line-clamp-2">
                        {cat.name}
                      </p>
                      {cat.tag && (
                        <span className="inline-block text-[9.5px] font-semibold text-[#e11938] mt-0.5">
                          {cat.tag}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* View All Products Shortcut */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCategoriesDrawerOpen(false);
                    navigate('/shop');
                  }}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                >
                  <span>Explore All Products</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* FIXED MOBILE BOTTOM NAVIGATION BAR                              */}
      {/* ============================================================== */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
        }}
      >
        <div className="flex items-stretch justify-around h-14 sm:h-16 px-1 max-w-lg mx-auto">
          {/* TAB 1: HOME */}
          <Link
            to="/"
            onClick={() => {
              setCategoriesDrawerOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex-1 flex flex-col items-center justify-center py-1 relative text-center group cursor-pointer active:scale-95 transition-transform"
          >
            <div className="relative flex items-center justify-center">
              <Home
                className={`w-5 h-5 transition-colors ${
                  isHomeActive ? 'text-slate-950 stroke-[2.4]' : 'text-slate-500 stroke-[1.8]'
                }`}
              />
            </div>
            <span
              className={`text-[10px] tracking-tight leading-none mt-1 transition-colors ${
                isHomeActive ? 'font-black text-slate-950' : 'font-medium text-slate-500'
              }`}
            >
              Home
            </span>
            {/* Active Indicator Underline (boAt style) */}
            {isHomeActive && (
              <span className="w-5 h-[2.5px] bg-[#e11938] rounded-full mt-0.5" />
            )}
          </Link>

          {/* TAB 2: CATEGORIES */}
          <button
            type="button"
            onClick={() => setCategoriesDrawerOpen(!categoriesDrawerOpen)}
            className="flex-1 flex flex-col items-center justify-center py-1 relative text-center group cursor-pointer active:scale-95 transition-transform"
          >
            <div className="relative flex items-center justify-center">
              <LayoutGrid
                className={`w-5 h-5 transition-colors ${
                  isShopActive ? 'text-slate-950 stroke-[2.4]' : 'text-slate-500 stroke-[1.8]'
                }`}
              />
            </div>
            <span
              className={`text-[10px] tracking-tight leading-none mt-1 transition-colors ${
                isShopActive ? 'font-black text-slate-950' : 'font-medium text-slate-500'
              }`}
            >
              Categories
            </span>
            {isShopActive && (
              <span className="w-5 h-[2.5px] bg-[#e11938] rounded-full mt-0.5" />
            )}
          </button>

          {/* TAB 3: CRAZY DEALS */}
          <Link
            to="/shop?filter=crazy-deals"
            onClick={() => setCategoriesDrawerOpen(false)}
            className="flex-1 flex flex-col items-center justify-center py-1 relative text-center group cursor-pointer active:scale-95 transition-transform"
          >
            <div className="relative flex items-center justify-center">
              <Zap
                className={`w-5 h-5 transition-colors ${
                  isDealsActive ? 'text-[#e11938] stroke-[2.4]' : 'text-slate-500 stroke-[1.8]'
                }`}
              />
            </div>
            <span
              className={`text-[10px] tracking-tight leading-none mt-1 transition-colors ${
                isDealsActive ? 'font-black text-[#e11938]' : 'font-medium text-slate-500'
              }`}
            >
              Crazy Deals
            </span>
            {isDealsActive && (
              <span className="w-5 h-[2.5px] bg-[#e11938] rounded-full mt-0.5" />
            )}
          </Link>

          {/* TAB 5: CHAT (Official WhatsApp API Integration) */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="flex-1 flex flex-col items-center justify-center py-1 relative text-center group cursor-pointer active:scale-95 transition-transform"
          >
            <div className="relative flex items-center justify-center">
              {/* WhatsApp Authentic Vector SVG */}
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="#25D366"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15ZM16.56 14.41C16.31 14.29 15.1 13.69 14.88 13.61C14.65 13.53 14.49 13.49 14.32 13.74C14.16 13.99 13.69 14.54 13.55 14.7C13.41 14.87 13.26 14.89 13.01 14.77C12.77 14.65 11.98 14.39 11.04 13.55C10.31 12.9 9.81 12.1 9.67 11.85C9.53 11.61 9.65 11.47 9.78 11.35C9.89 11.24 10.02 11.07 10.15 10.92C10.27 10.77 10.31 10.66 10.39 10.5C10.47 10.33 10.43 10.19 10.37 10.07C10.31 9.95 9.82 8.74 9.61 8.24C9.41 7.76 9.21 7.82 9.06 7.81C8.92 7.81 8.75 7.81 8.59 7.81C8.42 7.81 8.16 7.87 7.93 8.12C7.71 8.37 7.08 8.96 7.08 10.15C7.08 11.34 7.95 12.49 8.07 12.65C8.19 12.82 9.77 15.26 12.21 16.31C12.79 16.56 13.24 16.71 13.59 16.82C14.17 17.01 14.7 16.98 15.12 16.92C15.59 16.85 16.56 16.33 16.77 15.75C16.97 15.17 16.97 14.67 16.91 14.57C16.85 14.47 16.72 14.41 16.48 14.29L16.56 14.41Z"
                />
              </svg>
            </div>
            <span className="text-[10px] tracking-tight leading-none mt-1 font-medium text-slate-600">
              Chat
            </span>
          </a>
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;
