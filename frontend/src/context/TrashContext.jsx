import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE;

// Create Trash Context
const TrashContext = createContext();

// Hook to use Trash Context
export const useTrash = () => useContext(TrashContext);

// Provider Component
export const TrashProvider = ({ children }) => {
  const { user, userRole } = useAuth();
  const [trashCount, setTrashCount] = useState(0);

  // Fetch Trash Count from backend
  const fetchTrashCount = async () => {
    if (!user || userRole !== 'admin') return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${API_BASE}/admin/users/trash-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const count = res.data?.data?.trash_count ?? 0;
      setTrashCount(count);
    } catch (error) {
      console.error('Failed to fetch trash count:', error);
    }
  };

  // Fetch on mount or when admin logs in
  useEffect(() => {
    fetchTrashCount();
  }, [user, userRole]);

  return (
    <TrashContext.Provider value={{ trashCount, fetchTrashCount }}>
      {children}
    </TrashContext.Provider>
  );
};
