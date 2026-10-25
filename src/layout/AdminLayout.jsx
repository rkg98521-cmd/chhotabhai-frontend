import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  ArrowLeft,
  Shield,
  Tag,
  Smartphone,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '../store/useStore';

export const AdminLayout = () => {
  const { user, isAuthenticated, logout, fetchMe } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(!user || user.role !== 'admin');

  // Route Guard: Admin Role Check with Fresh Sync
  useEffect(() => {
    let isMounted = true;

    if (!isAuthenticated) {
      navigate('/login?redirect=/admin');
      return;
    }

    if (user?.role === 'admin') {
      setChecking(false);
      return;
    }

    // Attempt to sync fresh user role from backend before redirecting
    fetchMe().then((freshUser) => {
      if (!isMounted) return;
      if (freshUser?.role !== 'admin') {
        navigate('/');
      } else {
        setChecking(false);
      }
    }).catch(() => {
      if (isMounted) navigate('/');
    });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.role, navigate, fetchMe]);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated || checking || user?.role !== 'admin') {
    return null;
  }

  const navLinks = [
    { to: '/admin', label: 'Dashboard Overview', icon: LayoutDashboard, exact: true },
    { to: '/admin/products', label: 'Catalog & SKUs', icon: Package },
    { to: '/admin/devices', label: 'Phone Compatibility', icon: Smartphone },
    { to: '/admin/offers', label: 'Offers & Banners', icon: Tag },
    { to: '/admin/orders', label: 'Prepaid Orders', icon: ShoppingCart },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-6">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/" className="text-xl font-black tracking-tight text-slate-900">
              CHHOTA<span className="text-rose-600">BHAI</span>
            </Link>
            <div className="text-[10px] tracking-widest uppercase text-rose-600 font-bold mt-1 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Admin Console
            </div>
          </div>
          {mobileSidebarOpen && (
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Footer & Logout */}
      <div className="pt-6 border-t border-slate-100 space-y-3">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Storefront View
        </Link>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Signed in as</span>
          <span className="text-xs font-bold text-slate-900 block truncate">{user?.name}</span>
          <span className="text-[10px] text-rose-600 font-mono font-medium block truncate">{user?.email}</span>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" /> Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 text-slate-800">
      {/* Mobile / Tablet Top Header Bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Open Admin Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="text-lg font-black tracking-tight text-slate-900">
            CHHOTA<span className="text-rose-600">BHAI</span>
            <span className="text-[10px] text-rose-600 font-bold ml-1.5 uppercase">Admin</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white shadow-2xs"
          >
            Storefront
          </Link>
        </div>
      </header>

      {/* Mobile Slide-over Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col flex-shrink-0 h-screen sticky top-0 shadow-xs">
        {sidebarContent}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0 max-w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

