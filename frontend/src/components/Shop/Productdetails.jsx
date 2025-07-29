import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Nav';
import './Productdetails.css';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductById } from '../../services/superadmin/productService';
import { useCart } from '../../contexts/Cart';
import FlyingImage from './FlyingImage';
import { useAgentCartListener } from '../../hooks/Agent/useAgentCartListener';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5555';

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [showFeatures, setShowFeatures] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showCommitments, setShowCommitments] = useState(false);
  const [flyImageData, setFlyImageData] = useState(null);
  const [room, setRoom] = useState(null);

  const { addToCart } = useCart();

  useEffect(() => {
    if (window.currentLiveKitRoom) {
      setRoom(window.currentLiveKitRoom);
    }
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProductById(productId);
        const p = res.data;

        const processedImages = Array.isArray(p.images) && p.images.length > 0
          ? p.images.map(img =>
              img.image_url.startsWith('http') ? img.image_url : `${baseURL}${img.image_url}`
            )
          : [p.image_url && (p.image_url.startsWith('http') ? p.image_url : `${baseURL}${p.image_url}`)] || [];

        setProduct({
          id: p.id,
          title: p.name,
          description: p.description,
          price: `KES ${p.price.toLocaleString()}`,
          fullPrice: p.price,
          availability: p.quantity > 0 ? 'In Stock' : 'Out of Stock',
          sku: `SKU-${p.id}`,
          features: p.features || [],
          images: processedImages,
        });

        setCurrentImage(processedImages[0] || 'https://via.placeholder.com/600');
        setLoading(false);
      } catch (err) {
        console.error('Failed to load product details:', err);
        setError('Product not found.');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;

    const imageEl = document.querySelector('.main-product-image');
    const cartEl = document.querySelector('.cart-icon');

    if (imageEl && cartEl) {
      const imageRect = imageEl.getBoundingClientRect();
      const cartRect = cartEl.getBoundingClientRect();

      setFlyImageData({
        imageSrc: currentImage,
        fromRect: imageRect,
        toRect: cartRect,
      });
    }

    addToCart({
      id: product.id,
      title: product.title,
      price: product.fullPrice,
      image: product.images?.[0] || '',
    });

    window.dispatchEvent(new CustomEvent('open-cart-overlay'));
  };

  // ✅ Listen to agent event and trigger same logic
  useAgentCartListener({
    room,
    onAddToCart: (agentProduct) => {
      addToCart(agentProduct);
      const imageEl = document.querySelector('.main-product-image');
      const cartEl = document.querySelector('.cart-icon');
      if (imageEl && cartEl) {
        const imageRect = imageEl.getBoundingClientRect();
        const cartRect = cartEl.getBoundingClientRect();
        setFlyImageData({
          imageSrc: currentImage,
          fromRect: imageRect,
          toRect: cartRect,
        });
      }
      window.dispatchEvent(new CustomEvent('open-cart-overlay'));
    }
  });

  const handleThumbnailClick = (imgSrc) => setCurrentImage(imgSrc);

  if (loading) return <div className="product-detail-message">Loading...</div>;
  if (error) return <div className="product-detail-message product-detail-error">{error}</div>;
  if (!product) return <div className="product-detail-message">No product data available.</div>;

  return (
    <div className="product-detail-page-container">
      <Navbar />
      <div className="product-content-grid">
        <div className="product-image-carousel-section">
          <div className="main-product-image-wrapper">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImage}
                src={currentImage}
                alt={product.title}
                className="main-product-image"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              />
            </AnimatePresence>
            {product.images.length > 1 && (
              <div className="product-thumbnails">
                {product.images.map((imgSrc, index) => (
                  <div
                    key={index}
                    className={`thumbnail-box ${imgSrc === currentImage ? 'active' : ''}`}
                    onClick={() => handleThumbnailClick(imgSrc)}
                  >
                    <img src={imgSrc} alt={`Thumbnail ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="product-details-content-area">
          <div className="left-content-column">
            <h1 className="product-title--desktop-only">{product.title}</h1>
            <div className="product-description">
              <h2>Description</h2>
              <p>{product.description}</p>
            </div>

            {product.features.length > 0 && (
              <div className="product-features-dropdown">
                <h3 onClick={() => setShowFeatures(!showFeatures)} className="dropdown-toggle">
                  Key Features <span className="dropdown-arrow">{showFeatures ? '▲' : '▼'}</span>
                </h3>
                <AnimatePresence>
                  {showFeatures && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="features-list"
                    >
                      {product.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="product-other-dropdowns-section">
              <div className="payment-details-dropdown">
                <h3 onClick={() => setShowPayment(!showPayment)} className="dropdown-toggle">
                  Payment Details <span className="dropdown-arrow">{showPayment ? '▲' : '▼'}</span>
                </h3>
                <AnimatePresence>
                  {showPayment && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="payment-info-content"
                    >
                      <p>We accept a variety of secure payment methods:</p>
                      <ul>
                        <li><span className="icon">💳</span> Credit/Debit Cards</li>
                        <li><span className="icon">📱</span> M-Pesa, Airtel Money</li>
                        <li><span className="icon">🏦</span> Bank Transfer</li>
                        <li><span className="icon">🤝</span> Cash on Delivery (select areas)</li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="our-commitments-dropdown">
                <h3 onClick={() => setShowCommitments(!showCommitments)} className="dropdown-toggle">
                  Our Commitments <span className="dropdown-arrow">{showCommitments ? '▲' : '▼'}</span>
                </h3>
                <AnimatePresence>
                  {showCommitments && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="commitments-content"
                    >
                      <ul>
                        <li><span className="icon">✅</span> High-Quality Products</li>
                        <li><span className="icon">🔒</span> Secure Shopping</li>
                        <li><span className="icon">🔄</span> Easy Returns & Exchanges</li>
                        <li><span className="icon">📞</span> 24/7 Customer Support</li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="right-sticky-column-content">
            <h1 className="product-title--mobile-only">{product.title}</h1>
            <div className="order-details-card">
              <p className="product-price">{product.price}</p>
              <div className="product-availability">
                Availability:{' '}
                <span className={product.availability === 'In Stock' ? 'in-stock' : 'out-of-stock'}>
                  {product.availability}
                </span>
              </div>

              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                Add to Cart
              </button>

              <div className="delivery-info">
                <h3>Delivery Information:</h3>
                <p><span className="icon">🚚</span> Free delivery on all orders!</p>
                <p><span className="icon">📞</span> Order by call: <strong>+254 7XX XXX XXX</strong></p>
                <p><span className="icon">⏱️</span> Estimated delivery: 3–5 business days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {flyImageData && (
        <FlyingImage
          imageSrc={flyImageData.imageSrc}
          fromRect={flyImageData.fromRect}
          toRect={flyImageData.toRect}
          onComplete={() => setFlyImageData(null)}
        />
      )}
    </div>
  );
};

export default ProductDetail;
