import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  X,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  ShoppingBag,
  ChevronRight
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useFilterStore } from '../../store/useStore';
import CategoryIcon from '../common/CategoryIcon';

/**
 * boAt-Style Search Modal / Overlay
 * Faithful implementation of the official boAt search experience:
 * - Full header search bar with rotating placeholders & instant close (X)
 * - "Most Searched And Bought" 2-column curated visual category showcase
 * - Instant live product search with image previews, pricing, and discount badges
 * - Recent/trending quick tags
 */
export const SearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setSearchQuery: setGlobalSearch, setCategory } = useFilterStore();

  // Dynamic rotating search placeholder (matching boAt)
  const rotatingPlaceholders = [
    'Search "Wireless Earbuds"',
    'Search "Smartwatches"',
    'Search "Earphones"',
    'Search "Neckbands"',
    'Search "Headphones"',
    'Search "Fast Chargers"',
    'Search "Power Banks"',
    'Search "Speakers"',
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % rotatingPlaceholders.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Auto-focus input when opened & lock background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setSuggestions([]);
    }
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Live search query debounce
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await axiosInstance.get(`/products?search=${encodeURIComponent(query.trim())}&limit=6`);
        setSuggestions(res.data?.data?.products || []);
      } catch (err) {
        console.error('Search suggestion error:', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // "Most Searched And Bought" 2-Column Categories (faithful match to boAt screenshot)
  const mostSearchedAndBought = [
    { name: 'True Wireless Earbuds', slug: 'tws-earbuds' },
    { name: 'Mobile Back Covers', slug: 'back-cases' },
    { name: 'Smart Watches', slug: 'smartwatches' },
    { name: '9H Tempered Glass', slug: 'tempered-glass' },
    { name: 'Wireless Neckbands', slug: 'wireless-neckbands' },
    { name: 'Bluetooth Speakers', slug: 'wireless-speakers' },
    { name: 'Wireless Headphones', slug: 'wireless-headphones' },
    { name: 'Power Banks', slug: 'power-banks' },
    { name: 'Dashcams & Mounts', slug: 'dashcams' },
    { name: 'Fast Wall Chargers', slug: 'fast-wall-chargers' },
    { name: 'Wired Earphones', slug: 'wired-earphones' },
    { name: 'Braided Cables', slug: 'braided-data-cables' },
  ];

  const trendingTags = [
    'Airdopes',
    'Smartwatch',
    'ANC Headphones',
    'Fast Charger 65W',
    'MagSafe Cover',
    'Type-C Cable',
  ];

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (cleanQuery) {
      setGlobalSearch(cleanQuery);
      navigate(`/shop?search=${encodeURIComponent(cleanQuery)}`);
      onClose();
    }
  };

  const handleCategoryClick = (slug) => {
    setCategory(slug);
    navigate(`/shop?category=${slug}`);
    onClose();
  };

  const handleTagClick = (tag) => {
    setQuery(tag);
    setGlobalSearch(tag);
    navigate(`/shop?search=${encodeURIComponent(tag)}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-start bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Click outside backdrop */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Main Search Panel (Slides down from top) */}
      <div className="w-full bg-white shadow-2xl border-b border-slate-200 max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-top-4 duration-250">
        
        {/* TOP SEARCH INPUT BAR (Exact match to boAt Image 3) */}
        <div className="border-b border-slate-100 px-4 sm:px-8 py-3 sm:py-4 bg-white sticky top-0 z-20">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative flex items-center">
              {/* Magnifying Glass Icon */}
              <Search className="w-5 h-5 text-slate-800 shrink-0 ml-1 mr-2" strokeWidth={2.2} />

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={rotatingPlaceholders[placeholderIndex]}
                className="w-full py-2.5 text-sm sm:text-base font-semibold text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
              />

              {/* Clear Query Button */}
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSuggestions([]);
                    inputRef.current?.focus();
                  }}
                  className="p-1 mr-2 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
                  aria-label="Clear query"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Instant Close Modal Button (X icon on top right - exact to boAt) */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer shrink-0"
              aria-label="Close search"
            >
              <X className="w-5 h-5" strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* SEARCH BODY CONTAINER (Scrollable) */}
        <div className="overflow-y-auto px-4 sm:px-8 py-5 max-w-4xl w-full mx-auto flex-1">
          
          {/* STATE A: LIVE SEARCH SUGGESTIONS (When user is typing) */}
          {query.trim().length >= 2 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  {loading ? 'Searching products...' : `Results for "${query}"`}
                </span>
                {suggestions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="text-xs font-bold text-[#e11938] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View all results <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <div className="w-6 h-6 border-2 border-[#e11938] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-medium">Finding matching audio & accessories...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {suggestions.map((p) => {
                    const price = p.discountedPrice || p.variants?.[0]?.sellingPrice || 0;
                    const originalPrice = p.originalPrice || p.variants?.[0]?.mrp || 0;
                    const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
                    const img = p.thumbnail || p.variants?.[0]?.images?.[0];

                    return (
                      <Link
                        key={p._id}
                        to={`/product/${p.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition group"
                      >
                        <div className="w-14 h-14 rounded-xl bg-slate-100 p-1 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200/60">
                          {img ? (
                            <img
                              src={img}
                              alt={p.title}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <ShoppingBag className="w-6 h-6 text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate group-hover:text-[#e11938] transition-colors">
                            {p.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-black text-slate-900">₹{price}</span>
                            {originalPrice > price && (
                              <span className="text-[10px] text-slate-400 line-through">₹{originalPrice}</span>
                            )}
                            {discount > 0 && (
                              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                {discount}% OFF
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition" />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center space-y-3">
                  <p className="text-sm font-semibold text-slate-600">
                    No products found matching "<span className="text-slate-900">{query}</span>"
                  </p>
                  <p className="text-xs text-slate-400">
                    Try checking your spelling or explore popular categories below:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    {trendingTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagClick(tag)}
                        className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* View All Button */}
              {suggestions.length > 0 && (
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full py-3 mt-2 bg-slate-900 hover:bg-[#e11938] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>See all results for "{query}"</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            /* STATE B: "MOST SEARCHED AND BOUGHT" (Exact match to boAt Image 3) */
            <div className="space-y-6">
              
              {/* Heading */}
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-sans">
                  Most Searched And Bought
                </h3>
              </div>

              {/* 2-Column boAt Grid */}
              <div className="grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-5">
                {mostSearchedAndBought.map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => handleCategoryClick(item.slug)}
                    className="flex items-center gap-3 text-left group p-1.5 -m-1.5 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    {/* Authentic Vector Thumbnail Bubble (Exact to boAt) */}
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-100 flex items-center justify-center p-1.5 shrink-0 border border-slate-200/60 group-hover:bg-red-50/50 group-hover:border-red-200/70 transition-all group-hover:scale-105">
                      <CategoryIcon slug={item.slug} className="w-8 h-8 sm:w-9 sm:h-9" />
                    </div>

                    {/* Category Label */}
                    <span className="text-xs sm:text-[13.5px] font-bold text-slate-800 group-hover:text-[#e11938] transition-colors leading-snug">
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Trending Search Tags Section */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-[#e11938]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Trending Searches
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagClick(tag)}
                      className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-red-50 hover:text-[#e11938] hover:border-red-200 border border-slate-200/70 text-xs font-bold text-slate-700 transition-all cursor-pointer"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
