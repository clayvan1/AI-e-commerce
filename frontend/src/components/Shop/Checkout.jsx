import React, { useState } from 'react';
import { useCart } from '../../contexts/Cart';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../../services/superadmin/orderService'; // ✅ Use your service
import './Checkout.css';

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '',
    address_line: '',
    city: '',
    postal_code: '',
    country: '',
    payment_method: 'pay_on_delivery',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      ...form,
      items: cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      const res = await createOrder(payload); // ✅ use service
      console.log('Order created:', res);
      clearCart();
      navigate('/order-success');
    } catch (err) {
      console.error('Order failed:', err);
      setError(err?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="checkout-form">
          <h2>Shipping & Payment</h2>
          {error && <p className="error">{error}</p>}

          <input name="full_name" placeholder="Full Name" value={form.full_name} onChange={handleChange} required />
          <input name="address_line" placeholder="Address" value={form.address_line} onChange={handleChange} required />
          <input name="city" placeholder="City" value={form.city} onChange={handleChange} required />
          <input name="postal_code" placeholder="Postal Code" value={form.postal_code} onChange={handleChange} required />
          <input name="country" placeholder="Country" value={form.country} onChange={handleChange} required />

          <div className="payment-method">
            <label><strong>Payment Method:</strong></label>
            <label>
              <input
                type="radio"
                name="payment_method"
                value="pay_on_delivery"
                checked={form.payment_method === 'pay_on_delivery'}
                onChange={handleChange}
              />
              Pay on Delivery
            </label>
            <label>
              <input
                type="radio"
                name="payment_method"
                value="pay_now"
                checked={form.payment_method === 'pay_now'}
                onChange={handleChange}
              />
              Pay Now (dummy)
            </label>
          </div>

          <button type="submit" className="place-order-btn" disabled={loading}>
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>

        {/* Cart Summary Column */}
        <div className="checkout-summary">
          <h2>Your Cart</h2>
          <div className="cart-grid">
            {cartItems.length === 0 ? (
              <p>No items in cart.</p>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="cart-card">
                  <img src={item.image} alt={item.title} />
                  <div className="cart-card-details">
                    <p><strong>{item.title}</strong></p>
                    <p>KES {item.price.toLocaleString()} x {item.quantity}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="cart-total">
            <strong>Total:</strong> KES {getTotal().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
