import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Check, Loader2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/useStore';

// Curated high-res product image fallbacks for mobile accessories & electronics
const CURATED_IMAGE_REPLACEMENTS = {
  'chhotabhai 9h diamond privacy tempered glass':
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format&fit=crop&q=80',
  'chhotabhai 65w gan iii ultra fast wall charger':
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
  'chhotabhai n52 magsafe 15w wireless car mount':
    'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
  'chhotabhai 100w kevlar braided type-c to type-c cable':
    'https://images.unsplash.com/photo-1541877944-ac82a091518a?w=800&auto=format&fit=crop&q=80',
  'chhotabhai airdopes 161':
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
  'chhotabhai storm call 3':
    'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
  'chhotabhai nirvana ion':
    'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80',
  'chhotabhai rockerz 412':
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
  'chhotabhai aavante bar 480':
    'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
  'chhotabhai falcon 4k gps drone':
    'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80',
  'chhotabhai energyshroom pb300 pro':
    'https://images.unsplash.com/photo-1609592426508-cc24f60500bf?w=800&auto=format&fit=crop&q=80',
  'chhotabhai 3-in-1 foldable magsafe wireless charging station':
    'https://images.unsplash.com/photo-1622445262464-84b14e4b7571?w=800&auto=format&fit=crop&q=80',
  'chhotabhai ultra hybrid anti-yellowing clear case':
    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&auto=format&fit=crop&q=80',
  'chhotabhai 120w liquid silicone type-c fast cable':
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
  'chhotabhai 20000mah 65w pd turbo laptop power bank':
    'https://images.unsplash.com/photo-1609592426508-cc24f60500bf?w=800&auto=format&fit=crop&q=80',
  'chhotabhai gravity auto-lock metal car air vent mount':
    'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
  'chhotabhai sapphire individual camera lens protector':
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
  'chhotabhai sonic pods pro wireless earbuds':
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
};

