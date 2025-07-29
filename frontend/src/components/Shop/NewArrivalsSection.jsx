import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getNewArrivalProducts } from '../../services/superadmin/productService';
import PixelCard from './ProductCard';
import BlurText from './BlurText';
import { useNavigate } from 'react-router-dom'; // ✅ Import useNavigate
import './New.css';

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' }
  }),
};

const NewArrivalsSection = () => {
  const [newItems, setNewItems] = useState([]);
  const navigate = useNavigate(); // ✅ Hook for navigation

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const res = await getNewArrivalProducts();
        setNewItems(res.data || []);
      } catch (err) {
        console.error("Failed to fetch new arrivals", err);
      }
    };

    fetchNewArrivals();
  }, []);

  if (!newItems.length) return null;

  return (
    <div className='Trending'>
      <BlurText
        text="NEW ARRIVALS!"
        delay={150}
        animateBy="words"
        direction="top"
        fontSize="3rem"
        color="#ff0000"
        className="title"
      />

      <div className='see-more'>
        <a href="/Newa" className="see-more">See More</a>
      </div>

      <div className="trending-grid">
        {newItems.map((item, index) => (
          <motion.div
            key={item.id}
            className="offer-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            custom={index}
            variants={cardVariants}
          >
            <PixelCard variant="blue" className="pixel-card-container">
              <img
                src={item.image_url || (item.images?.[0]?.image_url ?? '/assets/placeholder.jpg')}
                alt={item.name}
                className="offer-image"
              />
              <div className="offer-content">
                <h3>{item.name}</h3>
                <p>{item.description?.slice(0, 60)}...</p>
                <div className="price-container">
                  <span className="current-price">KES {item.price?.toLocaleString()}</span>
                  {item.old_price && (
                    <span className="old-price">KES {item.old_price?.toLocaleString()}</span>
                  )}
                </div>
                <button
                  className="shop-now-btn"
                  onClick={() => navigate(`/products/${item.id}`)} // ✅ useNavigate here
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

export default NewArrivalsSection;
