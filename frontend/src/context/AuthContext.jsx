import { createContext, useContext, useEffect, useState } from 'react';

// Create the context
export const AuthContext = createContext();

// Custom hook for easier access
export const useAuth = () => useContext(AuthContext);

// AuthProvider component to wrap your app
export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);      // "buyer", "seller", or null
  const [user, setUser] = useState(null);              // Optional: user info (email, id, etc.)
  const [loading, setLoading] = useState(true);        // To avoid flickers on refresh

  // Load auth data from localStorage on mount
  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    const storedUser = localStorage.getItem('user');
    if (storedRole) setUserRole(storedRole);
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  // Login function
  const login = ({ role, userData }) => {
    setUserRole(role);
    setUser(userData);
    localStorage.setItem('userRole', role);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Logout function
  const logout = () => {
    setUserRole(null);
    setUser(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ userRole, user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
