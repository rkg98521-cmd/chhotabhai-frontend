import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import AdminLayout from './layout/AdminLayout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Loader from './components/Loader';

// Code-split heavy routes with React.lazy
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const OrderTrack = lazy(() => import('./pages/OrderTrack'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const Login = lazy(() => import('./pages/Login'));

// Admin Console Code-split routes
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminDevices = lazy(() => import('./pages/admin/AdminDevices'));
const AdminOffers = lazy(() => import('./pages/admin/AdminOffers'));

const SuspenseFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loader size="lg" text="Loading Experience..." />
  </div>
);

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error in UI:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto mb-4 font-black text-xl">
              !
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-xs text-slate-500 mb-6">
              An unexpected error occurred while loading this view.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-6 py-3 bg-slate-900 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const App = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          {/* Customer Storefront Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:slug" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order-success/:orderId" element={<OrderSuccess />} />
            <Route path="order-track" element={<OrderTrack />} />
            <Route path="order-track/:orderId" element={<OrderTrack />} />
            <Route path="track" element={<OrderTrack />} />
            <Route path="my-orders" element={<MyOrders />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Login />} />
          </Route>

          {/* Enterprise Admin Console Protected Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="devices" element={<AdminDevices />} />
            <Route path="offers" element={<AdminOffers />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
