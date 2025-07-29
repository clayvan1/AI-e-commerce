import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getCategoryById, getStockedProductsInCategory } from '../../services/superadmin/productService';

import Navbar from './Nav';
import Carousel from './Carousel';
import Masonry from './Masonry';
import './Category.css';

const Category = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);

  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5555';

  // Helper to resolve image URL
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
    const fetchCategoryAndProducts = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          getCategoryById(id),
          getStockedProductsInCategory(id)
        ]);

        const mapped = prodRes.data.map((p, index) => ({
          id: p.id || `product-${index}`,
          img: getImageUrl(p),
          url: `/products/${p.id}`,
          title: p.name,
          description: p.description,
          price: p.price,
           old_price: p.old_price,         // ✅ Add this
  is_on_offer: p.is_on_offer,
          height: 350 + (index % 3) * 40,
        }));

        setCategory(catRes.data);
        setProducts(mapped);
      } catch (err) {
        console.error('Failed to load category or stocked products:', err);
      }
    };

    fetchCategoryAndProducts();
  }, [id]);

  return (
    <div className="category-container">
      <Navbar />
      <div className="carousel-wrapper">
        <Carousel
          baseWidth={window.innerWidth}
          autoplay={true}
          autoplayDelay={3000}
          pauseOnHover={true}
          loop={false}
          round={false}
        />
      </div>
      <h2 className="category-heading">{category?.name || 'Products'}</h2>
      <Masonry
        items={products}
        ease="power3.out"
        duration={0.6}
        stagger={0.05}
        animateFrom="bottom"
        onItemClick={(productId) => {
          const product = products.find((p) => p.id === productId);
          if (product?.url) window.location.href = product.url;
        }}
      />
    </div>
  );
};

export default Category;
