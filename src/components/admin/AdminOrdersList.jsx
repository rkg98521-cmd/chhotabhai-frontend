/**
 * @file AdminOrdersList.jsx
 * @description Enterprise Admin Orders Data Table Component.
 * Supports real-time filtering, search, status badge tabs, and server-side pagination.
 */

import React from 'react';
import {
  Search,
  Filter,
  Eye,
  Calendar,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ShoppingBag,
  ExternalLink,
  Truck,
} from 'lucide-react';

const STATUS_COLORS = {
  PAYMENT_PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-blue-50 text-blue-800 border-blue-200',
  PROCESSING: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  SHIPPED: 'bg-purple-50 text-purple-800 border-purple-200',
  OUT_FOR_DELIVERY: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  DELIVERED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-800 border-rose-200',
  REPLACEMENT_REQUESTED: 'bg-rose-50 text-rose-700 border-rose-300 font-extrabold',
  REPLACEMENT_PROCESSING: 'bg-blue-50 text-blue-700 border-blue-300 font-extrabold',
  REPLACED: 'bg-teal-50 text-teal-800 border-teal-300 font-extrabold',
};

const PAYMENT_STATUS_COLORS = {
  PAID: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  PENDING: 'text-amber-700 bg-amber-50 border-amber-200',
  FAILED: 'text-rose-700 bg-rose-50 border-rose-200',
  REFUNDED: 'text-slate-700 bg-slate-100 border-slate-200',
};

export const AdminOrdersList = ({
  orders = [],
  loading = false,
  pagination = {},
  statusCounts = {},
  activeStatus = 'ALL',
  searchQuery = '',
  paymentFilter = 'ALL',
  onStatusChange,
  onSearchChange,
  onPaymentFilterChange,
  onPageChange,
  onSelectOrder,
}) => {
  const tabs = [
    { key: 'ALL', label: 'All Orders' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'DELIVERED', label: 'Delivered' },
    { key: 'REPLACEMENT_REQUESTED', label: 'Replacements' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Header & Quick Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {tabs.map((tab) => {
          const count = statusCounts[tab.key] || 0;
          const isActive = activeStatus === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onStatusChange(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Search & Secondary Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Order #, Name, Phone..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-900 outline-none focus:border-[#e11938] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Payment:
          </label>
          <select
            value={paymentFilter}
            onChange={(e) => onPaymentFilterChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#e11938]"
          >
            <option value="ALL">All Payments</option>
            <option value="PAID">Paid Only</option>
            <option value="PENDING">Pending Only</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* 3. Orders Responsive Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-[#e11938] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading Orders...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-600">No orders found.</p>
                    <p className="text-[11px] text-slate-400">Try modifying your search or filter criteria.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusClass = STATUS_COLORS[order.orderStatus] || 'bg-slate-50 text-slate-700 border-slate-200';
                  const paymentStatus = order.paymentInfo?.status || order.paymentDetails?.status?.toUpperCase() || 'PENDING';
                  const paymentClass = PAYMENT_STATUS_COLORS[paymentStatus] || 'bg-slate-50 text-slate-700';

                  return (
                    <tr
                      key={order._id}
                      onClick={() => onSelectOrder(order)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Order Number & Timestamp */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900 group-hover:text-[#e11938] transition-colors">
                          #{order.orderNumber}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">
                          {order.shippingAddress?.fullName || order.user?.name || 'Guest'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {order.shippingAddress?.phone || order.user?.phone || 'No phone'}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          {order.shippingAddress?.city}, {order.shippingAddress?.state}
                        </div>
                      </td>

                      {/* Items Preview */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">{order.items?.length || 0}</span>
                          <span className="text-slate-400 text-[11px]">items</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                          {order.items?.[0]?.title} {order.items?.length > 1 ? `+${order.items.length - 1} more` : ''}
                        </div>
                      </td>

                      {/* Payment Status Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${paymentClass}`}>
                          {paymentStatus}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {order.paymentInfo?.method || 'Prepaid'}
                        </div>
                      </td>

                      {/* Fulfillment Status Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusClass}`}>
                          {order.orderStatus}
                        </span>
                        {order.trackingDetails?.trackingNumber && (
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                            <Truck className="w-3 h-3 text-[#e11938]" />
                            <span>{order.trackingDetails.trackingNumber}</span>
                          </div>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 text-xs">
                        ₹{order.pricingSummary?.grandTotal || order.totalPrice || 0}
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectOrder(order);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1 mx-auto cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Pagination Controls Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs">
          <span className="text-slate-500">
            Showing Page <span className="font-bold text-slate-800">{pagination.currentPage || 1}</span> of{' '}
            <span className="font-bold text-slate-800">{pagination.totalPages || 1}</span> ({pagination.totalOrders || 0} total orders)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange((pagination.currentPage || 1) - 1)}
              disabled={!pagination.hasPrevPage}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button
              onClick={() => onPageChange((pagination.currentPage || 1) + 1)}
              disabled={!pagination.hasNextPage}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersList;
