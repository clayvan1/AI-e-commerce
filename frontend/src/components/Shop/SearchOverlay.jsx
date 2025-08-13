import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaSearch } from 'react-icons/fa';
import { searchCategoriesAndProducts } from '../../services/superadmin/productService';
import AnimatedList from '../Dashboard/Animatedlist'; // adjust to your structure
import { Link } from 'react-router-dom';
import './SearchOverlay.css';

const SearchOverlay = ({ isOpen, onClose }) => {
    const searchInputRef = useRef(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    // Debounced search (optional)
    useEffect(() => {
        const timeout = setTimeout(async () => {
            if (query.trim() === '') return setResults([]);

            try {
                const data = await searchCategoriesAndProducts(query);
                const flatItems = [];

                data.forEach(category => {
                    if (category.name.toLowerCase().includes(query.toLowerCase())) {
                        flatItems.push({
                            type: 'category',
                            id: category.id,
                            name: category.name
                        });
                    }
                    category.products.forEach(product => {
                        flatItems.push({
                            type: 'product',
                            ...product
                        });
                    });
                });

                setResults(flatItems);
            } catch (error) {
                console.error('Search failed:', error);
                setResults([]);
            }
        }, 300); // debounce delay

        return () => clearTimeout(timeout);
    }, [query]);

    const overlayVariants = {
        hidden: { opacity: 0, y: "-100%" },
        visible: { opacity: 1, y: "0%", transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, y: "-100%", transition: { duration: 0.3, ease: "easeIn" } },
    };

    const inputContainerVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { delay: 0.2, duration: 0.3 } },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
    };

    if (!isOpen) return null;

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
                        placeholder="Search for products or categories..."
                        className="search-overlay-input"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </motion.div>

                {/* ✅ Animated List of Results */}
                <div className="search-results-wrapper">
                    {results.length > 0 ? (
                        <AnimatedList
                            items={results}
                            renderItem={(item, index, isSelected) => {
                                if (item.type === 'category') {
                                    return (
                                        <Link
                                            to={`/categories/${item.id}`}
                                            className={`search-result category ${isSelected ? 'selected' : ''}`}
                                            onClick={onClose}
                                        >
                                            📁 <strong>Category:</strong> {item.name}
                                        </Link>
                                    );
                                }

                                return (
                                    <Link
                                        to={`/products/${item.id}`}
                                        className={`search-result product ${isSelected ? 'selected' : ''}`}
                                        onClick={onClose}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '0.5rem',
                                            textDecoration: 'none',
                                            color: 'inherit',
                                        }}
                                    >
                                        <img
                                            src={item.image_url}
                                            alt={item.name}
                                            style={{
                                                width: 50,
                                                height: 50,
                                                objectFit: 'cover',
                                                borderRadius: 8
                                            }}
                                        />
                                        <div>
                                            <h4 style={{ margin: 0 }}>{item.name}</h4>
                                            <p style={{ margin: 0 }}>KES {item.price}</p>
                                        </div>
                                    </Link>
                                );
                            }}
                        />
                    ) : (
                        query.trim() !== '' && (
                            <p style={{ marginTop: '1rem' }}>No results found for <strong>{query}</strong></p>
                        )
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default SearchOverlay;
