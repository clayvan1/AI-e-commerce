import React, { useEffect, useState } from 'react';
import {
  getShopkeeperProducts,
  updateProduct,
} from '../../services/superadmin/productService';
import './Shop.css';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('myShop');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, productId: null, field: '', value: '' });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await getShopkeeperProducts();
      setProducts(res.data || []);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const filteredList = products
    .filter((p) => {
      if (activeFilter === 'myShop') {
        return p.is_published === true && p.source_product_id !== null;
      } else {
        return p.is_published === false && p.source_product_id !== null;
      }
    })
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleUpdate = async (id, field, value) => {
    const res = await updateProduct(id, { [field]: value });
    if (res.status === 200) loadProducts();
    closeModal();
  };

  const handlePublish = async (id) => {
    const res = await updateProduct(id, { is_published: true });
    if (res.status === 200) loadProducts();
  };

  const handleOfferToggle = async (product) => {
    const newPrice = prompt(`Enter new offer price (current: ${product.price}):`);
    if (!newPrice) return;
    await updateProduct(product.id, {
      old_price: product.price,
      price: parseFloat(newPrice),
      is_on_offer: true,
    });
    loadProducts();
  };

  const openModal = (id, field, value) => {
    setModal({ open: true, productId: id, field, value });
  };

  const closeModal = () => {
    setModal({ open: false, productId: null, field: '', value: '' });
  };

  return (
    <div className="product-manager-container">
      <div className="product-toolbar">
        <div className="filter-tabs">
          <button
            className={activeFilter === 'myShop' ? 'active' : ''}
            onClick={() => setActiveFilter('myShop')}
          >
            My Shop
          </button>
          <button
            className={activeFilter === 'stock' ? 'active' : ''}
            onClick={() => setActiveFilter('stock')}
          >
            Stock In
          </button>
        </div>
        <input
          type="text"
          className="search-input"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="product-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Description</th>
            <th>Price (KES)</th>
            <th>Offer</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredList.map((product) => (
            <tr key={product.id}>
              <td>
                <img
                  src={
                    product.image_url?.includes('http')
                      ? product.image_url
                      : `http://localhost:5555${product.image_url}`
                  }
                  alt={product.name}
                  className="product-img"
                  onClick={() => openModal(product.id, 'image_url', product.image_url)}
                />
              </td>
              <td onClick={() => openModal(product.id, 'name', product.name)}>
                {product.name}
              </td>
              <td onClick={() => openModal(product.id, 'description', product.description)}>
                {product.description.slice(0, 60)}...
              </td>
              <td onClick={() => openModal(product.id, 'price', product.price)}>
                KES {product.price?.toLocaleString()}
              </td>
              <td>
                {product.is_on_offer ? (
                  <span className="offer-tag">Yes</span>
                ) : (
                  <button className="offer-btn" onClick={() => handleOfferToggle(product)}>
                    Add Offer
                  </button>
                )}
              </td>
              <td>{product.category_id}</td>
              <td>
                {activeFilter === 'stock' ? (
                  <button className="publish-btn" onClick={() => handlePublish(product.id)}>
                    ✓ Add to Shop
                  </button>
                ) : (
                  <span className="stock-in-check">Published</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modal.open && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit {modal.field}</h3>
            <textarea
              className="modal-input"
              value={modal.value}
              onChange={(e) => setModal({ ...modal, value: e.target.value })}
            />
            <div className="modal-actions">
              <button onClick={closeModal}>Cancel</button>
              <button onClick={() => handleUpdate(modal.productId, modal.field, modal.value)}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
