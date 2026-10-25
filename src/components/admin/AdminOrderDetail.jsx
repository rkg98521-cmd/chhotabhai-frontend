/**
 * @file AdminOrderDetail.jsx
 * @description Enterprise Order Inspection & Fulfillment Action Drawer / Modal.
 * Integrates State Machine transition restrictions, shipping courier generation,
 * address copying, and visual status timeline.
 */

import React, { useState } from 'react';
import {
  X,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  CreditCard,
  User,
  Calendar,
  Layers,
  MapPin,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { generateTrackingUrl } from '../../utils/trackingHelper';

const COURIER_OPTIONS = [
  'Delhivery',
  'BlueDart',
  'Shadowfax',
  'Xpressbees',
  'Ekart',
  'DTDC',
  'Other',
];

export const AdminOrderDetail = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  actionLoading = false,
}) => {
  if (!isOpen || !order) return null;

  const [copied, setCopied] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [courier, setCourier] = useState(order.trackingDetails?.courierCompany || 'Delhivery');
  const [awb, setAwb] = useState(order.trackingDetails?.trackingNumber || '');
  const [comment, setComment] = useState('');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);

  const allowedStatuses = order.allowedNextStatuses || [];

  const handleCopyShippingAddress = () => {
    const addr = order.shippingAddress;
    if (!addr) return;
    const formatted = `${addr.fullName}
${addr.phone}
${addr.street}${addr.landmark ? `, ${addr.landmark}` : ''}
${addr.city}, ${addr.state} - ${addr.pincode}
${addr.country || 'India'}`;

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitStatus = (e) => {
    e.preventDefault();
    if (!targetStatus) return;

    const isShippingAction = ['SHIPPED', 'OUT_FOR_DELIVERY', 'REPLACEMENT_PROCESSING'].includes(targetStatus);
    const trackingUrl = isShippingAction && courier && awb ? generateTrackingUrl(courier, awb) : '';

    onUpdateStatus({
      orderId: order._id,
      status: targetStatus,
      courierCompany: isShippingAction ? courier : '',
      trackingNumber: isShippingAction ? awb : '',
      trackingUrl,
      comment,
    });
  };

  const handleCancelOrder = () => {
    onUpdateStatus({
      orderId: order._id,
      status: 'CANCELLED',
      comment: comment || 'Cancelled by Store Administrator. Stock restored.',
    });
    setShowCancelPrompt(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-black text-slate-900 font-mono">
                Order #{order.orderNumber}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-800">
                {order.orderStatus}
              </span>
              {order.hasBeenReplaced && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200">
                  Replaced (1-Time Final)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Customer Replacement Request Alert Banner */}
          {order.orderStatus === 'REPLACEMENT_REQUESTED' && (
            <div className="p-5 bg-rose-50/90 border-2 border-rose-300 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> Customer Requested Replacement
                </span>
                <span className="text-[10px] bg-rose-200 text-rose-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  One-Time Policy (No Refund)
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-rose-200 text-xs space-y-1.5 shadow-xs">
                <p className="font-bold text-slate-900">
                  Customer Reason: <span className="font-semibold text-rose-600">{order.replacementDetails?.reason || 'Defective / Damaged Item'}</span>
                </p>
                {order.replacementDetails?.customerNote && (
                  <p className="text-slate-600 text-[11px]">Note: {order.replacementDetails.customerNote}</p>
                )}
                <p className="text-[10px] text-slate-400">
                  Requested on: {order.replacementDetails?.requestedAt ? new Date(order.replacementDetails.requestedAt).toLocaleString('en-IN') : 'Recently'}
                </p>
              </div>
              <p className="text-[11px] text-rose-700 font-medium">
                👉 Select <strong>Move to REPLACEMENT_PROCESSING</strong> below, select the courier, and input the new replacement shipment AWB number to approve and dispatch the replacement parcel.
              </p>
            </div>
          )}

          {/* Replacement In Transit Banner */}
          {order.orderStatus === 'REPLACEMENT_PROCESSING' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
              <Truck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-blue-900">Replacement Parcel in Transit</p>
                <p className="text-blue-700 text-[11px]">
                  Replacement courier: <strong>{order.replacementDetails?.courierCompany || order.trackingDetails?.courierCompany || 'Delhivery'}</strong> | AWB: <strong className="font-mono">{order.replacementDetails?.trackingNumber || order.trackingDetails?.trackingNumber || 'Pending'}</strong>
                </p>
                <p className="text-[11px] text-blue-600">
                  Once customer receives this replacement, select <strong>Move to REPLACED</strong> to permanently lock the one-time replacement rule.
                </p>
              </div>
            </div>
          )}

          {/* One-Time Replacement Fulfilled Banner */}
          {order.hasBeenReplaced && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center gap-2.5 text-xs text-teal-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>One-Time Replacement has been fulfilled. Further replacements, returns, or refunds are strictly locked.</span>
            </div>
          )}

          {/* 1. Fulfillment State Machine Action Panel */}
          <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100/70 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#e11938]" /> Fulfillment & State Machine Action
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                Current Status: <strong className="text-slate-900">{order.orderStatus}</strong>
              </span>
            </div>

            {allowedStatuses.length === 0 ? (
              <div className="p-3.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium">
                This order is in terminal state (<strong className="text-slate-900">{order.orderStatus}</strong>). No further status updates can be applied.
              </div>
            ) : (
              <form onSubmit={handleSubmitStatus} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Target Next Status *
                    </label>
                    <select
                      value={targetStatus}
                      onChange={(e) => setTargetStatus(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#e11938]"
                    >
                      <option value="">Select legal next status...</option>
                      {allowedStatuses
                        .filter((s) => s !== 'CANCELLED')
                        .map((statusKey) => (
                          <option key={statusKey} value={statusKey}>
                            {statusKey === 'REPLACEMENT_PROCESSING'
                              ? 'Approve & Move to REPLACEMENT_PROCESSING'
                              : statusKey === 'REPLACED'
                              ? 'Mark as REPLACED (Finalize 1-Time Replacement)'
                              : `Move to ${statusKey}`}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Courier Partner (shown when Shipped / Out for Delivery / Replacement Processing) */}
                  {['SHIPPED', 'OUT_FOR_DELIVERY', 'REPLACEMENT_PROCESSING'].includes(targetStatus) && (
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        {targetStatus === 'REPLACEMENT_PROCESSING' ? 'Replacement Courier Partner' : 'Courier Partner'}
                      </label>
                      <select
                        value={courier}
                        onChange={(e) => setCourier(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#e11938]"
                      >
                        {COURIER_OPTIONS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {['SHIPPED', 'OUT_FOR_DELIVERY', 'REPLACEMENT_PROCESSING'].includes(targetStatus) && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      {targetStatus === 'REPLACEMENT_PROCESSING'
                        ? 'New Replacement AWB / Tracking Number *'
                        : 'AWB / Tracking Number *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={awb}
                      onChange={(e) => setAwb(e.target.value)}
                      placeholder={
                        targetStatus === 'REPLACEMENT_PROCESSING'
                          ? 'e.g. REP-BLUEDART-889900'
                          : 'e.g. 142345892012'
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#e11938]"
                    />
                  </div>
                )}

                {targetStatus === 'REPLACED' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
                    ⚠️ <strong>Notice:</strong> Moving to <strong>REPLACED</strong> will permanently lock <code>hasBeenReplaced = true</code> on this order. The customer will not be permitted to request any further replacements.
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Timeline Note / Internal Staff Comment
                  </label>
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="e.g. Dispatched via Delhivery Surface. Package verified."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#e11938]"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={actionLoading || !targetStatus}
                    className="px-5 py-2.5 bg-[#e11938] hover:bg-[#c4142f] text-white font-bold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    {actionLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Apply Status Transition</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  {/* Cancel Order Action with Restock Protection */}
                  {allowedStatuses.includes('CANCELLED') && (
                    <button
                      type="button"
                      onClick={() => setShowCancelPrompt(true)}
                      className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl transition border border-rose-200 cursor-pointer"
                    >
                      Cancel Order & Rollback Stock
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Cancel Confirmation Prompt */}
            {showCancelPrompt && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5 text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Are you sure you want to cancel Order #{order.orderNumber}?</p>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      This action will automatically restock product inventory back to warehouse shelves and mark payment as refunded. This transition cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancelOrder}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition"
                  >
                    Yes, Confirm Cancellation & Restock
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCancelPrompt(false)}
                    className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition"
                  >
                    Nevermind
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Customer & Shipping Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" /> Customer Information
              </h4>
              <p className="font-bold text-slate-900 text-sm">{order.user?.name || order.shippingAddress?.fullName || 'Guest'}</p>
              <p className="text-slate-600">{order.user?.email || 'No email registered'}</p>
              <p className="text-slate-600">Phone: {order.shippingAddress?.phone || order.user?.phone || 'N/A'}</p>
            </div>

            {/* Shipping Address with 1-Click Copy */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 relative">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> Shipping Destination
                </h4>
                <button
                  onClick={handleCopyShippingAddress}
                  className="text-[11px] font-bold text-[#e11938] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Label'}</span>
                </button>
              </div>
              <p className="font-bold text-slate-800">{order.shippingAddress?.fullName}</p>
              <p className="text-slate-600 leading-relaxed">
                {order.shippingAddress?.street}
                {order.shippingAddress?.landmark ? `, ${order.shippingAddress.landmark}` : ''}<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - <strong className="text-slate-900">{order.shippingAddress?.pincode}</strong>
              </p>
            </div>
          </div>

          {/* 3. Items Ordered Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 font-bold uppercase tracking-wider text-[11px] text-slate-700">
              Ordered Products ({order.items?.length || 0})
            </div>
            <div className="divide-y divide-slate-100">
              {order.items?.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image || item.product?.thumbnail}
                      alt={item.title}
                      className="w-11 h-11 object-cover rounded-xl bg-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{item.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>SKU: <strong className="text-slate-700 font-mono">{item.variantSku}</strong></span>
                        {item.colorName && <span>&bull; Color: {item.colorName}</span>}
                        {item.selectedDevice && <span>&bull; Device: {item.selectedDevice}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900">₹{item.unitPrice} &times; {item.quantity}</span>
                    <p className="text-[11px] font-black text-[#e11938]">₹{item.totalPrice}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Payment & Financial Ledger */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment Authorization</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {order.paymentInfo?.status || order.paymentDetails?.status?.toUpperCase() || 'PAID'}
                </span>
                <span className="font-bold text-slate-800">{order.paymentInfo?.method || 'Prepaid Online'}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Txn: {order.paymentInfo?.transactionId || order.paymentDetails?.transactionId || 'N/A'}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Settlement</span>
              <p className="text-lg font-black text-slate-900">
                ₹{order.pricingSummary?.grandTotal || order.totalPrice || 0}
              </p>
            </div>
          </div>

          {/* 5. Chronological Order Status Timeline */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" /> Order Lifecycle Audit Timeline
            </h4>
            <div className="border-l-2 border-slate-200 ml-2 pl-4 space-y-3">
              {order.statusTimeline?.map((entry, idx) => (
                <div key={idx} className="relative text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#e11938] absolute -left-[21px] top-1 ring-4 ring-white" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{entry.status}</span>
                    <span className="text-[10px] text-slate-400">{new Date(entry.timestamp).toLocaleString('en-IN')}</span>
                  </div>
                  {entry.comment && (
                    <p className="text-slate-600 text-[11px] mt-0.5">{entry.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
