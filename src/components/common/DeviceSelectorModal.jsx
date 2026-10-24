import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone,
  Search,
  X,
  Check,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useDeviceStore } from '../../store/useDeviceStore';

const POPULAR_BRANDS = [
  'All',
  'Apple',
  'Samsung',
  'OnePlus',
  'Google',
  'Xiaomi',
  'Vivo',
  'Realme',
];

export const DeviceSelectorModal = () => {
  const navigate = useNavigate();
  const { isDeviceModalOpen, closeModal, setDevice, selectedDevice } = useDeviceStore();

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('Apple');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch active device catalog from backend
  useEffect(() => {
    if (!isDeviceModalOpen) return;

    const fetchDevices = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/devices');
        if (res.data?.data && Array.isArray(res.data.data)) {
          setDevices(res.data.data);
        }
      } catch (err) {
        console.warn('Failed to load device models from API:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [isDeviceModalOpen]);

  // Sync initial brand with currently selected device brand if any
  useEffect(() => {
    if (selectedDevice?.brand) {
      setSelectedBrand(selectedDevice.brand);
    }
  }, [selectedDevice, isDeviceModalOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isDeviceModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDeviceModalOpen, closeModal]);

  // Compute unique brands list
  const availableBrands = useMemo(() => {
    const apiBrands = Array.from(new Set(devices.map((d) => d.brand).filter(Boolean)));
    const merged = ['All', ...new Set([...POPULAR_BRANDS.slice(1), ...apiBrands])];
    return merged;
  }, [devices]);

  // Filter models based on brand pill and search input
  const filteredModels = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return devices.filter((d) => {
      const matchesBrand = selectedBrand === 'All' || d.brand.toLowerCase() === selectedBrand.toLowerCase();
      const matchesSearch = !q || d.modelName.toLowerCase().includes(q) || d.brand.toLowerCase().includes(q);

      if (q) {
        return matchesSearch;
      }
      return matchesBrand;
    });
  }, [devices, selectedBrand, searchQuery]);

  const handleSelectModel = (brand, modelName) => {
    setDevice(brand, modelName);
    closeModal();
    navigate(`/shop?device=${encodeURIComponent(modelName)}`);
  };

  if (!isDeviceModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Soft Ambient Rose Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-28 bg-rose-500/10 blur-[90px] rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 sm:p-7 border-b border-slate-100 flex items-start justify-between relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-brand-red text-[10px] font-black uppercase tracking-widest mb-2">
              <Sparkles className="w-3 h-3" /> Device-First Precision Matching
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
              Select Your <span className="text-brand-red">Device</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Browse accessories & armor engineered tailor-made for your exact phone model.
            </p>
          </div>

          <button
            onClick={closeModal}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
            aria-label="Close device selector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="px-6 pt-5 pb-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search your model, e.g. iPhone 16 Pro, Galaxy S24 Ultra..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-red text-slate-900 placeholder-slate-400 text-xs sm:text-sm rounded-2xl pl-11 pr-10 py-3.5 outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Brand Pills Strip */}
        <div className="px-6 py-2 border-b border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {availableBrands.map((brand) => {
              const isActive = selectedBrand === brand && !searchQuery;
              return (
                <button
                  key={brand}
                  onClick={() => {
                    setSelectedBrand(brand);
                    setSearchQuery('');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-brand-red text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {brand}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Matching Models List */}
        <div className="p-6 overflow-y-auto space-y-2 flex-1 scrollbar-thin">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading compatibility catalog...
            </div>
          ) : filteredModels.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-900">No phone model found</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Couldn&apos;t find any model matching &ldquo;{searchQuery}&rdquo;. Try another search term or pick &ldquo;All&rdquo;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredModels.map((item) => {
                const isSelected = selectedDevice?.model?.toLowerCase() === item.modelName.toLowerCase();
                return (
                  <button
                    key={item._id || `${item.brand}-${item.modelName}`}
                    onClick={() => handleSelectModel(item.brand, item.modelName)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-rose-50 border-brand-red text-slate-900 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-brand-red text-white'
                            : 'bg-white border border-slate-200 text-slate-500 group-hover:text-brand-red'
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          {item.brand}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                          {item.modelName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isSelected ? (
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Tip */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <Zap className="w-3.5 h-3.5 text-brand-red" />
          <span>Selecting a device filters our complete catalog for 100% verified fitment.</span>
        </div>
      </div>
    </div>
  );
};

export default DeviceSelectorModal;
