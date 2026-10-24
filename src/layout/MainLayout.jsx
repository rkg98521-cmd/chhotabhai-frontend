import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CartDrawer from '../components/cart/CartDrawer';
import DeviceSelectorModal from '../components/common/DeviceSelectorModal';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-brand-red selection:text-white">
      <Navbar />
      <CartDrawer />
      <DeviceSelectorModal />
      <main className="flex-1 bg-white">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
