import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Calendar,
  CreditCard,
  ArrowRight,
  Truck,
  ExternalLink,
  ShoppingBag,
  AlertTriangle,
  X,
  CheckCircle2,
  RefreshCw,
  Clock,
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useAuthStore } from '../store/useStore';
import Loader from '../components/Loader';

export const MyOrders = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cancellation Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Changed mind / Placed by mistake');
  const [cancelling, setCancelling] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  // Replacement Modal State (One-Time Replacement Policy: No Refunds/Returns)
  const [replaceModalOrder, setReplaceModalOrder] = useState(null);
  const [replaceReason, setReplaceReason] = useState('Item arrived defective / not working');
  const [replaceNote, setReplaceNote] = useState('');
  const [replacing, setReplacing] = useState(false);

  const fetchOrders = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await axiosInstance.get('/orders/my-orders');
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Fetch my-orders error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/my-orders');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  // Strict Cancellation Condition: ONLY 'CONFIRMED' or 'PAYMENT_PENDING'
  const isCancellable = (status) => {
    const s = (status || '').toUpperCase();
    return s === 'CONFIRMED' || s === 'PAYMENT_PENDING' || s === 'PENDING';
  };

  // Helper to determine 7-day one-time replacement eligibility
  const getReplacementEligibility = (ord) => {
    if (!ord) return { eligible: false };
    if (ord.hasBeenReplaced) return { eligible: false, alreadyReplaced: true };
    const s = (ord.orderStatus || '').toUpperCase();
    if (s !== 'DELIVERED') return { eligible: false };

    let deliveryTimestamp = ord.deliveredAt ? new Date(ord.deliveredAt).getTime() : null;
    if (!deliveryTimestamp && Array.isArray(ord.statusTimeline)) {
      const deliveredEntry = ord.statusTimeline.find((t) => t.status === 'DELIVERED');
      if (deliveredEntry?.timestamp) deliveryTimestamp = new Date(deliveredEntry.timestamp).getTime();
    }
    if (!deliveryTimestamp && ord.updatedAt) deliveryTimestamp = new Date(ord.updatedAt).getTime();
    if (!deliveryTimestamp) deliveryTimestamp = new Date(ord.createdAt).getTime();

    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const remainingMs = SEVEN_DAYS_MS - (Date.now() - deliveryTimestamp);
    if (remainingMs <= 0) return { eligible: false, expired: true };

    const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
    return { eligible: true, remainingDays };
  };

  // Perform secure cancellation request
  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return;
    setCancelling(true);

    try {
      await axiosInstance.patch(`/orders/${cancelModalOrder._id}/cancel`, {
        reason: cancelReason,
      });

      setOrders((prev) =>
        prev.map((ord) =>
          ord._id === cancelModalOrder._id
            ? {
                ...ord,
                orderStatus: 'CANCELLED',
                paymentInfo: {
                  ...(ord.paymentInfo || {}),
                  status: ord.paymentInfo?.status === 'PAID' ? 'REFUNDED' : ord.paymentInfo?.status,
                },
              }
            : ord
        )
      );

      setActionNotice({
        type: 'success',
        message: `Order #${cancelModalOrder.orderNumber || cancelModalOrder._id.slice(-8).toUpperCase()} was cancelled successfully. Refund initiated.`,
      });

      setCancelModalOrder(null);
    } catch (err) {
      setActionNotice({
        type: 'error',
        message: err.message || 'Failed to cancel order. Please try again.',
      });
    } finally {
      setCancelling(false);
    }
  };

  // Perform one-time replacement request
  const handleConfirmReplace = async () => {
    if (!replaceModalOrder) return;
    setReplacing(true);

    try {
      await axiosInstance.post(`/orders/${replaceModalOrder._id}/replace`, {
        reason: replaceReason,
        note: replaceNote,
      });

      setOrders((prev) =>
        prev.map((ord) =>
          ord._id === replaceModalOrder._id
            ? {
                ...ord,
                orderStatus: 'REPLACEMENT_REQUESTED',
                replacementDetails: {
                  hasRequested: true,
                  requestedAt: new Date(),
                  reason: replaceReason,
                  customerNote: replaceNote,
                },
              }
            : ord
        )
      );

      setActionNotice({
        type: 'success',
        message: `One-time replacement requested for Order #${replaceModalOrder.orderNumber || replaceModalOrder._id.slice(-8).toUpperCase()}. Our team will verify and dispatch a replacement package (No refund policy).`,
      });

      setReplaceModalOrder(null);
      setReplaceNote('');
    } catch (err) {
      setActionNotice({
        type: 'error',
        message: err.message || 'Failed to submit replacement request. Please try again.',
      });
    } finally {
      setReplacing(false);
    }
  };

  const getStatusBadge = (status, hasBeenReplaced = false) => {
    const s = (status || 'PLACED').toUpperCase();

    if (s === 'REPLACEMENT_REQUESTED') {
      return (
        <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
          <RefreshCw className="w-3 h-3 text-purple-600 animate-spin" /> Replacement Requested
        </span>
      );
    }
    if (s === 'REPLACEMENT_PROCESSING') {
      return (
        <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
          <Truck className="w-3 h-3 text-blue-600" /> Replacement Dispatched
        </span>
      );
    }
    if (s === 'REPLACED') {
      return (
        <span className="bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-teal-600" /> Item Replaced (Final)
        </span>
      );
    }
    if (s === 'DELIVERED') {
      return (
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Delivered {hasBeenReplaced ? '(Replaced)' : ''}
        </span>
      );
    }
    if (s === 'SHIPPED' || s === 'OUT_FOR_DELIVERY') {
      return (
        <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
          <Truck className="w-3 h-3 text-blue-600" /> In Transit
        </span>
      );
    }
    if (s === 'CONFIRMED') {
      return (
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Confirmed
        </span>
      );
    }
    if (s === 'PAYMENT_PENDING' || s === 'PROCESSING' || s === 'PENDING') {
      return (
        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-600" /> {s === 'PAYMENT_PENDING' ? 'Payment Pending' : 'Processing'}
        </span>
      );
    }
    if (s === 'CANCELLED') {
      return (
        <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
          <X className="w-3 h-3 text-rose-600" /> Cancelled
        </span>
      );
    }
    return (
      <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
        {s}
      </span>
    );
  };

  if (loading) return <Loader text="Loading Your Order History..." />;

  return (
    <div className="bg-slate-50/50 min-h-[85vh] py-8 sm:py-12">
      <div className="cb-container max-w-5xl space-y-6">
        
        {/* Header Bar */}
        <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900">
              My <span className="text-rose-600">Orders</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track live deliveries, review past purchases, or manage cancellations
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all"
              title="Refresh order history"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-rose-600' : ''}`} />
              <span>Refresh</span>
            </button>

            <Link
              to="/shop"
              className="text-xs font-bold text-rose-600 uppercase tracking-wider hover:underline hidden sm:inline"
            >
              Explore Catalog →
            </Link>
          </div>
        </div>

        {/* Global Toast / Action Notification Banner */}
        {actionNotice && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-medium animate-fadeIn ${
              actionNotice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{actionNotice.message}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="p-1 hover:opacity-75 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Orders List or Empty State */}
        {orders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 sm:p-16 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-black uppercase text-slate-900">No Orders Placed Yet</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven&apos;t placed any orders yet. Discover our signature MagSafe cases, 9H tempered glass, and 65W fast chargers.
            </p>

            <Link
              to="/shop"
              className="inline-block px-6 py-3 bg-slate-900 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md shadow-slate-900/10 transition duration-200"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((ord) => {
              const items = ord.items || ord.orderItems || [];
              const grandTotal = ord.pricingSummary?.grandTotal || ord.totalPrice || 0;
              const canCancel = isCancellable(ord.orderStatus);

              return (
                <div
                  key={ord._id}
                  className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
                >
                  {/* Order Top Meta */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <span className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                        <Package className="w-4 h-4 text-rose-600" />
                        Order #{ord.orderNumber || ord._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(ord.orderStatus, ord.hasBeenReplaced)}
                      <span className="text-base font-black text-slate-900">
                        ₹{grandTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {items.slice(0, 3).map((it, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80"
                      >
                        <img
                          src={it.image || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=150&auto=format&fit=crop&q=80'}
                          alt={it.title || it.name}
                          className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-200 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{it.title || it.name}</h4>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            Qty: {it.quantity} {it.colorName && `• ${it.colorName}`}
                          </span>
                        </div>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <div className="flex items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 font-medium">
                        +{items.length - 3} more accessory items
                      </div>
                    )}
                  </div>

                  {/* Replacement State Status Card */}
                  {ord.orderStatus === 'REPLACEMENT_REQUESTED' && (
                    <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-2xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-900 flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5 text-purple-600 animate-spin" /> One-Time Replacement Requested
                        </span>
                        <span className="text-[10px] bg-purple-200 text-purple-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
                          Replacement Only (No Refunds)
                        </span>
                      </div>
                      <p className="text-purple-700 text-[11px]">
                        Reason: <strong>{ord.replacementDetails?.reason || 'Defective / Damaged'}</strong> &bull; Our fulfillment team is verifying and preparing your replacement package.
                      </p>
                    </div>
                  )}

                  {ord.orderStatus === 'REPLACEMENT_PROCESSING' && (
                    <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-900 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-blue-600" /> Replacement Package Shipped
                        </span>
                        <span className="text-[10px] bg-blue-200 text-blue-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
                          In Transit
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-blue-700">
                        <span>
                          Courier: <strong>{ord.replacementDetails?.courierCompany || ord.trackingDetails?.courierCompany || 'Delhivery'}</strong> | AWB: <strong className="font-mono">{ord.replacementDetails?.trackingNumber || ord.trackingDetails?.trackingNumber || 'Pending'}</strong>
                        </span>
                        {(ord.replacementDetails?.trackingUrl || ord.trackingDetails?.trackingUrl) && (
                          <a
                            href={ord.replacementDetails?.trackingUrl || ord.trackingDetails?.trackingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg font-bold text-[10px] hover:bg-blue-700 transition"
                          >
                            Track Live <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {ord.hasBeenReplaced && (
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between text-xs text-teal-800 font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> One-Time Replacement Fulfilled
                      </span>
                      <span className="text-[10px] text-teal-600 uppercase">No Further Returns or Refunds</span>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <span className="text-[11px] text-slate-500">
                      Payment:{' '}
                      <strong className="text-slate-900 uppercase">
                        {ord.paymentInfo?.method || ord.paymentMethod || 'PREPAID'}
                      </strong>{' '}
                      ({ord.paymentInfo?.status || (ord.isPaid ? 'PAID' : 'PENDING')})
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Cancel Order Button: only appears if status is CONFIRMED or PAYMENT_PENDING */}
                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => setCancelModalOrder(ord)}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-rose-200 hover:border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel Order
                        </button>
                      )}

                      {/* Request Replacement Button: appears if DELIVERED, within 7 days, and !hasBeenReplaced */}
                      {(() => {
                        const rep = getReplacementEligibility(ord);
                        if (!rep.eligible) return null;
                        return (
                          <button
                            type="button"
                            onClick={() => setReplaceModalOrder(ord)}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-purple-200 hover:border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-2xs"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
                            Request Replacement ({rep.remainingDays}d left)
                          </button>
                        );
                      })()}

                      <Link
                        to={`/order-status/${ord._id}`}
                        state={{ order: ord }}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                      >
                        Track & Details <ArrowRight className="w-3.5 h-3.5 text-rose-600" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Confirmation Modal for Order Cancellation */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                onClick={() => setCancelModalOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                disabled={cancelling}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-black uppercase text-slate-900">
                Cancel Order #{cancelModalOrder.orderNumber || cancelModalOrder._id.slice(-8).toUpperCase()}?
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Are you sure you want to cancel this purchase? If payment was captured, a full refund of{' '}
                <strong className="text-slate-900 font-bold">
                  ₹{(cancelModalOrder.pricingSummary?.grandTotal || cancelModalOrder.totalPrice || 0).toLocaleString('en-IN')}
                </strong>{' '}
                will be credited back to your original payment method within 3&ndash;5 business days.
              </p>
            </div>

            {/* Reason Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Reason for cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                disabled={cancelling}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-rose-500"
              >
                <option value="Changed mind / Placed by mistake">Changed mind / Placed by mistake</option>
                <option value="Want to change delivery address or phone">Want to change delivery address or phone</option>
                <option value="Found a better deal / Want another accessory">Found a better deal / Want another accessory</option>
                <option value="Payment processed twice">Payment processed twice</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                disabled={cancelling}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md shadow-rose-600/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {cancelling ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Confirm Cancellation</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* One-Time Replacement Request Modal (Dropshipping Policy: Replacement Only - No Refunds) */}
      {replaceModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <RefreshCw className="w-5 h-5" />
              </div>
              <button
                onClick={() => setReplaceModalOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                disabled={replacing}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black uppercase text-slate-900">
                  Request Product Replacement
                </h3>
                <span className="text-[10px] bg-rose-100 text-rose-700 font-extrabold px-2 py-0.5 rounded-full uppercase">
                  No Refund Policy
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Order #{replaceModalOrder.orderNumber || replaceModalOrder._id.slice(-8).toUpperCase()}
              </p>
            </div>

            {/* Strict Policy Banner */}
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-[11px] text-amber-900 leading-relaxed space-y-1">
              <strong className="block font-bold text-amber-950 uppercase tracking-wider text-[10px]">
                Strict Dropshipping Replacement Policy:
              </strong>
              <p>
                We provide a <strong>One-Time Product Replacement</strong> for defective, transit-damaged, or incorrect accessories within 7 days of delivery.
              </p>
              <p className="text-rose-700 font-bold">
                ⚠️ As per our policy, monetary refunds or returns are NOT provided for delivered items. Once replaced, this order cannot be replaced again.
              </p>
            </div>

            {/* Reason Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Reason for replacement *
              </label>
              <select
                value={replaceReason}
                onChange={(e) => setReplaceReason(e.target.value)}
                disabled={replacing}
                className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="Item arrived defective / not working">Item arrived defective / not working</option>
                <option value="Damaged in transit (Broken seal/cable/glass)">Damaged in transit (Broken seal/cable/glass)</option>
                <option value="Wrong accessory model or variant received">Wrong accessory model or variant received</option>
                <option value="Charging speed or connector malfunction">Charging speed or connector malfunction</option>
                <option value="Missing component in box">Missing component in box</option>
                <option value="Other manufacturing quality defect">Other manufacturing quality defect</option>
              </select>
            </div>

            {/* Additional Note */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Additional Details (Optional)
              </label>
              <textarea
                value={replaceNote}
                onChange={(e) => setReplaceNote(e.target.value)}
                disabled={replacing}
                rows={2}
                placeholder="Describe the issue with the item (e.g. Type-C cable pin loose, tempered glass chipped on top right)..."
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReplaceModalOrder(null)}
                disabled={replacing}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmReplace}
                disabled={replacing || !replaceReason.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md shadow-purple-600/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {replacing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <span>Submit Replacement Request</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MyOrders;
