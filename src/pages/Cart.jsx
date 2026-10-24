import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, Tag, ShieldCheck, ShoppingBag, Smartphone, CheckCircle2 } from 'lucide-react';
import { useCartStore, useAuthStore } from '../store/useStore';
import Loader from '../components/Loader';

export const Cart = () => {
  const {
    items,
    pricing,
    appliedCoupon,
    totalItems,
    loading,
    fetchCart,
    updateQuantity,
    removeCartItem,
    applyCoupon,
    removeCoupon,
    couponLoading,
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      await applyCoupon(couponCode.trim());
      setCouponMessage('Coupon applied successfully!');
      setCouponCode('');
    } catch (err) {
      setCouponMessage(err.message || 'Invalid coupon code');
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
      setCouponMessage('');
    } catch (err) {
      setCouponMessage(err.message || 'Failed to remove coupon');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-6 bg-white text-slate-900">
        <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center mx-auto text-brand-red">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Your Cart is Waiting</h2>
        <p className="text-xs text-slate-500">Please log in to view items in your cart and continue checkout.</p>
        <Link
          to="/login"
          className="inline-block px-8 py-3 bg-brand-red hover:bg-brand-red-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm"
        >
          Sign In to Account
        </Link>
      </div>
    );
  }

  if (loading && items.length === 0) {
    return <Loader text="Refreshing your cart..." />;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-6 bg-white text-slate-900">
        <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">Looks like you haven&apos;t added any cases or fast charging gear yet.</p>
        <Link
          to="/shop"
          className="inline-block px-8 py-3 bg-brand-red hover:bg-brand-red-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cb-container py-8 sm:py-10 space-y-8 bg-white text-slate-900">
      <h1 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight">
        Shopping <span className="text-brand-red">Cart</span> ({totalItems} Items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {items.map((item) => (
            <div
              key={item.variantSku}
              className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-xs"
            >
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&auto=format&fit=crop&q=80'}
                  alt={item.product?.title || 'Product'}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl bg-[#eceef2] border border-slate-100 p-1 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                    {item.product?.title || 'Accessory Item'}
                  </h3>
                  {item.selectedDevice && (
                    <span className="text-[11px] text-amber-600 font-bold flex items-center gap-1 mt-0.5 truncate">
                      <Smartphone className="w-3.5 h-3.5 shrink-0" /> For: {item.selectedDevice}
                    </span>
                  )}
                  {item.colorName && (
                    <span className="text-[11px] text-slate-500 block mt-0.5">Color: {item.colorName}</span>
                  )}
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-sm sm:text-base font-black text-slate-900">₹{item.unitPrice.toLocaleString('en-IN')}</span>
                    {item.unitOriginalPrice > item.unitPrice && (
                      <span className="text-[11px] text-slate-400 line-through">₹{item.unitOriginalPrice.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity controls and delete */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl">
                  <button
                    onClick={() => updateQuantity(item.variantSku, Math.max(1, item.quantity - 1))}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-2.5 py-1.5 text-xs font-bold text-slate-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.variantSku, item.quantity + 1)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeCartItem(item.variantSku)}
                  className="p-2 text-slate-400 hover:text-brand-red transition-colors cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Coupon */}
        <div className="space-y-6 lg:sticky lg:top-24">
          {/* Coupon Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
            <label className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-brand-red" /> Apply Coupon
            </label>
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {appliedCoupon.code} Applied (-₹{appliedCoupon.discountAmount})
                </span>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs text-brand-red font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME100"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="bg-white border border-slate-300 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-brand-red flex-1 text-slate-900 uppercase font-bold"
                />
                <button
                  type="submit"
                  disabled={couponLoading}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-brand-red text-white text-xs font-bold rounded-xl uppercase transition-colors"
                >
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </form>
            )}
            {couponMessage && <p className="text-xs text-brand-red font-medium">{couponMessage}</p>}
          </div>

          {/* Price Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              Price Details
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Total MRP</span>
                <span className="text-slate-900 font-bold">₹{pricing?.totalMrp || 0}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Retail Discount</span>
                <span>- ₹{pricing?.savings || 0}</span>
              </div>
              {pricing?.couponDiscount > 0 && (
                <div className="flex justify-between text-brand-red font-semibold">
                  <span>Coupon Discount</span>
                  <span>- ₹{pricing.couponDiscount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Charges</span>
                <span className="text-slate-900 font-bold">
                  {pricing?.shippingFee === 0 ? <span className="text-emerald-600 font-bold uppercase">Free</span> : `₹${pricing?.shippingFee || 0}`}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 flex justify-between items-baseline">
              <span className="text-sm font-black uppercase text-slate-900">Total Amount</span>
              <span className="text-2xl font-black text-slate-900">₹{pricing?.grandTotal || 0}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-brand-red hover:bg-brand-red-hover text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
            >
              Confirm & Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-brand-red" />
              <span>Safe & Secure 256-bit Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
