import React from 'react';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Shop/Nav';
import './CartPage.css';

const CartPage = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <Navbar />
        <h2 className="cart-empty-message">🛒 Your cart is empty.</h2>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Navbar />
      <h2 className="cart-title">Your Shopping Cart</h2>

      <div className="cart-items">
        {cartItems.map((item) => (
          <div key={item.id} className="cart-item-card">
            <img src={item.image} alt={item.title} className="cart-item-image" />
            <div className="cart-item-details">
              <h3>{item.title}</h3>
              <p>KES {item.price.toLocaleString()}</p>
              <div className="quantity-control">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                <input
                  type="number"
                  value={item.quantity}
                  min="1"
                  onChange={(e) =>
                    updateQuantity(item.id, parseInt(e.target.value || '1'))
                  }
                />
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </div>
              <button
                className="remove-button"
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <h3>Total: <span>KES {totalPrice.toLocaleString()}</span></h3>
        <button className="clear-cart-btn" onClick={clearCart}>
          Clear Cart
        </button>
        <button className="checkout-btn" onClick={() => alert('Checkout logic here')}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartPage;
