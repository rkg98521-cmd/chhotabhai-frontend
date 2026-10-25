/**
 * @file OrderStatus.jsx
 * @description Secure Asynchronous Payment Reconciliation & Polling Screen.
 * Prevents client-side spoofing by actively verifying the final database state
 * confirmed by Gateway Webhooks or Server verification.
 */

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useCartStore } from '../store/useStore';

export const OrderStatus = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCartStore();

  const [status, setStatus] = useState('VERIFYING'); // 'VERIFYING' | 'SUCCESS' | 'FAILED' | 'TIMEOUT'
  const [order, setOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [pollCount, setPollCount] = useState(0);

  const verificationAttempted = useRef(false);
  const maxPolls = 15; // 15 attempts * 2s = 30 seconds max polling

  // 1. Trigger background server-side verification if redirect params are present
  useEffect(() => {
    const gatewayPaymentId = searchParams.get('payment_id');
    const gatewayOrderId = searchParams.get('order_id');
    const gatewaySignature = searchParams.get('signature');

    if (!verificationAttempted.current && gatewayPaymentId && gatewayOrderId) {
      verificationAttempted.current = true;
      axiosInstance
        .post('/payments/verify', {
          gatewayOrderId,
          gatewayPaymentId,
          gatewaySignature,
        })
        .catch((err) => {
          console.warn('[OrderStatus] Direct verification returned status:', err.message);
          // Non-fatal: Webhook or polling will reconcile regardless
        });
    }
  }, [searchParams]);

  // 2. Secure Polling Loop to check authoritative Database status
  useEffect(() => {
    if (!orderId) return;

    let isMounted = true;
    let timerId = null;

    const checkOrderStatus = async () => {
      try {
        const res = await axiosInstance.get(`/orders/${orderId}`);
        const currentOrder = res.data.data;

        if (!isMounted) return;
        setOrder(currentOrder);

        const normalizedStatus = (currentOrder.orderStatus || '').toUpperCase();
        const paymentStatus = (currentOrder.paymentInfo?.status || currentOrder.paymentDetails?.status || '').toUpperCase();

        const isPaid =
          paymentStatus === 'PAID' ||
          ['CONFIRMED', 'PROCESSING', 'DELIVERED', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(normalizedStatus);

        const isFailed = paymentStatus === 'FAILED' || normalizedStatus === 'CANCELLED';

        if (isPaid) {
          setStatus('SUCCESS');
          clearCart(); // Clean cart state upon certified payment confirmation
          return;
        }

        if (isFailed) {
          setStatus('FAILED');
          setErrorMessage('Payment was declined or rejected by the issuing bank.');
          return;
        }

        // Continue polling if not yet terminal
        setPollCount((prev) => {
          if (prev >= maxPolls) {
            setStatus('TIMEOUT');
            return prev;
          }
          timerId = setTimeout(checkOrderStatus, 2000);
          return prev + 1;
        });
      } catch (err) {
        if (!isMounted) return;
        setPollCount((prev) => {
          if (prev >= maxPolls) {
            setStatus('TIMEOUT');
            return prev;
          }
          timerId = setTimeout(checkOrderStatus, 2000);
          return prev + 1;
        });
      }
    };

    checkOrderStatus();

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [orderId, clearCart]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 bg-[#f8fafc]">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-[0_10px_35px_rgb(0,0,0,0.05)] p-7 sm:p-10 text-center space-y-6">

        {/* Brand Header */}
        <div className="space-y-1">
          <span className="text-xl font-black text-slate-900 tracking-tight font-sans">
            Chhota<span className="text-[#e11938]">Bhai</span>
          </span>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Payment Verification Gateway
          </p>
        </div>

        {/* STATUS: VERIFYING */}
        {status === 'VERIFYING' && (
          <div className="space-y-5 py-4">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-[#e11938] animate-spin" />
              <ShieldCheck className="w-8 h-8 text-[#e11938] absolute" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-black text-slate-900">
                Verifying Transaction With Bank...
              </h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Please do not refresh or close this browser window. We are securing authorization and locking your inventory.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400 bg-slate-50 py-2 rounded-xl border border-slate-100">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Authoritative verification pass: {pollCount} of {maxPolls}</span>
            </div>
          </div>
        )}

        {/* STATUS: SUCCESS */}
        {status === 'SUCCESS' && (
          <div className="space-y-5 py-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900">
                Payment Confirmed & Secured!
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Your payment was successfully captured. Order{' '}
                <span className="font-bold text-slate-900">
                  #{order?.orderNumber || orderId?.slice(-8)}
                </span>{' '}
                is confirmed and being routed to fulfillment.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate(`/order-success/${order?._id || orderId}`, { state: { order } })}
                className="w-full sm:w-auto px-6 py-3 bg-[#e11938] hover:bg-[#c4142f] text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                View Order Receipt <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STATUS: FAILED */}
        {status === 'FAILED' && (
          <div className="space-y-5 py-4 animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-xs">
              <XCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900">
                Payment Was Not Completed
              </h2>
              <p className="text-xs text-rose-600 font-medium max-w-sm mx-auto leading-relaxed">
                {errorMessage || 'The transaction failed or was cancelled.'}
              </p>
              <p className="text-[11px] text-slate-400">
                No money was deducted. If deducted by your bank, it will be automatically refunded within 3-5 business days.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/checkout"
                className="w-full sm:w-auto px-6 py-3 bg-[#e11938] hover:bg-[#c4142f] text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2"
              >
                Try Again
              </Link>
              <Link
                to="/cart"
                className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Back to Cart
              </Link>
            </div>
          </div>
        )}

        {/* STATUS: TIMEOUT (Delayed reconciliation) */}
        {status === 'TIMEOUT' && (
          <div className="space-y-5 py-4 animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
              <Clock className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900">
                Payment Under Reconciliation
              </h2>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Your payment confirmation is taking longer than expected to synchronize with your bank network. Our automated reconciliation engine will confirm your order within minutes.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/my-orders"
                className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-sm"
              >
                Check My Orders
              </Link>
            </div>
          </div>
        )}

        {/* SSL Trust note */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Authoritative Database Verification &bull; Anti-Spoofing Protected</span>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;
