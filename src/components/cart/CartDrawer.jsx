import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Trash2,
  Tag,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';
import { useCartStore } from '../../store/useStore';

export const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    items,
    pricing,
    appliedCoupon,
    totalItems,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeCartItem,
    applyCoupon,
    removeCoupon,
    couponLoading,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isDrawerOpen) return null;

  const freeShippingThreshold = 499;
  const currentSubtotal = pricing?.subtotal || 0;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - currentSubtotal);
  const freeShippingProgress = Math.min(
    100,
    Math.round((currentSubtotal / freeShippingThreshold) * 100)
  );

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError('');
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput('');
    } catch (err) {
      setCouponError(err.message || 'Invalid or expired coupon');
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponError('');
    try {
      await removeCoupon();
    } catch (err) {
      setCouponError(err.message || 'Failed to remove coupon');
    }
  };

  const handleProceedToCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 text-slate-900 shadow-2xl flex flex-col justify-between animate-slide-in-right">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-red" />
              <h2 className="text-base font-black uppercase tracking-wider text-slate-900">
                Your Cart ({totalItems})
              </h2>
            </div>
            <button
              onClick={closeDrawer}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Milestone Indicator */}
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Truck className="w-3.5 h-3.5 text-brand-red" />
                {amountNeededForFreeShipping === 0 ? (
                  <span className="text-emerald-600 font-bold">Congratulations! You unlocked Free Delivery</span>
                ) : (
                  <span>
                    Add <strong className="text-brand-red">₹{amountNeededForFreeShipping}</strong> more for{' '}
                    <strong className="text-slate-900">FREE Express Shipping</strong>
                  </span>
                )}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-red h-full transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Your Cart is Empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Explore our shockproof MagSafe cases, 9H tempered glass, and 65W GaN fast chargers.
                </p>

                <button
                  onClick={() => {
                    closeDrawer();
                    navigate('/shop');
                  }}
                  className="px-6 py-2.5 bg-brand-red hover:bg-brand-red-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.variantSku}
                  className="bg-white border border-slate-200 rounded-2xl p-3.5 flex gap-3.5 items-center relative group shadow-sm hover:border-slate-300 transition-colors"
                >
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&auto=format&fit=crop&q=80'}
                    alt={item.product?.title || 'Product'}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-50 border border-slate-100 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {item.product?.title || 'Accessory Item'}
                    </h4>
                    {item.selectedDevice && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 mt-0.5">
                        <Smartphone className="w-3 h-3 shrink-0 text-amber-500" />
                        <span className="truncate">For: {item.selectedDevice}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.colorName && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <span
                            className="w-2 h-2 rounded-full border border-slate-300 inline-block"
                            style={{ backgroundColor: item.colorCode || '#000' }}
                          />
                          {item.colorName}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.variantSku}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-sm font-black text-slate-900">₹{item.unitPrice}</span>
                      {item.unitOriginalPrice > item.unitPrice && (
                        <span className="text-[11px] text-slate-400 line-through">
                          ₹{item.unitOriginalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeCartItem(item.variantSku)}
                      className="text-slate-400 hover:text-brand-red transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.variantSku, Math.max(0, item.quantity - 1))}
                        className="px-2 py-0.5 text-xs text-slate-600 hover:text-slate-900 font-bold"
                      >
                        -
                      </button>
                      <span className="px-2 py-0.5 text-xs font-bold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantSku, item.quantity + 1)}
                        className="px-2 py-0.5 text-xs text-slate-600 hover:text-slate-900 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Pricing Summary & Checkout Block */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-4">
              {/* Coupon Bar */}
              <div className="space-y-1.5">
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
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Promo Code (e.g. WELCOME100)"
                        className="w-full bg-white border border-slate-300 rounded-xl py-2 pl-8 pr-3 text-xs text-slate-900 uppercase font-bold outline-none focus:border-brand-red"
                      />
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                    <button
                      type="submit"
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-4 py-2 bg-slate-900 hover:bg-brand-red text-white text-xs font-bold rounded-xl uppercase transition-colors disabled:opacity-50"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-brand-red font-medium">{couponError}</p>}
              </div>

              {/* Price Details Breakdown */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Total MRP</span>
                  <span className="text-slate-900 font-bold">₹{pricing?.totalMrp || 0}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Retail Savings</span>
                  <span>- ₹{pricing?.savings || 0}</span>
                </div>
                {pricing?.couponDiscount > 0 && (
                  <div className="flex justify-between text-brand-red font-bold">
                    <span>Coupon Discount</span>
                    <span>- ₹{pricing.couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="text-slate-900 font-bold">
                    {pricing?.shippingFee === 0 ? (
                      <span className="text-emerald-600 font-bold uppercase">FREE</span>
                    ) : (
                      `₹${pricing?.shippingFee || 0}`
                    )}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline text-slate-900">
                  <span className="text-sm font-black uppercase">Grand Total</span>
                  <span className="text-xl font-black">₹{pricing?.grandTotal || 0}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 bg-brand-red hover:bg-brand-red-hover text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-red" />
                <span>100% Genuine Mobile Gear with 1-Year Warranty</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
