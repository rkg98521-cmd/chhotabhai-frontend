import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Truck,
  RefreshCw,
  ShoppingBag,
  Zap,
  Check,
  ArrowLeft,
  Smartphone,
  Search,
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useCartStore, useAuthStore } from '../store/useStore';
import Meta from '../components/common/Meta';
import Loader from '../components/Loader';
import { useDeviceStore } from '../store/useDeviceStore';

export const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { selectedDevice: globalDevice, setDevice: setGlobalDevice } = useDeviceStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState(globalDevice?.model || '');
  const [availableDevices, setAvailableDevices] = useState([]);
  const [deviceSearch, setDeviceSearch] = useState('');
  const [deviceError, setDeviceError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (globalDevice?.model && !selectedDevice) {
      setSelectedDevice(globalDevice.model);
    }
  }, [globalDevice]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await axiosInstance.get('/devices');
        if (res.data?.data && Array.isArray(res.data.data)) {
          setAvailableDevices(res.data.data);
        }
      } catch (err) {
        console.warn('Could not load devices:', err);
      }
    };
    fetchDevices();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/products/${slug}`);
        const p = res.data.data;
        setProduct(p);
        setSelectedVariantIndex(p.defaultVariantIndex || 0);
        if (p.supportedDevices && p.supportedDevices.length > 0) {
          setSelectedDevice(p.supportedDevices[0]);
        }
      } catch (err) {
        console.error('PDP load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) return <Loader text="Loading Specifications..." />;
  if (!product) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4 bg-white text-slate-900">
        <h2 className="text-2xl font-black text-slate-900 uppercase">Product Not Found</h2>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 bg-brand-red text-white text-xs font-black uppercase rounded-xl shadow-sm"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  const variants = product.variants || [];
  const currentVariant = variants[selectedVariantIndex] || variants[0] || {};
  const galleryImages =
    currentVariant.images && currentVariant.images.length > 0
      ? currentVariant.images
      : product.images || [product.thumbnail];

  const activeImage = galleryImages[activeImageIndex] || galleryImages[0];

  const sellingPrice = currentVariant.sellingPrice || product.discountedPrice || 0;
  const mrp = currentVariant.mrp || product.originalPrice || 0;
  const savings = Math.max(0, mrp - sellingPrice);
  const discountPercent = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
  const stockQuantity = currentVariant.stockQuantity ?? product.countInStock ?? 20;

  const isPhoneCompatible =
    Boolean(product.supportedDevices && product.supportedDevices.length > 0) ||
    ['mobile-back-covers', 'tempered-glass', 'camera-lens-protectors', 'back-cases'].includes(
      product.category?.slug
    ) ||
    /cover|case|glass|tempered|lens|magsafe|screen/i.test(product.title || '') ||
    /cover|case|glass|tempered|lens|magsafe|screen/i.test(product.category?.name || '');

  const phoneModelsList =
    product.supportedDevices && product.supportedDevices.length > 0
      ? product.supportedDevices
      : availableDevices.map((d) => d.modelName);

  const filteredPhoneModels = phoneModelsList.filter((m) =>
    m.toLowerCase().includes(deviceSearch.toLowerCase())
  );

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isPhoneCompatible && !selectedDevice) {
      setDeviceError(true);
      return;
    }
    setDeviceError(false);

    try {
      setAdding(true);
      await addToCart(currentVariant.sku, quantity, product._id, selectedDevice || globalDevice?.model);
      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (isPhoneCompatible && !selectedDevice) {
      setDeviceError(true);
      return;
    }
    await handleAddToCart();
    navigate('/checkout');
  };

  return (
    <div className="cb-container py-6 sm:py-10 space-y-8 sm:space-y-12 bg-white text-slate-900 pb-24 lg:pb-10">
      {product && (
        <Meta
          title={`${product.title} - ChhotaBhai`}
          description={product.description ? product.description.substring(0, 150) : 'ChhotaBhai luxury mobile accessories'}
          keywords={`${product.category || 'accessories'}, mobile covers, tempered glass, ${product.brand || 'ChhotaBhai'}`}
          ogImage={activeImage}
        />
      )}

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </button>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-12 items-start">
        {/* LEFT COLUMN: Gallery */}
        <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-24">
          {/* Main Active Image Stage */}
          <div className="aspect-square bg-[#eceef2] rounded-3xl border border-slate-200 overflow-hidden relative shadow-sm group flex items-center justify-center p-4 sm:p-8">
            <img
              src={activeImage}
              alt={product.title}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 mix-blend-multiply"
            />
            {product.badge && product.badge !== 'None' && (
              <span className="absolute top-4 left-4 bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded shadow-sm">
                ★ {product.badge}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="absolute top-4 right-4 bg-brand-red text-white text-[11px] font-black uppercase px-3 py-1 rounded-lg tracking-wider shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnail Selector Row */}
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 bg-slate-50 transition-all ${
                    activeImageIndex === idx
                      ? 'border-brand-red ring-2 ring-rose-200 scale-105'
                      : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Product Configuration & Actions */}
        <div className="lg:col-span-6 space-y-6">
          {/* Brand, Title & Ratings */}
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-brand-red block">
              {product.brand} Official Drop
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight leading-tight">
              {product.title}
            </h1>
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {product.ratings?.averageRating || 4.8}
              </span>
              <span className="text-slate-500">
                ({product.ratings?.totalReviews || 120} verified reviews)
              </span>
            </div>
          </div>

          {/* Pricing & Savings Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">₹{sellingPrice}</span>
              {mrp > sellingPrice && (
                <span className="text-sm text-slate-400 line-through font-medium">₹{mrp}</span>
              )}
              {discountPercent > 0 && (
                <span className="text-xs font-black text-brand-red uppercase">
                  Save ₹{savings} ({discountPercent}% OFF)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">Inclusive of all taxes • Free Shipping available</p>
          </div>

          {/* Color / Variant Swatch Selector */}
          {variants.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                  Color Option: <strong className="text-slate-900 ml-1">{currentVariant.colorName}</strong>
                </label>
                <span className="text-[10px] text-slate-400 font-mono uppercase">
                  SKU: {currentVariant.sku}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {variants.map((v, idx) => (
                  <button
                    key={v.sku || idx}
                    onClick={() => {
                      setSelectedVariantIndex(idx);
                      setActiveImageIndex(0);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                      selectedVariantIndex === idx
                        ? 'border-brand-red bg-rose-50 text-slate-900 ring-2 ring-rose-200'
                        : 'border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-sm"
                      style={{ backgroundColor: v.colorCode || '#000' }}
                    />
                    <span>{v.colorName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Phone Compatibility Selector (for cases, covers & tempered glass) */}
          {isPhoneCompatible && phoneModelsList.length > 0 && (
            <div className={`space-y-2 p-4 rounded-2xl border transition-all ${
              deviceError ? 'border-brand-red bg-rose-50/50' : 'border-slate-200 bg-slate-50/80'
            }`}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-brand-red" /> Select Your Phone Model:
                </label>
                {selectedDevice ? (
                  <span className="text-[11px] font-black text-brand-red bg-white px-2.5 py-0.5 rounded-full border border-slate-200 flex items-center gap-1 shadow-sm">
                    <Check className="w-3 h-3 text-emerald-600" /> {selectedDevice}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-600 uppercase">
                    Model Required
                  </span>
                )}
              </div>

              {/* Quick Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search your phone (e.g. iPhone 16, Galaxy S24, OnePlus 12)..."
                  value={deviceSearch}
                  onChange={(e) => setDeviceSearch(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-red"
                />
              </div>

              {/* Scrollable Model Chips */}
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1 pr-1 scrollbar-thin">
                {filteredPhoneModels.length > 0 ? (
                  filteredPhoneModels.map((dev) => (
                    <button
                      key={dev}
                      type="button"
                      onClick={() => {
                        setSelectedDevice(dev);
                        setGlobalDevice('', dev);
                        setDeviceError(false);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-left flex items-center gap-1.5 ${
                        selectedDevice === dev
                          ? 'bg-brand-red text-white shadow-sm'
                          : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {dev}
                      {selectedDevice === dev && <Check className="w-3 h-3" />}
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 py-1">No phone model matches &ldquo;{deviceSearch}&rdquo;</span>
                )}
              </div>

              {deviceError && (
                <p className="text-[11px] font-bold text-brand-red flex items-center gap-1">
                  ⚠️ Please select your exact phone model above to ensure 100% precision fitment.
                </p>
              )}
            </div>
          )}

          {/* Stock Availability Badge */}
          <div className="flex items-center gap-2 text-xs">
            {stockQuantity > 5 ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> In Stock & Ready for Rapid Dispatch
              </span>
            ) : stockQuantity > 0 ? (
              <span className="text-amber-600 font-bold">
                ⚠️ Hurry! Only {stockQuantity} units left in stock
              </span>
            ) : (
              <span className="text-brand-red font-bold">Sold Out / Currently Unavailable</span>
            )}
          </div>

          {/* Quantity Selector & Action CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 text-xs text-slate-600 hover:text-slate-900 font-bold"
                >
                  -
                </button>
                <span className="px-3 py-2 text-xs font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2 text-xs text-slate-600 hover:text-slate-900 font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding || stockQuantity <= 0}
                className={`flex-1 py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart
                  </>
                ) : adding ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-white" /> Add to Cart
                  </>
                )}
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={stockQuantity <= 0}
              className="w-full py-4 bg-brand-red hover:bg-brand-red-hover text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Zap className="w-4 h-4" /> Instant Buy Now
            </button>
          </div>

          {/* Warranty & Guarantees strip */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-600">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-brand-red mx-auto mb-1" />
              <span>1 Year Warranty</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <Truck className="w-4 h-4 text-brand-red mx-auto mb-1" />
              <span>Free Delivery ₹499+</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <RefreshCw className="w-4 h-4 text-brand-red mx-auto mb-1" />
              <span>7 Days Return</span>
            </div>
          </div>
        </div>
      </div>

      {/* TECHNICAL SPECIFICATIONS TABLE & FEATURES */}
      <section className="border-t border-slate-200 pt-12 space-y-6">
        <h2 className="text-xl font-black uppercase text-slate-900 tracking-tight">
          Technical Specifications & <span className="text-brand-red">Highlights</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Specs Table */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <tr key={key} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-500 w-1/2">{key}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Description & Overview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Product Description</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS & RATINGS SECTION */}
      <section className="border-t border-slate-200 pt-12 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black uppercase text-slate-900 tracking-tight">
              Verified Customer <span className="text-brand-red">Reviews</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Real ratings from authentic buyers across India</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span className="text-base font-black text-slate-900">{product.ratings?.averageRating || 4.8} / 5</span>
          </div>
        </div>

        {product.reviews && product.reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.reviews.map((rev) => (
              <div key={rev._id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{rev.user?.name || 'Verified Buyer'}</span>
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
                {rev.title && <h4 className="text-xs font-bold text-slate-900">{rev.title}</h4>}
                <p className="text-xs text-slate-600">{rev.comment}</p>
                <span className="text-[10px] text-emerald-600 font-bold block pt-1">✓ Verified Purchase</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-500">
            Be the first to review this mobile accessory drop!
          </div>
        )}
      </section>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 px-4 z-40 flex items-center justify-between gap-3 shadow-2xl">
        <div className="min-w-0">
          <div className="text-base sm:text-lg font-black text-slate-900 leading-none truncate">
            ₹{sellingPrice.toLocaleString('en-IN')}
          </div>
          {mrp > sellingPrice && (
            <span className="text-[10px] text-emerald-600 font-bold block truncate">
              {discountPercent}% OFF • Free Delivery
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end max-w-[240px]">
          <button
            onClick={handleAddToCart}
            disabled={adding || stockQuantity <= 0}
            className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-sm flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            {added ? 'Added' : 'Add to Cart'}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={stockQuantity <= 0}
            className="flex-1 py-2.5 px-3 bg-brand-red hover:bg-brand-red-hover text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
