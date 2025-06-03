// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Create Cart Context
const CartContext = createContext();

// Hook to use cart context
export const useCart = () => useContext(CartContext);

// Provider Component
export const CartProvider = ({ children }) => {
  const { user, userRole } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    if (!user || userRole !== 'buyer') return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/buyer/cart/count', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCartCount(res.data.count);
    } catch (err) {
      console.error('Failed to fetch cart count:', err);
    }
  };

  useEffect(() => {
    fetchCartCount(); 
  }, [user, userRole]);

  return (
    <CartContext.Provider value={{ cartCount, fetchCartCount }}>
      {children}
    </CartContext.Provider>
  );
};
