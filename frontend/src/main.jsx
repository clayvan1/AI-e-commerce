import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './App';
import { ContextProvider } from './contexts/ContextProvider';
import "./index.css"
import { CartProvider } from './contexts/Cart';

import { LiveKitProvider } from './contexts/LiveKitContext';
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
      
        <LiveKitProvider>
    <BrowserRouter>

     <CartProvider>
      <ContextProvider>
         
        <AppRoutes />
      </ContextProvider>
      </CartProvider>
    </BrowserRouter>
    </LiveKitProvider>
      
  </React.StrictMode>
);