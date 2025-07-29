// SearchOverlay.js
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaSearch } from 'react-icons/fa';
import './SearchOverlay.css'; // We'll create this CSS file

const SearchOverlay = ({ isOpen, onClose }) => {
    const searchInputRef = useRef(null);

    // Focus the input when the overlay opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    // Define animation variants for the overlay
    const overlayVariants = {
        hidden: { opacity: 0, y: "-100%" },
        visible: { opacity: 1, y: "0%", transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, y: "-100%", transition: { duration: 0.3, ease: "easeIn" } },
    };

    // Define animation variants for the input container
    const inputContainerVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { delay: 0.2, duration: 0.3 } },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
    };

    if (!isOpen) return null; // Don't render if not open

    return (
        <motion.div
            className="search-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className="search-overlay-content">
                <FaTimes className="close-search-overlay" onClick={onClose} />
                <motion.div
                    className="search-input-wrapper"
                    variants={inputContainerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <FaSearch className="search-overlay-icon" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search for products..."
                        className="search-overlay-input"
                    />
                </motion.div>
                {/* You can add recent searches, popular categories, etc. here */}
                <div className="search-suggestions">
                    {/* Example suggestions */}
                    <p>Popular searches: **Laptops**, **Smartphones**, **Headphones**</p>
                </div>
            </div>
        </motion.div>
    );
};

export default SearchOverlay;