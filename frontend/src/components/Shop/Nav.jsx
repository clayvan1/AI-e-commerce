import React, { useState, useEffect } from 'react';
import { FaSearch, FaShoppingBasket, FaBars, FaTimes } from 'react-icons/fa';
import { IoPlanet, IoPerson } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

import SearchOverlay from './SearchOverlay';
import CartOverlay from './CartOverlay';
import { getAllCategories } from '../../services/superadmin/productService';

import './NavBar.css';

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  // Toggle handlers
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);
  const openSearchOverlay = () => setSearchOverlayOpen(true);
  const closeSearchOverlay = () => setSearchOverlayOpen(false);
  const openCart = () => setCartOpen(true);
  const closeCart = () => setCartOpen(false);

  // ✅ Listen for agent-triggered cart overlay event
  useEffect(() => {
    const handleOpenCartFromAgent = () => {
      console.log('[NavBar] Cart overlay opened by agent.');
      setCartOpen(true);
    };

    window.addEventListener('open-cart-overlay', handleOpenCartFromAgent);
    return () => {
      window.removeEventListener('open-cart-overlay', handleOpenCartFromAgent);
    };
  }, []);

  // Fetch categories
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
      <div className="navbar-wrapp">
        <div className="navbar-content">
          {/* Left Icon */}
          <div className="nav-left-icon" onClick={toggleMenu}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </div>

          {/* Center Logo */}
          <div className="nav-center">
            <div className="logo">
              Gee Planet <IoPlanet className="planet-icon" />
            </div>
          </div>

          {/* Right Icons */}
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
              <ul className="menu-links">
                {categories.map((cat) => (
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

      {/* === Search Overlay === */}
      <AnimatePresence>
        {searchOverlayOpen && (
          <SearchOverlay isOpen={searchOverlayOpen} onClose={closeSearchOverlay} />
        )}
      </AnimatePresence>

      {/* === Cart Overlay === */}
      <AnimatePresence>
        {cartOpen && (
          <CartOverlay isOpen={cartOpen} onClose={closeCart} />
        )}
      </AnimatePresence>
    </>
  );
};

export default NavBar;
