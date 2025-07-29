// src/contexts/SuperadminContextProvider.jsx
import React from 'react';
import { UserProvider } from './UserContext';
import { GlobalInventoryProvider } from './GlobalInventorycontext';

const SuperadminContextProvider = ({ children }) => {
  return (
    <UserProvider>
      <GlobalInventoryProvider>
        {children}
      </GlobalInventoryProvider>
    </UserProvider>
  );
};

export default SuperadminContextProvider;
