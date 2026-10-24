import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useLocation, Link } from 'react-router-dom';
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  Copy,
  CheckCheck,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import Loader from '../components/Loader';
import { generateTrackingUrl } from '../utils/trackingHelper';

const PROGRESS_STAGES = [
  { key: 'PLACED', label: 'Order Placed', desc: 'Order received and verified' },
  { key: 'CONFIRMED', label: 'Confirmed', desc: 'Packed at fulfillment hub' },
  { key: 'SHIPPED', label: 'Shipped', desc: 'Handed over to courier' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'With local delivery agent' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Safely handed over to you' },
];

export const OrderTrack = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order || null);
  const [orderNumberInput, setOrderNumberInput] = useState(
    searchParams.get('orderNumber') || orderId || ''
  );
  const [phoneInput, setPhoneInput] = useState(searchParams.get('phone') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [awbCopied, setAwbCopied] = useState(false);

  // Auto-fetch if orderId was passed in route or URL query
  useEffect(() => {
    const lookupId = orderId || searchParams.get('orderNumber');
    if (!order && lookupId) {
      handleLookup(lookupId, searchParams.get('phone') || '');
    }
  }, [orderId, searchParams]);

  const handleLookup = async (lookupOrderNum, lookupPhone) => {
    const num = (lookupOrderNum || orderNumberInput).trim();
    const ph = (lookupPhone || phoneInput).trim();

    if (!num) {
      setError('Please enter a valid Order Number (e.g. ORD-2026-XXXXX).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axiosInstance.post('/orders/track', {
        orderNumber: num,
        phone: ph,
      });

      setOrder(res.data.data);
    } catch (err) {
      console.error('Order tracking lookup error:', err);
      setError(
        err.response?.data?.message ||
          'Order not found. Please verify your Order Number and phone number.'
      );
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleLookup(orderNumberInput, phoneInput);
  };

  const handleCopyAwb = (awb) => {
    if (!awb) return;
    navigator.clipboard.writeText(awb);
    setAwbCopied(true);
    setTimeout(() => setAwbCopied(false), 2000);
  };

  const getStageIndex = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 4;
      case 'OUT_FOR_DELIVERY':
        return 3;
      case 'SHIPPED':
        return 2;
      case 'CONFIRMED':
      case 'PROCESSING':
        return 1;
      case 'PLACED':
      default:
        return 0;
    }
  };

  const currentStageIdx = order ? getStageIndex(order.orderStatus) : 0;
  const isShippedOrBeyond = currentStageIdx >= 2;

  const courierName = order?.trackingDetails?.courierCompany || 'Express Courier';
  const awbNumber = order?.trackingDetails?.trackingNumber || '';
  const trackingUrl =
    order?.trackingDetails?.trackingUrl || generateTrackingUrl(courierName, awbNumber);

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-8 sm:py-12">
      <div className="cb-container max-w-4xl space-y-8">
        {/* Title Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
            <Truck className="w-3.5 h-3.5" /> Live Parcel Tracking
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900">
            Track Your <span className="text-rose-600">ChhotaBhai</span> Order
          </h1>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            Real-time fulfillment milestone tracker and official courier partner status for your audio gear & phone covers.
          </p>
        </div>

        {/* Tracking Input Card */}
        {(!order || error) && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm max-w-2xl mx-auto space-y-6">
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Order Reference Number *
                </label>
                <div className="relative">
                  <Package className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. ORD-2026-AB123"
                    value={orderNumberInput}
                    onChange={(e) => setOrderNumberInput(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-rose-500 focus:bg-white uppercase transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Registered Mobile Number (Optional for Guest Verification)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
                />
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-900 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition duration-200 shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Locating Dispatch Records...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Track Order Status</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Live Tracking Result State */}
        {order && (
          <div className="space-y-6">
            {/* Order Identity Bar */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Order Reference
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
                    {order.orderStatus?.replace(/_/g, ' ')}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 font-mono mt-1">
                  {order.orderNumber}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Placed on{' '}
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setOrder(null);
                    setOrderNumberInput('');
                    setPhoneInput('');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition border border-slate-200"
                >
                  Track Another Order
                </button>
              </div>
            </div>

            {/* Visual 5-Stage ChhotaBhai Progress Bar */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Delivery Progression Timeline
              </h3>

              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-5 left-4 right-4 h-1 bg-slate-100 z-0 hidden md:block rounded-full">
                  <div
                    className="h-full bg-rose-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${(currentStageIdx / (PROGRESS_STAGES.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                {/* Milestones */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-2 relative z-10">
                  {PROGRESS_STAGES.map((st, idx) => {
                    const isDone = idx <= currentStageIdx;
                    const isCurrent = idx === currentStageIdx;

                    return (
                      <div
                        key={st.key}
                        className="flex md:flex-col items-center md:text-center gap-3 md:gap-2"
                      >
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                            isDone
                              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20 ring-4 ring-rose-100'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                        </div>
                        <div>
                          <p
                            className={`text-xs font-bold uppercase tracking-wider ${
                              isDone ? 'text-slate-900' : 'text-slate-400'
                            } ${isCurrent ? 'text-rose-600 font-black' : ''}`}
                          >
                            {st.label}
                          </p>
                          <p className="text-[10px] text-slate-500 hidden md:block mt-0.5">
                            {st.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Official Courier Partner Live Tracking Card */}
            {isShippedOrBeyond && (
              <div className="bg-gradient-to-br from-rose-50/40 via-white to-slate-50 border-2 border-rose-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
                      Dispatched with Official Logistics Partner
                    </span>
                    <h3 className="text-xl font-black text-slate-900 uppercase flex items-center gap-2 mt-1">
                      <Truck className="w-5 h-5 text-rose-600" /> {courierName} Express
                    </h3>
                  </div>

                  {awbNumber && (
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-xs text-slate-500">AWB Code:</span>
                      <span className="text-xs font-mono font-bold text-slate-900">{awbNumber}</span>
                      <button
                        onClick={() => handleCopyAwb(awbNumber)}
                        className="text-slate-400 hover:text-slate-700 transition ml-1"
                        title="Copy tracking code"
                      >
                        {awbCopied ? (
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-slate-600 max-w-md">
                    Your parcel is in transit with {courierName}. You can view the live GPS delivery scan events directly on the courier website.
                  </p>

                  {trackingUrl && (
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-md shadow-rose-600/20 flex-shrink-0"
                    >
                      <span>Track Live on {courierName}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Destination & Ordered Items Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery Address Preview */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-rose-600" /> Delivery Destination
                </div>
                <div className="space-y-1 text-xs text-slate-600">
                  <p className="font-bold text-slate-900 text-sm">
                    {order.shippingAddress?.fullName}
                  </p>
                  <p>{order.shippingAddress?.street}</p>
                  {order.shippingAddress?.landmark && (
                    <p className="text-slate-400">Near {order.shippingAddress.landmark}</p>
                  )}
                  <p>
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} -{' '}
                    <span className="font-mono font-bold text-slate-900">
                      {order.shippingAddress?.pincode}
                    </span>
                  </p>
                  <p className="text-slate-400">{order.shippingAddress?.country || 'India'}</p>
                </div>
              </div>

              {/* Order Manifest Summary */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <ShoppingBag className="w-4 h-4 text-rose-600" /> Manifest Summary
                </div>
                <div className="divide-y divide-slate-100">
                  {order.items?.map((it, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <img
                          src={it.image}
                          alt={it.title}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-50 border border-slate-200 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
                            {it.title}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {it.colorName || 'Default'} × {it.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        ₹{it.totalPrice?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Back to Catalog CTA */}
            <div className="text-center pt-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider hover:underline"
              >
                <span>Continue Shopping at ChhotaBhai Store</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrack;
