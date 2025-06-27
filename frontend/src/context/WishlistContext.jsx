// src/context/WishlistContext.jsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE;

// Create Wishlist Context
const WishlistContext = createContext();

// Hook to use wishlist context
export const useWishlist = () => useContext(WishlistContext);

// Provider Component
export const WishlistProvider = ({ children }) => {
  const { user, userRole } = useAuth();
  const [wishlistCount, setWishlistCount] = useState(0);

  const fetchWishlistCount = async () => {
    if (!user || userRole !== 'buyer') return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/buyer/wishlist/count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setWishlistCount(res.data.count || 0);
    } catch (error) {
      console.error('Failed to fetch wishlist count:', error);
    }
  };

  useEffect(() => {
    fetchWishlistCount();
  }, [user, userRole]);

  return (
    <WishlistContext.Provider value={{ wishlistCount, fetchWishlistCount }}>
      {children}
    </WishlistContext.Provider>
  );
};
