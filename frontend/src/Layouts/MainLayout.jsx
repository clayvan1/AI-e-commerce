// src/Layouts/MainLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Nav from '../components/Shop/Nav'; // Adjust this import path if necessary

const MainLayout = () => {
  return (
    <>
      <Nav />
      {/* The Outlet will render your page components like HomePage, Category, etc. */}
      <Outlet />
    </>
  );
};

export default MainLayout;