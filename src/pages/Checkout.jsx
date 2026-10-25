/**
 * @file Checkout.jsx
 * @description Enterprise Prepaid Checkout Component with Decoupled Payment Orchestration.
 * Dynamically loads Razorpay SDK, triggers server Payment Intent, handles all modal
 * lifecycle callbacks, and redirects to authoritative polling verification.
 */

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
  Lock,
  Zap,
  X,
  CheckCircle2,
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useCartStore, useAuthStore } from '../store/useStore';
import { loadRazorpaySdk } from '../utils/loadRazorpaySdk';
import Loader from '../components/Loader';

export const Checkout = () => {
  const navigate = useNavigate();
  const { items, pricing, appliedCoupon, fetchCart, loading: cartLoading } = useCartStore();
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

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dismissNotice, setDismissNotice] = useState(false);
  const [demoPaymentModal, setDemoPaymentModal] = useState(null);

  // 1. Guard authenticated route
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }
    fetchCart();
  }, [isAuthenticated, navigate, fetchCart]);

  // 2. Fetch saved addresses
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
        console.error('Failed to load user addresses:', err);
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
      setErrorMessage('Please fill in all mandatory address fields.');
      return;
    }

    try {
      const res = await axiosInstance.put('/auth/profile', {
        addressAction: 'add',
        addressData: newAddress,
      });
      const updated = res.data.data?.addresses || [];
      setSavedAddresses(updated);
      setSelectedAddressIndex(updated.length - 1);
      setIsAddingNewAddress(false);
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to persist new address.');
    }
  };

  /**
   * Orchestrates Order Creation, Payment Intent, and Razorpay Checkout Modal
   */
  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setDismissNotice(false);

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
        setErrorMessage('Please complete your shipping address before paying.');
        return;
      }
      finalShippingAddress = newAddress;
    } else {
      finalShippingAddress = savedAddresses[selectedAddressIndex];
    }

    if (!finalShippingAddress) {
      setErrorMessage('Please select or specify a shipping destination.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Step A: Load Payment Gateway SDK non-blockingly
      await loadRazorpaySdk();

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to initialize. Please check your network connection.');
      }

      // Step B: Initialize Order on backend with idempotency key
      const idempotencyKey = `checkout_${user._id}_${Date.now()}`;
      const orderPayload = {
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

      const orderRes = await axiosInstance.post('/orders/checkout', orderPayload, {
        headers: { 'Idempotency-Key': idempotencyKey },
      });
      const order = orderRes.data.data;

      // Step C: Initialize Payment Intent with Orchestrator
      const intentRes = await axiosInstance.post(
        '/payments/intent',
        {
          orderId: order._id,
          preferredGateway: 'RAZORPAY',
        },
        {
          headers: { 'Idempotency-Key': `intent_${order._id}` },
        }
      );
      const paymentIntent = intentRes.data.data;

      const razorpayKey =
        import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_ChhotaBhaiDemoKey2026';

      // Step D: Configure Razorpay Checkout Options
      const options = {
        key: razorpayKey,
        amount: Math.round(paymentIntent.amount * 100), // in paise
        currency: paymentIntent.currency || 'INR',
        name: 'ChhotaBhai Accessories',
        description: `Order #${order.orderNumber || order._id.slice(-8)}`,
        order_id: paymentIntent.gatewayOrderId,
        prefill: {
          name: finalShippingAddress.fullName || user?.name || '',
          email: user?.email || '',
          contact: finalShippingAddress.phone || user?.phone || '',
        },
        theme: {
          color: '#e11938',
        },
        modal: {
          confirm_close: true,
          // Callback 1: onDismiss
          ondismiss: () => {
            setIsProcessingPayment(false);
            setDismissNotice(true);
          },
        },
        // Callback 2: onSuccess
        handler: async (response) => {
          setIsProcessingPayment(false);
          // Redirect immediately to /order-status/:orderId with verification tokens
          // The page will securely poll and verify authoritative DB confirmation
          navigate(
            `/order-status/${order._id}?payment_id=${encodeURIComponent(
              response.razorpay_payment_id
            )}&order_id=${encodeURIComponent(
              response.razorpay_order_id
            )}&signature=${encodeURIComponent(response.razorpay_signature)}`
          );
        },
      };

      const isDemoMode =
        paymentIntent.gatewayOrderId?.startsWith('order_demo_') ||
        razorpayKey.includes('Demo') ||
        razorpayKey.includes('demo');

      // If running with demo credentials, immediately show the sandbox modal without hanging
      if (isDemoMode) {
        setIsProcessingPayment(false);
        setDemoPaymentModal({
          isOpen: true,
          orderId: order._id,
          orderNumber: order.orderNumber || order._id.slice(-8).toUpperCase(),
          amount: paymentIntent.amount,
          gatewayOrderId: paymentIntent.gatewayOrderId,
        });
        return;
      }

      const rzpInstance = new window.Razorpay(options);

      // Watchdog timeout to prevent button hanging if external CDN has issues
      setTimeout(() => {
        setIsProcessingPayment(false);
      }, 5000);

      // Callback 3: onFailure
      rzpInstance.on('payment.failed', (failResponse) => {
        setIsProcessingPayment(false);
        const desc = failResponse?.error?.description || 'Transaction was declined by issuing bank.';
        setErrorMessage(`Payment Failed: ${desc}`);
      });

      // Open secure modal
      rzpInstance.open();
    } catch (err) {
      console.error('[Checkout Error]', err);
      setIsProcessingPayment(false);
      setErrorMessage(
        err.response?.data?.message || err.message || 'Failed to initiate secure payment transaction.'
      );
    }
  };

  if (cartLoading && items.length === 0) {
    return <Loader text="Preparing Secure Express Checkout..." />;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4 bg-white text-slate-900">
        <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black uppercase text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">
          Please add smartphone accessories, chargers, or tempered glass before checking out.
        </p>
        <Link
          to="/shop"
          className="inline-block px-6 py-3 bg-[#e11938] hover:bg-[#c4142f] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-sm transition"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="cb-container py-8 sm:py-10 space-y-8 bg-white text-slate-900">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight">
          Express <span className="text-[#e11938]">Prepaid Checkout</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          100% Prepaid Order Authorization &bull; Razorpay, UPI, Cards & NetBanking
        </p>
      </div>

      {/* Dismiss notice alert */}
      {dismissNotice && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-start gap-3 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Payment window was dismissed.</p>
            <p className="text-[11px] text-amber-700">
              Your items and address are securely saved. Click "Authorize & Pay" whenever you are ready.
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-3 text-xs">
          <AlertCircle className="w-4 h-4 text-[#e11938] shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Shipping Address Selection */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#e11938]" /> 1. Shipping Address
              </h2>
              {savedAddresses.length > 0 && !isAddingNewAddress && (
                <button
                  type="button"
                  onClick={() => setIsAddingNewAddress(true)}
                  className="text-xs font-bold text-[#e11938] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Address
                </button>
              )}
            </div>

            {/* Saved Addresses Radio List */}
            {!isAddingNewAddress && savedAddresses.length > 0 ? (
              <div className="space-y-3">
                {savedAddresses.map((addr, idx) => (
                  <div
                    key={addr._id || idx}
                    onClick={() => setSelectedAddressIndex(idx)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex items-start gap-3.5 ${
                      selectedAddressIndex === idx
                        ? 'border-[#e11938] bg-rose-50/20 ring-1 ring-[#e11938]'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        selectedAddressIndex === idx
                          ? 'border-[#e11938] bg-[#e11938] text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {selectedAddressIndex === idx && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="min-w-0 flex-1 text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        {addr.street}
                        {addr.landmark ? `, ${addr.landmark}` : ''}, {addr.city}, {addr.state} -{' '}
                        <span className="font-semibold text-slate-900">{addr.pincode}</span>
                      </p>
                      <p className="text-slate-500 font-medium">Phone: {addr.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Add New Address Form */
              <form onSubmit={handleAddNewAddressSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      placeholder="Receiver's name"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#e11938] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#e11938] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Street Address & House/Flat *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    placeholder="House / Flat / Street / Area"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#e11938] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      placeholder="City"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#e11938] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      placeholder="State"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#e11938] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      pattern="^[1-9][0-9]{5}$"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      placeholder="6-digit PIN"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#e11938] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                  >
                    Save Address
                  </button>
                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Secure Payment Gateway Info Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#e11938]" /> 2. Payment Method
            </h2>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-[#e11938]">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Razorpay Smart Gateway</p>
                  <p className="text-[11px] text-slate-500">
                    Instant UPI (GPay, PhonePe, Paytm), All Credit/Debit Cards & NetBanking
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary & Place Order */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h2>

            {/* Cart Items List */}
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center gap-3">
                  <img
                    src={item.product?.thumbnail || item.product?.variants?.[0]?.images?.[0]}
                    alt={item.product?.title || item.title}
                    className="w-11 h-11 object-cover rounded-xl bg-slate-100 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {item.product?.title || item.title}
                    </p>
                    <p className="text-[11px] text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    ₹{(item.unitPrice || item.price) * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing Calculation */}
            <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">₹{pricing.subtotal}</span>
              </div>
              {pricing.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>-₹{pricing.couponDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charges</span>
                <span className="font-semibold text-emerald-600">
                  {pricing.shippingFee === 0 ? 'FREE' : `₹${pricing.shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
                <span>Total Payable</span>
                <span className="text-[#e11938]">₹{pricing.grandTotal}</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleInitiatePayment}
              disabled={isProcessingPayment}
              className="w-full py-3.5 bg-[#e11938] hover:bg-[#c4142f] active:scale-[0.99] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessingPayment ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Gateway...</span>
                </>
              ) : (
                <>
                  <span>Authorize & Pay ₹{pricing.grandTotal}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Security Notice */}
            <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>256-bit SSL encrypted & secure prepaid checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Razorpay Sandbox Modal */}
      {demoPaymentModal?.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-scaleUp">
            {/* Header */}
            <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-wide text-white">Razorpay Smart Gateway</h3>
                  <p className="text-[10px] text-blue-200">Secure 256-bit Sandbox Authorization</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDemoPaymentModal(null)}
                className="text-white/60 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Amount Payable</span>
                  <div className="text-2xl font-black text-slate-900">
                    ₹{(demoPaymentModal.amount || 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase">
                  Verified Order
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Select Payment Simulator Method
                </span>
                <div className="grid grid-cols-1 gap-2">
                  <div className="p-3 bg-white border-2 border-[#e11938] rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Zap className="w-4 h-4 text-[#e11938]" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Instant UPI & Cards</div>
                        <div className="text-[10px] text-slate-400">GPay, PhonePe, Paytm, RuPay, Visa</div>
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-[#e11938]" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const orderId = demoPaymentModal.orderId;
                    const gwOrderId = demoPaymentModal.gatewayOrderId;
                    setDemoPaymentModal(null);
                    navigate(
                      `/order-status/${orderId}?payment_id=pay_demo_${Date.now()}&order_id=${encodeURIComponent(
                        gwOrderId
                      )}&signature=sig_demo_${Date.now()}`
                    );
                  }}
                  className="w-full py-3.5 bg-[#e11938] hover:bg-[#c4142f] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Authorize & Pay ₹{(demoPaymentModal.amount || 0).toLocaleString('en-IN')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDemoPaymentModal(null)}
                  className="w-full py-2.5 text-slate-500 hover:text-slate-800 text-xs font-bold cursor-pointer"
                >
                  Cancel and Return
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
