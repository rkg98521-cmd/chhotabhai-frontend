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
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useAuthStore } from '../store/useStore';
import Loader from '../components/Loader';

export const MyOrders = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/my-orders');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/orders/my-orders');
        setOrders(res.data.data || []);
      } catch (err) {
        console.error('Fetch my-orders error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate]);

  if (loading) return <Loader text="Loading Your Order History..." />;

  const getStatusBadge = (status) => {
    const s = (status || 'PLACED').toUpperCase();
    if (s === 'DELIVERED') {
      return (
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
          Delivered
        </span>
      );
    }
    if (s === 'SHIPPED' || s === 'OUT_FOR_DELIVERY') {
      return (
        <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
          In Transit
        </span>
      );
    }
    if (s === 'PROCESSING' || s === 'CONFIRMED') {
      return (
        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
          {s}
        </span>
      );
    }
    if (s === 'CANCELLED') {
      return (
        <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
          Cancelled
        </span>
      );
    }
    return (
      <span className="bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
        Placed
      </span>
    );
  };

  return (
    <div className="bg-slate-50/50 min-h-[85vh] py-8 sm:py-12">
      <div className="cb-container max-w-5xl space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200 pb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900">
              My <span className="text-rose-600">Orders</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track fulfillments, download receipts, and view previous orders
            </p>
          </div>
          <Link
            to="/shop"
            className="text-xs font-bold text-rose-600 uppercase tracking-wider hover:underline hidden sm:inline"
          >
            Explore Catalog →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-4 shadow-sm">
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
          <div className="space-y-6">
            {orders.map((ord) => {
              const items = ord.items || ord.orderItems || [];
              const grandTotal = ord.pricingSummary?.grandTotal || ord.totalPrice || 0;

              return (
                <div
                  key={ord._id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
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
                          dateStyle: 'medium',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(ord.orderStatus)}
                      <span className="text-base font-black text-slate-900">₹{grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <span className="text-[11px] text-slate-500">
                      Payment: <strong className="text-slate-900">{ord.paymentInfo?.method || ord.paymentMethod}</strong> (
                      {ord.paymentInfo?.status || (ord.isPaid ? 'PAID' : 'PENDING')})
                    </span>

                    <Link
                      to={`/order-success/${ord._id}`}
                      state={{ order: ord }}
                      className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                    >
                      Track Order & Receipt <ArrowRight className="w-3.5 h-3.5 text-rose-600" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
