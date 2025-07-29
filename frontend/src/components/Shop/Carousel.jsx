import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
// replace icons with your own if needed
import { FiCircle, FiCode, FiFileText, FiLayers, FiLayout } from "react-icons/fi";

import "./Carousel.css";

// Directly integrate your product items here
const CAROUSEL_ITEMS = [
  {
    image: '/assets/3d/m.png',
    link: 'https://google.com/',
    title: 'Smartwatch Series 9',
    description: 'Advanced health tracking with sleek design.',
    price: '$349' // Added price
  },
  {
    image: '/assets/3d/lip.jpg',
    link: 'https://google.com/',
    title: 'Smart Glasses',
    description: 'Augmented vision with seamless style.',
    price: '$599' // Added price
  },
  {
    image: '/assets/3d/ship.jpg',
    link: 'https://google.com/',
    title: 'Smart Ring Pro',
    description: 'Minimalist control at your fingertips.',
    price: '$199' // Added price
  },
  {
    image: '/assets/3d/ab.jpg',
    link: 'https://google.com/',
    title: 'Smartwatch Series 9',
    description: 'Advanced health tracking with sleek design.',
    price: '$349' // Added price
  },
  {
    image: '/assets/3d/cello.jpg',
    link: 'https://google.com/',
    title: 'Smart Glasses',
    description: 'Augmented vision with seamless style.',
    price: '$599' // Added price
  },
  {
    image: '/assets/3d/at.jpg',
    link: 'https://google.com/',
    title: 'Smart Ring Pro',
    description: 'Minimalist control at your fingertips.',
    price: '$199' // Added price
  },
];

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: "spring", stiffness: 300, damping: 30 };

export default function Carousel({
  items = CAROUSEL_ITEMS, // Now uses CAROUSEL_ITEMS by default
  baseWidth = 100,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false,
}) {
  const containerPadding = 0;
  const itemWidth = baseWidth - containerPadding * 0;
  const trackItemOffset = itemWidth + GAP;
  const carouselItems = loop ? [...items, items[0]] : items;
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const containerRef = useRef(null);
  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  useEffect(() => {
    if (autoplay && (!pauseOnHover || !isHovered)) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev === items.length - 1 && loop) {
            return prev + 1;
          }
          if (prev === carouselItems.length - 1) {
            return loop ? 0 : prev;
          }
          return prev + 1;
        });
      }, autoplayDelay);
      return () => clearInterval(timer);
    }
  }, [
    autoplay,
    autoplayDelay,
    isHovered,
    loop,
    items.length,
    carouselItems.length,
    pauseOnHover,
  ]);

  const effectiveTransition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationComplete = () => {
    if (loop && currentIndex === carouselItems.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      setTimeout(() => setIsResetting(false), 50);
    }
  };

  const handleDragEnd = (_, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      if (loop && currentIndex === items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex((prev) => Math.min(prev + 1, carouselItems.length - 1));
      }
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      if (loop && currentIndex === 0) {
        setCurrentIndex(items.length - 1);
      } else {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    }
  };

  const dragProps = loop
    ? {}
    : {
        dragConstraints: {
          left: -trackItemOffset * (carouselItems.length - 1),
          right: 0,
        },
      };

  return (
    <div
      ref={containerRef}
      className={`carousel-container ${round ? "round" : ""}`}
      style={{
        width: `${baseWidth}px`,
        ...(round && { height: `${baseWidth}px`, borderRadius: "50%" }),
      }}
    >
      <motion.div
        className="carousel-track"
        drag="x"
        {...dragProps}
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${currentIndex * trackItemOffset + itemWidth / 2}px 50%`,
          x,
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselItems.map((item, index) => {
          const range = [
            -(index + 1) * trackItemOffset,
            -index * trackItemOffset,
            -(index - 1) * trackItemOffset,
          ];
          const outputRange = [90, 0, -90];
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const rotateY = useTransform(x, range, outputRange, { clamp: false });

          return (
            <motion.div
              key={index}
              className={`carousel-item ${round ? "round" : ""}`}
              style={{
                width: itemWidth,
                height: round ? itemWidth : "100%",
                rotateY: rotateY,
                ...(round && { borderRadius: "50%" }),
              }}
              transition={effectiveTransition}
            >
              {item.image ? (
                <>
                  <div className="carousel-image-wrapper">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="carousel-image"
                    />
                  </div>
                  {/* Ribbon - if you have a ribbon property in your item data */}
                  {item.ribbon && (
                    <div className="carousel-ribbon">{item.ribbon}</div>
                  )}
                  <div className="carousel-text-overlay">
                    <h3>{item.title}</h3>
                    {item.price && <p className="carousel-price">{item.price}</p>} {/* Added price element */}
                    <p>{item.description}</p>
                  </div>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="carousel-shop-button">
                      Shop Now
                    </a>
                  )}
                </>
              ) : (
                // Fallback for items without an image (original icon items)
                // This will use the old styling if 'item.image' is not present
                <>
                  <div className={`carousel-item-header ${round ? "round" : ""}`}>
                    <span className="carousel-icon-container">
                      {item.icon}
                    </span>
                  </div>
                  <div className="carousel-item-content">
                    <div className="carousel-item-title">{item.title}</div>
                    <p className="carousel-item-description">{item.description}</p>
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="carousel-item-link">
                        Learn More
                      </a>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </motion.div>
      <div className={`carousel-indicators-container ${round ? "round" : ""}`}>
        <div className="carousel-indicators">
          {items.map((_, index) => (
            <motion.div
              key={index}
              className={`carousel-indicator ${currentIndex % items.length === index ? "active" : "inactive"
                }`}
              animate={{
                scale: currentIndex % items.length === index ? 1.2 : 1,
              }}
              onClick={() => setCurrentIndex(index)}
              transition={{ duration: 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}