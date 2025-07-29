import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Dashboard/Navbar';
import Sidebar from '../components/Dashboard/Sidebar';
import Footer from '../components/Dashboard/Footer';
import { useStateContext } from '../contexts/ContextProvider';
import SuperadminContextProvider from '../contexts/SuperadminContextProvider';

const SuperadminLayout = () => {
  const { activeMenu } = useStateContext();

  return (
      <SuperadminContextProvider>
      <div className="flex min-h-screen bg-main-bg dark:bg-main-dark-bg">
        {/* Sidebar */}
        <div>
          <Sidebar />
        </div>

        {/* Main content area */}
        <div
          className={`flex-1 transition-all duration-500 ease-in-out ${
            activeMenu ? 'ml-72' : 'ml-0'
          }`}
        >
          {/* Navbar */}
          <div className="fixed top-0 left-0 w-full z-40 bg-main-bg dark:bg-main-dark-bg">
            <Navbar />
          </div>
           
          {/* Page Content */}
          <div className="pt-24 px-6">
            <Outlet />
          </div>

          {/* Footer */}
          <Footer />
        </div>

      </div>
       </SuperadminContextProvider>
    
  );
};

export default SuperadminLayout;
