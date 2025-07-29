// src/contexts/OrdersContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  fetchOrders as fetchOrdersAPI,
  updateOrderStatus as updateOrderStatusAPI,
} from '../services/superadmin/orderService';

const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // renamed fetchOrders to refreshOrders for clarity
  const refreshOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchOrdersAPI();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const updatedOrder = await updateOrderStatusAPI(orderId, newStatus);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: updatedOrder.status } : order
        )
      );
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  return (
    <OrdersContext.Provider
      value={{
        orders,
        loading,
        updateOrderStatus,
        refreshOrders, // 👈 added for manual refetch
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

// Hook for consuming the context
// eslint-disable-next-line react-refresh/only-export-components
export const useOrders = () => useContext(OrdersContext);
