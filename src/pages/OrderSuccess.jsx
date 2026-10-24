import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  ExternalLink,
  ArrowRight,
  Calendar,
  CreditCard,
  Clock,
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import Loader from '../components/Loader';

export const OrderSuccess = () => {
  const { orderId } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    if (!order && orderId) {
      const fetchOrderDetails = async () => {
        setLoading(true);
        try {
          const res = await axiosInstance.get(`/orders/${orderId}`);
          setOrder(res.data.data);
        } catch (err) {
          console.error('Order fetch error:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrderDetails();
    }
  }, [orderId, order]);

  if (loading) return <Loader text="Retrieving Order Confirmation..." />;

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4 bg-white text-slate-900">
        <h2 className="text-xl font-black uppercase text-slate-900">Order Not Found</h2>
        <Link
          to="/shop"
          className="inline-block px-6 py-2.5 bg-brand-red text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-sm"
        >
          Return to Storefront
        </Link>
      </div>
    );
  }

  // Order Progression Steps
  const stages = [
    { key: 'PLACED', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PROCESSING', label: 'Packed' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const currentStageIndex = stages.findIndex((s) => s.key === (order.orderStatus || 'PLACED'));
  const activeStep = currentStageIndex !== -1 ? currentStageIndex : 0;

  const items = order.items || order.orderItems || [];
  const pricing = order.pricingSummary || {
    subtotal: order.itemsPrice || 0,
    shippingFee: order.shippingPrice || 0,
    discountAmount: order.couponDiscount || 0,
    grandTotal: order.totalPrice || 0,
  };

  return (
    <div className="cb-container max-w-4xl py-8 sm:py-12 space-y-8 bg-white text-slate-900">
      {/* Top Success Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-sm relative overflow-hidden">
        <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-slate-900">
          Order Placed <span className="text-brand-red">Successfully!</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Thank you for shopping with ChhotaBhai. Your official drop order{' '}
          <strong className="text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {order.orderNumber || order._id}
          </strong>{' '}
          has been received and is being prepared for express dispatch.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-red" />
            Placed: {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-brand-red" />
            Payment: {order.paymentInfo?.method || order.paymentMethod || 'PREPAID_ONLINE'} ({order.paymentInfo?.status || 'PAID'})
          </span>
        </div>
      </div>

      {/* Visual Step Tracker */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-red" /> Real-Time Fulfillment Progression
        </h2>

        {/* Step Indicator Bar */}
        <div className="relative pt-4 pb-2">
          {/* Progress bar background */}
          <div className="hidden sm:block absolute top-7 left-6 right-6 h-1 bg-slate-200 rounded-full z-0">
            <div
              className="bg-brand-red h-full rounded-full transition-all duration-700"
              style={{ width: `${(activeStep / (stages.length - 1)) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
            {stages.map((stage, idx) => {
              const isPassed = idx <= activeStep;
              const isCurrent = idx === activeStep;
              return (
                <div key={stage.key} className="flex flex-col items-center text-center space-y-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      isCurrent
                        ? 'bg-brand-red text-white ring-4 ring-rose-200 scale-110 shadow-sm'
                        : isPassed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isPassed ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider ${
                      isCurrent ? 'text-brand-red' : isPassed ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Courier Dispatch Block */}
        {order.trackingDetails?.trackingNumber && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-red shadow-sm">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Courier Partner: {order.trackingDetails.courierCompany || 'Blue Dart Express'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  AWB Tracking Number: <strong className="text-slate-900">{order.trackingDetails.trackingNumber}</strong>
                </span>
              </div>
            </div>

            {order.trackingDetails.trackingUrl && (
              <a
                href={order.trackingDetails.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-red text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-brand-red-hover transition-colors shadow-sm"
              >
                Track Live <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Itemized Order Receipt & Delivery Destination */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Items List */}
        <div className="md:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-red" /> Drop Items ({items.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {items.map((it, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={it.image || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&auto=format&fit=crop&q=80'}
                    alt={it.title || it.name}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-slate-100 flex-shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{it.title || it.name}</h4>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      SKU: {it.variantSku || 'STD'} • Qty: {it.quantity} {it.colorName && `• Color: ${it.colorName}`}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900">₹{it.totalPrice || it.unitPrice * it.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address & Pricing Breakdown */}
        <div className="md:col-span-5 space-y-6">
          {/* Shipping Address Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-red" /> Delivery Destination
            </h3>
            <div className="text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-900 block">{order.shippingAddress?.fullName}</span>
              <span className="block mt-0.5">{order.shippingAddress?.phone}</span>
              <p className="mt-1">
                {order.shippingAddress?.street}, {order.shippingAddress?.landmark ? `${order.shippingAddress?.landmark}, ` : ''}
                {order.shippingAddress?.city}, {order.shippingAddress?.state} -{' '}
                <strong className="text-slate-900">{order.shippingAddress?.pincode || order.shippingAddress?.postalCode}</strong>
              </p>
            </div>
          </div>

          {/* Pricing Summary Breakdown */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
              Receipt Breakdown
            </h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal Items</span>
                <span className="text-slate-900 font-bold">₹{pricing.subtotal}</span>
              </div>
              {pricing.discountAmount > 0 && (
                <div className="flex justify-between text-brand-red font-bold">
                  <span>Coupon Discount</span>
                  <span>- ₹{pricing.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Express Delivery</span>
                <span className="text-slate-900 font-bold">
                  {pricing.shippingFee === 0 ? <strong className="text-emerald-600 uppercase">FREE</strong> : `₹${pricing.shippingFee}`}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline text-slate-900">
                <span className="font-black uppercase text-xs">Total Amount</span>
                <span className="text-xl font-black">₹{pricing.grandTotal}</span>
              </div>
            </div>

            <Link
              to="/shop"
              className="mt-4 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              Continue Shopping <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
