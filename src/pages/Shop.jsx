import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Smartphone,
  Check,
  Search,
  X,
  Sparkles,
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import ProductCard from '../components/common/ProductCard';
import Meta from '../components/common/Meta';
import Loader from '../components/Loader';
import { useFilterStore } from '../store/useStore';
import { useDeviceStore } from '../store/useDeviceStore';

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    category,
    selectedDevice,
    selectedBrand,
    searchQuery,
    sortBy,
    setCategory,
    setSelectedDevice,
    setSelectedBrand,
    setSearchQuery,
    setSortBy,
    resetFilters,
  } = useFilterStore();

  const {
    selectedDevice: globalSelectedDevice,
    setDevice,
    clearDevice,
    openModal: openDeviceModal,
  } = useDeviceStore();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Price Range Filter State
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const urlDevice = searchParams.get('device') || '';
  const activeDevice = urlDevice || selectedDevice || globalSelectedDevice?.model || '';

  const displayDevice = React.useMemo(() => {
    if (!activeDevice) return '';
    const brand = globalSelectedDevice?.brand || '';
    if (brand && !activeDevice.toLowerCase().includes(brand.toLowerCase())) {
      return `${brand} ${activeDevice}`;
    }
    return activeDevice;
  }, [activeDevice, globalSelectedDevice]);

  // Sync URL search params with stores
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    const urlDev = searchParams.get('device');
    const urlSearch = searchParams.get('search');

    if (urlCategory) setCategory(urlCategory);
    if (urlDev) {
      setSelectedDevice(urlDev);
      if (globalSelectedDevice?.model !== urlDev) {
        setDevice(globalSelectedDevice?.brand || '', urlDev);
      }
    }
    if (urlSearch) setSearchQuery(urlSearch);
  }, [searchParams, setCategory, setSelectedDevice, setSearchQuery, globalSelectedDevice, setDevice]);

  // Fetch Catalog Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await axiosInstance.get('/products/categories');
        setCategories(res.data.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch Products based on all active filters
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (activeDevice) params.append('device', activeDevice);
        if (selectedBrand) params.append('brand', selectedBrand);
        if (searchQuery) params.append('search', searchQuery);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);

        if (sortBy === 'price-asc') {
          params.append('sortBy', 'price');
          params.append('sortOrder', 'asc');
        } else if (sortBy === 'price-desc') {
          params.append('sortBy', 'price');
          params.append('sortOrder', 'desc');
        } else if (sortBy === 'rating') {
          params.append('sortBy', 'ratings');
        } else {
          params.append('sortBy', 'createdAt');
          params.append('sortOrder', 'desc');
        }

        const res = await axiosInstance.get(`/products?${params.toString()}`);
        setProducts(res.data.data?.products || []);
      } catch (err) {
        console.error('Failed to fetch catalog:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [category, activeDevice, selectedBrand, searchQuery, minPrice, maxPrice, sortBy]);

  const [devicesList, setDevicesList] = useState([]);

  // Fetch Dynamic Phone Devices for Compatibility Filtering
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await axiosInstance.get('/devices');
        if (res.data?.data && Array.isArray(res.data.data)) {
          setDevicesList(res.data.data.map((d) => d.modelName));
        }
      } catch (err) {
        console.warn('Using fallback device list:', err);
        setDevicesList([
          'iPhone 16 Pro Max',
          'iPhone 16 Pro',
          'iPhone 15 Pro Max',
          'iPhone 15 Pro',
          'iPhone 15',
          'Samsung Galaxy S24 Ultra',
          'Samsung Galaxy S24',
          'OnePlus 12',
        ]);
      }
    };
    fetchDevices();
  }, []);

  const handleClearDeviceFilter = () => {
    clearDevice();
    setSelectedDevice('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('device');
    setSearchParams(newParams);
  };

  const handleToggleSidebarDevice = (dev) => {
    if (activeDevice.toLowerCase() === dev.toLowerCase()) {
      handleClearDeviceFilter();
    } else {
      setDevice('', dev);
      setSelectedDevice(dev);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('device', dev);
      setSearchParams(nextParams);
    }
  };

  const clearAllFilters = () => {
    clearDevice();
    resetFilters();
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  return (
    <div className="cb-container py-8 sm:py-10 space-y-8 bg-white text-slate-900">
      <Meta
        title={
          activeDevice
            ? `${displayDevice} Accessories & Covers | ChhotaBhai`
            : category
            ? `${category.replace(/-/g, ' ').toUpperCase()} | ChhotaBhai Luxury Collection`
            : 'Shop Mobile Accessories & Armor Catalog | ChhotaBhai'
        }
        description={
          activeDevice
            ? `Buy premium back cases, 9D tempered glass, and fast chargers designed specifically for ${displayDevice}. High durability, free prepaid shipping.`
            : 'Explore high-grade mobile phone accessories: back covers, tempered glass, fast chargers, braided cables, and audio gear.'
        }
        keywords="phone cases, tempered glass, fast chargers, mobile accessories, ChhotaBhai"
      />

      {/* Top Header & Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase text-slate-900 tracking-tight">
            Accessories & Armor <span className="text-brand-red">Catalog</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1.5">
            Showing <strong className="text-slate-900">{products.length}</strong> verified drops
            {activeDevice && (
              <span>
                {' '}
                for <strong className="text-brand-red">{displayDevice}</strong>
              </span>
            )}
            {searchQuery && (
              <span>
                {' '}
                matching &ldquo;<strong className="text-slate-900">{searchQuery}</strong>&rdquo;
              </span>
            )}
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800"
          >
            <Filter className="w-4 h-4 text-brand-red" /> Filters
          </button>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 shadow-sm">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-800 text-xs sm:text-sm font-semibold outline-none cursor-pointer"
            >
              <option value="newest" className="bg-white text-slate-900">
                Newest Drops
              </option>
              <option value="price-asc" className="bg-white text-slate-900">
                Price: Low to High
              </option>
              <option value="price-desc" className="bg-white text-slate-900">
                Price: High to Low
              </option>
              <option value="rating" className="bg-white text-slate-900">
                Customer Rating
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Pinned Device-First Banner */}
      {activeDevice && (
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 animate-in fade-in duration-300">
          <div className="absolute top-0 right-0 w-72 h-full bg-brand-red/20 blur-[80px] pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-rose-400 shrink-0 shadow-sm">
              <Smartphone className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-black uppercase tracking-widest mb-1">
                <Sparkles className="w-3 h-3 text-rose-300" /> Device-First Precision Matching
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                Customized For:{' '}
                <span className="text-rose-400">
                  {displayDevice}
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Showing accessories & armor engineered tailor-made for your exact phone model.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 relative z-10 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={openDeviceModal}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Smartphone className="w-3.5 h-3.5 text-rose-300" />
              Change Device
            </button>
            <button
              type="button"
              onClick={handleClearDeviceFilter}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Clear Filter
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Badges */}
      {(category || activeDevice || selectedBrand || searchQuery || minPrice || maxPrice) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-bold mr-1">Active:</span>

          {category && (
            <span className="bg-slate-100 border border-slate-200 text-slate-800 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
              Category: {category}
              <button onClick={() => setCategory('')} className="text-slate-400 hover:text-slate-800">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeDevice && (
            <span className="bg-rose-50 border border-rose-200 text-brand-red text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-bold shadow-sm">
              Filtered for: {displayDevice}
              <button onClick={handleClearDeviceFilter} className="text-brand-red/60 hover:text-brand-red">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedBrand && (
            <span className="bg-slate-100 border border-slate-200 text-slate-800 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
              Brand: {selectedBrand}
              <button onClick={() => setSelectedBrand('')} className="text-slate-400 hover:text-slate-800">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {searchQuery && (
            <span className="bg-slate-100 border border-slate-200 text-slate-800 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
              Query: {searchQuery}
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-800">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={clearAllFilters}
            className="text-xs text-brand-red font-bold hover:underline flex items-center gap-1 ml-2"
          >
            <RotateCcw className="w-3 h-3" /> Reset All
          </button>
        </div>
      )}

      {/* Main Catalog Area */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* LEFT SIDEBAR FILTERS (Desktop persistent & Mobile modal drawer) */}
        {/* Mobile backdrop */}
        {mobileFilterOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 lg:hidden"
            onClick={() => setMobileFilterOpen(false)}
          />
        )}

        <aside
          className={`space-y-6 lg:block lg:sticky lg:top-24 w-full lg:w-64 xl:w-72 shrink-0 ${
            mobileFilterOpen
              ? 'fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 p-6 overflow-y-auto shadow-2xl animate-in slide-in-from-left duration-200'
              : 'hidden'
          }`}
        >
          <div className="bg-white lg:border lg:border-slate-200 rounded-2xl lg:p-6 space-y-6 lg:shadow-sm">
            {/* Filter Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-brand-red" /> Filter Catalog
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] text-brand-red hover:underline flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
                {mobileFilterOpen && (
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-900"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Brand</h3>
              <div className="flex gap-2">
                {[
                  { label: 'All', value: '' },
                  { label: 'ChhotaBhai Essentials', value: 'ChhotaBhai Essentials' },
                ].map((b) => (
                  <button
                    key={b.value}
                    onClick={() => setSelectedBrand(b.value)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                      selectedBrand === b.value
                        ? 'bg-brand-red text-white'
                        : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories Checklist */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Category</h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => setCategory('')}
                  className={`w-full text-left text-xs font-medium py-1.5 px-3 rounded-lg transition-colors ${
                    category === ''
                      ? 'bg-brand-red text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setCategory(cat.slug)}
                    className={`w-full text-left text-xs font-medium py-1.5 px-3 rounded-lg transition-colors ${
                      category === cat.slug
                        ? 'bg-brand-red text-white font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Compatibility Quick Select */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-brand-red" /> Compatible Phones
                </h3>
                <button
                  type="button"
                  onClick={openDeviceModal}
                  className="text-[10px] text-brand-red hover:underline uppercase font-bold"
                >
                  All Models
                </button>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {devicesList.map((dev) => {
                  const isDevActive = activeDevice.toLowerCase() === dev.toLowerCase();
                  return (
                    <button
                      key={dev}
                      onClick={() => handleToggleSidebarDevice(dev)}
                      className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg flex items-center justify-between transition-colors ${
                        isDevActive
                          ? 'bg-rose-50 text-brand-red border border-rose-200 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{dev}</span>
                      {isDevActive && <Check className="w-3.5 h-3.5 text-brand-red shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Price Range</h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs rounded-lg p-2 text-slate-900 outline-none focus:border-brand-red focus:bg-white"
                />
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs rounded-lg p-2 text-slate-900 outline-none focus:border-brand-red focus:bg-white"
                />
              </div>
            </div>

            {/* Mobile Apply Button */}
            {mobileFilterOpen && (
              <div className="pt-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3 bg-[#1a1a1a] hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md"
                >
                  Apply Filters ({products.length} Drops)
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN: Product Grid */}
        <div className="flex-1 min-w-0 w-full">
          {loading ? (
            <Loader text="Fetching Verified Drops..." />
          ) : products.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 sm:p-16 text-center space-y-4 max-w-md mx-auto my-8">
              <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Matching Drops Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We couldn&apos;t find any accessories matching your selected filters. Try broadening your criteria.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-brand-red text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-sm"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
