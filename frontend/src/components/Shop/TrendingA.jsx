import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Masonry from './Masonry';
import { getTrendingProducts } from '../../services/superadmin/productService';
import Navbar from './Nav';
import './Category.css'; // Optional if styles are reused

const TrendingSeeMore = () => {
  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState('');
  const navigate = useNavigate();

  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5555';

  const getImageUrl = (p) => {
    if (Array.isArray(p.images) && p.images.length > 0) {
      const first = p.images[0];
      return first.image_url?.startsWith('http')
        ? first.image_url
        : `${baseURL}${first.image_url}`;
    }

    if (p.image_url) {
      return p.image_url.startsWith('http')
        ? p.image_url
        : `${baseURL}${p.image_url}`;
    }

    return 'https://via.placeholder.com/350';
  };

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await getTrendingProducts();
        const mapped = res.data.map((p, index) => ({
          id: p.id,
          img: getImageUrl(p),
          url: `/products/${p.id}`, // ✅ matches your route
          title: p.name,
          description: p.description,
          price: p.price,
          old_price: p.old_price,
          is_on_offer: p.is_on_offer,
          height: 350 + (index % 3) * 40,
        }));
        setProducts(mapped);
      } catch (err) {
        console.error('Failed to load trending products', err);
      }
    };

    fetchTrending();
  }, []);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortOption === 'priceLowHigh') return a.price - b.price;
    if (sortOption === 'priceHighLow') return b.price - a.price;
    if (sortOption === 'latest') return b.id - a.id;
    return 0;
  });

  return (
    <div className="trending-page">
      <Navbar />

      <div className="filter-bar">
        <label htmlFor="sort">Sort by:</label>
        <select
          id="sort"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="">Default</option>
          <option value="priceLowHigh">Price: Low to High</option>
          <option value="priceHighLow">Price: High to Low</option>
          <option value="latest">Latest</option>
        </select>
      </div>

      <Masonry
        items={sortedProducts}
        ease="power3.out"
        duration={0.6}
        stagger={0.05}
        animateFrom="bottom"
        onItemClick={(id) => {
          const product = products.find((p) => p.id === id);
          if (product?.url) navigate(product.url); // ✅ use SPA routing
        }}
      />
    </div>
  );
};

export default TrendingSeeMore;
