// src/contexts/ShopkeeperInventoryContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getGlobalInventory } from '../services/superadmin/productService'; // ✅ Correct API for shopkeeper

const ShopkeeperInventoryContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useShopkeeperInventory = () => useContext(ShopkeeperInventoryContext);

export const ShopkeeperInventoryProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshProducts = async () => {
    setLoading(true);
    try {
      const res = await getGlobalInventory(); // ✅ Use shopkeeper-accessible global products
      setProducts(res.data);
    } catch (err) {
      console.error('[Shopkeeper] Failed to fetch global inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  return (
    <ShopkeeperInventoryContext.Provider value={{ products, setProducts, loading, refreshProducts }}>
      {children}
    </ShopkeeperInventoryContext.Provider>
  );
};
