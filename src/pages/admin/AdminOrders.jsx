/**
 * @file AdminOrders.jsx
 * @description Enterprise Order Management System (OMS) Page.
 * Orchestrates AdminOrdersList and AdminOrderDetail with Optimistic UI updates
 * and auto-dismissing toast feedback.
 */

import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { AdminOrdersList } from '../../components/admin/AdminOrdersList';
import { AdminOrderDetail } from '../../components/admin/AdminOrderDetail';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters & Pagination State
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [statusCounts, setStatusCounts] = useState({});

  // Selected Order for Inspection Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
      });

      if (activeStatus && activeStatus !== 'ALL') {
        params.append('status', activeStatus);
      }
      if (paymentFilter && paymentFilter !== 'ALL') {
        params.append('paymentStatus', paymentFilter);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const res = await axiosInstance.get(`/admin/orders?${params.toString()}`);
      const data = res.data.data;

      setOrders(data.orders || []);
      setPagination(data.pagination || {});
      setStatusCounts(data.counts || {});
    } catch (err) {
      console.error('Failed to load admin orders:', err);
      showToast('error', err.response?.data?.message || err.message || 'Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  }, [activeStatus, paymentFilter, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(1);
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  /**
   * Optimistic UI Order Fulfillment Status Updater
   */
  const handleUpdateStatus = async ({ orderId, status, courierCompany, trackingNumber, trackingUrl, comment }) => {
    setActionLoading(true);

    // Save snapshot for rollback if API rejects
    const previousOrders = [...orders];
    const previousSelectedOrder = selectedOrder ? { ...selectedOrder } : null;

    // 1. Optimistic local mutation
    const optimisticUpdatedOrders = orders.map((ord) => {
      if (ord._id === orderId) {
        return {
          ...ord,
          orderStatus: status,
          trackingDetails: {
            ...ord.trackingDetails,
            courierCompany: courierCompany || ord.trackingDetails?.courierCompany,
            trackingNumber: trackingNumber || ord.trackingDetails?.trackingNumber,
            trackingUrl: trackingUrl || ord.trackingDetails?.trackingUrl,
          },
        };
      }
      return ord;
    });

    setOrders(optimisticUpdatedOrders);
    if (selectedOrder && selectedOrder._id === orderId) {
      setSelectedOrder((prev) => ({
        ...prev,
        orderStatus: status,
        trackingDetails: {
          ...prev.trackingDetails,
          courierCompany: courierCompany || prev.trackingDetails?.courierCompany,
          trackingNumber: trackingNumber || prev.trackingDetails?.trackingNumber,
          trackingUrl: trackingUrl || prev.trackingDetails?.trackingUrl,
        },
      }));
    }

    try {
      // 2. Perform authoritative API request
      const res = await axiosInstance.patch(`/admin/orders/${orderId}/status`, {
        status,
        courierCompany,
        trackingNumber,
        trackingUrl,
        comment,
      });

      const updatedOrder = res.data.data;

      // 3. Confirm with server response
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updatedOrder : o)));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(updatedOrder);
      }

      showToast('success', `Order #${updatedOrder.orderNumber} transitioned to ${status} successfully.`);
    } catch (err) {
      // 4. Rollback on failure (e.g. Invalid state machine jump or inventory failure)
      setOrders(previousOrders);
      if (previousSelectedOrder) setSelectedOrder(previousSelectedOrder);

      const errorMsg =
        err.response?.data?.message || err.message || 'State machine transition rejected by server.';
      showToast('error', errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectOrder = async (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);

    // Fetch authoritative order details with allowedNextStatuses
    try {
      const res = await axiosInstance.get(`/admin/orders/${order._id}`);
      setSelectedOrder(res.data.data);
    } catch (err) {
      console.warn('Failed to fetch full order details:', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Container */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-xl border flex items-start gap-3 max-w-md animate-in slide-in-from-top-3 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs font-semibold leading-relaxed">
            {toast.message}
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Order Fulfillment & OMS
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage live orders, enforce fulfillment state machines, assign couriers, and inspect customer audit trails.
          </p>
        </div>
      </div>

      {/* Orders Data Table */}
      <AdminOrdersList
        orders={orders}
        loading={loading}
        pagination={pagination}
        statusCounts={statusCounts}
        activeStatus={activeStatus}
        searchQuery={searchQuery}
        paymentFilter={paymentFilter}
        onStatusChange={(newStatus) => {
          setActiveStatus(newStatus);
          setPagination((prev) => ({ ...prev, currentPage: 1 }));
        }}
        onSearchChange={setSearchQuery}
        onPaymentFilterChange={(val) => {
          setPaymentFilter(val);
          setPagination((prev) => ({ ...prev, currentPage: 1 }));
        }}
        onPageChange={(page) => fetchOrders(page)}
        onSelectOrder={handleSelectOrder}
      />

      {/* Order Detail & Fulfillment Action Modal */}
      <AdminOrderDetail
        order={selectedOrder}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedOrder(null);
        }}
        onUpdateStatus={handleUpdateStatus}
        actionLoading={actionLoading}
      />
    </div>
  );
};

export default AdminOrders;
