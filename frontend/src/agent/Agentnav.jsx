import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoomEvent } from 'livekit-client';
import { useCart } from '../contexts/Cart'; // ✅ Import cart context

const textDecoder = new TextDecoder();

const AgentNavigationHandler = ({ room }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (payload, participant) => {
      if (!participant || !participant.identity.startsWith('agent-')) return;

      const messageStr = textDecoder.decode(payload);
      try {
        const data = JSON.parse(messageStr);
        console.log('[Agent Event]', data);

        if (!data?.event) return;

        switch (data.event) {
          case 'go_home':
            navigate('/Home');
            break;
          case 'go_checkout':
            navigate('/checkout');
            break;
          case 'go_offers':
            navigate('/offera');
            break;
          case 'go_trending':
            navigate('/trendinga');
            break;
          case 'go_new_arrivals':
            navigate('/Newa');
            break;
          case 'go_cart':
            // Optional: navigate or trigger cart open
            navigate('/cart'); // only if cart page exists
            break;
          case 'open_cart_overlay':
            // 🔓 Open cart overlay (if using modal-based cart)
            window.dispatchEvent(new CustomEvent('open-cart-overlay'));
            break;
          case 'add_to_cart':
            if (data.product && typeof data.product === 'object') {
              addToCart(data.product);
              console.log('[Agent] Product added to cart:', data.product);

              // Optionally open cart after adding
              window.dispatchEvent(new CustomEvent('open-cart-overlay'));
            } else {
              console.warn('[Agent] Missing or invalid product data in add_to_cart event');
            }
            break;
          case 'navigate':
            if (data.path) {
              console.log('[Agent] Navigating to:', data.path);
              navigate(data.path);
            } else {
              console.warn('[Agent] "navigate" event received without "path"');
            }
            break;
          default:
            console.warn('[Agent] Unknown event:', data.event);
        }
      } catch (err) {
        console.error('[Agent] Failed to parse data message:', err);
      }
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, navigate, addToCart]);

  return null; // This component renders nothing
};

export default AgentNavigationHandler;
