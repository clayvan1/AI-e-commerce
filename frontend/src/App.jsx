import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// --- Layout & Nav Imports ---
import Nav from './components/Shop/Nav'; // Your main navbar
import SuperadminLayout from './Layouts/SuperadminLayout';
import ShopkeeperLayout from './Layouts/shopkeeperlayout';

// --- Page & Component Imports ---
import LoginPage from './pages/Auth/Login';
import SignUpPage from './pages/Auth/Signup';
import LandingContent from './components/Landing/LandingContent';
import FluidGlass from './components/FluidGlass/FluidGlass';
import ProtectedRoute from './components/AuthForm/ProtectedRoute';
import AgentFloatingOrb from './agent/agent.jsx';
import SuperadminDashboard from './pages/Dashboard/SuperadminDashboard';
import InventoryManagement from './pages/Dashboard/InventoryManagement';
import UserManagement from './pages/Dashboard/UserManagement';
import ShopkeeperDashboard from './pages/Dashboard/ShopkeeperDashboard';
import ShopkeeperOrders from './pages/Dashboard/order';
import ShopkeeperInventory from './pages/Dashboard/ShopKeeperInventory';
import ShopkeeperAddProduct from './pages/Dashboard/Product';
import ShopkeeperStockIn from './pages/Dashboard/ShopKeeperStockIn.jsx';
import Agent from './agent/agent.jsx';
import HomePage from './Layouts/Home';
import Category from './components/Shop/Category.jsx';
import ProductDetails from './components/Shop/Productdetails.jsx';
import CheckoutPage from './components/Shop/Checkout.jsx';
import NewArrivalsPage from './components/Shop/Newa.jsx';
import OffersSeeMore from './components/Shop/OfferA.jsx';
import TrendingSeeMore from './components/Shop/TrendingA.jsx';

// ===================================================================
// 1. The Main Layout Component
// This component renders the shared navbar and an <Outlet />.
// The <Outlet /> is a placeholder where your page content will be displayed.
// ===================================================================
const MainLayout = () => {
  return (
    <>
      <Nav />
      <main>
        <Outlet />
      </main>
    </>
  );
};


// ===================================================================
// 2. Your Main App Component
// This defines the entire routing structure for your application.
// ===================================================================
export default function App() {
  return (
    <>
      <Routes>
        {/* === Routes WITHOUT the main navbar === */}
        <Route
          path="/"
          element={
            <>
              <FluidGlass
                mode="bar"
                barProps={{
                  scale: 0.15,
                  ior: 1.15,
                  thickness: 5,
                  chromaticAberration: 0.1,
                  anisotropy: 0.01,
                }}
                lensProps={{
                  scale: 0.15,
                  ior: 1.15,
                  thickness: 5,
                  chromaticAberration: 0.1,
                  anisotropy: 0.01,
                }}
                cubeProps={{}}
              />
              <LandingContent />
            </>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign" element={<SignUpPage />} />

        {/* === Main Shop Routes that USE the shared navbar === */}
        {/* This parent route renders MainLayout, which contains your Nav component. */}
        <Route element={<MainLayout />}>
          <Route path="/Home" element={<HomePage />} />
          <Route path="/category/:id" element={<Category />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/Newa" element={<NewArrivalsPage />} />
          <Route path="/offera" element={<OffersSeeMore />} />
          <Route path="/trendinga" element={<TrendingSeeMore />} />
          <Route path="/products/:productId" element={<ProductDetails />} />
          <Route path="/Agent" element={<Agent />} />
        </Route>

        {/* === Dashboard Routes (using their own separate layouts) === */}
        <Route
          path="/dashboard/superadmin"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperadminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SuperadminDashboard />} />
          <Route path="inventory" element={<InventoryManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="Agent" element={<Agent />} />
        </Route>

        <Route
          path="/dashboard/shopkeeper"
          element={
            <ProtectedRoute allowedRoles={['shopkeeper']}>
              <ShopkeeperLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ShopkeeperDashboard />} />
          <Route path="orders" element={<ShopkeeperOrders />} />
          <Route path="inventory" element={<ShopkeeperInventory />} />
          <Route path="products" element={<ShopkeeperAddProduct />} />
          <Route path="Stock" element={<ShopkeeperStockIn />} />
          <Route path="Agent" element={<Agent />} />
        </Route>

        {/* Catch-all route to redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* This component is always visible, outside of the routing changes */}
      <AgentFloatingOrb />
    </>
  );
}