import React, { useEffect, useState, useMemo } from 'react';
import {
  Smartphone,
  Plus,
  Search,
  Trash2,
  Check,
  AlertCircle,
  Sparkles,
  Layers,
  CheckCircle2,
  RefreshCw,
  Power,
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import Loader from '../../components/Loader';

const CORE_BRANDS = [
  'Apple',
  'Samsung',
  'OnePlus',
  'Vivo',
  'Realme',
  'Xiaomi',
  'Nothing',
  'Google',
];

export const AdminDevices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  // Quick Add Form State
  const [selectedBrand, setSelectedBrand] = useState('Apple');
  const [customBrand, setCustomBrand] = useState('');
  const [modelInput, setModelInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/admin/devices');
      setDevices(res.data.data || []);
    } catch (err) {
      console.error('Error fetching device models:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    setFormError('');

    const targetBrand = selectedBrand === 'Other' ? customBrand.trim() : selectedBrand.trim();
    const rawInput = modelInput.trim();

    if (!targetBrand || !rawInput) {
      setFormError('Please specify both a Brand and at least one Model Name.');
      return;
    }

    const modelsToAdd = rawInput
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    if (modelsToAdd.length === 0) {
      setFormError('Please enter a valid model name.');
      return;
    }

    const tempIds = modelsToAdd.map(() => `temp-${Date.now()}-${Math.random()}`);
    const optimisticItems = modelsToAdd.map((m, idx) => ({
      _id: tempIds[idx],
      brand: targetBrand,
      modelName: m,
      isActive: true,
      createdAt: new Date().toISOString(),
    }));

    setDevices((prev) => [...optimisticItems, ...prev]);
    setModelInput('');
    setFeedback({
      type: 'success',
      message: `Adding ${modelsToAdd.length} model(s) for ${targetBrand}...`,
    });

    setSubmitting(true);
    try {
      if (modelsToAdd.length === 1) {
        const res = await axiosInstance.post('/admin/devices', {
          brand: targetBrand,
          modelName: modelsToAdd[0],
          isActive: true,
        });
        const saved = res.data.data;
        setDevices((prev) =>
          prev.map((d) => (d._id === tempIds[0] ? saved : d))
        );
        setFeedback({
          type: 'success',
          message: `Successfully added "${targetBrand} ${modelsToAdd[0]}" to compatibility catalog.`,
        });
      } else {
        const res = await axiosInstance.post('/admin/devices', {
          brand: targetBrand,
          models: modelsToAdd,
          isActive: true,
        });
        fetchDevices();
        setFeedback({
          type: 'success',
          message: `Successfully added ${modelsToAdd.length} models for ${targetBrand}.`,
        });
      }
    } catch (err) {
      setDevices((prev) => prev.filter((d) => !tempIds.includes(d._id)));
      setFormError(err.response?.data?.message || err.message || 'Failed to add model.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (device) => {
    const updatedStatus = !device.isActive;
    setDevices((prev) =>
      prev.map((d) => (d._id === device._id ? { ...d, isActive: updatedStatus } : d))
    );

    try {
      await axiosInstance.put(`/admin/devices/${device._id}`, {
        isActive: updatedStatus,
      });
      setFeedback({
        type: 'success',
        message: `Updated status for ${device.brand} ${device.modelName} to ${updatedStatus ? 'Active' : 'Disabled'}.`,
      });
    } catch (err) {
      setDevices((prev) =>
        prev.map((d) => (d._id === device._id ? { ...d, isActive: device.isActive } : d))
      );
      setFeedback({
        type: 'error',
        message: 'Failed to update device status.',
      });
    }
  };

  const handleDeleteDevice = async (id, modelName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${modelName}"?`)) {
      return;
    }

    const previousDevices = [...devices];
    setDevices((prev) => prev.filter((d) => d._id !== id));

    try {
      await axiosInstance.delete(`/admin/devices/${id}`);
      setFeedback({
        type: 'success',
        message: `Deleted "${modelName}" from system.`,
      });
    } catch (err) {
      setDevices(previousDevices);
      setFeedback({
        type: 'error',
        message: 'Could not delete device model.',
      });
    }
  };

  const availableBrands = useMemo(() => {
    const fromDevices = devices.map((d) => d.brand).filter(Boolean);
    const combined = Array.from(new Set([...CORE_BRANDS, ...fromDevices]));
    return combined.sort();
  }, [devices]);

  const brandTabs = useMemo(() => {
    return ['All', ...availableBrands];
  }, [availableBrands]);

  const filteredDevices = useMemo(() => {
    const q = search.toLowerCase().trim();
    return devices.filter((d) => {
      const matchesTab =
        activeTab === 'All' || d.brand.toLowerCase() === activeTab.toLowerCase();
      const matchesSearch =
        !q ||
        d.modelName.toLowerCase().includes(q) ||
        d.brand.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [devices, activeTab, search]);

  if (loading) return <Loader text="Loading Device Compatibility Suite..." />;

  const activeCount = devices.filter((d) => d.isActive).length;

  return (
    <div className="space-y-8 w-full animate-in fade-in duration-300">
      {/* 1. TOP HEADER & INTRO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Device Compatibility Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
            Smartphone <span className="text-rose-600">Brands & Models</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage live device compatibility for cases, 9H tempered glass, and camera protectors across storefront & catalog.
          </p>
        </div>

        <button
          onClick={fetchDevices}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors shadow-sm self-start sm:self-auto"
          title="Refresh catalog from database"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" /> Refresh
        </button>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback.message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs flex items-center gap-2.5 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="font-semibold">{feedback.message}</span>
        </div>
      )}

      {/* METRICS OVERVIEW STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Registered Phone Models
            </span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">
              {devices.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-rose-600">
            <Smartphone className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Active in Storefront
            </span>
            <span className="text-3xl font-black text-emerald-600 mt-1 block">
              {activeCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Check className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Configured Brands
            </span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">
              {availableBrands.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. PROMINENT QUICK ADD CARD */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-600" /> Quick-Register New Smartphone Model
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add models instantly to database. Changes immediately reflect in Storefront &ldquo;Shop by Phone&rdquo; modal.
            </p>
          </div>

          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleQuickAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
              {/* Brand Selector */}
              <div className="sm:col-span-4 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                  Smartphone Brand
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 focus:bg-white rounded-xl px-3.5 py-3 text-xs font-bold text-slate-900 outline-none transition-colors"
                >
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                  <option value="Other">
                    + Other (Custom Brand)
                  </option>
                </select>
              </div>

              {/* Custom Brand input if 'Other' */}
              {selectedBrand === 'Other' && (
                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                    Custom Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    placeholder="e.g. Asus, Motorola"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 focus:bg-white rounded-xl px-3.5 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors"
                  />
                </div>
              )}

              {/* Model Name Input */}
              <div
                className={`space-y-1.5 ${
                  selectedBrand === 'Other' ? 'sm:col-span-5' : 'sm:col-span-6'
                }`}
              >
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                  Model Name(s) <span className="text-slate-400 font-normal lowercase">(separate multiples with commas)</span>
                </label>
                <input
                  type="text"
                  required
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  placeholder="e.g. iPhone 16 Pro Max, Galaxy S24 Ultra, OnePlus 12..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 focus:bg-white rounded-xl px-3.5 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors"
                />
              </div>

              {/* Submit CTA */}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{submitting ? 'Adding...' : 'Add Model'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* 3. BRAND GROUPING TABS & SEARCH BAR */}
      <div className="space-y-4">
        {/* Horizontal Brand Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
          {brandTabs.map((brand) => {
            const isActive = activeTab === brand;
            const count =
              brand === 'All'
                ? devices.length
                : devices.filter((d) => d.brand.toLowerCase() === brand.toLowerCase()).length;

            return (
              <button
                key={brand}
                onClick={() => setActiveTab(brand)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{brand}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Search Input */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Live search by model name (e.g. S24 Ultra, iPhone 16, Nord 4)..."
            className="w-full bg-white border border-slate-200 focus:border-rose-500 rounded-2xl py-3 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-slate-700 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 4. DEVICE TABLE & ACTION GRID */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] bg-slate-50 font-bold tracking-wider">
                <th className="py-4 px-5">Brand</th>
                <th className="py-4 px-5">Smartphone Model Name</th>
                <th className="py-4 px-5">Storefront Visibility</th>
                <th className="py-4 px-5">Registered Date</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDevices.map((d) => (
                <tr key={d._id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-slate-100 border border-slate-200 text-slate-800">
                      {d.brand}
                    </span>
                  </td>

                  <td className="py-4 px-5 font-bold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-rose-600 transition-colors">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <span className="text-sm">{d.modelName}</span>
                    </div>
                  </td>

                  <td className="py-4 px-5">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(d)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        d.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      }`}
                      title="Click to toggle storefront visibility"
                    >
                      <Power className="w-3 h-3" />
                      <span>{d.isActive ? 'Active' : 'Disabled'}</span>
                    </button>
                  </td>

                  <td className="py-4 px-5 text-slate-400 text-[11px]">
                    {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Active'}
                  </td>

                  <td className="py-4 px-5 text-right space-x-2">
                    <button
                      onClick={() => handleToggleStatus(d)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                        d.isActive
                          ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                      title={d.isActive ? 'Deactivate Model' : 'Activate Model'}
                    >
                      {d.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDeleteDevice(d._id, d.modelName)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors inline-flex items-center justify-center"
                      title="Delete Model Permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredDevices.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400 mb-3">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-900 text-sm">No phone models match your filter.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Use the Quick Add form above to register new models for &ldquo;{activeTab}&rdquo;.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDevices;