export const ProductCard = ({ product }) => {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(
    product.defaultVariantIndex || 0
  );
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const { addToCart } = useCartStore();

  const variants = product.variants && product.variants.length > 0 ? product.variants : [];
  const currentVariant = variants[selectedVariantIndex] || variants[0] || {};

  const sellingPrice = currentVariant.sellingPrice || product.discountedPrice || 0;
  const mrp = currentVariant.mrp || product.originalPrice || 0;
  const discountPercent =
    mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  // Resolve best product image, bypassing bad/broken stock photos
  const rawImage =
    currentVariant.images?.[0] ||
    product.thumbnail ||
    product.images?.[0] ||
    '';

  const titleKey = (product.title || product.name || '').toLowerCase().trim();
  const curatedImage =
    CURATED_IMAGE_REPLACEMENTS[titleKey] ||
    (rawImage && (rawImage.includes('photo-1544717305') || rawImage.includes('photo-1622445262464') || rawImage.includes('photo-1540555700') || rawImage.includes('photo-1586105251261'))
      ? CURATED_IMAGE_REPLACEMENTS[titleKey] || 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80'
      : rawImage) ||
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80';

  const [imgSrc, setImgSrc] = useState(curatedImage);

  // Extract key feature highlight (e.g. "100 Hours Playback | ★ 4.8", "65W Fast Charge")
  const featureTag =
    product.dealTag ||
    product.specifications?.Playback ||
    product.specifications?.Feature ||
    product.specifications?.Capacity ||
    product.specifications?.Hardness ||
    product.specifications?.['Power Rating'] ||
    product.specifications?.['Maximum Output'] ||
    product.specifications?.Latency ||
    product.tagline ||
    'Signature Gear';

  // Badge handling (e.g. "🔥 Free Spotify", "⚡ EXTRA ₹100 OFF", "🔥 Engraving Available")
  const badgeText = product.badge && product.badge !== 'None' ? product.badge : null;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setAdding(true);
      await addToCart(currentVariant.sku || 'DEFAULT', 1, product._id);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const ratingValue =
    typeof product.ratings === 'number'
      ? product.ratings
      : product.ratings?.averageRating || 4.8;

  // Swatches preview data matching boAt
  const displaySwatches =
    variants.length > 0
      ? variants.slice(0, 2)
      : [
          { colorName: 'Matte Black', colorCode: '#1e293b' },
          { colorName: 'Silver Titanium', colorCode: '#cbd5e1' },
        ];

  const extraCount = variants.length > 2 ? variants.length - 2 : variants.length <= 1 ? 1 : 0;

  return (
    <div className="group relative bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between h-full select-none">
      {/* 1. TOP IMAGE STAGE CONTAINER (Aspect-Square, boAt studio presentation) */}
      <div className="relative bg-[#eceef2] overflow-hidden">
        {/* Top Badges (Left) */}
        {badgeText && (
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <span
              className={`text-[9.5px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 shadow-2xs ${
                badgeText.includes('EXTRA')
                  ? 'bg-[#008a00] text-white font-black'
                  : 'bg-black text-white'
              }`}
            >
              {badgeText.includes('Engraving') ? '🔥 ' : badgeText.includes('Trending') ? '⚡ ' : ''}
              {badgeText}
            </span>
          </div>
        )}

        {/* Quick Add floating button (Hover action on desktop, clean & unobtrusive) */}
        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={adding}
          title="Quick Add To Cart"
          className={`absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 hover:bg-white text-slate-900 flex items-center justify-center transition-all shadow-sm z-10 cursor-pointer ${
            added
              ? 'bg-emerald-600 text-white opacity-100 scale-100'
              : 'opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95'
          }`}
        >
          {added ? (
            <Check className="w-3.5 h-3.5 text-white" />
          ) : adding ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-900" />
          ) : (
            <ShoppingBag className="w-3.5 h-3.5 text-slate-800" />
          )}
        </button>

        {/* Product Image Stage */}
        <Link
          to={`/product/${product.slug || product._id}`}
          className="block relative aspect-square w-full overflow-hidden flex items-center justify-center p-3.5 sm:p-4"
        >
          <img
            src={imgSrc}
            alt={product.title || product.name}
            onError={() =>
              setImgSrc(
                'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80'
              )
            }
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
            loading="lazy"
            decoding="async"
          />
        </Link>

        {/* boAt Signature Yellow Strip at bottom of image */}
        <div className="bg-[#ffc200] py-1 px-2.5 sm:px-3 flex items-center justify-between min-h-[28px] sm:min-h-[30px]">
          <span className="text-[11px] sm:text-[11.5px] font-black text-slate-900 truncate max-w-[68%] tracking-tight">
            {featureTag}
          </span>

          {ratingValue > 0 && (
            <span className="bg-white px-1.5 py-0.5 rounded flex items-center gap-0.5 text-[10px] sm:text-[10.5px] font-black text-slate-900 shrink-0 shadow-2xs">
              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
              {Number(ratingValue).toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* 2. CARD CONTENT CONTAINER (Exact boAt typographic layout) */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Product Title (1-line clean clamp matching boAt) */}
          <Link to={`/product/${product.slug || product._id}`}>
            <h3 className="font-extrabold text-slate-900 text-[12.5px] sm:text-[13.5px] line-clamp-1 group-hover:text-rose-600 transition-colors tracking-tight leading-snug">
              {product.title || product.name}
            </h3>
          </Link>

          {/* Pricing Row: Price on Left, Color Swatches on Right (Exact boAt layout) */}
          <div className="flex items-center justify-between mt-1 sm:mt-1.5">
            <span className="text-base sm:text-[17px] font-black text-slate-900 tracking-tight">
              ₹{sellingPrice.toLocaleString('en-IN')}
            </span>

            {/* Color Swatches */}
            <div className="flex items-center gap-1 shrink-0">
              {displaySwatches.map((v, idx) => (
                <button
                  key={v.sku || idx}
                  type="button"
                  title={v.colorName}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedVariantIndex(idx);
                  }}
                  className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${
                    selectedVariantIndex === idx
                      ? 'border-slate-900 ring-1 ring-slate-400 scale-110'
                      : 'border-slate-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: v.colorCode || '#1e293b' }}
                />
              ))}
              {extraCount > 0 && (
                <span className="text-[10px] sm:text-[10.5px] font-bold text-slate-600 ml-0.5">
                  +{extraCount}
                </span>
              )}
            </div>
          </div>

          {/* Strikethrough MRP and Discount % Row */}
          {mrp > sellingPrice && (
            <div className="flex items-center gap-1.5 text-xs sm:text-[12px] mt-0.5">
              <span className="text-slate-400 line-through font-medium">
                ₹{mrp.toLocaleString('en-IN')}
              </span>
              <span className="text-[#059669] font-extrabold">
                {discountPercent}% off
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

