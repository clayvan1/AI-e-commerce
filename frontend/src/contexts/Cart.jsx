import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      const parsed = saved ? JSON.parse(saved) : [];
      console.log('[Cart Init] Loaded from localStorage:', parsed);
      return parsed;
    } catch (error) {
      console.error('[Cart Init] Failed to parse cart from localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
      console.log('[Cart Persist] Saved to localStorage:', cartItems);
    } catch (error) {
      console.error('[Cart Persist] Failed to save cart to localStorage:', error);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      let updated;
      if (existing) {
        updated = prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        console.log(`[Cart Add] Increased quantity of ${product.title}`);
      } else {
        updated = [...prev, { ...product, quantity }];
        console.log(`[Cart Add] Added new product: ${product.title}`);
      }
      return updated;
    });
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems(prev => {
      const updated = prev.map(item =>
        item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      );
      console.log(`[Cart Update] Product ${productId} quantity set to`, quantity);
      return updated;
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => {
      const updated = prev.filter(item => item.id !== productId);
      console.log(`[Cart Remove] Removed product ${productId}`);
      return updated;
    });
  };

  const clearCart = () => {
    console.log('[Cart Clear] Cart cleared');
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
