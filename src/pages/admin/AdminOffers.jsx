import React, { useEffect, useState } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Edit,
  X,
  Check,
  AlertCircle,
  Sparkles,
  Megaphone,
  Image as ImageIcon,
  Calendar,
  Percent,
  ExternalLink,
  CheckCircle2,
  UploadCloud,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import Loader from '../../components/Loader';

export const AdminOffers = () => {
  const [activeTab, setActiveTab] = useState('BANNERS');
  const [banners, setBanners] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Modal States
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [uploadingBannerImg, setUploadingBannerImg] = useState(false);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Banner / Announcement Form
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    redirectUrl: '/shop',
    badgeText: 'FESTIVE SALE',
    ctaText: 'Shop Now',
    bannerMode: 'TEXT_OVERLAY',
    order: 1,
    type: 'BANNER',
    isActive: true,
  });

  // Coupon Form
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderValue: 499,
    maxDiscountAmount: 200,
    expiryDate: '2028-12-31',
    isActive: true,
  });

  const fetchMarketingData = async () => {
    setLoading(true);
    try {
      const [bannerRes, couponRes] = await Promise.all([
        axiosInstance.get('/admin/banners'),
        axiosInstance.get('/admin/coupons'),
      ]);
      setBanners(bannerRes.data.data || []);
      setCoupons(couponRes.data.data || []);
    } catch (err) {
      console.error('Failed to load marketing offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketingData();
  }, []);

  const handleOpenCreateBanner = () => {
    setFormError('');
    setEditingBannerId(null);
    setBannerForm({
      title: '',
      subtitle: '',
      imageUrl: '',
      redirectUrl: '/shop',
      badgeText: 'FESTIVE SALE',
      ctaText: 'Shop Now',
      bannerMode: 'TEXT_OVERLAY',
      order: (banners.filter((b) => b.type === 'BANNER').length || 0) + 1,
      type: activeTab === 'ANNOUNCEMENTS' ? 'ANNOUNCEMENT' : 'BANNER',
      isActive: true,
    });
    setBannerModalOpen(true);
  };

  const handleOpenEditBanner = (b) => {
    setFormError('');
    setEditingBannerId(b._id);
    setBannerForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      imageUrl: b.imageUrl || '',
      redirectUrl: b.redirectUrl || '/shop',
      badgeText: b.badgeText || 'SPECIAL DEAL',
      ctaText: b.ctaText || 'Shop Now',
      bannerMode: b.bannerMode || 'TEXT_OVERLAY',
      order: b.order || 0,
      type: b.type === 'ANNOUNCEMENT' || b.type === 'TICKER' ? 'ANNOUNCEMENT' : 'BANNER',
      isActive: b.isActive !== false,
    });
    setBannerModalOpen(true);
  };

  const handleBannerImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBannerImg(true);
    setFormError('');

    try {
      const data = new FormData();
      data.append('images', file);

      const res = await axiosInstance.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const urls = res.data.data?.urls || [];
      if (urls.length > 0) {
        setBannerForm((prev) => ({ ...prev, imageUrl: urls[0] }));
      }
    } catch (err) {
      setFormError(err.message || 'Image upload failed. Please verify format.');
    } finally {
      setUploadingBannerImg(false);
    }
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!bannerForm.title.trim()) {
      setFormError('Headline text is required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingBannerId) {
        await axiosInstance.put(`/admin/banners/${editingBannerId}`, bannerForm);
        setFeedback({ type: 'success', message: 'Hero banner updated successfully!' });
      } else {
        await axiosInstance.post('/admin/banners', bannerForm);
        setFeedback({ type: 'success', message: 'New banner published successfully!' });
      }

      setBannerModalOpen(false);
      setEditingBannerId(null);
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
      fetchMarketingData();
    } catch (err) {
      setFormError(err.message || 'Failed to save banner.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!couponForm.code.trim() || !couponForm.discountValue || !couponForm.expiryDate) {
      setFormError('Please fill in coupon code, discount value, and expiration date.');
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.post('/admin/coupons', couponForm);
      setCouponModalOpen(false);
      setCouponForm({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderValue: 499,
        maxDiscountAmount: 200,
        expiryDate: '2028-12-31',
        isActive: true,
      });
      setFeedback({ type: 'success', message: 'Discount coupon published successfully!' });
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
      fetchMarketingData();
    } catch (err) {
      setFormError(err.message || 'Failed to create coupon code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleBanner = async (banner) => {
    try {
      await axiosInstance.put(`/admin/banners/${banner._id}`, { isActive: !banner.isActive });
      fetchMarketingData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Delete this banner campaign?')) return;
    try {
      await axiosInstance.delete(`/admin/banners/${id}`);
      fetchMarketingData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCoupon = async (coupon) => {
    try {
      await axiosInstance.put(`/admin/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      fetchMarketingData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await axiosInstance.delete(`/admin/coupons/${id}`);
      fetchMarketingData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loader text="Loading Marketing & Offers Center..." />;

  const announcements = banners.filter((b) => b.type === 'ANNOUNCEMENT' || b.type === 'TICKER');
  const heroBanners = banners.filter((b) => b.type === 'BANNER' || b.type === 'HERO_BANNER');

  return (
    <div className="space-y-8 w-full animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
            Marketing, <span className="text-rose-600">Offers & Tickers</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage top announcement bar alerts, homepage promotional hero banners, and discount coupon codes
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'COUPONS' ? (
            <button
              onClick={() => {
                setFormError('');
                setCouponModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> Create Coupon
            </button>
          ) : (
            <button
              onClick={handleOpenCreateBanner}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />{' '}
              {activeTab === 'ANNOUNCEMENTS' ? 'New Announcement Alert' : 'New Hero Banner'}
            </button>
          )}
        </div>
      </div>

      {feedback.message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ANNOUNCEMENTS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap ${
            activeTab === 'ANNOUNCEMENTS'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Megaphone className="w-4 h-4" /> Top Announcement Bar ({announcements.length})
        </button>
        <button
          onClick={() => setActiveTab('BANNERS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap ${
            activeTab === 'BANNERS'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Hero Banners ({heroBanners.length})
        </button>
        <button
          onClick={() => setActiveTab('COUPONS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap ${
            activeTab === 'COUPONS'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Percent className="w-4 h-4" /> Discount Coupons ({coupons.length})
        </button>
      </div>

      {/* TAB 1: ANNOUNCEMENT BAR TICKERS */}
      {activeTab === 'ANNOUNCEMENTS' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">
              Active Storefront Announcement Tickers
            </h3>
            <div className="space-y-3">
              {announcements.map((a) => (
                <div
                  key={a._id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-rose-50 text-rose-600 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-rose-200">
                        {a.badgeText || 'LIVE ALERT'}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                          a.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {a.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 truncate">{a.title}</p>
                    {a.subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{a.subtitle}</p>}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleBanner(a)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        a.isActive
                          ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {a.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(a._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No announcement tickers created. Click &quot;New Announcement Alert&quot; to add one.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HERO BANNERS */}
      {activeTab === 'BANNERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {heroBanners.map((b) => (
            <div
              key={b._id}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div className="relative aspect-[21/9] bg-slate-900 overflow-hidden">
                {b.imageUrl ? (
                  <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover object-center" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="bg-rose-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-xs">
                    {b.badgeText || 'PROMO'}
                  </span>
                  <span className="bg-black/70 text-amber-300 text-[9px] font-black uppercase px-1.5 py-0.5 rounded backdrop-blur-xs">
                    Order #{b.order || 1}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  <span className="bg-black/60 text-white text-[8.5px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                    {b.bannerMode === 'FULL_IMAGE' ? 'Full Graphic' : 'Text Overlay'}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-xs ${
                      b.isActive ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {b.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-2 flex-1">
                <h4 className="text-xs font-black uppercase text-slate-900 line-clamp-1">{b.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">{b.subtitle || 'Direct promotion banner'}</p>
                <div className="pt-2 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                  <span className="flex items-center gap-1 truncate max-w-[190px]">
                    <ExternalLink className="w-3 h-3 text-rose-600 flex-shrink-0" />
                    <span className="truncate">{b.redirectUrl || '/shop'}</span>
                  </span>
                  <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[9.5px]">
                    CTA: {b.ctaText || 'Shop Now'}
                  </span>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <button
                  onClick={() => handleToggleBanner(b)}
                  className={`text-xs font-bold ${b.isActive ? 'text-amber-700 hover:text-amber-800' : 'text-emerald-700 hover:text-emerald-800'}`}
                >
                  {b.isActive ? 'Deactivate' : 'Activate'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditBanner(b)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs flex items-center gap-1 cursor-pointer"
                  >
                    <Edit className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBanner(b._id)}
                    className="text-xs text-slate-400 hover:text-rose-600 p-1"
                    title="Delete banner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {heroBanners.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200 shadow-sm">
              No hero banners currently configured. Click &quot;New Hero Banner&quot; above to create one.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DISCOUNT COUPONS */}
      {activeTab === 'COUPONS' && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] bg-slate-50">
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Min Order</th>
                  <th className="py-3.5 px-4">Expires</th>
                  <th className="py-3.5 px-4">Redemptions</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg">
                        {c.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {c.discountType === 'PERCENTAGE'
                        ? `${c.discountValue}% OFF (Capped at ₹${c.maxDiscountAmount || 'No cap'})`
                        : `₹${c.discountValue} FLAT OFF`}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">₹{c.minOrderValue}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(c.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.usedCount || 0} Uses</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleCoupon(c)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          c.isActive
                            ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {c.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(c._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No discount coupons found. Click &quot;Create Coupon&quot; to publish promotional codes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BANNER / ANNOUNCEMENT MODAL */}
      {bannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-600" />
                {editingBannerId ? 'Edit Hero Banner / Alert' : 'New Marketing Campaign'}
              </h2>
              <button
                onClick={() => setBannerModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {formError}
              </div>
            )}

            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Campaign Type *</label>
                  <select
                    value={bannerForm.type}
                    onChange={(e) => setBannerForm({ ...bannerForm, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-rose-500 focus:bg-white font-medium"
                  >
                    <option value="BANNER">Homepage Hero Banner</option>
                    <option value="ANNOUNCEMENT">Top Announcement Bar Ticker</option>
                  </select>
                </div>

                {bannerForm.type === 'BANNER' && (
                  <div>
                    <label className="text-slate-600 font-bold block mb-1">Banner Presentation Mode</label>
                    <select
                      value={bannerForm.bannerMode}
                      onChange={(e) => setBannerForm({ ...bannerForm, bannerMode: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-rose-500 focus:bg-white font-medium"
                    >
                      <option value="TEXT_OVERLAY">Text &amp; CTA Button Over Background</option>
                      <option value="FULL_IMAGE">Full Graphic Artwork (Auto-cover, Clickable)</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Headline Text *</label>
                <input
                  type="text"
                  required
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  placeholder="e.g. Celebrate The Moments, Make Them Personal"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-rose-500 focus:bg-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Subtitle / Supporting Text</label>
                <input
                  type="text"
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  placeholder="e.g. A Special Gift For Every Festive Celebration"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-rose-500 focus:bg-white"
                />
              </div>

              {bannerForm.type === 'BANNER' && (
                <div className="space-y-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-700 font-bold block">
                      Banner Image (Auto-Sized &amp; Centered)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Upload from PC or Paste Image URL
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={bannerForm.imageUrl}
                      onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/... or paste image URL"
                      className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-rose-500 text-xs"
                    />

                    <label className="px-3.5 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 font-bold text-slate-700 text-xs shrink-0 shadow-2xs">
                      {uploadingBannerImg ? (
                        <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                      ) : (
                        <UploadCloud className="w-4 h-4 text-rose-600" />
                      )}
                      <span>{uploadingBannerImg ? 'Uploading...' : 'Upload File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerImageUpload}
                        className="hidden"
                        disabled={uploadingBannerImg}
                      />
                    </label>
                  </div>

                  {/* Real-Time Auto-Fit Live Preview Box */}
                  {bannerForm.imageUrl && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Live Auto-Fit Preview (Matches Homepage Screen Aspect):
                      </span>
                      <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm flex items-center">
                        <img
                          src={bannerForm.imageUrl}
                          alt="Banner preview"
                          className="absolute inset-0 w-full h-full object-cover object-center"
                        />
                        {bannerForm.bannerMode !== 'FULL_IMAGE' && (
                          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent p-4 sm:p-5 flex flex-col justify-center text-white space-y-1 z-10">
                            <span className="inline-block self-start text-[8.5px] font-black uppercase tracking-wider bg-rose-600 px-2 py-0.5 rounded text-white shadow-xs">
                              {bannerForm.badgeText || 'SPECIAL OFFER'}
                            </span>
                            <h3 className="text-xs sm:text-sm font-black leading-tight max-w-sm line-clamp-1">
                              {bannerForm.title || 'Headline Text'}
                            </h3>
                            <p className="text-[10px] text-slate-200 line-clamp-1 max-w-sm">
                              {bannerForm.subtitle || 'Supporting subtitle...'}
                            </p>
                            <span className="self-start text-[9.5px] font-black bg-white text-slate-900 px-2.5 py-0.5 rounded-lg mt-1 shadow-xs">
                              {bannerForm.ctaText || 'Shop Now'} →
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={bannerForm.badgeText}
                    onChange={(e) => setBannerForm({ ...bannerForm, badgeText: e.target.value })}
                    placeholder="GRAND FESTIVE SALE"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-rose-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={bannerForm.ctaText}
                    onChange={(e) => setBannerForm({ ...bannerForm, ctaText: e.target.value })}
                    placeholder="Shop Now"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-rose-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">Display Order #</label>
                  <input
                    type="number"
                    min="1"
                    value={bannerForm.order}
                    onChange={(e) => setBannerForm({ ...bannerForm, order: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-rose-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Target Redirect URL</label>
                <input
                  type="text"
                  value={bannerForm.redirectUrl}
                  onChange={(e) => setBannerForm({ ...bannerForm, redirectUrl: e.target.value })}
                  placeholder="/shop?category=smartwatches"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-rose-500 focus:bg-white font-mono"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setBannerModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingBannerImg}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-wider rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {submitting
                      ? 'Saving...'
                      : editingBannerId
                      ? 'Update Campaign'
                      : 'Publish Campaign'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COUPON MODAL */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-rose-600" /> Create Discount Coupon
              </h2>
              <button
                onClick={() => setCouponModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {formError}
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. FLASH20"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono uppercase font-black outline-none focus:border-rose-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Discount Type *</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-rose-500 focus:bg-white"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Cash (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">
                    {couponForm.discountType === 'PERCENTAGE' ? 'Discount (%) *' : 'Discount (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-rose-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={couponForm.minOrderValue}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-rose-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={couponForm.maxDiscountAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, maxDiscountAmount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-rose-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Expiration Date *</label>
                <input
                  type="date"
                  required
                  value={couponForm.expiryDate}
                  onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-rose-500 focus:bg-white"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-wider rounded-xl shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOffers;
