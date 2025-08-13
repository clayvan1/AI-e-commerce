import React, { useState, useEffect } from 'react';
import { FaSearch, FaShoppingBasket, FaBars, FaTimes } from 'react-icons/fa';
import { IoPlanet, IoPerson } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

import SearchOverlay from './SearchOverlay';
import CartOverlay from './CartOverlay';
import { getAllCategories } from '../../services/superadmin/productService';

import './NavBar.css';

const Nav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedSection, setSelectedSection] = useState('home');

  const location = useLocation();
  const isHomePage = location.pathname === '/Home';

  const [scrolled, setScrolled] = useState(!isHomePage);

  // --- Handlers ---
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);
  const openSearchOverlay = () => setSearchOverlayOpen(true);
  const closeSearchOverlay = () => setSearchOverlayOpen(false);
  const openCart = () => setCartOpen(true);
  const closeCart = () => setCartOpen(false);

  // ✅ NEW LOGIC: This now listens to the main app container for scrolls.
  useEffect(() => {
    if (isHomePage) {
      // Find the main scrollable element. In most React apps, this is '#root'.
      // If your main scrolling div has a different ID or class, change it here.
      const scrollContainer = document.querySelector('#root');

      // If we can't find the container, do nothing.
      if (!scrollContainer) return;

      const handleScroll = () => {
        // We now check the scrollTop of the element, not the window.
        setScrolled(scrollContainer.scrollTop > 10);
      };

      scrollContainer.addEventListener('scroll', handleScroll);

      // Cleanup the event listener
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [isHomePage]); // Dependency array ensures this only re-evaluates on page change

  // Other useEffects...
  useEffect(() => {
    const handleOpenCartFromAgent = () => setCartOpen(true);
    window.addEventListener('open-cart-overlay', handleOpenCartFromAgent);
    return () => {
      window.removeEventListener('open-cart-overlay', handleOpenCartFromAgent);
    };
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <>
      <div className={`navbar-wrapp ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-content">
          <div className="nav-left-icon" onClick={toggleMenu}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </div>
          <div className="nav-center">
            <div className="logo">
              Gee Planet <IoPlanet className="planet-icon" />
            </div>
          </div>
          <div className="nav-right">
            <div className="cart-icon">
              <FaSearch onClick={openSearchOverlay} />
              <IoPerson />
              <FaShoppingBasket onClick={openCart} />
            </div>
          </div>
        </div>
      </div>

      {/* === Side Menu === */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="side-menu"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <div className="sidebar-top-tabs">
                {['home', 'categories'].map((tab) => (
                  <div key={tab} className="tab-container">
                    <button
                      className={`tab-button ${
                        selectedSection === tab ? 'active' : ''
                      }`}
                      onClick={() => setSelectedSection(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {selectedSection === tab && (
                        <motion.div
                          layoutId="underline"
                          className="underline"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </button>
                  </div>
                ))}
              </div>
              <ul className="menu-links">
                {selectedSection === 'home' && (
                  <>
                    <li>
                      <Link to="/offera" onClick={closeMenu}>
                        Offers
                      </Link>
                    </li>
                    <li>
                      <Link to="/trendinga" onClick={closeMenu}>
                        Trending
                      </Link>
                    </li>
                    <li>
                      <Link to="/newa" onClick={closeMenu}>
                        New Arrivals
                      </Link>
                    </li>
                  </>
                )}
                {selectedSection === 'categories' &&
                  categories.map((cat) => (
                    <li key={cat.id}>
                      <Link to={`/category/${cat.id}`} onClick={closeMenu}>
                        {cat.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </motion.div>
            <motion.div
              className="blur-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={closeMenu}
            />
          </>
        )}
      </AnimatePresence>

      {/* === Overlays === */}
      <AnimatePresence>
        {searchOverlayOpen && (
          <SearchOverlay isOpen={searchOverlayOpen} onClose={closeSearchOverlay} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {cartOpen && (
          <CartOverlay isOpen={cartOpen} onClose={closeCart} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Nav;