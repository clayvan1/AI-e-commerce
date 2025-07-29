// src/AppRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Auth/Login';
import SignUpPage from './pages/Auth/Signup';
import LandingContent from './components/Landing/LandingContent';
import FluidGlass from './components/FluidGlass/FluidGlass';
import ProtectedRoute from './components/AuthForm/ProtectedRoute';
import LiveKitNavigation from "./agent/Agentnav";
import AgentFloatingOrb from './agent/agent.jsx'; // Orb component
// Superadmin
import SuperadminLayout from './Layouts/SuperadminLayout';
import SuperadminDashboard from './pages/Dashboard/SuperadminDashboard';
import InventoryManagement from './pages/Dashboard/InventoryManagement';
import UserManagement from './pages/Dashboard/UserManagement';
// Shopkeeper
import ShopkeeperLayout from './Layouts/shopkeeperlayout';
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

export default function AppRoutes() {
  return (
    <>
      <Routes>
        {/* === Public Routes === */}
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
        <Route path="/Home" element={<HomePage />} />
        <Route path="/Agent" element={<Agent />} />
        <Route path="/category/:id" element={<Category />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/Newa" element={<NewArrivalsPage />} />
        <Route path="/offera" element={<OffersSeeMore />} />
        <Route path="/trendinga" element={<TrendingSeeMore />} />
        <Route path="/products/:productId" element={<ProductDetails />} />

        {/* === Superadmin Dashboard === */}
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

        {/* === Shopkeeper Dashboard === */}
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

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Always-visible Orb */}
      <AgentFloatingOrb />
    </>
  );
}
