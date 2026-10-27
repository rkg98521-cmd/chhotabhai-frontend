import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Trash2, ArrowLeft } from 'lucide-react';
import { useWishlistStore, useCartStore } from '../store/useStore';
import ProductCard from '../components/common/ProductCard';
import Meta from '../components/common/Meta';

export const Wishlist = () => {
  const { items, removeFromWishlist, clearWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();

  const handleMoveToCart = async (product) => {
    try {
      const variantSku = product.variants?.[0]?.sku || 'DEFAULT';
      await addToCart(variantSku, 1, product._id || product.id);
      removeFromWishlist(product._id || product.id);
    } catch (err) {
      console.error('Failed to move to cart:', err);
    }
  };

  return (
    <div className="min-h-[80vh] bg-slate-50/60 pb-28 sm:pb-16 pt-4 sm:pt-8">
      <Meta
        title="My Wishlist | ChhotaBhai"
        description="View and manage your saved premium audio & smartphone accessories."
      />

      <div className="cb-container max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Link to="/" className="hover:text-slate-900 transition flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Home
              </Link>
              <span>/</span>
              <span className="text-slate-900 font-bold">Wishlist</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Heart className="w-7 h-7 text-[#e11938] fill-[#e11938]" />
              <span>My Wishlist</span>
              {items.length > 0 && (
                <span className="text-xs sm:text-sm font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              )}
            </h1>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="self-start sm:self-auto text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Wishlist</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        {items.length > 0 ? (
          <div className="pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {items.map((product) => (
                <div key={product._id || product.id} className="relative group">
                  <ProductCard product={product} />
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(product._id || product.id)}
                    className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-white/95 hover:bg-rose-50 text-slate-400 hover:text-rose-600 shadow-md flex items-center justify-center transition cursor-pointer"
                    title="Remove from wishlist"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="py-16 sm:py-24 text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-100 text-[#e11938] flex items-center justify-center mx-auto mb-5 shadow-xs">
              <Heart className="w-10 h-10 stroke-[1.75]" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
              Explore our best-selling wireless earbuds, smartwatches, fast wall chargers, and protective cases to save your favorites!
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#e11938] hover:bg-[#c4142f] text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-md hover:shadow-lg cursor-pointer"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
