import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CartDrawer from '../components/cart/CartDrawer';
import MobileBottomNav from '../components/layout/MobileBottomNav';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-brand-red selection:text-white">
      <Navbar />
      <CartDrawer />
      <main className="flex-1 bg-white pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;
