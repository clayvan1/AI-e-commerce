import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNewArrivalProducts } from '../../services/superadmin/productService';
import Navbar from './Nav';
import Masonry from './Masonry';
import TrueFocus from './TrueFocus';
import './Category.css';

const NewArrivalsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortOption, setSortOption] = useState('');
  const [onlyOffers, setOnlyOffers] = useState(false);
  const navigate = useNavigate();

  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5555';

  const getImageUrl = (p) => {
    if (Array.isArray(p.images) && p.images.length > 0) {
      const first = p.images[0];
      return first.image_url?.startsWith('http') ? first.image_url : `${baseURL}${first.image_url}`;
    }
    if (p.image_url) {
      return p.image_url.startsWith('http') ? p.image_url : `${baseURL}${p.image_url}`;
    }
    return 'https://via.placeholder.com/350';
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getNewArrivalProducts();
        const mapped = res.data.map((p, index) => ({
          id: p.id,
          img: getImageUrl(p),
          url: `/products/${p.id}`, // ✅ updated to match route
          title: p.name,
          description: p.description,
          price: p.price,
          old_price: p.old_price,
          is_on_offer: p.is_on_offer,
          height: 350 + (index % 3) * 40,
        }));
        setProducts(mapped);
        setFilteredProducts(mapped);
      } catch (err) {
        console.error("Failed to fetch new arrivals:", err);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let updated = [...products];

    if (onlyOffers) {
      updated = updated.filter(p => p.is_on_offer);
    }

    if (sortOption === 'price-low') {
      updated.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-high') {
      updated.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'name-az') {
      updated.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'name-za') {
      updated.sort((a, b) => b.title.localeCompare(a.title));
    }

    setFilteredProducts(updated);
  }, [sortOption, onlyOffers, products]);

  return (
    <div className="New-container">
      <Navbar />
      <TrueFocus 
        sentence="New Arrivals"
        manualMode={false}
        blurAmount={5}
        borderColor="red"
        animationDuration={4}
        pauseBetweenAnimations={1}
      />

      {/* 🔍 Filter Bar */}
      <div className="filter-bar">
        <label>
          Sort:
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="">Default</option>
            <option value="price-low">Price (Low to High)</option>
            <option value="price-high">Price (High to Low)</option>
            <option value="name-az">Name (A–Z)</option>
            <option value="name-za">Name (Z–A)</option>
          </select>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={onlyOffers}
            onChange={() => setOnlyOffers(!onlyOffers)}
          />
          Only Offers
        </label>
      </div>

      <Masonry
        items={filteredProducts}
        animateFrom="bottom"
        ease="power3.out"
        duration={0.6}
        stagger={0.05}
        onItemClick={(id) => {
          const product = filteredProducts.find((p) => p.id === id);
          if (product?.url) navigate(product.url); // ✅ use SPA navigation
        }}
      />
    </div>
  );
};

export default NewArrivalsPage;
