import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { gsap } from "gsap";
import "./Masonry.css";

const useMedia = (queries, values, defaultValue) => {
  const get = useCallback(() => {
    return values[queries.findIndex((q) => matchMedia(q).matches)] ?? defaultValue;
  }, [queries, values, defaultValue]);

  const [value, setValue] = useState(get);

  useEffect(() => {
    const handler = () => setValue(get);
    queries.forEach((q) => matchMedia(q).addEventListener("change", handler));
    return () =>
      queries.forEach((q) =>
        matchMedia(q).removeEventListener("change", handler)
      );
  }, [queries, get]);

  return value;
};

const useMeasure = () => {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
};

const preloadImages = async (urls) => {
  await Promise.all(
    urls.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = img.onerror = () => resolve();
        })
    )
  );
};

const Masonry = ({
  items,
  ease = "power3.out",
  duration = 0.6,
  stagger = 0.05,
  animateFrom = "bottom",
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = true,
  onItemClick,
}) => {
  const finalColumns = useMedia(
    ["(min-width: 1500px)", "(min-width: 1000px)", "(min-width: 600px)", "(min-width: 489px)"],
    [5, 4, 3, 2],
    2
  );

  const [containerRef, { width }] = useMeasure();
  const [imagesReady, setImagesReady] = useState(false);
  const gutter = 16;

  useEffect(() => {
    if (items && items.length > 0) {
      preloadImages(items.map((i) => i.img)).then(() => setImagesReady(true));
    } else {
      setImagesReady(true);
    }
  }, [items]);

  const grid = useMemo(() => {
    if (!width || !items.length) return [];

    const colHeights = new Array(finalColumns).fill(0);
    const columnWidth = (width - (finalColumns - 1) * gutter) / finalColumns;

    return items.map((child) => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = (columnWidth + gutter) * col;
      const height = child.height || 350;
      const y = colHeights[col];

      colHeights[col] += height + gutter;

      return { ...child, x, y, w: columnWidth, h: height };
    });
  }, [finalColumns, items, width]);

  const hasMounted = useRef(false);

  const getInitialPosition = useCallback((item) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    let direction = animateFrom;
    if (animateFrom === "random") {
      const directions = ["top", "bottom", "left", "right"];
      direction = directions[Math.floor(Math.random() * directions.length)];
    }

    switch (direction) {
      case "top": return { x: item.x, y: -item.h - 200 };
      case "bottom": return { x: item.x, y: window.innerHeight + 200 };
      case "left": return { x: -item.w - 200, y: item.y };
      case "right": return { x: window.innerWidth + 200, y: item.y };
      case "center":
        return containerRect
          ? {
              x: containerRect.width / 2 - item.w / 2,
              y: containerRect.height / 2 - item.h / 2,
            }
          : { x: item.x, y: item.y + 100 };
      default: return { x: item.x, y: window.innerHeight + 200 };
    }
  }, [animateFrom]);

  useLayoutEffect(() => {
    if (!imagesReady) return;

    const maxColHeight = Math.max(...grid.map(item => item.y + item.h + gutter), 0);
    if (containerRef.current) {
      containerRef.current.style.height = `${maxColHeight}px`;
    }

    grid.forEach((item, index) => {
      const selector = `[data-key="${item.id}"]`;
      const animationProps = {
        x: item.x,
        y: item.y,
        width: item.w,
        height: item.h,
      };

      if (!hasMounted.current) {
        const initialPos = getInitialPosition(item);
        gsap.fromTo(selector, {
          opacity: 0,
          x: initialPos.x,
          y: initialPos.y,
          width: item.w,
          height: item.h,
          ...(blurToFocus && { filter: "blur(10px)" }),
        }, {
          opacity: 1,
          ...animationProps,
          ...(blurToFocus && { filter: "blur(0px)" }),
          duration: 0.8,
          ease: "power3.out",
          delay: index * stagger,
        });
      } else {
        gsap.to(selector, {
          ...animationProps,
          duration,
          ease,
          overwrite: "auto",
        });
      }
    });

    hasMounted.current = true;
  }, [grid, imagesReady]);

  const handleMouseEnter = (e, item) => {
    const element = e.currentTarget;
    const selector = `[data-key="${item.id}"]`;

    if (scaleOnHover) {
      gsap.to(selector, {
        scale: hoverScale,
        duration: 0.3,
        ease: "power2.out",
      });
    }

    if (colorShiftOnHover) {
      const overlay = element.querySelector(".color-overlay");
      if (overlay) {
        gsap.to(overlay, { opacity: 0.3, duration: 0.3 });
      }
    }
  };

  const handleMouseLeave = (e, item) => {
    const element = e.currentTarget;
    const selector = `[data-key="${item.id}"]`;

    if (scaleOnHover) {
      gsap.to(selector, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }

    if (colorShiftOnHover) {
      const overlay = element.querySelector(".color-overlay");
      if (overlay) {
        gsap.to(overlay, { opacity: 0, duration: 0.3 });
      }
    }
  };

  return (
    <div ref={containerRef} className="list">
      {grid.map((item) => (
        <div
          key={item.id}
          data-key={item.id}
          className="item-wrapper"
          onClick={() => onItemClick && onItemClick(item.id)}
          onMouseEnter={(e) => handleMouseEnter(e, item)}
          onMouseLeave={(e) => handleMouseLeave(e, item)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: item.w,
            height: item.h,
            opacity: hasMounted.current ? 1 : 0,
            transform: `translate(${item.x}px, ${item.y}px)`,
            boxSizing: "border-box",
          }}
        >
          <div
            className="item-image-container"
            style={{
              backgroundImage: `url(${item.img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              overflow: "hidden",
              width: "100%",
              height: "100%",
              borderRadius: "12px",
            }}
          >
            {item.is_on_offer && (
              <div className="offer-ribbon">ON OFFER</div>
            )}
            {colorShiftOnHover && (
              <div
                className="color-overlay"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(45deg, rgba(255,0,150,0.5), rgba(0,150,255,0.5))",
                  opacity: 0,
                  pointerEvents: "none",
                  borderRadius: "12px",
                }}
              />
            )}
          </div>
          <div className="item-details">
            <h3 className="item-title">{item.title}</h3>
            {item.description && (
              <p className="item-description">{item.description}</p>
            )}
            {item.price && (
              <p className="item-price">
                Ksh {item.price.toLocaleString()}
                {item.old_price && item.is_on_offer && (
                  <span className="old-price"> Ksh {item.old_price.toLocaleString()}</span>
                )}
              </p>
            )}
            {item.url && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onItemClick && onItemClick(item.id);
                }}
                className="shop-btn"
              >
                Shop Now
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Masonry;
