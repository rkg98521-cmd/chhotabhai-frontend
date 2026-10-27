import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  ShoppingBag,
  Zap,
  Check,
  Heart,
  Share2,
  ChevronRight,
  Shield,
  Sparkles,
  Smartphone,
  Radio,
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useCartStore, useAuthStore, useWishlistStore } from '../store/useStore';
import Meta from '../components/common/Meta';
import Loader from '../components/Loader';
import ProductCard from '../components/common/ProductCard';

export const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
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

        // Fetch similar / related products - ensure full 4-card row
        try {
          let items = [];
          if (p.category?.slug) {
            try {
              const relRes = await axiosInstance.get('/products', {
                params: { limit: 12, category: p.category.slug },
              });
              items = (relRes.data?.data?.products || relRes.data?.products || []).filter(
                (item) => (item.slug || item._id) !== slug && (item._id || item.id) !== (p._id || p.id)
              );
            } catch (err) {
              console.error(err);
            }
          }

          // Backfill with other popular accessories so the entire 4-column row is full
          if (items.length < 4) {
            try {
              const allRes = await axiosInstance.get('/products', {
                params: { limit: 16 },
              });
              const more = (allRes.data?.data?.products || allRes.data?.products || []).filter(
                (item) =>
                  (item.slug || item._id) !== slug &&
                  (item._id || item.id) !== (p._id || p.id) &&
                  !items.some((x) => (x._id || x.id) === (item._id || item.id))
              );
              items = [...items, ...more];
            } catch (err) {
              console.error(err);
            }
          }

          setRelatedProducts(items.slice(0, 4));
        } catch (relErr) {
          console.error('Related products fetch error:', relErr);
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

  if (loading) return <Loader text="Loading Product..." />;
  if (!product) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 bg-white text-slate-900">
        <h2 className="text-xl font-black text-slate-900 uppercase">Product Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested product is currently unavailable or has been moved.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="px-5 py-2.5 bg-[#e11938] hover:bg-[#be123c] text-white text-xs font-bold uppercase rounded-xl transition cursor-pointer"
        >
          Back to Shop
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
      setTimeout(() => setAdded(false), 2000);
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
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const defaultSpecifications = {
    'Brand': product.brand || 'ChhotaBhai Essentials',
    'Category': product.category?.name || 'Back Cases',
    'Compatible Models': product.supportedDevices?.join(', ') || 'Precision Fit',
    'Material': 'Optical Polycarbonate + Shockproof TPU Bumper',
    'Warranty': '1 Year Replacement Warranty',
    'In The Box': '1x Case, 1x Warranty Card'
  };

  const specificationsToRender =
    product.specifications && Object.keys(product.specifications).length > 0
      ? product.specifications
      : defaultSpecifications;

  return (
    <div className="bg-white text-slate-900 pb-16 lg:pb-12 selection:bg-[#e11938] selection:text-white">
      {product && (
        <Meta
          title={`${product.title} - ChhotaBhai`}
          description={product.description ? product.description.substring(0, 150) : 'ChhotaBhai mobile accessories'}
          keywords={`${product.category?.name || 'accessories'}, mobile covers, ${product.brand || 'ChhotaBhai'}`}
          ogImage={activeImage}
        />
      )}

      {/* 1. BREADCRUMBS */}
      <div className="border-b border-slate-100 bg-slate-50/50">
        <div className="cb-container py-2">
          <nav className="flex items-center gap-1.5 text-[11px] text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none">
            <Link to="/" className="hover:text-slate-900 transition">Home</Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <Link to="/shop" className="hover:text-slate-900 transition">Shop</Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <Link to={`/shop?category=${product.category?.slug || 'all'}`} className="hover:text-slate-900 transition">
              {product.category?.name || 'Accessories'}
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-slate-800 font-semibold truncate max-w-xs">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="cb-container pt-4 pb-2 space-y-8">
        {/* 2. MAIN BUYING STAGE: IMAGE & BUY BOX */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT: Product Gallery */}
          <div className="lg:col-span-6 space-y-2.5">
            <div className="h-[360px] sm:h-[440px] w-full bg-[#f8f9fb] rounded-2xl border border-slate-200 overflow-hidden relative flex items-center justify-center p-4 sm:p-6">
              <img
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-contain mix-blend-multiply select-none"
              />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none">
                {product.badge && product.badge !== 'None' && (
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-xs">
                    {product.badge}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="bg-[#e11938] text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-xs">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Wishlist & Share */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center transition cursor-pointer ${
                    inWishlist ? 'text-[#e11938]' : 'text-slate-500 hover:text-[#e11938]'
                  }`}
                  title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-[#e11938]' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-500 hover:text-slate-900 transition cursor-pointer"
                  title="Share"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {copied && (
                <div className="absolute bottom-3 inset-x-4 bg-slate-900 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow text-center animate-in fade-in z-20">
                  Link copied to clipboard!
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 bg-slate-50 transition cursor-pointer p-1 ${
                      activeImageIndex === idx
                        ? 'border-[#e11938] ring-1 ring-rose-200'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Buy Box */}
          <div className="lg:col-span-6 space-y-3.5">
            
            {/* Title & Brand */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#e11938]">
                {product.brand || 'ChhotaBhai Essentials'}
              </span>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mt-0.5">
                {product.title}
              </h1>

              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-amber-800 font-bold text-[11px]">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  {product.ratings?.averageRating || 4.8}
                </span>
                <span className="text-slate-400 text-xs">
                  ({product.ratings?.totalReviews || 120} ratings)
                </span>
              </div>
            </div>

            {/* Price Row */}
            <div className="py-2 border-y border-slate-100 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                ₹{sellingPrice.toLocaleString('en-IN')}
              </span>
              {mrp > sellingPrice && (
                <span className="text-sm text-slate-400 line-through font-semibold">
                  ₹{mrp.toLocaleString('en-IN')}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-xs font-bold text-[#e11938] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                  Save ₹{savings} ({discountPercent}% OFF)
                </span>
              )}
            </div>

            {/* Color Variants (if any) */}
            {variants.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-700">
                  Color: <span className="text-slate-900">{currentVariant.colorName || 'Default'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v, idx) => (
                    <button
                      key={v.sku || idx}
                      type="button"
                      onClick={() => {
                        setSelectedVariantIndex(idx);
                        setActiveImageIndex(0);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                        selectedVariantIndex === idx
                          ? 'border-[#e11938] bg-rose-50/50 text-slate-900 ring-1 ring-rose-200'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-slate-300 shadow-2xs shrink-0"
                        style={{ backgroundColor: v.colorCode || '#ffffff' }}
                      />
                      <span>{v.colorName || 'Standard'}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Supported Models (if any) */}
            {product.supportedDevices && product.supportedDevices.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-700">
                  Device: <span className="text-slate-900">{selectedDevice || 'Universal'}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {product.supportedDevices.map((dev) => (
                    <button
                      key={dev}
                      type="button"
                      onClick={() => setSelectedDevice(dev)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                        selectedDevice === dev
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {dev}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock & Quantity Row */}
            <div className="flex items-center justify-between pt-1">
              <div className="text-xs">
                {stockQuantity > 5 ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    In Stock ({stockQuantity} available)
                  </span>
                ) : stockQuantity > 0 ? (
                  <span className="text-amber-700 font-bold">Only {stockQuantity} left</span>
                ) : (
                  <span className="text-rose-700 font-bold">Sold Out</span>
                )}
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Qty:</span>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 text-xs font-bold transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-7 h-7 flex items-center justify-center text-xs font-bold text-slate-900 bg-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 text-xs font-bold transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* CTAS: EXACT SAME SIZE & PROPORTIONS */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding || stockQuantity <= 0}
                className={`h-12 w-full rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border transition cursor-pointer active:scale-[0.99] ${
                  added
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-900 hover:bg-black text-white border-slate-900 shadow-xs'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added
                  </>
                ) : adding ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </button>

              {/* Buy Now (Exact Identical Dimensions & Height) */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={stockQuantity <= 0}
                className="h-12 w-full rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-[#e11938] hover:bg-[#be123c] text-white border border-[#e11938] shadow-md transition cursor-pointer active:scale-[0.99]"
              >
                <Zap className="w-4 h-4 fill-white" /> Buy Now
              </button>
            </div>

            {/* Guarantee Line (Compact, 1-line clean strip) */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] text-slate-600">
              <div className="py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#e11938] shrink-0" />
                <span className="font-semibold">1 Year Warranty</span>
              </div>
              <div className="py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#e11938] shrink-0" />
                <span className="font-semibold">Free Delivery</span>
              </div>
              <div className="py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-[#e11938] shrink-0" />
                <span className="font-semibold">7 Days Replacement</span>
              </div>
            </div>

          </div>
        </div>

        {/* 3. PRODUCT DETAILS & SPECIFICATIONS (Fully balanced with Key Features & Specs) */}
        <div className="border-t border-slate-200 pt-6 space-y-4">
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Product Details & Specifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            {/* Left: About & Key Feature Highlights */}
            <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3.5">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#e11938]">
                  About This Product
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {product.description ||
                    '100% optical clarity with anti-UV molecular coating that never turns yellow. Features 360-degree shockproof TPU bumpers, 1.8mm raised camera lips, and wireless charging compatibility.'}
                </p>
              </div>

              {/* 4 Feature Highlights - Fills the empty space cleanly */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/80">
                <div className="p-2 rounded-lg bg-white border border-slate-200/60 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#e11938] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-900 leading-tight">10ft Drop Guard</p>
                    <p className="text-[9px] text-slate-500">Shockproof Bumpers</p>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white border border-slate-200/60 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-900 leading-tight">Anti-Yellowing</p>
                    <p className="text-[9px] text-slate-500">UV Molecular Shield</p>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white border border-slate-200/60 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-900 leading-tight">Tactile Fit</p>
                    <p className="text-[9px] text-slate-500">1.8mm Raised Lips</p>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white border border-slate-200/60 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-900 leading-tight">Qi / MagSafe</p>
                    <p className="text-[9px] text-slate-500">Wireless Ready</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Specifications Table */}
            <div className="md:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden text-xs flex flex-col justify-center">
              <table className="w-full">
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(specificationsToRender).map(([key, val], idx) => (
                    <tr key={key} className={idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}>
                      <td className="py-2.5 px-3.5 font-bold text-slate-500 w-2/5 border-r border-slate-100">
                        {key}
                      </td>
                      <td className="py-2.5 px-3.5 font-semibold text-slate-900 w-3/5">
                        {val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 4. SIMILAR PRODUCTS (Fills the dead empty bottom space) */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  You May Also Like
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Popular recommendations matched for your device
                </p>
              </div>
              <Link
                to="/shop"
                className="text-xs font-bold text-[#e11938] hover:text-[#be123c] flex items-center gap-1 transition"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct._id || relProduct.id} product={relProduct} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 5. MOBILE STICKY BOTTOM BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 px-4 z-40 flex items-center justify-between gap-3 shadow-2xl pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))]">
        <div className="min-w-0">
          <div className="text-base font-black text-slate-900 leading-none truncate">
            ₹{sellingPrice.toLocaleString('en-IN')}
          </div>
          {discountPercent > 0 && (
            <span className="text-[10px] text-[#e11938] font-bold block truncate mt-0.5">
              {discountPercent}% OFF
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 flex-1 max-w-[240px]">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding || stockQuantity <= 0}
            className="h-10 w-full bg-slate-900 hover:bg-black text-white text-[11px] font-bold uppercase rounded-xl flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            {added ? 'Added' : 'Add to Cart'}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={stockQuantity <= 0}
            className="h-10 w-full bg-[#e11938] hover:bg-[#be123c] text-white text-[11px] font-bold uppercase rounded-xl flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
