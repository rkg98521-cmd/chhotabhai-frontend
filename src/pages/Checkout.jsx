import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  CreditCard,
  Plus,
  Check,
  ShoppingBag,
  Truck,
  AlertCircle,
  Zap,
  Lock,
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useCartStore, useAuthStore } from '../store/useStore';
import Loader from '../components/Loader';

export const Checkout = () => {
  const navigate = useNavigate();
  const { items, pricing, appliedCoupon, fetchCart, clearCart, loading: cartLoading } =
    useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Protect checkout route
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }
    fetchCart();
  }, [isAuthenticated, navigate, fetchCart]);

  // Load user addresses
  useEffect(() => {
    const fetchUserAddresses = async () => {
      try {
        const res = await axiosInstance.get('/auth/me');
        const addresses = res.data.data?.addresses || [];
        setSavedAddresses(addresses);
        if (addresses.length > 0) {
          const defaultIdx = addresses.findIndex((a) => a.isDefault);
          setSelectedAddressIndex(defaultIdx !== -1 ? defaultIdx : 0);
        } else {
          setIsAddingNewAddress(true);
        }
      } catch (err) {
        console.error('Error fetching addresses:', err);
      }
    };

    if (isAuthenticated) {
      fetchUserAddresses();
    }
  }, [isAuthenticated]);

  const handleAddNewAddressSubmit = async (e) => {
    e.preventDefault();
    if (
      !newAddress.fullName ||
      !newAddress.phone ||
      !newAddress.street ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.pincode
    ) {
      setError('Please fill all required address fields.');
      return;
    }

    try {
      const res = await axiosInstance.put('/auth/profile', {
        addressAction: 'add',
        addressData: newAddress,
      });
      const updatedAddresses = res.data.data?.addresses || [];
      setSavedAddresses(updatedAddresses);
      setSelectedAddressIndex(updatedAddresses.length - 1);
      setIsAddingNewAddress(false);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to save address');
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    let finalShippingAddress;

    if (isAddingNewAddress || savedAddresses.length === 0) {
      if (
        !newAddress.fullName ||
        !newAddress.phone ||
        !newAddress.street ||
        !newAddress.city ||
        !newAddress.state ||
        !newAddress.pincode
      ) {
        setError('Please complete the shipping address form.');
        return;
      }
      finalShippingAddress = newAddress;
    } else {
      finalShippingAddress = savedAddresses[selectedAddressIndex];
    }

    if (!finalShippingAddress) {
      setError('Please select or add a shipping address.');
      return;
    }

    setSubmitting(true);
    try {
      // Execute Frictionless Prepaid Sandbox Checkout
      const payload = {
        shippingAddress: finalShippingAddress,
        items: items.map((i) => ({
          product: i.product?._id || i.product,
          title: i.product?.title || i.title,
          variantSku: i.variantSku || i.sku,
          quantity: i.quantity,
        })),
        couponCode: appliedCoupon?.code || '',
        paymentMethod: 'PREPAID_ONLINE',
      };

      const res = await axiosInstance.post('/orders/checkout', payload);
      const order = res.data.data;

      // Clear cart and smoothly navigate to order success screen
      clearCart();
      navigate(`/order-success/${order._id || order.orderNumber}`, {
        state: { order },
      });
    } catch (err) {
      console.error('Prepaid Checkout error:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to complete prepaid order. Please verify your address and items.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading && items.length === 0) {
    return <Loader text="Preparing Secure Prepaid Checkout..." />;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4 bg-white text-slate-900">
        <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black uppercase text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">
          Please add mobile cases, tempered glass, or charging accessories to your cart before proceeding.
        </p>
        <Link
          to="/shop"
          className="inline-block px-6 py-3 bg-brand-red text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-sm"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="cb-container py-8 sm:py-10 space-y-8 bg-white text-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight">
          Express <span className="text-brand-red">Prepaid Checkout</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          100% Prepaid Order Authorization with Razorpay, UPI & Server-Side Verification
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-brand-red text-xs p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Delivery, Payment & Review */}
        <div className="lg:col-span-8 space-y-8">
          {/* STEP 1: DELIVERY ADDRESS */}
          <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-brand-red text-white text-xs font-black flex items-center justify-center">
                  1
                </div>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  Delivery Address
                </h2>
              </div>

              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                  className="text-xs font-bold text-brand-red hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isAddingNewAddress ? 'Use Saved Address' : 'Add New Address'}
                </button>
              )}
            </div>

            {/* Saved Address Cards */}
            {!isAddingNewAddress && savedAddresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedAddresses.map((addr, idx) => (
                  <div
                    key={addr._id || idx}
                    onClick={() => setSelectedAddressIndex(idx)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                      selectedAddressIndex === idx
                        ? 'border-brand-red bg-rose-50/50 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {selectedAddressIndex === idx && (
                      <span className="absolute top-3 right-3 text-brand-red">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{addr.fullName}</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{addr.phone}</span>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {addr.street}, {addr.landmark ? `${addr.landmark}, ` : ''}
                        {addr.city}, {addr.state} - <strong className="text-slate-900">{addr.pincode}</strong>
                      </p>
                    </div>
                    {addr.isDefault && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded w-max mt-3">
                        Default Address
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add New Address Form */}
            {(isAddingNewAddress || savedAddresses.length === 0) && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      placeholder="e.g. Rohit Sharma"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-brand-red focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      placeholder="e.g. +91 9876543210"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-brand-red focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">Flat / House / Street Address *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    placeholder="House No., Street Name, Apartment"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-brand-red focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-brand-red focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-brand-red focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">6-Digit PIN Code *</label>
                    <input
                      type="text"
                      required
                      pattern="[1-9][0-9]{5}"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      placeholder="e.g. 560001"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-brand-red focus:bg-white font-mono"
                    />
                  </div>
                </div>

                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAddNewAddressSubmit}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                  >
                    Save Address to Profile
                  </button>
                )}
              </div>
            )}
          </section>

          {/* STEP 2: PAYMENT METHOD (100% PREPAID ONLY) */}
          <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-brand-red text-white text-xs font-black flex items-center justify-center">
                  2
                </div>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  Payment Mode
                </h2>
              </div>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded border border-emerald-200">
                100% Prepaid Exclusive
              </span>
            </div>

            {/* Single Unified Prepaid Gateway Card */}
            <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-red text-white flex items-center justify-center shadow-sm">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                      Razorpay Instant UPI & Cards <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Google Pay, PhonePe, Paytm, BHIM UPI, RuPay, Visa, Mastercard & NetBanking
                    </p>
                  </div>
                </div>
                <span className="text-brand-red">
                  <Check className="w-5 h-5" />
                </span>
              </div>

              {/* Trust Badges Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-rose-100 text-[10px] text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-brand-red" />
                  <span>Priority 24h Express Dispatch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Zero Gateway Surcharge</span>
                </div>
              </div>
            </div>

            {/* Business Policy Note */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
              <strong className="text-slate-900">Note on Delivery Policy:</strong> To ensure zero return-to-origin delays and guarantee genuine stock reservation, ChhotaBhai operates strictly as a <strong>100% prepaid platform</strong>. Cash on Delivery (COD) is permanently disabled.
            </div>
          </section>

          {/* STEP 3: ORDER ITEMS REVIEW */}
          <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="w-7 h-7 rounded-full bg-brand-red text-white text-xs font-black flex items-center justify-center">
                3
              </div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Review Items ({items.length})
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.variantSku} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={
                        item.image ||
                        'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=200&auto=format&fit=crop&q=80'
                      }
                      alt={item.product?.title || 'Accessory'}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-50 border border-slate-100 flex-shrink-0"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.product?.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        {item.colorName && <span>Color: {item.colorName}</span>}
                        <span>•</span>
                        <span>SKU: {item.variantSku}</span>
                        <span>•</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900">₹{item.totalItemPrice}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Sticky Verified Pricing Summary */}
        <div className="lg:col-span-4">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-5 sticky top-28 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-emerald-600 font-bold">100% Prepaid Safe</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Total Items MRP</span>
                <span className="text-slate-900 font-bold">₹{pricing.totalMrp || 0}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Retail Discount</span>
                <span>- ₹{pricing.savings || 0}</span>
              </div>
              {pricing.couponDiscount > 0 && (
                <div className="flex justify-between text-brand-red font-bold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>- ₹{pricing.couponDiscount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Delivery</span>
                <span className="text-slate-900 font-bold">
                  {pricing.shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase">FREE</span>
                  ) : (
                    `₹${pricing.shippingFee}`
                  )}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 flex justify-between items-baseline">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 block">
                  Total Payable
                </span>
                <span className="text-[10px] text-slate-500">
                  Includes ₹{pricing.taxAmount || 0} GST
                </span>
              </div>
              <span className="text-2xl font-black text-slate-900">₹{pricing.grandTotal || 0}</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-brand-red hover:bg-brand-red-hover text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" /> COMPLETE PREPAID ORDER <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 space-y-2 font-medium">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-brand-red" />
                <span>Express Dispatch via Blue Dart / Delhivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-red" />
                <span>1-Year Official Warranty & 7-Day Replacement</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
