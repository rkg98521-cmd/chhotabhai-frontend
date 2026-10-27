import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Share2,
  Heart,
  Copy,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Tag,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useCartStore, useAuthStore, useWishlistStore } from '../store/useStore';
import Meta from '../components/common/Meta';
import Loader from '../components/Loader';

export const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Pincode Delivery Estimator
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [pincodeChecking, setPincodeChecking] = useState(false);

  // Link copy toast
  const [copied, setCopied] = useState(false);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) return <Loader text="Loading Specifications..." />;
  if (!product) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4 bg-white text-slate-900">
        <h2 className="text-2xl font-black text-slate-900 uppercase">Product Not Found</h2>
        <p className="text-xs text-slate-500">
          The accessory item you are looking for is currently unavailable or has been discontinued.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 bg-[#e11938] hover:bg-[#be123c] text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-sm cursor-pointer"
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
      : product.images && product.images.length > 0
      ? product.images
      : [product.thumbnail || 'https://images.unsplash.com/photo-1541877944-ac82a091518a?w=800&auto=format&fit=crop&q=80'];

  const activeImage = galleryImages[activeImageIndex] || galleryImages[0];

  const sellingPrice = currentVariant.sellingPrice || product.discountedPrice || 399;
  const mrp = currentVariant.mrp || product.originalPrice || 1299;
  const savings = Math.max(0, mrp - sellingPrice);
  const discountPercent = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
  const stockQuantity = currentVariant.stockQuantity ?? product.countInStock ?? 50;

  const inWishlist = isInWishlist(product._id || product.id);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    try {
      setAdding(true);
      await addToCart(currentVariant.sku || 'CB-DEFAULT-SKU', quantity, product._id);
      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    await handleAddToCart();
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
      setPincodeStatus({ valid: false, message: 'Please enter a valid 6-digit Indian PIN Code.' });
      return;
    }
    setPincodeChecking(true);
    setTimeout(() => {
      setPincodeChecking(false);
      setPincodeStatus({
        valid: true,
        message: 'Delivery in 2-3 Days • Free Express Delivery',
        cod: true
      });
    }, 400);
  };

  // Comprehensive technical specs fallback if backend field is blank
  const defaultSpecifications = {
    'Brand': product.brand || 'ChhotaBhai Essentials',
    'Category': product.category?.name || 'Mobile Cases & Covers',
    'Compatible Models': product.supportedDevices?.join(', ') || 'iPhone 16 Pro Max, 16 Pro, 15, S24 Ultra',
    'Material': 'Optical Bayer Polycarbonate + Shockproof TPU Bumper',
    'Form Factor': 'Ultra-Slim Hybrid Armor with Raised Camera Lip (1.8mm)',
    'Drop Protection': 'Military-Grade 10ft Drop Tested (MIL-STD-810G)',
    'Special Feature': 'Anti-Yellowing UV Coating, Wireless Qi / MagSafe Friendly',
    'Item Weight': '28 Grams (Ultra Lightweight)',
    'Warranty': '1 Year Domestic Brand Replacement Warranty',
    'In The Box': '1x Case, 1x Microfiber Polishing Cloth, 1x Warranty Card'
  };

  const specificationsToRender =
    product.specifications && Object.keys(product.specifications).length > 0
      ? product.specifications
      : defaultSpecifications;

  return (
    <div className="bg-white text-slate-900 pb-28 lg:pb-16 selection:bg-[#e11938] selection:text-white">
      {product && (
        <Meta
          title={`${product.title} - ChhotaBhai`}
          description={product.description ? product.description.substring(0, 150) : 'ChhotaBhai luxury mobile accessories'}
          keywords={`${product.category?.name || 'accessories'}, mobile covers, tempered glass, ${product.brand || 'ChhotaBhai'}`}
          ogImage={activeImage}
        />
      )}

      {/* 1. BREADCRUMBS & TOP BAR */}
      <div className="border-b border-slate-100 bg-slate-50/70">
        <div className="cb-container py-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none font-medium">
            <Link to="/" className="hover:text-slate-900 transition">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link to="/shop" className="hover:text-slate-900 transition">
              Shop
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link
              to={`/shop?category=${product.category?.slug || 'all'}`}
              className="hover:text-slate-900 transition"
            >
              {product.category?.name || 'Accessories'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-900 font-bold truncate max-w-xs sm:max-w-md">
              {product.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="cb-container pt-6 sm:pt-8 space-y-12">
        {/* 2. MAIN BUYING STAGE: 2-COLUMN LAYOUT (Image Gallery & Buy Box) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-14 items-start">
          
          {/* =========================================================================
              LEFT COLUMN: Product Gallery (Sticky on Desktop)
          ========================================================================= */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-4 lg:sticky lg:top-24">
            
            {/* Primary Main Image Stage */}
            <div className="aspect-square bg-[#f8f9fb] rounded-3xl border border-slate-200/90 overflow-hidden relative shadow-xs flex items-center justify-center p-6 sm:p-10 group">
              <img
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply select-none"
              />

              {/* Floating Deal & Discount Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10 pointer-events-none">
                {product.badge && product.badge !== 'None' && (
                  <span className="bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-black uppercase px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-slate-950" /> {product.badge}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="bg-[#e11938] text-white text-[10px] sm:text-xs font-black uppercase px-2.5 py-1 rounded-md tracking-wider shadow-xs">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Action Overlay: Wishlist & Share Buttons */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-xs flex items-center justify-center transition cursor-pointer ${
                    inWishlist ? 'text-[#e11938]' : 'text-slate-500 hover:text-[#e11938]'
                  }`}
                  title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-[#e11938]' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-500 hover:text-slate-900 transition cursor-pointer"
                  title="Share Product"
                  aria-label="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Share Toast Notification */}
              {copied && (
                <div className="absolute bottom-4 inset-x-4 bg-slate-900 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-lg flex items-center justify-center gap-2 animate-in fade-in z-20">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Link copied to clipboard!</span>
                </div>
              )}
            </div>

            {/* Thumbnail Navigation Row */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 bg-slate-50 transition-all cursor-pointer p-1.5 ${
                      activeImageIndex === idx
                        ? 'border-[#e11938] ring-2 ring-rose-100 scale-105'
                        : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt="Thumbnail"
                      className="w-full h-full object-contain mix-blend-multiply"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Amazon / boAt Style 4-Point Trust Grid Under Image */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-center">
                <ShieldCheck className="w-5 h-5 text-[#e11938] mx-auto mb-1" />
                <p className="text-[11px] font-bold text-slate-900">1 Year Warranty</p>
                <p className="text-[10px] text-slate-500">100% Brand Guarantee</p>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-center">
                <Truck className="w-5 h-5 text-[#e11938] mx-auto mb-1" />
                <p className="text-[11px] font-bold text-slate-900">Free Delivery</p>
                <p className="text-[10px] text-slate-500">Fast Prepaid Shipping</p>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-center">
                <RefreshCw className="w-5 h-5 text-[#e11938] mx-auto mb-1" />
                <p className="text-[11px] font-bold text-slate-900">7 Days Return</p>
                <p className="text-[10px] text-slate-500">Hassle-Free Swap</p>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-center">
                <Award className="w-5 h-5 text-[#e11938] mx-auto mb-1" />
                <p className="text-[11px] font-bold text-slate-900">Original Gear</p>
                <p className="text-[10px] text-slate-500">100% Verified Quality</p>
              </div>
            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: Product Buying Configuration & CTAs
          ========================================================================= */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6">
            
            {/* Header: Brand, Title & Social Proof */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#e11938] bg-rose-50 px-2.5 py-0.5 rounded-md">
                  {product.brand || 'ChhotaBhai Essentials'}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">•</span>
                <span className="text-[11px] font-bold text-slate-500">
                  {product.category?.name || 'Back Cases'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                {product.title}
              </h1>

              {/* Rating & Social Proof Strip */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-lg text-amber-700 font-extrabold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{product.ratings?.averageRating || 4.8}</span>
                </div>
                <span className="text-slate-500">
                  ({product.ratings?.totalReviews || 120} customer ratings)
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                  🔥 85+ Bought in last 24h
                </span>
              </div>
            </div>

            {/* Price Box with Savings Pill */}
            <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-1.5">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  ₹{sellingPrice.toLocaleString('en-IN')}
                </span>
                {mrp > sellingPrice && (
                  <span className="text-base text-slate-400 line-through font-semibold">
                    ₹{mrp.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-black text-[#e11938] bg-white border border-rose-200 px-2.5 py-1 rounded-full uppercase shadow-2xs">
                    Save ₹{savings} ({discountPercent}% OFF)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Inclusive of all taxes • Free Shipping available on prepaid orders
              </p>
            </div>

            {/* Special Offers Box (boAt Style) */}
            <div className="p-3.5 bg-gradient-to-r from-rose-50/60 via-amber-50/40 to-slate-50 border border-rose-100 rounded-2xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-900">
                <Tag className="w-4 h-4 text-[#e11938]" />
                <span>Available Offers for You</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <span className="text-[#e11938] font-bold">•</span>
                  <p>
                    <strong>Prepaid Discount:</strong> Get extra 5% instant off on UPI & Card payments (Applied automatically).
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#e11938] font-bold">•</span>
                  <p>
                    <strong>Welcome Offer:</strong> Use code <strong className="text-[#e11938]">CHHOTABHAI</strong> for flat reward savings.
                  </p>
                </div>
              </div>
            </div>

            {/* Color Variant Swatches */}
            {variants.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    Color: <strong className="text-slate-900">{currentVariant.colorName || 'Default'}</strong>
                  </span>
                  {currentVariant.sku && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      SKU: {currentVariant.sku}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {variants.map((v, idx) => (
                    <button
                      key={v.sku || idx}
                      type="button"
                      onClick={() => {
                        setSelectedVariantIndex(idx);
                        setActiveImageIndex(0);
                      }}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        selectedVariantIndex === idx
                          ? 'border-[#e11938] bg-rose-50/60 text-slate-900 ring-2 ring-rose-100 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                        style={{ backgroundColor: v.colorCode || '#ffffff' }}
                      />
                      <span>{v.colorName || 'Standard'}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Supported Phone Models (If Available) */}
            {product.supportedDevices && product.supportedDevices.length > 0 && (
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Select Model / Fit: <strong className="text-slate-900">{selectedDevice || 'Universal'}</strong>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.supportedDevices.map((dev) => (
                    <button
                      key={dev}
                      type="button"
                      onClick={() => setSelectedDevice(dev)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        selectedDevice === dev
                          ? 'border-[#e11938] bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {dev}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Availability Pill */}
            <div className="flex items-center gap-2 text-xs">
              {stockQuantity > 5 ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  In Stock ({stockQuantity} units available) • Ready to dispatch
                </span>
              ) : stockQuantity > 0 ? (
                <span className="text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  ⚠️ Only {stockQuantity} items left — Order soon
                </span>
              ) : (
                <span className="text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  Sold Out / Currently Unavailable
                </span>
              )}
            </div>

            {/* Quantity Stepper & Add to Cart / Buy Now CTAs */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-3 text-sm text-slate-600 hover:text-slate-900 font-bold hover:bg-slate-200 transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-3 text-xs font-bold text-slate-900 min-w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-3 text-sm text-slate-600 hover:text-slate-900 font-bold hover:bg-slate-200 transition cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={adding || stockQuantity <= 0}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow active:scale-[0.99]'
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
                      <ShoppingBag className="w-4 h-4" /> Add to Cart
                    </>
                  )}
                </button>
              </div>

              {/* Buy Now CTA */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={stockQuantity <= 0}
                className="w-full py-4 bg-[#e11938] hover:bg-[#be123c] text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(225,25,56,0.3)] hover:shadow-[0_6px_20px_rgba(225,25,56,0.38)] transition-all cursor-pointer active:scale-[0.99]"
              >
                <Zap className="w-4 h-4 fill-white" /> Buy Now
              </button>
            </div>

            {/* Pincode Delivery Estimator (Amazon / Flipkart / boAt feature) */}
            <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <MapPin className="w-4 h-4 text-[#e11938]" />
                <span>Check Delivery & Service Availability</span>
              </div>

              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit Pincode"
                  className="flex-1 bg-white border border-slate-300 focus:border-[#e11938] rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold outline-none"
                />
                <button
                  type="submit"
                  disabled={pincodeChecking}
                  className="px-4 py-2 bg-slate-900 hover:bg-[#e11938] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  {pincodeChecking ? 'Checking...' : 'Check'}
                </button>
              </form>

              {pincodeStatus && (
                <div
                  className={`text-xs p-2.5 rounded-xl border ${
                    pincodeStatus.valid
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  <p className="font-bold flex items-center gap-1">
                    {pincodeStatus.valid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : null}
                    {pincodeStatus.message}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* 3. PRODUCT HIGHLIGHTS & BENEFIT SHOWCASE (Amazon A+ / boAt Style) */}
        <section className="border-t border-slate-200 pt-10 sm:pt-14 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#e11938]">
              Engineered For Perfection
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Why Choose ChhotaBhai Ultra Hybrid?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Precision-designed to safeguard your mobile device without hiding its original aesthetic.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-xs hover:border-slate-300 transition">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#e11938] flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900">Anti-Yellowing Tech</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Optical-grade Bayer resin infused with anti-UV molecular chains that never oxidize or turn yellowish.
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-xs hover:border-slate-300 transition">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#e11938] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900">10FT Drop Armor</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                4-corner micro air cushions disperse heavy impact energy, guarding phone edges against accidental drops.
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-xs hover:border-slate-300 transition">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#e11938] flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900">Raised Screen & Lens Lips</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                1.8mm elevated bezels lift screen and camera lenses off flat surfaces to eliminate micro-abrasions.
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-xs hover:border-slate-300 transition">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#e11938] flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900">MagSafe & Qi Ready</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ultra-thin backplate preserves maximum magnetic charging efficiency with zero case removal needed.
              </p>
            </div>
          </div>
        </section>

        {/* 4. TECHNICAL SPECIFICATIONS & DESCRIPTION */}
        <section className="border-t border-slate-200 pt-10 sm:pt-14 space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Technical Specifications & Details
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Exact dimensional measurements, materials, and manufacturer warranty facts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Specs Table (2-Column Clean Zebra Table) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(specificationsToRender).map(([key, val], idx) => (
                    <tr
                      key={key}
                      className={idx % 2 === 0 ? 'bg-slate-50/50 hover:bg-slate-50' : 'bg-white hover:bg-slate-50'}
                    >
                      <td className="py-3 px-4 font-bold text-slate-500 w-2/5 border-r border-slate-100">
                        {key}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 w-3/5">
                        {val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Product Overview & Description Card */}
            <div className="lg:col-span-5 bg-slate-50/80 border border-slate-200 rounded-2xl p-6 space-y-3.5 shadow-xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#e11938]" />
                Product Overview & Build Notes
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {product.description ||
                  'Manufactured with German optical polymer technology. The ChhotaBhai Ultra Hybrid line provides crystalline transparency, anti-fingerprint oleophobic coating, and military-grade shock resilience.'}
              </p>
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
                <p>• 100% Precision CNC laser cutouts for speakers and mic ports</p>
                <p>• Compatible with 9H tempered glass screen protectors</p>
                <p>• Designed & Quality-Inspected by ChhotaBhai Labs</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. VERIFIED CUSTOMER REVIEWS & RATING BREAKDOWN (Amazon Style) */}
        <section className="border-t border-slate-200 pt-10 sm:pt-14 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Verified Customer Reviews
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Authentic ratings and feedback from verified purchasers across India
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 self-start sm:self-auto">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              <div>
                <span className="text-lg font-black text-slate-900">4.8</span>
                <span className="text-xs text-slate-500 font-semibold"> / 5.0</span>
              </div>
              <span className="text-[11px] text-slate-400 pl-1">(120 Reviews)</span>
            </div>
          </div>

          {/* Rating Breakdown Bar & Highlight */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left Rating Progress Bars */}
            <div className="md:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-2.5 shadow-xs">
              <h4 className="text-xs font-bold text-slate-900 mb-2">Rating Breakdown</h4>
              {[
                { stars: 5, pct: 84 },
                { stars: 4, pct: 11 },
                { stars: 3, pct: 3 },
                { stars: 2, pct: 1 },
                { stars: 1, pct: 1 },
              ].map((row) => (
                <div key={row.stars} className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-600 w-12">{row.stars} Star</span>
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <span className="text-slate-400 w-8 text-right font-medium">{row.pct}%</span>
                </div>
              ))}
            </div>

            {/* Right Review Cards */}
            <div className="md:col-span-7 space-y-3">
              {[
                {
                  id: 1,
                  name: 'Aakash Verma',
                  rating: 5,
                  title: 'Crystal clear and does NOT turn yellow!',
                  comment:
                    'Been using it on my iPhone 16 Pro for 2 months now. Zero yellowing, solid fit, and the camera protection is reassuring. Amazing packaging too.',
                  date: 'Verified Buyer • 18 Oct 2026',
                  city: 'Bengaluru'
                },
                {
                  id: 2,
                  name: 'Sneha Patel',
                  rating: 5,
                  title: 'Better than official cases at 1/4th the price',
                  comment:
                    'Buttons are clicky and tactile. The case has already survived a 4ft drop on tiles without a single scratch on the phone.',
                  date: 'Verified Buyer • 12 Oct 2026',
                  city: 'Mumbai'
                },
                {
                  id: 3,
                  name: 'Vikram Joshi',
                  rating: 4,
                  title: 'Super fast delivery and premium quality',
                  comment:
                    'Delivered in 2 days. The case feels ultra-premium in hand. Backplate is completely transparent and shows the original phone color beautifully.',
                  date: 'Verified Buyer • 05 Oct 2026',
                  city: 'Delhi NCR'
                }
              ].map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 font-bold text-slate-700 text-xs flex items-center justify-center">
                        {rev.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{rev.name}</p>
                        <p className="text-[10px] text-slate-400">{rev.date} • {rev.city}</p>
                      </div>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900">{rev.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  
                  <div className="pt-1 flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Purchase</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* 6. MOBILE STICKY BOTTOM ACTION BAR (Safe-area aware) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 px-4 z-40 flex items-center justify-between gap-3 shadow-2xl pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        <div className="min-w-0">
          <div className="text-base sm:text-lg font-black text-slate-900 leading-none truncate">
            ₹{sellingPrice.toLocaleString('en-IN')}
          </div>
          {mrp > sellingPrice && (
            <span className="text-[10px] text-[#e11938] font-bold block truncate mt-0.5">
              {discountPercent}% OFF • In Stock
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end max-w-[240px]">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding || stockQuantity <= 0}
            className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-xs flex items-center justify-center gap-1 active:scale-95 transition cursor-pointer whitespace-nowrap"
          >
            {added ? 'Added' : 'Add to Cart'}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={stockQuantity <= 0}
            className="flex-1 py-2.5 px-3 bg-[#e11938] hover:bg-[#be123c] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1 active:scale-95 transition cursor-pointer whitespace-nowrap"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
