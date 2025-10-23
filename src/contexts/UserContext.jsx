import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UserContext } from './UserContextDef';

const USER_STORAGE_KEY = 'ecommerce-user';

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    // Notify other providers (cart, favourites) to clear sensitive user data on logout
    try {
      // Use a namespaced event so other contexts can listen and react
      const evt = new CustomEvent('ecommerce:logout');
      window.dispatchEvent(evt);
    } catch {
      // Fallback for older browsers
      window.dispatchEvent(new Event('ecommerce:logout'));
    }
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user
  }), [user, loading, login, logout, updateUser]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

