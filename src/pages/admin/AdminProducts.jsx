import React, { useEffect, useState, useRef } from 'react';
import {
  Package,
  Plus,
  Search,
  Trash2,
  Edit,
  X,
  Check,
  AlertCircle,
  Smartphone,
  Layers,
  Sparkles,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
  Flame,
  Zap,
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import Loader from '../../components/Loader';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dealFilter, setDealFilter] = useState('ALL'); // 'ALL' | 'CRAZY' | 'TOP'

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [uploadingVariantIdx, setUploadingVariantIdx] = useState(null);
  const [dragOverVariantIdx, setDragOverVariantIdx] = useState(null);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [deviceSearchQuery, setDeviceSearchQuery] = useState('');

  // Product Form State
  const [formData, setFormData] = useState({
    title: '',
    brand: 'ChhotaBhai Essentials',
    category: '',
    badge: 'Drop Tested',
    dealTag: '',
    isCrazyDeal: false,
    isTopDeal: false,
    isFeatured: false,
    description: '',
    supportedDevices: [],
    variants: [
      {
        sku: '',
        colorName: 'Carbon Black',
        colorCode: '#111111',
        mrp: 1499,
        sellingPrice: 599,
        stockQuantity: 50,
        images: [
          'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&auto=format&fit=crop&q=80',
        ],
        imagesText:
          'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&auto=format&fit=crop&q=80',
      },
    ],
  });

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, devRes] = await Promise.all([
        axiosInstance.get('/products?limit=50'),
        axiosInstance.get('/products/categories'),
        axiosInstance.get('/devices'),
      ]);
      setProducts(prodRes.data.data?.products || []);
      const cats = catRes.data.data || [];
      setCategories(cats);
      setAvailableDevices(devRes.data.data || []);
      if (cats.length > 0 && !formData.category) {
        setFormData((prev) => ({ ...prev, category: cats[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleAddVariantRow = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          sku: '',
          colorName: '',
          colorCode: '#000000',
          mrp: 1999,
          sellingPrice: 999,
          stockQuantity: 30,
          images: [],
          imagesText: '',
        },
      ],
    }));
  };

  const handleRemoveVariantRow = (idx) => {
    if (formData.variants.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx),
    }));
  };

  const handleVariantFieldChange = (idx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.variants];
      updated[idx][field] = value;
      return { ...prev, variants: updated };
    });
  };

  // Upload Images Pipeline
  const handleImageFilesUpload = async (variantIdx, fileList) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).slice(0, 5);

    setUploadingVariantIdx(variantIdx);
    setFormError('');

    try {
      const uploadData = new FormData();
      files.forEach((file) => {
        uploadData.append('images', file);
      });

      const res = await axiosInstance.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrls = res.data.data?.urls || [];

      if (uploadedUrls.length === 0) {
        throw new Error('No image URLs returned from media server.');
      }

      setFormData((prev) => {
        const updated = [...prev.variants];
        const existingImages = updated[variantIdx].images || [];
        const combined = [...existingImages, ...uploadedUrls].slice(0, 5);
        updated[variantIdx].images = combined;
        updated[variantIdx].imagesText = combined.join(', ');
        return { ...prev, variants: updated };
      });
    } catch (err) {
      setFormError(err.message || 'Media upload failed. Please verify image formats (JPG/PNG/WEBP).');
    } finally {
      setUploadingVariantIdx(null);
      setDragOverVariantIdx(null);
    }
  };

  const handleRemoveVariantImage = (variantIdx, imageIdx) => {
    setFormData((prev) => {
      const updated = [...prev.variants];
      const existing = updated[variantIdx].images || [];
      const filtered = existing.filter((_, i) => i !== imageIdx);
      updated[variantIdx].images = filtered;
      updated[variantIdx].imagesText = filtered.join(', ');
      return { ...prev, variants: updated };
    });
  };

  const handleToggleDevice = (modelName) => {
    setFormData((prev) => {
      const current = prev.supportedDevices || [];
      const exists = current.some((m) => m.toLowerCase() === modelName.toLowerCase());
      return {
        ...prev,
        supportedDevices: exists
          ? current.filter((m) => m.toLowerCase() !== modelName.toLowerCase())
          : [...current, modelName],
      };
    });
  };

  const handleSelectAllBrand = (brandName) => {
    const brandModels = availableDevices
      .filter((d) => d.brand.toLowerCase() === brandName.toLowerCase())
      .map((d) => d.modelName);

    setFormData((prev) => {
      const current = prev.supportedDevices || [];
      const merged = Array.from(new Set([...current, ...brandModels]));
      return { ...prev, supportedDevices: merged };
    });
  };

  const handleClearAllDevices = () => {
    setFormData((prev) => ({ ...prev, supportedDevices: [] }));
  };

  const handleOpenCreateProduct = () => {
    setFormError('');
    setEditingProductId(null);
    setDeviceSearchQuery('');
    setFormData({
      title: '',
      brand: 'ChhotaBhai Essentials',
      category: categories[0]?._id || '',
      badge: 'Drop Tested',
      dealTag: '',
      isCrazyDeal: false,
      isTopDeal: false,
      isFeatured: false,
      description: '',
      supportedDevices: [],
      variants: [
        {
          sku: '',
          colorName: 'Carbon Black',
          colorCode: '#111111',
          mrp: 1499,
          sellingPrice: 599,
          stockQuantity: 50,
          images: [
            'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&auto=format&fit=crop&q=80',
          ],
          imagesText:
            'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&auto=format&fit=crop&q=80',
        },
      ],
    });
    setModalOpen(true);
  };

  const handleOpenEditProduct = (p) => {
    setFormError('');
    setEditingProductId(p._id);
    setDeviceSearchQuery('');
    setFormData({
      title: p.title || '',
      brand: p.brand || 'ChhotaBhai Essentials',
      category: p.category?._id || p.category || categories[0]?._id || '',
      badge: p.badge || 'None',
      dealTag: p.dealTag || '',
      isCrazyDeal: Boolean(p.isCrazyDeal),
      isTopDeal: Boolean(p.isTopDeal),
      isFeatured: Boolean(p.isFeatured),
      description: p.description || '',
      supportedDevices: Array.isArray(p.supportedDevices) ? p.supportedDevices : [],
      variants:
        p.variants && p.variants.length > 0
          ? p.variants.map((v) => ({
              sku: v.sku || '',
              colorName: v.colorName || 'Standard',
              colorCode: v.colorCode || '#111111',
              mrp: v.mrp || 0,
              sellingPrice: v.sellingPrice || 0,
              stockQuantity: v.stockQuantity || 0,
              images: v.images || [],
              imagesText: (v.images || []).join(', '),
            }))
          : [
              {
                sku: '',
                colorName: 'Standard',
                colorCode: '#111111',
                mrp: 999,
                sellingPrice: 499,
                stockQuantity: 50,
                images: [],
                imagesText: '',
              },
            ],
    });
    setModalOpen(true);
  };

  const handleToggleCrazyDeal = async (productId, currentVal) => {
    try {
      await axiosInstance.patch(`/admin/products/${productId}/toggle-crazy-deal`);
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, isCrazyDeal: !currentVal } : p))
      );
    } catch (err) {
      console.error('Failed to toggle crazy deal:', err);
    }
  };

  const handleToggleTopDeal = async (productId, currentVal) => {
    try {
      await axiosInstance.patch(`/admin/products/${productId}/toggle-top-deal`);
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, isTopDeal: !currentVal } : p))
      );
    } catch (err) {
      console.error('Failed to toggle top deal:', err);
    }
  };

  const handleCreateProductSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title || !formData.category || !formData.brand || !formData.description) {
      setFormError('Please fill in all basic product details.');
      return;
    }

    // Process Variants
    const formattedVariants = formData.variants.map((v) => {
      const imagesList =
        v.images && v.images.length > 0
          ? v.images
          : v.imagesText
          ? v.imagesText.split(',').map((img) => img.trim()).filter(Boolean)
          : [];

      return {
        sku: v.sku.trim().toUpperCase(),
        colorName: v.colorName.trim() || 'Standard',
        colorCode: v.colorCode.trim() || '#111111',
        mrp: Number(v.mrp),
        sellingPrice: Number(v.sellingPrice),
        stockQuantity: Number(v.stockQuantity),
        images:
          imagesList.length > 0
            ? imagesList
            : [
                'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
              ],
      };
    });

    const skuSet = new Set(formattedVariants.map((v) => v.sku));
    if (skuSet.size !== formattedVariants.length || formattedVariants.some((v) => !v.sku)) {
      setFormError('Each variant must have a valid and unique SKU.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        brand: formData.brand,
        category: formData.category,
        badge: formData.badge,
        dealTag: (formData.dealTag || '').trim(),
        isCrazyDeal: Boolean(formData.isCrazyDeal),
        isTopDeal: Boolean(formData.isTopDeal),
        isFeatured: Boolean(formData.isFeatured),
        description: formData.description,
        supportedDevices: formData.supportedDevices || [],
        variants: formattedVariants,
      };

      if (editingProductId) {
        await axiosInstance.put(`/admin/products/${editingProductId}`, payload);
      } else {
        await axiosInstance.post('/admin/products', payload);
      }

      setModalOpen(false);
      fetchCatalog();
    } catch (err) {
      setFormError(err.message || 'Failed to save product SKU.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleProductStatus = async (id) => {
    try {
      await axiosInstance.delete(`/admin/products/${id}`);
      fetchCatalog();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch = search ? p.title.toLowerCase().includes(search.toLowerCase()) : true;
    const matchCat = categoryFilter
      ? p.category?._id === categoryFilter || p.category?.slug === categoryFilter
      : true;
    const matchDeal =
      dealFilter === 'CRAZY'
        ? p.isCrazyDeal
        : dealFilter === 'TOP'
        ? p.isTopDeal
        : true;
    return matchSearch && matchCat && matchDeal;
  });

  if (loading) return <Loader text="Loading Catalog Manager..." />;

  return (
    <div className="space-y-8 w-full animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900">
            Catalog & <span className="text-rose-600">SKU Matrix</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage accessories, Crazy Deals, Top Deals, Cloudinary media pipeline & device compatibility
          </p>
        </div>

        <button
          onClick={handleOpenCreateProduct}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New SKU Drop
        </button>
      </div>

      {/* Quick Promotion & Deal Showcase Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setDealFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
            dealFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          All Items ({products.length})
        </button>

        <button
          type="button"
          onClick={() => setDealFilter('CRAZY')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
            dealFilter === 'CRAZY'
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
              : 'bg-white border border-slate-200 text-amber-700 hover:bg-amber-50'
          }`}
        >
          <Flame className="w-3.5 h-3.5 fill-current" />
          <span>Crazy Deals ({products.filter((p) => p.isCrazyDeal).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setDealFilter('TOP')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
            dealFilter === 'TOP'
              ? 'bg-[#e11938] text-white font-black shadow-xs'
              : 'bg-white border border-slate-200 text-[#e11938] hover:bg-rose-50'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Top Deals ({products.filter((p) => p.isTopDeal).length})</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-900 outline-none focus:border-rose-500 shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-rose-500 shadow-sm"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Data Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] bg-slate-50 font-bold tracking-wider">
                <th className="py-3.5 px-4">Accessory</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Brand</th>
                <th className="py-3.5 px-4">Price (Selling / MRP)</th>
                <th className="py-3.5 px-4">Variants & Stock</th>
                <th className="py-3.5 px-4">Homepage Deals</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const totalStock =
                  p.variants?.reduce((acc, v) => acc + (v.stockQuantity || 0), 0) || 0;
                const sellingPrice = p.variants?.[0]?.sellingPrice || p.discountedPrice || 0;
                const mrp = p.variants?.[0]?.mrp || p.originalPrice || 0;

                return (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            p.thumbnail ||
                            p.variants?.[0]?.images?.[0] ||
                            'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100'
                          }
                          alt={p.title}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-slate-200 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate max-w-xs">{p.title}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400">
                              {p.badge !== 'None' ? `★ ${p.badge}` : 'Standard SKU'}
                            </span>
                            {p.supportedDevices?.length > 0 && (
                              <span className="text-[10px] text-amber-700 font-bold flex items-center gap-0.5">
                                <Smartphone className="w-3 h-3 text-amber-600" />
                                {p.supportedDevices.length} models linked
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-700">{p.category?.name || 'Accessories'}</td>
                    <td className="py-4 px-4 font-bold text-rose-600">{p.brand}</td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-900 block">₹{sellingPrice}</span>
                      <span className="text-[10px] text-slate-400 line-through">₹{mrp}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-900 block">{p.variants?.length || 1} Variant(s)</span>
                      <span
                        className={`text-[10px] font-bold ${
                          totalStock > 10 ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        Total Stock: {totalStock}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* 1-Click Crazy Deal Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleCrazyDeal(p._id, p.isCrazyDeal)}
                            title={
                              p.isCrazyDeal
                                ? 'Active in Crazy Deals (Click to remove)'
                                : 'Click to add to Homepage Crazy Deals'
                            }
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 transition-all cursor-pointer ${
                              p.isCrazyDeal
                                ? 'bg-amber-500 text-slate-950 shadow-2xs font-extrabold'
                                : 'bg-slate-100 text-slate-400 hover:text-amber-700 hover:bg-amber-50'
                            }`}
                          >
                            <Flame className={`w-3 h-3 ${p.isCrazyDeal ? 'fill-current' : ''}`} />
                            <span>Crazy</span>
                          </button>

                          {/* 1-Click Top Deal Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleTopDeal(p._id, p.isTopDeal)}
                            title={
                              p.isTopDeal
                                ? 'Active in Top Deals (Click to remove)'
                                : 'Click to add to Homepage Top Deals'
                            }
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 transition-all cursor-pointer ${
                              p.isTopDeal
                                ? 'bg-[#e11938] text-white shadow-2xs font-extrabold'
                                : 'bg-slate-100 text-slate-400 hover:text-[#e11938] hover:bg-rose-50'
                            }`}
                          >
                            <Zap className={`w-3 h-3 ${p.isTopDeal ? 'fill-current' : ''}`} />
                            <span>Top Deal</span>
                          </button>
                        </div>

                        {p.dealTag ? (
                          <span
                            className="text-[9.5px] font-bold text-amber-950 bg-[#ffc200]/30 border border-[#ffc200]/80 rounded px-1.5 py-0.5 truncate max-w-[150px]"
                            title={p.dealTag}
                          >
                            {p.dealTag}
                          </span>
                        ) : (
                          <span className="text-[9.5px] text-slate-400 italic">No custom strip</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {p.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditProduct(p)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors inline-flex items-center gap-1"
                        title="Edit Product and Device Compatibility"
                      >
                        <Edit className="w-3 h-3 text-amber-600" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleToggleProductStatus(p._id)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                          p.isActive !== false
                            ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {p.isActive !== false ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD/EDIT PRODUCT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-600" />
                {editingProductId ? 'Edit Product SKU & Compatibility' : 'Create New SKU Drop'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {formError}
              </div>
            )}

            <form onSubmit={handleCreateProductSubmit} className="space-y-6">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-600 font-bold block mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Airdopes 441 Pro ANC Wireless Earbuds"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-rose-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-bold block mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="ChhotaBhai Essentials"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-rose-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-bold block mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-rose-500 focus:bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-bold block mb-1">Highlight Badge</label>
                  <select
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-rose-500 focus:bg-white"
                  >
                    <option value="None">None</option>
                    <option value="Drop Tested">Drop Tested</option>
                    <option value="Shockproof">Shockproof</option>
                    <option value="9H Hardness">9H Hardness</option>
                    <option value="65W Fast Charge">65W Fast Charge</option>
                    <option value="MagSafe">MagSafe</option>
                    <option value="Bestseller">Bestseller</option>
                    <option value="Hot Deal">Hot Deal</option>
                    <option value="New Launch">New Launch</option>
                    <option value="Trending">Trending</option>
                  </select>
                </div>

                {/* Homepage Deals & Promotions Showcase */}
                <div className="sm:col-span-2 p-4 bg-gradient-to-r from-amber-50/60 to-rose-50/60 rounded-2xl border border-amber-200/80 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      Homepage Showcase & Deal Placements
                    </h4>
                    <span className="text-[10px] text-slate-500 font-bold">
                      Direct control over Homepage placements
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Crazy Deal Checkbox */}
                    <label
                      className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        formData.isCrazyDeal
                          ? 'bg-amber-100/80 border-amber-400 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.isCrazyDeal}
                        onChange={(e) => setFormData({ ...formData, isCrazyDeal: e.target.checked })}
                        className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                      />
                      <div>
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" /> Crazy Deal
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5">Show in Homepage Crazy Deals</p>
                      </div>
                    </label>

                    {/* Top Deal Checkbox */}
                    <label
                      className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        formData.isTopDeal
                          ? 'bg-rose-100/80 border-rose-400 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-rose-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.isTopDeal}
                        onChange={(e) => setFormData({ ...formData, isTopDeal: e.target.checked })}
                        className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                      />
                      <div>
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-rose-600 fill-rose-500" /> Top Deal
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5">Show in Homepage Top Deals</p>
                      </div>
                    </label>

                    {/* Featured Checkbox */}
                    <label
                      className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        formData.isFeatured
                          ? 'bg-slate-100 border-slate-400 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="mt-0.5 rounded text-slate-900 focus:ring-slate-800 w-4 h-4"
                      />
                      <div>
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-slate-800" /> Featured Gear
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5">High priority catalog item</p>
                      </div>
                    </label>
                  </div>

                  {/* Yellow Deal Strip Tag */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Yellow Deal Strip Text (e.g., <span className="text-amber-800">100 Hours Playback | ★ 4.8</span> or <span className="text-amber-800">65W GaN Turbo</span>)
                    </label>
                    <input
                      type="text"
                      value={formData.dealTag}
                      onChange={(e) => setFormData({ ...formData, dealTag: e.target.value })}
                      placeholder="e.g. 100 Hours Playback | ★ 4.8"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Supported Phone Models Multi-Device Compatibility Selector */}
                <div className="sm:col-span-2 space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-rose-600" />
                        Supported Phone Models
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold border border-rose-200">
                          {formData.supportedDevices?.length || 0} Linked
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Link compatible smartphones for Back Covers, 9D Tempered Glass & Camera Guards.
                      </p>
                    </div>

                    {/* Quick Utility Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleSelectAllBrand('Apple')}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-sm"
                      >
                        + All Apple
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectAllBrand('Samsung')}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-sm"
                      >
                        + All Samsung
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectAllBrand('OnePlus')}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-sm"
                      >
                        + All OnePlus
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAllDevices}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors shadow-sm"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Active Selected Tags Tray */}
                  {formData.supportedDevices && formData.supportedDevices.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Linked Models ({formData.supportedDevices.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200">
                        {formData.supportedDevices.map((model) => (
                          <span
                            key={model}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold"
                          >
                            <span>{model}</span>
                            <button
                              type="button"
                              onClick={() => handleToggleDevice(model)}
                              className="text-rose-400 hover:text-rose-700 p-0.5"
                              title={`Remove ${model}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search Input for Device Filtering */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search phone model to toggle (e.g. 16 Pro, S24 Ultra, Nord, Vivo)..."
                      value={deviceSearchQuery}
                      onChange={(e) => setDeviceSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-rose-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors"
                    />
                    {deviceSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setDeviceSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-700"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Scrollable Model Picker Chips */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Click Model to Add / Remove:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200">
                      {availableDevices
                        .filter((d) => {
                          const q = deviceSearchQuery.toLowerCase().trim();
                          if (!q) return true;
                          return (
                            d.modelName.toLowerCase().includes(q) ||
                            d.brand.toLowerCase().includes(q)
                          );
                        })
                        .map((d) => {
                          const isSelected = (formData.supportedDevices || []).some(
                            (m) => m.toLowerCase() === d.modelName.toLowerCase()
                          );

                          return (
                            <button
                              key={d._id}
                              type="button"
                              onClick={() => handleToggleDevice(d.modelName)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-slate-900 text-white border border-slate-900 shadow-sm font-bold'
                                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <span>{isSelected ? '✓' : '+'}</span>
                              <span className="opacity-80 uppercase text-[9px] font-bold">
                                [{d.brand}]
                              </span>
                              <span>{d.modelName}</span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-600 font-bold block mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide acoustic or armor specifications..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-rose-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Variant Matrix Builder */}
              <div className="space-y-4 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      SKU Variant Matrix ({formData.variants.length})
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Attach Cloudinary images, pricing and stock for each colorway
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Color Variant
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs"
                    >
                      {/* Top Variant Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-6 gap-2.5 items-end">
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">SKU *</label>
                          <input
                            type="text"
                            required
                            value={v.sku}
                            onChange={(e) => handleVariantFieldChange(idx, 'sku', e.target.value)}
                            placeholder="DROP-BLK-01"
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[11px] text-slate-900 uppercase font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">Color Name</label>
                          <input
                            type="text"
                            value={v.colorName}
                            onChange={(e) => handleVariantFieldChange(idx, 'colorName', e.target.value)}
                            placeholder="Active Black"
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[11px] text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">Hex Color</label>
                          <input
                            type="text"
                            value={v.colorCode}
                            onChange={(e) => handleVariantFieldChange(idx, 'colorCode', e.target.value)}
                            placeholder="#111111"
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[11px] text-slate-900 font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">MRP ₹</label>
                          <input
                            type="number"
                            required
                            value={v.mrp}
                            onChange={(e) => handleVariantFieldChange(idx, 'mrp', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[11px] text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">Selling ₹</label>
                          <input
                            type="number"
                            required
                            value={v.sellingPrice}
                            onChange={(e) => handleVariantFieldChange(idx, 'sellingPrice', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[11px] text-slate-900"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <label className="text-[10px] text-slate-500 font-bold block mb-1">Stock</label>
                            <input
                              type="number"
                              required
                              value={v.stockQuantity}
                              onChange={(e) => handleVariantFieldChange(idx, 'stockQuantity', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[11px] text-slate-900"
                            />
                          </div>
                          {formData.variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveVariantRow(idx)}
                              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                              title="Delete Variant"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* CLOUDINARY DRAG-AND-DROP UPLOADER SECTION */}
                      <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-rose-600" />
                            Cloud Media Gallery ({v.images?.length || 0}/5 Images)
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Accepts JPG, PNG, WEBP (Max 5MB)
                          </span>
                        </div>

                        {/* Drag and Drop Zone */}
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragOverVariantIdx(idx);
                          }}
                          onDragLeave={() => setDragOverVariantIdx(null)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragOverVariantIdx(null);
                            handleImageFilesUpload(idx, e.dataTransfer.files);
                          }}
                          className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                            dragOverVariantIdx === idx
                              ? 'border-rose-500 bg-rose-50'
                              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                          }`}
                        >
                          <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/webp"
                            id={`variant-upload-${idx}`}
                            className="hidden"
                            onChange={(e) => handleImageFilesUpload(idx, e.target.files)}
                          />

                          {uploadingVariantIdx === idx ? (
                            <div className="flex items-center justify-center gap-2 py-2 text-rose-600">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span className="text-xs font-bold">Uploading to Cloudinary CDN...</span>
                            </div>
                          ) : (
                            <label
                              htmlFor={`variant-upload-${idx}`}
                              className="cursor-pointer flex flex-col items-center justify-center gap-1.5 py-1"
                            >
                              <UploadCloud className="w-6 h-6 text-slate-400 hover:text-rose-600 transition-colors" />
                              <p className="text-xs text-slate-700 font-medium">
                                <span className="text-rose-600 font-bold underline">Click to upload</span> or drag and drop images
                              </p>
                              <p className="text-[10px] text-slate-400">
                                Fast auto-sync to Cloudinary CDN with responsive compression
                              </p>
                            </label>
                          )}
                        </div>

                        {/* Uploaded Gallery Thumbnails */}
                        {v.images && v.images.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                            {v.images.map((imgUrl, imgIdx) => (
                              <div
                                key={imgIdx}
                                className="group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 aspect-square flex items-center justify-center"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Variant ${v.colorName || idx} - Image ${imgIdx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <a
                                    href={imgUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1 bg-white/20 hover:bg-white/40 text-white rounded"
                                    title="View Full Size"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveVariantImage(idx, imgIdx)}
                                    className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded"
                                    title="Delete Image"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                {imgIdx === 0 && (
                                  <span className="absolute bottom-1 left-1 bg-rose-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow">
                                    Primary
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs text-slate-700 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingVariantIdx !== null}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-sm disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving SKU Matrix...
                    </>
                  ) : editingProductId ? (
                    'Update Product SKU Drop'
                  ) : (
                    'Publish Product Drop'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
