import React, { createContext, useContext, useState, useEffect } from 'react';
import { getGlobalProducts } from '../services/superadmin/productService';

const GlobalInventoryContext = createContext();

export const GlobalInventoryProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false); // Cache check
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getGlobalProducts();
      const globalOnly = res.data.filter(p => p.shop_keeper_id === null);
      setProducts(globalOnly);
      setLoaded(true);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loaded) fetchProducts(); // Avoid re-fetch if already loaded
  }, [loaded]);

  return (
    <GlobalInventoryContext.Provider
      value={{ products, loading, error, fetchProducts, setProducts, loaded }}
    >
      {children}
    </GlobalInventoryContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useGlobalInventory = () => useContext(GlobalInventoryContext);
