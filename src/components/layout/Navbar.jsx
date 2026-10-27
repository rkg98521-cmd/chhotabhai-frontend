import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  User as UserIcon,
  Search,
  Menu,
  X,
  ChevronDown,
  Zap,
  Heart,
  Package,
  Smartphone,
  Truck,
  Shield,
  LogOut,
  Gift,
  Building,
  Sparkles,
} from 'lucide-react';
import { useAuthStore, useCartStore, useFilterStore, useWishlistStore } from '../../store/useStore';
import { useDeviceStore } from '../../store/useDeviceStore';
import axiosInstance from '../../api/axiosInstance';
import SearchModal from './SearchModal';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [categoriesDropdown, setCategoriesDropdown] = useState(false);
  const [moreDropdown, setMoreDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const userDropdownRef = useRef(null);


  const { user, isAuthenticated, logout } = useAuthStore();
  const { totalItems, openDrawer, fetchCart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { setSearchQuery: setGlobalSearch, setCategory } = useFilterStore();
  const { selectedDevice, openModal: openDeviceModal } = useDeviceStore();
  const navigate = useNavigate();

  // Rotating search placeholders (exact match to boAt screenshot)
  const searchPlaceholders = [
    'Search "Speakers"',
    'Search "Earphones"',
    'Search "Smartwatches"',
    'Search "Wireless Earbuds"',
    'Search "Power Banks"',
    'Search "Fast Chargers"',
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  // Live auto-suggest debounce query
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await axiosInstance.get(`/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        setSuggestions(res.data.data?.products || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search auto-suggest and user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedSearch = searchRef.current && searchRef.current.contains(e.target);
      const clickedMobileSearch = mobileSearchRef.current && mobileSearchRef.current.contains(e.target);
      if (!clickedSearch && !clickedMobileSearch) {
        setShowSuggestions(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setGlobalSearch(searchQuery.trim());
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setMobileMenuOpen(false);
    }
  };

  const navCategories = [
    { name: 'True Wireless Earbuds', slug: 'tws-earbuds' },
    { name: 'Wireless Neckbands', slug: 'neckbands' },
    { name: 'Smartwatches', slug: 'smartwatches' },
    { name: 'Wired Earphones', slug: 'wired-earphones' },
    { name: 'Power Banks', slug: 'power-banks' },
    { name: 'Fast Wall Chargers', slug: 'fast-wall-chargers' },
    { name: 'Mobile Back Covers', slug: 'back-cases' },
    { name: '9H Tempered Glass', slug: 'tempered-glass' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
      {/* TOP ANNOUNCEMENT TICKER (Exact match to boAt Image 2) */}
      <div className="bg-[#141414] text-white text-[11px] sm:text-xs py-1.5 px-4 text-center font-semibold tracking-wide flex items-center justify-center gap-1.5 border-b border-white/10 select-none">
        <span>Get additional 5% off on Prepaid Orders | Code: <strong className="text-[#e11938] font-black tracking-wider">CHHOTABHAI</strong></span>
        <Link to="/shop?filter=crazy-deals" className="underline font-bold hover:text-[#e11938] ml-1 transition-colors">
          Shop Now
        </Link>
      </div>

      {/* MAIN HEADER NAVBAR */}
      <div className="cb-container">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 xl:gap-5 flex-nowrap">
          {/* Left Brand Area: Mobile 3-Lines Menu (Before Logo) + ChhotaBhai Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Mobile Hamburger 3-Lines Menu Toggle (Before Logo) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center lg:hidden text-slate-800 hover:bg-slate-100 transition cursor-pointer -ml-1"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* ChhotaBhai Logo */}
            <Link to="/" className="flex items-center gap-1 flex-shrink-0 group whitespace-nowrap">
              <span className="text-2xl sm:text-3xl xl:text-4xl font-black text-slate-900 tracking-tighter font-sans select-none">
                Chhota<span className="text-[#e11938]">Bhai</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links (Strict Single Line Flexbox with whitespace-nowrap) */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 2xl:gap-7 text-[13.5px] xl:text-[15px] font-semibold text-slate-800 flex-nowrap whitespace-nowrap shrink-0">
            {/* Categories Dropdown */}
            <div
              className="relative py-4 shrink-0"
              onMouseEnter={() => setCategoriesDropdown(true)}
              onMouseLeave={() => setCategoriesDropdown(false)}
            >
              <button
                type="button"
                className="inline-flex items-center gap-1 hover:text-[#e11938] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoriesDropdown ? 'rotate-180' : ''}`} />
              </button>

              {categoriesDropdown && (
                <div className="absolute top-12 left-0 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-3 z-50 animate-in fade-in duration-150">
                  <div className="px-3 pb-2 mb-1 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                    Product Categories
                  </div>
                  {navCategories.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/shop?category=${cat.slug}`}
                      onClick={() => {
                        setCategory(cat.slug);
                        setCategoriesDropdown(false);
                      }}
                      className="block px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-[#e11938] hover:bg-slate-50 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>


            {/* Corporate Orders */}
            <Link
              to="/shop"
              className="hover:text-[#e11938] transition-colors whitespace-nowrap shrink-0"
            >
              Corporate Orders
            </Link>

            {/* Gifting Store */}
            <Link
              to="/shop"
              className="hover:text-[#e11938] transition-colors whitespace-nowrap shrink-0"
            >
              Gifting Store
            </Link>

            {/* More Dropdown */}
            <div
              className="relative py-4 shrink-0"
              onMouseEnter={() => setMoreDropdown(true)}
              onMouseLeave={() => setMoreDropdown(false)}
            >
              <button
                type="button"
                className="inline-flex items-center gap-1 hover:text-[#e11938] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreDropdown ? 'rotate-180' : ''}`} />
              </button>

              {moreDropdown && (
                <div className="absolute top-12 right-0 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in duration-150">
                  <Link
                    to="/shop?filter=deals"
                    onClick={() => setMoreDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-[#e11938] hover:bg-slate-50"
                  >
                    <Zap className="w-4 h-4 text-[#e11938]" /> Flash Drops & VIP Deals
                  </Link>
                  <Link
                    to="/track"
                    onClick={() => setMoreDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-[#e11938] hover:bg-slate-50"
                  >
                    <Truck className="w-4 h-4 text-[#e11938]" /> Track Your Order
                  </Link>
                  <Link
                    to="/my-orders"
                    onClick={() => setMoreDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-[#e11938] hover:bg-slate-50"
                  >
                    <Package className="w-4 h-4 text-[#e11938]" /> Order History
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMoreDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#e11938] hover:bg-rose-50"
                    >
                      <Shield className="w-4 h-4" /> Admin Console
                    </Link>
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Section (Search, Pure User Avatar Circle, Cart) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Desktop Search Trigger Bar (Opens boAt SearchModal) */}
            <div
              onClick={() => setSearchModalOpen(true)}
              className="relative hidden md:flex items-center cursor-pointer group"
              title="Search audio, watches & accessories"
            >
              <div className="w-44 md:w-52 lg:w-64 xl:w-72 2xl:w-80 pl-9 pr-4 py-2 bg-[#f0f2f5] hover:bg-[#e9ecf0] border border-transparent rounded-full text-xs sm:text-[13.5px] text-slate-500 transition-all select-none flex items-center shadow-2xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-slate-700 transition-colors" />
                <span className="truncate">{searchPlaceholders[placeholderIndex]}</span>
              </div>
            </div>

            {/* boAt Mobile Search Button (Identical size w-9 h-9 sm:w-10 sm:h-10) */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition text-slate-800 cursor-pointer focus:outline-none shrink-0 md:hidden"
              title="Search Products"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-slate-800" strokeWidth={2} />
            </button>

            {/* User Account Action - Pure Avatar Circle (Identical size w-9 h-9 sm:w-10 sm:h-10) */}
            <div ref={userDropdownRef} className="relative flex items-center">
              {isAuthenticated ? (
                <div className="relative flex items-center">
                  <button
                    onClick={() => setUserDropdown(!userDropdown)}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:opacity-90 transition cursor-pointer focus:outline-none shrink-0"
                    title="Account Profile"
                    aria-label="User Account"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user?.name || 'User Profile'}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-purple-500/80 shadow-2xs"
                      />
                    ) : (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white text-xs sm:text-[13px] font-black flex items-center justify-center shadow-xs">
                        {user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </button>

                  {userDropdown && (
                    <div className="absolute right-0 top-12 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in duration-150">
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white text-xs font-black flex items-center justify-center shrink-0">
                            {user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/my-orders"
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:text-[#e11938] hover:bg-slate-50 transition"
                        >
                          <Package className="w-4 h-4 text-slate-500" /> My Orders
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:text-[#e11938] hover:bg-slate-50 transition"
                        >
                          <Heart className="w-4 h-4 text-slate-500" /> My Wishlist
                        </Link>
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#e11938] hover:bg-rose-50 transition"
                          >
                            <Shield className="w-4 h-4" /> Admin Console
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdown(false);
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left cursor-pointer transition"
                        >
                          <LogOut className="w-4 h-4" /> Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition shrink-0"
                  title="Sign In"
                  aria-label="Sign In"
                >
                  <UserIcon className="w-5 h-5 text-slate-700" strokeWidth={2} />
                </Link>
              )}
            </div>

            {/* Shopping Bag / Cart Action (Identical size w-9 h-9 sm:w-10 sm:h-10) */}
            <button
              onClick={openDrawer}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition text-slate-800 relative cursor-pointer focus:outline-none shrink-0"
              title="View Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-slate-800" strokeWidth={1.8} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#e11938] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-5 space-y-4 shadow-xl">
          {/* Mobile User Profile Header */}
          {isAuthenticated ? (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/');
                }}
                className="px-3 py-1.5 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition shrink-0 cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl"
            >
              <UserIcon className="w-4 h-4" /> Sign In / Register
            </Link>
          )}

          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Earphones, Neckbands, Cases..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#f0f2f5] border border-slate-200 rounded-full text-xs text-slate-900 outline-none"
            />
          </form>

          {/* Nav Categories */}
          <div className="space-y-1 pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 pb-1">
              Top Categories
            </div>
            {navCategories.map((c) => (
              <Link
                key={c.slug}
                to={`/shop?category=${c.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {c.name}
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2">

            <Link
              to="/my-orders"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 rounded-xl"
            >
              <Package className="w-4 h-4 text-[#e11938]" /> My Orders
            </Link>
            <Link
              to="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 rounded-xl"
            >
              <Truck className="w-4 h-4 text-[#e11938]" /> Track Order
            </Link>
          </div>
        </div>
      )}

      {/* boAt-Style Full Search Modal / Overlay (Exact match to Image 3) */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </header>
  );
};

export default Navbar;
