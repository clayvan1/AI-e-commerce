import axios from '../../utils/axiosInstance'; // ✅ Handles base URL and token

// ✅ Superadmin - Create a new global product
export const createGlobalProduct = async (productData) => {
  return await axios.post('/admin/products', productData);
};

// ✅ Superadmin - Get all global products
export const getGlobalProducts = async () => {
  return await axios.get('/admin/products');
};

// 🛠️ Shopkeeper - Stock in product from global inventory
export const stockInProduct = async (product_id, quantity) => {
  return await axios.post('/inventory/stock-in', { product_id, quantity });
};

// 🧺 Shopkeeper - Get products that belong to the current shopkeeper
export const getShopkeeperProducts = async () => {
  return await axios.get('/inventory');
};

// 🔁 Shopkeeper - Update a product
export const updateProduct = async (product_id, data) => {
  return await axios.put(`/products/${product_id}`, data);
};

// ❌ Shopkeeper - Delete a product
export const deleteProduct = async (product_id) => {
  return await axios.delete(`/products/${product_id}`);
};

// 🛍️ Public - Buyer fetches shopkeeper products
export const getBuyerProducts = async () => {
  return await axios.get('/products');
};

// 🆕 ✅ Shopkeeper - Get global products available for stock-in
export const getGlobalInventory = async () => {
  return await axios.get('/inventory/global');
};

//
// ========== CATEGORY APIs ==========
//

// ✅ Get all categories
export const getAllCategories = async () => {
  return await axios.get('/categories');
};

// ✅ Create new category (Superadmin only)
export const createCategory = async (categoryData) => {
  return await axios.post('/categories', categoryData);
};

// ✅ Get single category by ID (optional usage)
export const getCategoryById = async (categoryId) => {
  return await axios.get(`/categories/${categoryId}`);
};

// ✅ Get products in a specific category (optional usage)
export const getProductsInCategory = async (categoryId) => {
  return await axios.get(`/categories/${categoryId}/products`);
};
export const getStockedProductsInCategory = (categoryId) => {
  return axios.get(`/products/category/${categoryId}`);
};
// services/superadmin/productService.js
export const getProductById = async (productId) => {
  const res = await axios.get(`/products/${productId}`);
  return res;
};
export const getOfferProducts = () => axios.get('/products/offers');
// 🎯 Public - Get new arrival products
export const getNewArrivalProducts = async () => {
  return await axios.get('/products/new');
};
// 🔥 Public - Get trending products
export const getTrendingProducts = async () => {
  return await axios.get('/products/trending');
};
