// src/Layouts/ShopkeeperLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Dashboard/Navbar';
import Sidebar from '../components/Dashboard/Sidebar';
import Footer from '../components/Dashboard/Footer';
import { useStateContext } from '../contexts/ContextProvider';
import { ShopkeeperInventoryProvider } from '../contexts/ShopKeeperInventoryContext';
import { OrdersProvider } from '../contexts/OrdersContext';
import Agent from '../agent/agent';

const ShopkeeperLayout = () => {
  const { activeMenu } = useStateContext();

  return (
      
    <ShopkeeperInventoryProvider>
      <OrdersProvider>
      <div className="flex min-h-screen bg-main-bg dark:bg-main-dark-bg">
        <div>
          <Sidebar />
          
        </div>
        <div
          className={`flex-1 transition-all duration-500 ease-in-out ${
            activeMenu ? 'ml-72' : 'ml-0'
          }`}
        >
          <div className="fixed top-0 left-0 w-full z-40 bg-main-bg dark:bg-main-dark-bg">
            <Navbar />
          </div>

          <div className="pt-24 px-6">
            <Outlet />
          </div>

          <Footer />
        </div>
      </div>
       </OrdersProvider>
    </ShopkeeperInventoryProvider>
     
  );
};

export default ShopkeeperLayout;
