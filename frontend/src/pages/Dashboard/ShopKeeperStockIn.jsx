// src/pages/Dashboard/ShopkeeperStockIn.jsx
import React, { useState } from 'react';
import { useShopkeeperInventory } from '../../contexts/ShopKeeperInventoryContext';
import { stockInProduct } from '../../services/superadmin/productService';
import './ShopkeeperStockIn.css';

const ShopkeeperStockIn = () => {
  const { products, refreshProducts, loading } = useShopkeeperInventory();
  const [quantities, setQuantities] = useState({});
  const [stocked, setStocked] = useState([]);
  const [search, setSearch] = useState('');

  const handleQuantityChange = (e, productId) => {
    const value = e.target.value;
    setQuantities(prev => ({ ...prev, [productId]: value }));
  };

  const handleStockIn = async (productId) => {
    const quantity = quantities[productId];
    if (!quantity || parseInt(quantity) <= 0) return alert('Enter a valid quantity');

    try {
      await stockInProduct(productId, quantity);
      setStocked(prev => [...prev, productId]);
      setQuantities(prev => ({ ...prev, [productId]: '' }));
      refreshProducts(); // Optional: Refresh after stock-in
    } catch (err) {
      console.error('Stock-in failed:', err);
      alert('Failed to stock in product');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="stock-in-page">
      <h2>Stock In from Global Inventory</h2>

      <input
        type="text"
        placeholder="Search global products..."
        className="search-box"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <img
                src={
                  product.image_url
                    ? `http://localhost:5555/static/uploads/${product.image_url.split('/').pop()}`
                    : 'https://via.placeholder.com/80'
                }
                alt={product.name}
              />
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <strong>KES {product.price}</strong>
              <p>Available: <strong>{product.quantity}</strong></p>

              <div className="stock-controls">
                <input
                  type="number"
                  min="1"
                  className="quantity-input"
                  placeholder="Quantity"
                  value={quantities[product.id] || ''}
                  onChange={(e) => handleQuantityChange(e, product.id)}
                />

                {stocked.includes(product.id) ? (
                  <button className="stocked" disabled>✔ Stocked</button>
                ) : (
                  <button onClick={() => handleStockIn(product.id)}>
                    ➕ Stock In
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopkeeperStockIn;
