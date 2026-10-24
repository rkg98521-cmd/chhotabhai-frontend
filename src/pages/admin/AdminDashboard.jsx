import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import Loader from '../../components/Loader';

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        axiosInstance.get('/admin/analytics'),
        axiosInstance.get('/admin/orders'),
      ]);
      setAnalytics(analyticsRes.data.data);
      setOrders(ordersRes.data.data || []);
    } catch (err) {
      console.error('Admin Dashboard Load:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <Loader text="Loading Enterprise Analytics..." />;

  const outOfStockAlerts = analytics?.outOfStockAlerts || [];

  return (
    <div className="space-y-8 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900">
            Enterprise <span className="text-rose-600">Overview</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Live revenue settlement, order metrics & inventory health</p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-rose-500 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-rose-600" /> Refresh Metrics
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Gross Revenue */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Gross Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-4">
            ₹{(analytics?.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 100% Verified Settled
          </span>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Total Orders</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-4">
            {analytics?.totalOrders || orders.length}
          </div>
          <span className="text-[11px] text-slate-400 font-bold mt-1.5 block">Pipeline orders</span>
        </div>

        {/* Active Products */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Catalog SKUs</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-4">
            {analytics?.totalProducts || 0}
          </div>
          <span className="text-[11px] text-blue-600 font-bold mt-1.5 block">Active Catalog Drops</span>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Low Stock SKUs</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-4">
            {outOfStockAlerts.length}
          </div>
          <span className="text-[11px] text-amber-600 font-bold mt-1.5 block">
            {outOfStockAlerts.length > 0 ? 'Requires Stock Replenish' : 'Healthy Inventory'}
          </span>
        </div>
      </div>

      {/* Inventory Low-Stock Alert Banner */}
      {outOfStockAlerts.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" /> Immediate Inventory Replenishment Alert
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {outOfStockAlerts.map((item, i) => (
              <div key={i} className="bg-white p-3.5 rounded-2xl border border-amber-200 text-xs shadow-sm">
                <span className="font-bold text-slate-900 block truncate">{item.title}</span>
                <span className="text-[10px] text-slate-500 block">Brand: {item.brand}</span>
                <div className="mt-2 space-y-1">
                  {item.lowVariants?.map((v, idx) => (
                    <span key={idx} className="text-[11px] text-amber-700 block font-mono">
                      • {v.sku} ({v.color}): <strong>{v.stock} left</strong>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Pipeline Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Recent Customer Orders
          </h2>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-rose-600 uppercase tracking-wider hover:underline flex items-center gap-1"
          >
            Manage All Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.slice(0, 6).map((ord) => (
                <tr key={ord._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {ord.orderNumber || ord._id.slice(-6)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{ord.user?.name || 'Customer'}</span>
                    <span className="text-[10px] text-slate-400">{ord.user?.email}</span>
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900">
                    ₹{(ord.pricingSummary?.grandTotal || ord.totalPrice)?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-medium">
                      {ord.paymentInfo?.method || ord.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ord.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ord.orderStatus === 'SHIPPED'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : ord.orderStatus === 'PROCESSING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}
                    >
                      {ord.orderStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to="/admin/orders"
                      className="px-3 py-1 bg-slate-100 border border-slate-200 hover:border-rose-500 hover:text-rose-600 text-slate-700 text-[11px] font-bold rounded-lg transition-colors"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
