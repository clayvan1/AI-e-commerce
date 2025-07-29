import React, { useState, useEffect } from 'react';
import './Dash.css';
import { useGlobalInventory } from '../../contexts/GlobalInventorycontext';
import {
  createGlobalProduct,
  getAllCategories,
  createCategory,
} from '../../services/superadmin/productService';

const CategoryModal = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => setImage(e.target.files[0]);

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("Category name is required");
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    if (image) formData.append('image', image);
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-editor">
        <h3>Create New Category</h3>
        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-input"
        />
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {image && (
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            style={{ maxWidth: '100px', marginTop: '10px', borderRadius: '8px' }}
          />
        )}
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSubmit}>Save</button>
        </div>
      </div>
    </div>
  );
};

const initialForm = {
  name: '',
  description: '',
  price: '',
  old_price: '',
  is_on_offer: false,
  category_id: '',
  quantity: '',
  images: [],
};

const SuperadminInventoryDashboard = () => {
  const { products, setProducts, loading, refreshProducts } = useGlobalInventory();
  const [formData, setFormData] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await getAllCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (droppedFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...droppedFiles],
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === 'images') {
      setFormData({ ...formData, images: Array.from(files) });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = new FormData();

    for (let key in formData) {
      if (key === "images") {
        formData.images.forEach((file) => payload.append("images", file));
      } else {
        payload.append(key, formData[key]);
      }
    }

    try {
      const res = await createGlobalProduct(payload);
      setProducts((prev) => [...prev, res.data]);
      setFormData(initialForm);
      document.getElementById('hidden-file-input').value = '';
    } catch (err) {
      console.error('Failed to add product:', err);
      alert('Failed to add product.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="inventory-dashboard">
      <form className="product-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <h2>Add New Product</h2>
        <div className="form-grid">
          <input
            type="text"
            name="name"
            value={formData.name}
            placeholder="Name"
            className="form-input"
            onChange={handleChange}
          />
          <textarea
            name="description"
            value={formData.description}
            placeholder="Description"
            className="form-input"
            onChange={handleChange}
          />
          <div className="form-input with-button">
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select Category</option>
              {Array.isArray(categories) &&
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
            <button type="button" onClick={() => setShowCategoryModal(true)}>
              + Create Category
            </button>
          </div>

          <input
            type="number"
            name="price"
            value={formData.price}
            placeholder="Current Price"
            className="form-input"
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="old_price"
            value={formData.old_price}
            placeholder="Old Price (optional)"
            className="form-input"
            onChange={handleChange}
          />

          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            placeholder="Quantity"
            className="form-input"
            onChange={handleChange}
          />

          <label className="form-input checkbox-label">
            <input
              type="checkbox"
              name="is_on_offer"
              checked={formData.is_on_offer}
              onChange={handleChange}
            />
            On Offer?
          </label>

          <div
            className={`drop-zone ${dragging ? 'drag-over' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('hidden-file-input').click()}
          >
            {formData.images.length > 0 ? (
              <div className="image-preview-group">
                {formData.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={URL.createObjectURL(img)}
                    alt={`Preview ${idx + 1}`}
                    className="image-preview"
                    style={{ maxWidth: '80px', borderRadius: '8px', marginRight: '8px' }}
                  />
                ))}
              </div>
            ) : (
              <p>Drag & Drop or Click to Upload Image(s)</p>
            )}
            <input
              id="hidden-file-input"
              type="file"
              name="images"
              accept="image/*"
              multiple
              onChange={handleChange}
              hidden
            />
          </div>
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Product'}
        </button>
      </form>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={refreshProducts} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="scrollable-container">
        {loading ? (
          <p>Loading inventory...</p>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <img
                  src={
  product.images && product.images.length > 0
    ? `http://localhost:5555${product.images[0]}`
    : 'https://via.placeholder.com/80'
}

                  alt={product.name}
                  className="product-image-circle"
                />
                <h3>{product.name}</h3>
                <p className="category">Category ID: {product.category_id}</p>
                <p>{product.description}</p>
                {product.is_on_offer ? (
                  <p>
                    <strong>KES {product.price.toLocaleString()}</strong>{' '}
                    <span style={{ textDecoration: 'line-through', color: 'gray' }}>
                      KES {product.old_price?.toLocaleString()}
                    </span>
                  </p>
                ) : (
                  <p>
                    <strong>KES {product.price.toLocaleString()}</strong>
                  </p>
                )}
                <p>Stock: <strong>{product.quantity}</strong></p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCategoryModal && (
        <CategoryModal
          onClose={() => setShowCategoryModal(false)}
          onSave={async (formData) => {
            try {
              await createCategory(formData);
              await loadCategories();
              setShowCategoryModal(false);
            } catch (err) {
              alert('Failed to create category');
              console.error(err);
            }
          }}
        />
      )}
    </div>
  );
};

export default SuperadminInventoryDashboard;
