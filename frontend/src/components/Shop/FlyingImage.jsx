// FlyingImage.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const FlyingImage = ({ imageSrc, fromRect, toRect, onComplete }) => {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  useEffect(() => {
    if (fromRect && toRect) {
      setStart({ x: fromRect.left, y: fromRect.top });
      setEnd({ x: toRect.left, y: toRect.top });
    }
  }, [fromRect, toRect]);

  if (!start || !end) return null;

  return (
    <motion.img
      src={imageSrc}
      alt="flying"
      initial={{
        position: 'fixed',
        top: start.y,
        left: start.x,
        width: 100,
        height: 100,
        scale: 1,
        rotate: 0,
        zIndex: 9999
      }}
      animate={{
        top: end.y,
        left: end.x,
        width: 30,
        height: 30,
        scale: 0.3,
        rotate: 720
      }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      onAnimationComplete={onComplete}
      style={{ pointerEvents: 'none', borderRadius: '10px' }}
    />
  );
};

export default FlyingImage;
