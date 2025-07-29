import React from 'react';
import './HomePage.css';
import Navbar from '../components/Dashboard/Navbar';
import InfiniteMenu from '../components/Shop/InfiniteMenu';
import ScrambledText from '../components/Shop/ScrambledText';
import BlurText from "../components/Shop/BlurText";
import TrueFocus from '../components/Shop/TrueFocus';
import PixelCard from '../components/Shop/ProductCard';
import NavBar from '../components/Shop/Nav';
import CurvedLoop from '../components/Shop/CurvedLoop';
import ScrollStack, { ScrollStackItem } from '../components/Shop/ScrollStack';
import Galaxy from '../components/Shop/Galaxy';

import { GiArtificialHive } from "react-icons/gi";
import { Link } from 'react-router-dom';
import SpotlightCard from '../components/Shop/SpotlightCard';
import { motion } from 'framer-motion';
import CategoriesMenu from '../components/Shop/CategoriesMenu';

// ✅ Import new live offer section component
import OfferSection from '../components/Shop/OfferSection';
import NewArrivalsSection from '../components/Shop/NewArrivalsSection';
import TrendingProductsSection from '../components/Shop/TrendingProductsSection';


const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' }
  }),
};

function HomePage() {
  return (
    <div className="home-container">
      <NavBar />

      <div className="infinite">
        <CategoriesMenu />
      </div>

      
      {/* Spotlight Section */}
      <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(255, 0, 0, 0.4)">
        <NewArrivalsSection />
      </SpotlightCard>
     
      {/* ✅ New: Live Offers Section */}
      <OfferSection />
      <TrendingProductsSection/>
      {/* Trending Section */}
      
    </div>
  );
}

export default HomePage;
