// CartOverlay.jsx
import React from 'react';
import { motion } from 'framer-motion';
import './CartOverlay.css';
import { useCart } from '../../contexts/Cart';
import { Link } from 'react-router-dom';

const CartOverlay = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  return (
    <motion.div
      className="cart-overlay-wrapper"
      initial={{ y: '100%' }}
      animate={{ y: '0%' }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <div className="cart-overlay-content">
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="cart-items">
          {cartItems.length === 0 ? (
            <p>No items in your cart yet.</p>
          ) : (
            <>
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="cart-item-image"
                  />
                  <div className="cart-item-info">
                    <p className="cart-item-title"><strong>{item.title}</strong></p>
                    <p className="cart-item-price">KES {item.price.toLocaleString()}</p>
                    <div className="cart-item-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      <button onClick={() => removeFromCart(item.id)} className="remove-btn">🗑</button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="checkout-card">
                <p><strong>Total:</strong> KES {cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}</p>
                <Link to="/checkout">
  <button className="checkout-btn">Checkout</button>
</Link>

              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CartOverlay;
