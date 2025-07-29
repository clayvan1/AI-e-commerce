import instance from '../../utils/axiosInstance'; // Adjust path if needed

// ✅ Fetch all orders (shopkeeper sees all, buyer sees own)
export const fetchOrders = async () => {
  try {
    const response = await instance.get('/orders');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ✅ Fetch a single order by ID
export const fetchOrderById = async (orderId) => {
  try {
    const response = await instance.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ✅ Create a new order (buyers only)
export const createOrder = async (orderData) => {
  try {
    const response = await instance.post('/orders', orderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ✅ Update order status (shopkeeper: "shipped", "delivered")
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await instance.put(`/orders/${orderId}/status`, {
      status: newStatus,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ✅ Delete an order (admin or shopkeeper)
export const deleteOrder = async (orderId) => {
  try {
    const response = await instance.delete(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
