import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getTrendingProducts } from '../../services/superadmin/productService';
import PixelCard from './ProductCard';
import BlurText from './BlurText';
import { Link, useNavigate } from 'react-router-dom'; // ✅ import useNavigate

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
  }),
};

const TrendingProductsSection = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate(); // ✅ use navigate

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const res = await getTrendingProducts();
        setProducts(res.data)
      } catch (error) {
        console.error('Failed to load trending products:', error);
      }
    };

    loadTrending();
  }, []);

  return (
    <div className="Trending">
      <BlurText
        text="Trending!"
        delay={150}
        animateBy="words"
        direction="top"
        fontSize="3rem"
        color="#ff0000"
        className="offers-title"
      />
      <div className="see-more">
        <Link to="/trendinga" className="see-more">See More</Link>
      </div>

      <div className="trending-grid">
        {products.map((item, index) => (
          <motion.div
            key={item.id}
            className="offer-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            custom={index}
            variants={cardVariants}
          >
            <PixelCard variant="green" className="pixel-card-container">
              {item.is_on_offer && (
                <div className="discount-ribbon" style={{ backgroundColor: '#008000' }}>
                  {item.old_price && item.price &&
                    `${Math.round(((item.old_price - item.price) / item.old_price) * 100)}% OFF`}
                </div>
              )}
              <img
                src={item.images?.[0]?.image_url || '/assets/default.jpg'}
                alt={item.name}
                className="offer-image"
              />
              <div className="offer-content">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="price-container">
                  <span className="current-price">KES {item.price?.toLocaleString()}</span>
                  {item.old_price && (
                    <span className="old-price">KES {item.old_price?.toLocaleString()}</span>
                  )}
                </div>
                {/* ✅ Navigate using button */}
                <button
                  onClick={() => navigate(`/products/${item.id}`)}
                  className="shop-now-btn"
                >
                  Shop Now
                </button>
              </div>
            </PixelCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TrendingProductsSection;
