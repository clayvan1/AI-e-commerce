import { useEffect } from 'react';
import { RoomEvent } from 'livekit-client';

export const useAgentCartListener = ({ room, onAddToCart }) => {
  useEffect(() => {
    if (!room || typeof onAddToCart !== 'function') return;

    const textDecoder = new TextDecoder();

    const handleDataReceived = (payload, participant) => {
      if (!participant?.identity?.startsWith('agent-')) return;

      try {
        const messageStr = textDecoder.decode(payload);
        const data = JSON.parse(messageStr);

        if (data?.event === 'add_to_cart' && data.product) {
          onAddToCart(data.product);
        }
      } catch (err) {
        console.error('[useAgentCartListener] Failed to decode payload:', err);
      }
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);
    return () => room.off(RoomEvent.DataReceived, handleDataReceived);
  }, [room, onAddToCart]);
};
