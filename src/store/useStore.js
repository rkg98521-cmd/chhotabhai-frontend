import { create } from 'zustand';
import axiosInstance from '../api/axiosInstance';

// =========================================================================
// 1. AUTH STORE
// =========================================================================
export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('chhota_user') || 'null'),
  token: localStorage.getItem('chhota_auth_token') || null,
  isAuthenticated: !!localStorage.getItem('chhota_auth_token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { user, token } = response.data.data;

      localStorage.setItem('chhota_auth_token', token);
      localStorage.setItem('chhota_user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, loading: false });

      // Automatically sync user cart on login
      useCartStore.getState().fetchCart();
      return user;
    } catch (err) {
      const msg = err.message || 'Invalid email or password';
      set({ error: msg, loading: false });
      throw err;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      const { user, token } = response.data.data;

      localStorage.setItem('chhota_auth_token', token);
      localStorage.setItem('chhota_user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, loading: false });
      useCartStore.getState().fetchCart();
      return user;
    } catch (err) {
      const msg = err.message || 'Registration failed';
      set({ error: msg, loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('chhota_auth_token');
    localStorage.removeItem('chhota_user');
    set({ user: null, token: null, isAuthenticated: false });
    useCartStore.getState().clearCart();
  },

  fetchMe: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const response = await axiosInstance.get('/auth/me');
      const user = response.data.data;
      localStorage.setItem('chhota_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch {
      get().logout();
    }
  },
}));

// =========================================================================
// 2. CART STORE (Authoritative Server Pricing)
// =========================================================================
export const useCartStore = create((set, get) => ({
  items: [],
  pricing: {
    subtotal: 0,
    totalMrp: 0,
    savings: 0,
    couponDiscount: 0,
    shippingFee: 0,
    taxAmount: 0,
    grandTotal: 0,
  },
  appliedCoupon: null,
  totalItems: 0,
  isDrawerOpen: false,
  loading: false,
  couponLoading: false,
  error: null,

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

  fetchCart: async () => {
    if (!useAuthStore.getState().isAuthenticated) return;
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get('/cart');
      const data = res.data.data;
      set({
        items: data.items || [],
        pricing: data.pricingSummary || {
          subtotal: data.totalDiscountedPrice || 0,
          totalMrp: data.totalOriginalPrice || 0,
          savings: data.totalSavings || 0,
          couponDiscount: data.appliedCoupon?.discountAmount || 0,
          shippingFee: data.shippingFee || 0,
          taxAmount: 0,
          grandTotal: data.finalPayableAmount || 0,
        },
        appliedCoupon: data.appliedCoupon || null,
        totalItems: data.totalItems || (data.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0),
        loading: false,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addToCart: async (sku, quantity = 1, productId = null, selectedDevice = null) => {
    if (!useAuthStore.getState().isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    set({ loading: true, error: null });
    try {
      let activeDevice = selectedDevice;
      if (!activeDevice) {
        try {
          const stored = localStorage.getItem('chhota_selected_device');
          if (stored) {
            const parsed = JSON.parse(stored);
            activeDevice = parsed?.model || null;
          }
        } catch {
          // ignore
        }
      }

      const payload = {
        sku,
        quantity,
        productId,
      };
      if (activeDevice) {
        payload.selectedDevice = activeDevice;
      }

      const res = await axiosInstance.post('/cart/add', payload);
      const data = res.data.data;
      set({
        items: data.items || [],
        pricing: data.pricingSummary || get().pricing,
        appliedCoupon: data.appliedCoupon || null,
        totalItems: data.totalItems || 0,
        loading: false,
        isDrawerOpen: true, // Auto open drawer to celebrate addition
      });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateQuantity: async (sku, quantity) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.put('/cart/update', { sku, quantity });
      const data = res.data.data;
      set({
        items: data.items || [],
        pricing: data.pricingSummary || get().pricing,
        appliedCoupon: data.appliedCoupon || null,
        totalItems: data.totalItems || 0,
        loading: false,
      });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  removeCartItem: async (sku) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.delete(`/cart/remove/${sku}`);
      const data = res.data.data;
      set({
        items: data.items || [],
        pricing: data.pricingSummary || get().pricing,
        appliedCoupon: data.appliedCoupon || null,
        totalItems: data.totalItems || 0,
        loading: false,
      });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  applyCoupon: async (code) => {
    set({ couponLoading: true, error: null });
    try {
      const res = await axiosInstance.post('/cart/apply-coupon', { code });
      const data = res.data.data;
      set({
        items: data.items || [],
        pricing: data.pricingSummary || get().pricing,
        appliedCoupon: data.appliedCoupon || null,
        couponLoading: false,
      });
      return data;
    } catch (err) {
      set({ error: err.message, couponLoading: false });
      throw err;
    }
  },

  removeCoupon: async () => {
    set({ couponLoading: true, error: null });
    try {
      const res = await axiosInstance.delete('/cart/remove-coupon');
      const data = res.data.data;
      set({
        items: data.items || [],
        pricing: data.pricingSummary || get().pricing,
        appliedCoupon: null,
        couponLoading: false,
      });
      return data;
    } catch (err) {
      set({ error: err.message, couponLoading: false });
      throw err;
    }
  },

  clearCart: () => {
    set({
      items: [],
      pricing: {
        subtotal: 0,
        totalMrp: 0,
        savings: 0,
        couponDiscount: 0,
        shippingFee: 0,
        taxAmount: 0,
        grandTotal: 0,
      },
      appliedCoupon: null,
      totalItems: 0,
    });
  },
}));

// =========================================================================
// 3. FILTER STORE (Device Model & Catalog Filter Sync)
// =========================================================================

export const useFilterStore = create((set) => ({
  category: '',
  selectedDevice: '',
  selectedBrand: '',
  minPrice: '',
  maxPrice: '',
  searchQuery: '',
  sortBy: 'newest',
  badge: '',

  setCategory: (category) => set({ category }),
  setSelectedDevice: (selectedDevice) => set({ selectedDevice }),
  setSelectedBrand: (selectedBrand) => set({ selectedBrand }),
  setPriceRange: (minPrice, maxPrice) => set({ minPrice, maxPrice }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSortBy: (sortBy) => set({ sortBy }),
  setBadge: (badge) => set({ badge }),

  resetFilters: () =>
    set({
      category: '',
      selectedDevice: '',
      selectedBrand: '',
      minPrice: '',
      maxPrice: '',
      searchQuery: '',
      sortBy: 'newest',
      badge: '',
    }),
}));

// Keep backward-compatible exports
export default {
  useAuthStore,
  useCartStore,
  useFilterStore,
};
