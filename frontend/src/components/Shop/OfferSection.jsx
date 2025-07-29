import React, { useEffect, useState } from 'react';
import { getOfferProducts } from '../../services/superadmin/productService';
import { motion } from 'framer-motion';
import PixelCard from './ProductCard';
import ScrollVelocity from './ScrollVelocity';
import { Link, useNavigate } from 'react-router-dom';

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' }
  }),
};

const OfferSection = () => {
  const [offers, setOffers] = useState([]);
  const navigate = useNavigate(); // ✅ Use navigate

  useEffect(() => {
    const loadOffers = async () => {
      try {
        const res = await getOfferProducts();
        setOffers(res.data || []);
      } catch (err) {
        console.error('Error fetching offers:', err);
      }
    };

    loadOffers();
  }, []);

  return (
    <div className="offers-section">
      <div className="offers-header">
        <ScrollVelocity
          texts={[
            { text: 'HOT Deals', color: '#ff4d4f' },
            { text: 'Don’t Miss Out', color: 'black' }
          ]}
          velocity={110}
          className="custom-scroll-text"
        />
      </div>

      <div className="horizontal-scroll-container">
        <div className='see-more'>
          <Link to="/offera" className="see-more">See More</Link>
        </div>

        <div className="offer-cards-wrapper">
          {offers.map((item, index) => {
            const firstImage = item.images?.[0]?.image_url || item.image_url || '';

            return (
              <motion.div
                key={item.id}
                className="offer-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.2 }}
                custom={index}
                variants={cardVariants}
              >
                <PixelCard variant="pink" className="pixel-card-container">
                  <div className="discount-ribbon" style={{ backgroundColor: '#ff0000' }}>
                    {Math.round(((item.old_price - item.price) / item.old_price) * 100)}% OFF
                  </div>
                  <img src={firstImage} alt={item.name} className="offer-image" />
                  <div className="offer-content">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <div className="price-container">
                      <span className="current-price">KES {item.price.toLocaleString()}</span>
                      <span className="old-price">KES {item.old_price?.toLocaleString()}</span>
                    </div>
                    {/* ✅ Use navigate instead of anchor */}
                    <button
                      onClick={() => navigate(`/products/${item.id}`)}
                      className="shop-now-btn"
                    >
                      Shop Now
                    </button>
                  </div>
                </PixelCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OfferSection;
