import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/useUser';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useUser();
  const location = useLocation();

  if (loading) return null; // or a spinner
  
  if (!isAuthenticated) {
    // If this is a checkout page with buyNow data, preserve it in sessionStorage
    // This ensures the data survives the login redirect
    if (location.pathname === '/checkout' && location.state?.buyNow) {
      try {
        // Ensure the data has a timestamp for validation
        const dataToStore = {
          ...location.state,
          timestamp: location.state.timestamp || Date.now()
        };
        sessionStorage.setItem('buyNowData', JSON.stringify(dataToStore));
      } catch (error) {
        console.warn('Failed to store buyNowData in sessionStorage:', error);
      }
    }
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

export default ProtectedRoute;
